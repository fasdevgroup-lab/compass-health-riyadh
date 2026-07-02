import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SurveyAxis, SurveyIndicator, IndicatorScore } from '../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  Loader2
} from 'lucide-react';

interface AxisAnalysis {
  axis: SurveyAxis;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  color: string;
  strengths: string[];
  weaknesses: string[];
  gaps: { indicator: SurveyIndicator; current: number; target: number; gap: number }[];
}

type AnalysisType = 'swot' | 'pestel' | 'gap' | 'priority' | 'maturity';

export function Analysis() {
  const { association } = useAuth();
  const [loading, setLoading] = useState(true);
  const [axesAnalysis, setAxesAnalysis] = useState<AxisAnalysis[]>([]);
  const [activeType, setActiveType] = useState<AnalysisType>('swot');
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (association) {
      loadData();
    }
  }, [association]);

  const loadData = async () => {
    if (!association) return;

    setLoading(true);
    try {
      const { data: axesData } = await supabase
        .from('survey_axes')
        .select('*, indicators:survey_indicators(*)')
        .order('sort_order');

      const { data: response } = await supabase
        .from('survey_responses')
        .select('*, scores:indicator_scores(*)')
        .eq('association_id', association.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!axesData) return;

      const scoresMap = new Map<string, number>();
      const notesMap = new Map<string, string>();

      if (response && response.scores) {
        (response.scores as IndicatorScore[]).forEach((s) => {
          scoresMap.set(s.indicator_id, s.score);
          if (s.notes) notesMap.set(s.indicator_id, s.notes);
        });
      }

      const analysis: AxisAnalysis[] = axesData.map((axis) => {
        const indicators = (axis.indicators as SurveyIndicator[]) || [];
        let axisScore = 0;
        let axisMaxScore = 0;
        const gaps: AxisAnalysis['gaps'] = [];
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        indicators.forEach((ind) => {
          const weight = ind.weight || 1;
          axisMaxScore += 5 * weight;
          const score = scoresMap.get(ind.id) || 0;
          axisScore += score * weight;

          if (score >= 4) {
            strengths.push(ind.name_ar);
          } else if (score > 0 && score <= 2) {
            weaknesses.push(ind.name_ar);
          }

          if (score > 0 && score < 4) {
            gaps.push({
              indicator: ind,
              current: score,
              target: 4,
              gap: 4 - score
            });
          }
        });

        const percentage = axisMaxScore > 0 ? (axisScore / axisMaxScore) * 100 : 0;
        let grade = '';
        let color = '';

        if (percentage >= 80) {
          grade = 'متميز';
          color = 'emerald';
        } else if (percentage >= 60) {
          grade = 'جيد جداً';
          color = 'teal';
        } else if (percentage >= 40) {
          grade = 'جيد';
          color = 'amber';
        } else if (percentage >= 20) {
          grade = 'يحتاج تحسين';
          color = 'orange';
        } else {
          grade = 'ضعيف';
          color = 'red';
        }

        return {
          axis: axis as SurveyAxis,
          score: axisScore,
          maxScore: axisMaxScore,
          percentage,
          grade,
          color,
          strengths,
          weaknesses,
          gaps: gaps.sort((a, b) => b.gap - a.gap).slice(0, 5)
        };
      });

      setAxesAnalysis(analysis);

      const totalScore = analysis.reduce((sum, a) => sum + a.score, 0);
      const totalMax = analysis.reduce((sum, a) => sum + a.maxScore, 0);
      setOverallScore(totalMax > 0 ? (totalScore / totalMax) * 100 : 0);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return colors[color] || colors.amber;
  };

  const renderSWOT = () => {
    const allStrengths = axesAnalysis.flatMap((a) => a.strengths).slice(0, 10);
    const allWeaknesses = axesAnalysis.flatMap((a) => a.weaknesses).slice(0, 10);

    const opportunities = [
      'التحول الرقمي في القطاع غير الربحي',
      'دعم رؤية 2030 للقطاع الصحي',
      'زيادة الوعي بالعمل التطوعي',
      'تطور تقنيات الطب عن بعد',
      'شراكات مع التجمعات الصحية'
    ];

    const threats = [
      'المنافسة على الموارد المالية',
      'التغيرات التنظيمية والقوانين',
      'نقص الكفاءات المتخصصة',
      'التحديات الاقتصادية',
      'التطور التقني السريع'
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-400">نقاط القوة</h3>
              <p className="text-emerald-200/60 text-sm">Internal Strengths</p>
            </div>
          </div>
          <ul className="space-y-2">
            {allStrengths.length > 0 ? allStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{s}</span>
              </li>
            )) : (
              <li className="text-slate-400 text-sm">أكمل الاستبيان لظهور نقاط القوة</li>
            )}
          </ul>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-500/20">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400">نقاط الضعف</h3>
              <p className="text-red-200/60 text-sm">Internal Weaknesses</p>
            </div>
          </div>
          <ul className="space-y-2">
            {allWeaknesses.length > 0 ? allWeaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </li>
            )) : (
              <li className="text-slate-400 text-sm">لا توجد نقاط ضعف بارزة</li>
            )}
          </ul>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <ArrowUpRight className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-400">الفرص</h3>
              <p className="text-blue-200/60 text-sm">External Opportunities</p>
            </div>
          </div>
          <ul className="space-y-2">
            {opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-400">التهديدات</h3>
              <p className="text-amber-200/60 text-sm">External Threats</p>
            </div>
          </div>
          <ul className="space-y-2">
            {threats.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <ArrowDownRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderGapAnalysis = () => {
    const allGaps = axesAnalysis
      .flatMap((a) => a.gaps.map((g) => ({ ...g, axis: a.axis })))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 15);

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">تحليل الفجوات الرئيسية</h3>
          <div className="space-y-4">
            {allGaps.length > 0 ? allGaps.map((gap, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{gap.indicator.name_ar}</p>
                  <p className="text-slate-400 text-xs">{gap.axis.name_ar}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">{gap.current}</span>
                  <Minus className="w-4 h-4 text-slate-500" />
                  <span className="text-emerald-400 text-sm font-medium">{gap.target}</span>
                </div>
                <div className="w-20 bg-white/5 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${(gap.gap / 5) * 100}%` }}
                  />
                </div>
                <span className="text-red-400 text-sm font-bold w-12">-{gap.gap}</span>
              </div>
            )) : (
              <p className="text-slate-400 text-center py-8">أكمل الاستبيان لظهور تحليل الفجوات</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPriorityAnalysis = () => {
    const priorities = axesAnalysis
      .map((a) => ({
        axis: a.axis,
        score: a.percentage,
        priority: a.percentage < 40 ? 'عالية' : a.percentage < 60 ? 'متوسطة' : 'منخفضة',
        priorityScore: a.percentage < 40 ? 3 : a.percentage < 60 ? 2 : 1
      }))
      .sort((a, b) => a.priorityScore - b.priorityScore);

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">ترتيب الأولويات التدخل</h3>
          <div className="space-y-3">
            {priorities.map((p, i) => {
              const colorClasses = getColorClasses(
                p.priority === 'عالية' ? 'red' : p.priority === 'متوسطة' ? 'amber' : 'emerald'
              );
              return (
                <div
                  key={p.axis.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${colorClasses.bg} border ${colorClasses.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} flex items-center justify-center ${colorClasses.text} font-bold`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{p.axis.name_ar}</p>
                    <p className="text-slate-400 text-sm">{p.axis.description}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-lg font-bold ${colorClasses.text}`}>
                      {p.score.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-400">أولوية {p.priority}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMaturityAnalysis = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {['المستوى 1', 'المستوى 2', 'المستوى 3', 'المستوى 4', 'المستوى 5'].map((level, i) => (
            <div
              key={level}
              className={`p-4 rounded-xl text-center ${
                i < Math.floor(overallScore / 20)
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <p className={`text-sm font-medium ${i < Math.floor(overallScore / 20) ? 'text-emerald-400' : 'text-slate-400'}`}>
                {level}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {i * 20}-{(i + 1) * 20}%
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">مستوى النضج المؤسسي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {axesAnalysis.map((a) => {
              const colorClasses = getColorClasses(a.color);
              return (
                <div key={a.axis.id} className={`p-4 rounded-xl ${colorClasses.bg} border ${colorClasses.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{a.axis.name_ar}</p>
                    <span className={`${colorClasses.text} font-bold`}>{a.grade}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${colorClasses.text.replace('text', 'bg')}`}
                      style={{ width: `${a.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{a.percentage.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const analysisTabs: { id: AnalysisType; label: string; icon: React.ElementType }[] = [
    { id: 'swot', label: 'تحليل SWOT', icon: PieChart },
    { id: 'gap', label: 'تحليل الفجوات', icon: BarChart3 },
    { id: 'priority', label: 'ترتيب الأولويات', icon: Target },
    { id: 'maturity', label: 'مستوى النضج', icon: LineChart }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">التحليلات الاستراتيجية</h1>
          <p className="text-slate-400">تحليل شامل للاحتياجات والفجوات والأولويات</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-3xl font-bold text-emerald-400">{overallScore.toFixed(0)}%</p>
            <p className="text-xs text-slate-400">الدرجة الكلية</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {analysisTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeType === 'swot' && renderSWOT()}
      {activeType === 'gap' && renderGapAnalysis()}
      {activeType === 'priority' && renderPriorityAnalysis()}
      {activeType === 'maturity' && renderMaturityAnalysis()}
    </div>
  );
}
