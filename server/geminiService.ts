import { GoogleGenAI } from '@google/genai';

export const AI_UNAVAILABLE_MESSAGE = 'CareerPilot AI is temporarily unable to generate an AI response. Please try again later.';

export type ErrorCategory =
  | 'RATE_LIMIT_429'
  | 'UNAVAILABLE_503'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'CLIENT_ERROR_400'
  | 'UNKNOWN';

interface SafeLogEvent {
  category: ErrorCategory | 'SUCCESS' | 'CACHE_HIT' | 'IN_FLIGHT_COALESCED' | 'MODEL_FALLBACK';
  model?: string;
  attempt?: number;
  retryOutcome?: string;
  cooldownSeconds?: number;
  delayMs?: number;
  reason?: string;
}

/**
 * Sanitized logger that strictly avoids logging secrets, user prompts,
 * resumes, or personal data.
 */
export function logGeminiEvent(event: SafeLogEvent): void {
  const parts: string[] = [`[CareerPilot AI] category=${event.category}`];
  if (event.model) parts.push(`model=${event.model}`);
  if (event.attempt !== undefined) parts.push(`attempt=${event.attempt}`);
  if (event.delayMs !== undefined) parts.push(`delayMs=${event.delayMs}`);
  if (event.cooldownSeconds !== undefined) parts.push(`cooldownSec=${event.cooldownSeconds}`);
  if (event.retryOutcome) parts.push(`outcome=${event.retryOutcome}`);
  if (event.reason) parts.push(`reason=${event.reason}`);
  console.log(parts.join(' | '));
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-memory TTL cache with LRU eviction
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Parse structured or unstructured error details from Gemini API.
 */
export function parseGeminiError(err: any): {
  category: ErrorCategory;
  retryDelayMs: number | null;
  isDailyQuotaExhausted: boolean;
  isProjectWideQuota: boolean;
  targetModel?: string;
  message: string;
} {
  const status = err?.status || err?.code || 0;
  let rawMessage = '';
  if (typeof err?.message === 'string') {
    rawMessage = err.message;
  } else if (err && typeof err === 'object') {
    rawMessage = JSON.stringify(err);
  }

  let parsedJson: any = null;
  try {
    parsedJson = JSON.parse(rawMessage);
  } catch {
    // rawMessage is plaintext
  }

  const errObj = parsedJson?.error || parsedJson || {};
  const messageStr = String(errObj.message || rawMessage || '');
  const statusStr = String(errObj.status || '');

  // 1. Quota / Rate-limit detection (429 or RESOURCE_EXHAUSTED)
  const is429 =
    status === 429 ||
    statusStr === 'RESOURCE_EXHAUSTED' ||
    messageStr.includes('429') ||
    messageStr.includes('RESOURCE_EXHAUSTED') ||
    messageStr.includes('quota') ||
    messageStr.includes('rate limit');

  if (is429) {
    let retryDelayMs: number | null = null;
    let isDailyQuotaExhausted = false;
    let isProjectWideQuota = false;
    let targetModel: string | undefined = undefined;

    // Check RetryInfo in details
    if (Array.isArray(errObj.details)) {
      for (const d of errObj.details) {
        if (d?.['@type']?.includes('RetryInfo') && d.retryDelay) {
          const match = String(d.retryDelay).match(/^([0-9.]+)s?$/i);
          if (match) {
            retryDelayMs = Math.round(parseFloat(match[1]) * 1000);
          }
        }
        if (d?.['@type']?.includes('QuotaFailure')) {
          if (Array.isArray(d.violations)) {
            for (const v of d.violations) {
              if (v?.quotaDimensions?.model) {
                targetModel = v.quotaDimensions.model;
              }
              if (
                v?.quotaId?.includes('PerDay') ||
                v?.quotaMetric?.includes('free_tier_requests')
              ) {
                isDailyQuotaExhausted = true;
              }
            }
          }
        }
      }
    }

    // Parse "Please retry in 12h10m25s" or similar
    if (!retryDelayMs) {
      const durationMatch = messageStr.match(/retry in\s+(?:(\d+)h)?(?:(\d+)m)?(?:([0-9.]+)s)?/i);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1] || '0', 10);
        const mins = parseInt(durationMatch[2] || '0', 10);
        const secs = parseFloat(durationMatch[3] || '0');
        const totalMs = (hours * 3600 + mins * 60 + secs) * 1000;
        if (totalMs > 0) {
          retryDelayMs = Math.round(totalMs);
        }
      }
    }

    if (!retryDelayMs) {
      const secMatch = messageStr.match(/retry after\s+([0-9.]+)\s*(?:s|seconds)?/i);
      if (secMatch) {
        retryDelayMs = Math.round(parseFloat(secMatch[1]) * 1000);
      }
    }

    if (
      messageStr.includes('daily request quota') ||
      messageStr.includes('Queries per day') ||
      messageStr.includes('free_tier_requests') ||
      messageStr.includes('limit: 20')
    ) {
      isDailyQuotaExhausted = true;
    }

    if (messageStr.includes('PerProject') && !messageStr.includes('PerModel')) {
      isProjectWideQuota = true;
    }

    return {
      category: 'RATE_LIMIT_429',
      retryDelayMs,
      isDailyQuotaExhausted,
      isProjectWideQuota,
      targetModel,
      message: messageStr
    };
  }

  // 2. 503 UNAVAILABLE (high demand, overload)
  const is503 =
    status === 503 ||
    statusStr === 'UNAVAILABLE' ||
    messageStr.includes('503') ||
    messageStr.includes('UNAVAILABLE') ||
    messageStr.includes('high demand') ||
    messageStr.includes('overloaded');

  if (is503) {
    let retryDelayMs: number | null = null;
    const match = messageStr.match(/retry after\s+([0-9.]+)/i);
    if (match) {
      retryDelayMs = Math.round(parseFloat(match[1]) * 1000);
    }
    return {
      category: 'UNAVAILABLE_503',
      retryDelayMs,
      isDailyQuotaExhausted: false,
      isProjectWideQuota: false,
      message: messageStr
    };
  }

  // 3. Timeout
  if (
    messageStr.includes('timed out') ||
    messageStr.includes('ETIMEDOUT') ||
    status === 504 ||
    status === 408
  ) {
    return {
      category: 'TIMEOUT',
      retryDelayMs: null,
      isDailyQuotaExhausted: false,
      isProjectWideQuota: false,
      message: messageStr
    };
  }

  // 4. Network error
  if (
    messageStr.includes('ECONNRESET') ||
    messageStr.includes('ENOTFOUND') ||
    messageStr.includes('fetch failed') ||
    messageStr.includes('network')
  ) {
    return {
      category: 'NETWORK_ERROR',
      retryDelayMs: null,
      isDailyQuotaExhausted: false,
      isProjectWideQuota: false,
      message: messageStr
    };
  }

  // 5. 400 Bad request / invalid argument
  if (status === 400 || statusStr === 'INVALID_ARGUMENT') {
    return {
      category: 'CLIENT_ERROR_400',
      retryDelayMs: null,
      isDailyQuotaExhausted: false,
      isProjectWideQuota: false,
      message: messageStr
    };
  }

  return {
    category: 'UNKNOWN',
    retryDelayMs: null,
    isDailyQuotaExhausted: false,
    isProjectWideQuota: false,
    message: messageStr
  };
}

export class GeminiOrchestrator {
  private aiClient: GoogleGenAI | null = null;
  private readonly primaryModel = 'gemini-3.8-flash';
  private readonly fallbackModel = 'gemini-3.1-flash-lite';

  // Cooldown tracker per model (timestamp in ms until which model is unavailable)
  private modelCooldownUntil = new Map<string, number>();

  // Global project quota cooldown (if project-wide quota is exhausted)
  private projectQuotaCooldownUntil = 0;

  // In-flight promises to deduplicate concurrent requests with identical inputs
  private inFlightRequests = new Map<string, Promise<any>>();

  // Cache
  private responseCache = new MemoryCache(500);

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err: any) {
        logGeminiEvent({
          category: 'UNKNOWN',
          reason: `Failed to initialize GoogleGenAI: ${err?.message || err}`
        });
      }
    }
  }

  /**
   * Status reporter for /api/ai/status
   */
  getStatus() {
    const primaryExhausted = this.isModelOnCooldown(this.primaryModel);
    const fallbackExhausted = this.isModelOnCooldown(this.fallbackModel);
    const projectExhausted = Date.now() < this.projectQuotaCooldownUntil;

    return {
      hasKey: Boolean(this.aiClient),
      primaryModel: this.primaryModel,
      fallbackModel: this.fallbackModel,
      liveModel: 'gemini-3.8-live',
      primaryModelAvailable: !primaryExhausted && !projectExhausted,
      fallbackModelAvailable: !fallbackExhausted && !projectExhausted,
      quotaStatus: projectExhausted || (primaryExhausted && fallbackExhausted) ? 'exhausted' : primaryExhausted ? 'primary_exhausted_using_fallback' : 'healthy',
      primaryResetTime: primaryExhausted ? new Date(this.modelCooldownUntil.get(this.primaryModel)!).toISOString() : null,
      status: this.aiClient ? 'connected' : 'offline_fallback'
    };
  }

  public isModelOnCooldown(model: string): boolean {
    const cooldown = this.modelCooldownUntil.get(model);
    if (!cooldown) return false;
    if (Date.now() >= cooldown) {
      this.modelCooldownUntil.delete(model);
      return false;
    }
    return true;
  }

  public setModelCooldown(model: string, delayMs: number): void {
    const until = Date.now() + delayMs;
    this.modelCooldownUntil.set(model, until);
    logGeminiEvent({
      category: 'RATE_LIMIT_429',
      model,
      cooldownSeconds: Math.round(delayMs / 1000),
      retryOutcome: 'model_cooldown_activated'
    });
  }

  public setProjectCooldown(delayMs: number): void {
    this.projectQuotaCooldownUntil = Date.now() + delayMs;
    logGeminiEvent({
      category: 'RATE_LIMIT_429',
      cooldownSeconds: Math.round(delayMs / 1000),
      retryOutcome: 'project_quota_cooldown_activated'
    });
  }

  /**
   * Helper to execute a single call on a model with bounded retries for 503 / transient network errors.
   */
  private async executeOnModelWithBackoff(
    model: string,
    operation: () => Promise<any>
  ): Promise<{ success: boolean; data?: any; errorParsed?: ReturnType<typeof parseGeminiError> }> {
    const maxRetries = 2; // Total up to 3 attempts
    const baseDelayMs = 800;
    const maxBackoffMs = 3000;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const timeoutMs = 20000; // 20s bounded timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Call to model ${model} timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        logGeminiEvent({
          category: 'SUCCESS',
          model,
          attempt,
          retryOutcome: 'resolved'
        });
        return { success: true, data: result };
      } catch (err: any) {
        const parsed = parseGeminiError(err);

        // 1. Quota Exhaustion (429) -> STOP retries immediately on this model!
        if (parsed.category === 'RATE_LIMIT_429') {
          const cooldownMs = parsed.retryDelayMs || (parsed.isDailyQuotaExhausted ? 43200000 : 60000); // 12 hours or 1 min
          if (parsed.isProjectWideQuota) {
            this.setProjectCooldown(cooldownMs);
          } else {
            this.setModelCooldown(model, cooldownMs);
          }

          logGeminiEvent({
            category: 'RATE_LIMIT_429',
            model,
            attempt,
            cooldownSeconds: Math.round(cooldownMs / 1000),
            retryOutcome: 'stop_retries_quota_exhausted',
            reason: parsed.isDailyQuotaExhausted ? 'daily_quota_limit' : 'rate_limit'
          });
          return { success: false, errorParsed: parsed };
        }

        // 2. Client error (400) -> Non-retryable
        if (parsed.category === 'CLIENT_ERROR_400') {
          logGeminiEvent({
            category: 'CLIENT_ERROR_400',
            model,
            attempt,
            retryOutcome: 'no_retry_client_error'
          });
          return { success: false, errorParsed: parsed };
        }

        // 3. Transient error (503 UNAVAILABLE or TIMEOUT or NETWORK_ERROR)
        const isLastAttempt = attempt > maxRetries;
        if (isLastAttempt) {
          logGeminiEvent({
            category: parsed.category,
            model,
            attempt,
            retryOutcome: 'exhausted_max_retries'
          });
          return { success: false, errorParsed: parsed };
        }

        // Compute bounded exponential backoff with jitter & server delay
        let delayMs = Math.min(maxBackoffMs, baseDelayMs * Math.pow(2, attempt - 1));
        const jitterMs = Math.floor(Math.random() * 300);
        delayMs += jitterMs;

        if (parsed.retryDelayMs && parsed.retryDelayMs > 0) {
          delayMs = Math.min(5000, Math.max(delayMs, parsed.retryDelayMs));
        }

        logGeminiEvent({
          category: parsed.category,
          model,
          attempt,
          delayMs,
          retryOutcome: 'retrying_with_backoff',
          reason: parsed.message.slice(0, 80)
        });

        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    return { success: false };
  }

  /**
   * Primary orchestrator method:
   * 1. Check response cache
   * 2. Deduplicate in-flight requests
   * 3. Call primary model (gemini-3.8-flash) if available
   * 4. If primary fails with 503 or model-specific 429, try verified fallback (gemini-3.1-flash-lite)
   * 5. If all fail, return fallback response with standard advisory message
   */
  async executeWithFallback<T>(
    cacheKey: string,
    ttlMs: number,
    operationFactory: (model: string) => Promise<T>
  ): Promise<{ data: T | null; isAiGenerated: boolean; modelUsed?: string; message?: string }> {
    // 1. Response cache lookup
    const cached = this.responseCache.get<T>(cacheKey);
    if (cached !== null) {
      logGeminiEvent({
        category: 'CACHE_HIT',
        retryOutcome: 'served_from_memory_cache'
      });
      return { data: cached, isAiGenerated: true, modelUsed: 'cache' };
    }

    // 2. In-flight request deduplication (Promise collapsing)
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      logGeminiEvent({
        category: 'IN_FLIGHT_COALESCED',
        retryOutcome: 'joined_existing_promise'
      });
      return inFlight;
    }

    const executionPromise = (async () => {
      if (!this.aiClient) {
        return {
          data: null,
          isAiGenerated: false,
          message: AI_UNAVAILABLE_MESSAGE
        };
      }

      // Check project-wide cooldown
      if (Date.now() < this.projectQuotaCooldownUntil) {
        logGeminiEvent({
          category: 'RATE_LIMIT_429',
          retryOutcome: 'short_circuit_project_quota_exhausted'
        });
        return {
          data: null,
          isAiGenerated: false,
          message: AI_UNAVAILABLE_MESSAGE
        };
      }

      // Candidate models in sequence
      const modelsToTry: string[] = [];

      // Primary model: gemini-3.8-flash
      if (!this.isModelOnCooldown(this.primaryModel)) {
        modelsToTry.push(this.primaryModel);
      } else {
        logGeminiEvent({
          category: 'RATE_LIMIT_429',
          model: this.primaryModel,
          retryOutcome: 'bypassing_primary_due_to_active_cooldown'
        });
      }

      // Fallback model: gemini-3.1-flash-lite
      if (!this.isModelOnCooldown(this.fallbackModel)) {
        modelsToTry.push(this.fallbackModel);
      }

      for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        if (i > 0) {
          logGeminiEvent({
            category: 'MODEL_FALLBACK',
            model,
            retryOutcome: `switched_to_fallback_model_${model}`
          });
        }

        const runResult = await this.executeOnModelWithBackoff(model, () => operationFactory(model));

        if (runResult.success && runResult.data !== undefined) {
          // Cache successful response
          this.responseCache.set(cacheKey, runResult.data, ttlMs);
          return {
            data: runResult.data as T,
            isAiGenerated: true,
            modelUsed: model
          };
        }

        // If error was project-wide quota exhaustion, do NOT attempt other models
        if (runResult.errorParsed?.isProjectWideQuota) {
          logGeminiEvent({
            category: 'RATE_LIMIT_429',
            retryOutcome: 'stop_all_models_project_wide_quota'
          });
          break;
        }
      }

      // All candidate models failed
      logGeminiEvent({
        category: 'UNKNOWN',
        retryOutcome: 'all_models_exhausted_serving_fallback'
      });
      return {
        data: null,
        isAiGenerated: false,
        message: AI_UNAVAILABLE_MESSAGE
      };
    })();

    this.inFlightRequests.set(cacheKey, executionPromise);

    try {
      const outcome = await executionPromise;
      return outcome;
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
  }

  /**
   * Helper for structured JSON endpoints
   */
  async generateJson<T>(
    cacheKey: string,
    prompt: string,
    systemInstruction?: string,
    ttlMs = 1800000 // 30 minutes default TTL
  ): Promise<{ data: T | null; isAiGenerated: boolean; message?: string; modelUsed?: string }> {
    const defaultInstruction =
      'You are CareerPilot AI, an expert career counselor, tech recruiter, and ATS specialist. Return only valid JSON adhering strictly to the requested schema. No markdown fences if possible.';

    return this.executeWithFallback<T>(cacheKey, ttlMs, async model => {
      if (!this.aiClient) throw new Error('AI client uninitialized');

      const response = await this.aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || defaultInstruction,
          responseMimeType: 'application/json'
        }
      });

      let text = response.text?.trim() || '';
      if (!text) throw new Error('Empty response from model');

      if (text.startsWith('```json')) {
        text = text.slice(7);
      } else if (text.startsWith('```')) {
        text = text.slice(3);
      }
      if (text.endsWith('```')) {
        text = text.slice(0, -3);
      }
      text = text.trim();

      return JSON.parse(text) as T;
    });
  }

  /**
   * Helper for Multi-Turn Chat
   */
  async generateChat(
    messages: { role: string; content: string }[],
    systemInstruction: string,
    complexity = 'general'
  ): Promise<{ reply: string; isAiGenerated: boolean; modelUsed?: string; message?: string }> {
    // Generate deterministic cache key from message history
    const cacheKey = `chat:${complexity}:${JSON.stringify(messages)}`;

    const outcome = await this.executeWithFallback<string>(cacheKey, 300000, async model => {
      if (!this.aiClient) throw new Error('AI client uninitialized');

      const formattedContents = (messages || []).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await this.aiClient.models.generateContent({
        model,
        contents: formattedContents,
        config: {
          systemInstruction
        }
      });

      return response.text || '';
    });

    if (outcome.isAiGenerated && outcome.data) {
      return {
        reply: outcome.data,
        isAiGenerated: true,
        modelUsed: outcome.modelUsed
      };
    }

    return {
      reply: AI_UNAVAILABLE_MESSAGE,
      isAiGenerated: false,
      message: AI_UNAVAILABLE_MESSAGE
    };
  }

  /**
   * Helper for Google Search Grounding
   */
  async generateSearchGrounding(
    query: string,
    topic = 'tech'
  ): Promise<{
    text: string;
    isAiGenerated: boolean;
    groundingChunks?: any[];
    webSearchQueries?: string[];
    modelUsed?: string;
    message?: string;
  }> {
    const cacheKey = `search:${topic}:${query.trim().toLowerCase()}`;

    const outcome = await this.executeWithFallback<{
      text: string;
      groundingChunks: any[];
      webSearchQueries: string[];
    }>(cacheKey, 900000, async model => {
      if (!this.aiClient) throw new Error('AI client uninitialized');

      const prompt = `Provide the latest up-to-date market information, verified salaries, hiring trends, and real-time industry demands for: "${query}". Context topic: ${topic}. Cite facts and sources clearly.`;

      const response = await this.aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction:
            'You are CareerPilot Market Intel. Use Google Search grounding to give authoritative, up-to-date industry stats, salary bands, and emerging skill demands with source links when possible.'
        }
      });

      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;

      return {
        text: response.text || '',
        groundingChunks: groundingMetadata?.groundingChunks || [],
        webSearchQueries: groundingMetadata?.webSearchQueries || []
      };
    });

    if (outcome.isAiGenerated && outcome.data) {
      return {
        text: outcome.data.text,
        groundingChunks: outcome.data.groundingChunks,
        webSearchQueries: outcome.data.webSearchQueries,
        isAiGenerated: true,
        modelUsed: outcome.modelUsed
      };
    }

    return {
      text: AI_UNAVAILABLE_MESSAGE,
      isAiGenerated: false,
      groundingChunks: [],
      webSearchQueries: [],
      message: AI_UNAVAILABLE_MESSAGE
    };
  }

  getAiClient(): GoogleGenAI | null {
    return this.aiClient;
  }
}
