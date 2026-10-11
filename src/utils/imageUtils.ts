/**
 * Validates and resizes user profile picture to a clean, optimized square Data URL.
 * Handles JPG, JPEG, PNG, and WebP up to 5MB.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) || 
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isAllowedType) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WebP photo.'
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMb} MB). Maximum allowed image size is 5 MB.`
    };
  }

  return { valid: true };
}

/**
 * Resizes and center-crops image to a clean square data URL (320x320)
 * to ensure crisp display across all device resolutions while avoiding localStorage quota limits.
 */
export function processImageFile(file: File, size = 320, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('The uploaded file could not be decoded as a valid image.'));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas rendering context unavailable.'));
            return;
          }

          // Center-crop calculation for square avatar
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            size,
            size
          );

          // Convert to jpeg data URL with high quality
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
