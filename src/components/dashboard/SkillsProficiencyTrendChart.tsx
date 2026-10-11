import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Skill } from '../../types';
import { StorageService } from '../../services/storage';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';

interface SkillsProficiencyTrendChartProps {
  skills: Skill[];
  onSkillPracticed?: () => void;
}

// Brand color palette for the top three lines
const SKILL_COLORS = [
  {
    stroke: '#580F69', // Deep Royal Brand Purple
    fillBg: 'bg-[#580F69]/10',
    border: 'border-[#580F69]/30',
    text: 'text-[#580F69]',
    badgeBg: 'bg-[#580F69]',
    gradient: 'from-[#580F69] to-[#8B26A6]'
  },
  {
    stroke: '#8B26A6', // Vivid Purple
    fillBg: 'bg-[#8B26A6]/10',
    border: 'border-[#8B26A6]/30',
    text: 'text-[#8B26A6]',
    badgeBg: 'bg-[#8B26A6]',
    gradient: 'from-[#8B26A6] to-[#A855F7]'
  },
  {
    stroke: '#C056D4', // Orchid / Light Accent Purple
    fillBg: 'bg-[#C056D4]/10',
    border: 'border-[#C056D4]/30',
    text: 'text-[#C056D4]',
    badgeBg: 'bg-[#C056D4]',
    gradient: 'from-[#C056D4] to-[#E879F9]'
  }
];

export const SkillsProficiencyTrendChart: React.FC<SkillsProficiencyTrendChartProps> = ({
  skills,
  onSkillPracticed
}) => {
  const { success } = useToast();
  const [metricMode, setMetricMode] = useState<'score' | 'hours'>('score');
  const [hiddenSkills, setHiddenSkills] = useState<Record<string, boolean>>({});

  // 1. Identify the Top Three Most-Practiced Skills
  // Practice priority: practiceHours * 2 + practiceCount * 3
  const topThreeSkills = useMemo(() => {
    // Prefer saved skills, fallback to all catalog skills if fewer than 3 saved
    let candidates = skills.filter(s => s.isSaved);
    if (candidates.length < 3) {
      const unsaved = skills.filter(s => !s.isSaved);
      candidates = [...candidates, ...unsaved];
    }

    const sorted = [...candidates].sort((a, b) => {
      const scoreA = (a.practiceHours || 0) * 2 + (a.practiceCount || 0) * 3;
      const scoreB = (b.practiceHours || 0) * 2 + (b.practiceCount || 0) * 3;
      return scoreB - scoreA;
    });

    return sorted.slice(0, 3);
  }, [skills]);

  // 2. Build the Time Series Data across the periods for Recharts
  const chartData = useMemo(() => {
    if (topThreeSkills.length === 0) return [];

    // Collect all unique periods (e.g. Month 1 ... Month 6)
    const periodsSet = new Set<string>();
    topThreeSkills.forEach(skill => {
      skill.proficiencyHistory?.forEach(pt => {
        periodsSet.add(pt.date);
      });
    });

    let periods = Array.from(periodsSet);
    if (periods.length === 0) {
      periods = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    }

    return periods.map(period => {
      const point: Record<string, any> = { period };

      topThreeSkills.forEach(skill => {
        const historyPt = skill.proficiencyHistory?.find(h => h.date === period);
        if (historyPt) {
          point[skill.id] = historyPt.score;
          point[`${skill.id}_hours`] = historyPt.hours ?? 0;
        } else {
          // Approximate based on skill level if point is missing
          const defaultScore =
            skill.proficiency === 'Advanced' ? 85 : skill.proficiency === 'Intermediate' ? 65 : 40;
          point[skill.id] = defaultScore;
          point[`${skill.id}_hours`] = skill.practiceHours ?? 10;
        }
      });

      return point;
    });
  }, [topThreeSkills]);

  // Toggle visibility of a specific skill line
  const toggleSkillVisibility = (skillId: string) => {
    setHiddenSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  // Quick 1-hr practice session logger
  const handleQuickPractice = (skill: Skill, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = StorageService.logSkillPractice(skill.id, 1);
    if (updated) {
      success(
        'Practice Logged!',
        `Logged +1 hr practice for "${skill.name}". Total: ${updated.practiceHours} hrs.`
      );
      if (onSkillPracticed) {
        onSkillPracticed();
      }
    }
  };

  if (topThreeSkills.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#D2B9E0] text-center space-y-3">
        <TrendingUp className="w-8 h-8 text-[#580F69] mx-auto opacity-70" />
        <h3 className="text-lg font-bold text-[#370D48]">Skills Proficiency Trend</h3>
        <p className="text-xs text-[#240D2F]/70 max-w-md mx-auto">
          Start practicing skills in your toolkit to visualize proficiency curves and growth trajectories over time.
        </p>
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#580F69] text-white text-xs font-bold"
        >
          Explore Skills Catalog →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F7F5F8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Competency Velocity</span>
            </span>
            <Badge variant="accent">Top 3 Most-Practiced</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#370D48] tracking-tight">
            Skills Proficiency Trend
          </h2>
          <p className="text-xs sm:text-sm text-[#240D2F]/75 max-w-2xl">
            Longitudinal mastery curves tracking technical competency over 6 months across your most frequently practiced competencies.
          </p>
        </div>

        {/* View toggles & Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex p-1 bg-[#F7F5F8] border border-[#D2B9E0]/60 rounded-xl">
            <button
              onClick={() => setMetricMode('score')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                metricMode === 'score'
                  ? 'bg-[#580F69] text-white shadow-xs'
                  : 'text-[#370D48]/70 hover:text-[#370D48]'
              }`}
            >
              Proficiency Score (%)
            </button>
            <button
              onClick={() => setMetricMode('hours')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                metricMode === 'hours'
                  ? 'bg-[#580F69] text-white shadow-xs'
                  : 'text-[#370D48]/70 hover:text-[#370D48]'
              }`}
            >
              Practice Hours (hrs)
            </button>
          </div>

          <Link
            to="/skills"
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[#D2B9E0] text-[#580F69] hover:bg-[#D2B9E0]/20 text-xs font-bold transition-all"
          >
            <span>All Skills</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 3 Interactive Skill Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThreeSkills.map((skill, index) => {
          const color = SKILL_COLORS[index % SKILL_COLORS.length];
          const isHidden = Boolean(hiddenSkills[skill.id]);

          // Calculate growth from first recorded score to last
          const history = skill.proficiencyHistory || [];
          const initialScore = history[0]?.score ?? 30;
          const currentScore = history[history.length - 1]?.score ?? (metricMode === 'score' ? 75 : skill.practiceHours || 20);
          const growth = currentScore - initialScore;

          return (
            <div
              key={skill.id}
              onClick={() => toggleSkillVisibility(skill.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isHidden
                  ? 'bg-gray-50/70 border-gray-200 opacity-60'
                  : `${color.fillBg} ${color.border} shadow-xs hover:border-[#580F69]`
              }`}
              title="Click to toggle line in trend chart"
            >
              {/* Top Row: Rank & Visibility */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-extrabold ${color.badgeBg}`}
                  >
                    #{index + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#370D48]/70">
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#240D2F]/70">
                  {isHidden ? (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Eye className={`w-3.5 h-3.5 ${color.text}`} />
                  )}
                </div>
              </div>

              {/* Skill Name */}
              <div className="font-extrabold text-[#370D48] text-base leading-snug truncate">
                <Link
                  to={`/skills/${skill.id}`}
                  onClick={e => e.stopPropagation()}
                  className="hover:underline flex items-center gap-1 group-hover:text-[#580F69]"
                >
                  <span>{skill.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Metrics Grid */}
              <div className="mt-3 pt-3 border-t border-black/5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[11px] text-[#240D2F]/60">
                    {metricMode === 'score' ? 'Current Level' : 'Total Practice'}
                  </div>
                  <div className={`text-base font-extrabold ${color.text}`}>
                    {metricMode === 'score'
                      ? `${currentScore}% (${skill.proficiency || 'Intermediate'})`
                      : `${skill.practiceHours || currentScore} hrs`}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#240D2F]/60">6-Mo Growth</div>
                  <div className="text-base font-extrabold text-emerald-800 flex items-center gap-0.5">
                    <span>+{growth > 0 ? growth : 15}%</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                <span className="text-[#240D2F]/70">
                  <Clock className="w-3 h-3 inline mr-1 text-[#580F69]" />
                  {skill.practiceHours || 0} hrs • {skill.practiceCount || 0} sessions
                </span>

                <button
                  onClick={e => handleQuickPractice(skill, e)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D2B9E0] text-[#580F69] hover:bg-[#580F69] hover:text-white font-bold transition-all text-[11px] shadow-2xs"
                  title="Log 1 hour practice session"
                >
                  <Plus className="w-3 h-3" />
                  <span>+1h Log</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="pt-2">
        <div className="h-80 sm:h-96 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 24, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#EEDEF5"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                stroke="#70437A"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#D2B9E0' }}
                dy={8}
              />
              <YAxis
                domain={metricMode === 'score' ? [0, 100] : [0, 'auto']}
                ticks={metricMode === 'score' ? [0, 25, 50, 75, 100] : undefined}
                tickFormatter={val => (metricMode === 'score' ? `${val}%` : `${val}h`)}
                stroke="#70437A"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#D2B9E0' }}
                dx={-6}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-[#D2B9E0] shadow-lg text-xs space-y-2.5 min-w-[210px]">
                        <div className="font-extrabold text-[#370D48] border-b border-[#F7F5F8] pb-1.5 flex items-center justify-between">
                          <span>{label}</span>
                          <span className="text-[10px] text-[#580F69] font-normal uppercase tracking-wider">
                            Progress Snapshot
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {payload.map((entry: any) => {
                            const skill = topThreeSkills.find(s => s.id === entry.dataKey);
                            const hours = entry.payload?.[`${entry.dataKey}_hours`];
                            return (
                              <div
                                key={entry.dataKey}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="font-semibold text-[#370D48] truncate max-w-[130px]">
                                    {entry.name}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-[#370D48]">
                                    {metricMode === 'score' ? `${entry.value}%` : `${entry.value} hrs`}
                                  </span>
                                  {hours !== undefined && metricMode === 'score' && (
                                    <span className="text-[10px] text-[#240D2F]/60 ml-1">
                                      ({hours}h)
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#370D48'
                }}
              />

              {/* Top 3 Lines */}
              {topThreeSkills.map((skill, index) => {
                const color = SKILL_COLORS[index % SKILL_COLORS.length];
                const isHidden = Boolean(hiddenSkills[skill.id]);

                if (isHidden) return null;

                const dataKey = metricMode === 'score' ? skill.id : `${skill.id}_hours`;

                return (
                  <Line
                    key={skill.id}
                    type="monotone"
                    dataKey={dataKey}
                    name={skill.name}
                    stroke={color.stroke}
                    strokeWidth={3}
                    dot={{
                      r: 4.5,
                      strokeWidth: 2,
                      fill: '#FFFFFF',
                      stroke: color.stroke
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 2.5,
                      fill: color.stroke,
                      stroke: '#FFFFFF'
                    }}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Guidance Note */}
      <div className="p-3.5 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 flex items-center justify-between flex-wrap gap-2 text-xs text-[#240D2F]/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#580F69] shrink-0" />
          <span>
            <strong>AI Coach Insight:</strong> Your consistent practice in{' '}
            <strong className="text-[#580F69]">{topThreeSkills[0]?.name}</strong> and{' '}
            <strong className="text-[#8B26A6]">{topThreeSkills[1]?.name}</strong> matches the highest-weight requirements for target Tech roles.
          </span>
        </div>
        <Link
          to={`/skills/${topThreeSkills[0]?.id}`}
          className="font-bold text-[#580F69] hover:underline shrink-0 text-xs flex items-center gap-1"
        >
          <span>Curriculum & Tasks</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
