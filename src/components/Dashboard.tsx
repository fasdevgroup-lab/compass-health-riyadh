import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SurveyAxis, SurveyResponse, SurveyIndicator } from '../lib/supabase';
import {
  ClipboardList,
  TrendingUp,
  Target,
  Building2,
  Users,
  DollarSign,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

interface AxisScore {
  axis: SurveyAxis;
  score: number;
  maxScore: number;
  percentage: number;
  indicators: number;
  completed: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-300 text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}

function ProgressBar({ value, max, color = 'emerald' }: { value: number; max: number; color?: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    blue: 'from-blue-500 to-indigo-500'
  };

  return (
    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { association } = useAuth();
  const [loading, setLoading] = useState(true);
  const [axes, setAxes] = useState<AxisScore[]>([]);
  const [latestResponse, setLatestResponse] = useState<SurveyResponse | null>(null);
  const [totalIndicators, setTotalIndicators] = useState(0);
  const [completedIndicators, setCompletedIndicators] = useState(0);

  useEffect(() => {
    loadData();
  }, [association]);

  const loadData = async () => {
    if (!association) return;

    setLoading(true);
    try {
      const { data: axesData } = await supabase
        .from('survey_axes')
        .select('*, indicators:survey_indicators(*)')
        .order('sort_order');

      if (!axesData) return;

      const { data: response } = await supabase
        .from('survey_responses')
        .select('*, scores:indicator_scores(*)')
        .eq('association_id', association.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (response) {
        setLatestResponse(response);

        const scoresMap = new Map(
          (response.scores || []).map((s: { indicator_id: string; score: number }) => [s.indicator_id, s.score])
        );

        const axisScores: AxisScore[] = axesData.map((axis) => {
          const indicators = axis.indicators as SurveyIndicator[];
          let axisScore = 0;
          let axisMaxScore = 0;
          let completed = 0;

          indicators.forEach((ind) => {
            axisMaxScore += 5 * (ind.weight || 1);
            if (scoresMap.has(ind.id)) {
              axisScore += scoresMap.get(ind.id)! * (ind.weight || 1);
              completed++;
            }
          });

          return {
            axis,
            score: axisScore,
            maxScore: axisMaxScore,
            percentage: axisMaxScore > 0 ? (axisScore / axisMaxScore) * 100 : 0,
            indicators: indicators.length,
            completed
          };
        });

        setAxes(axisScores);

        const total = axisScores.reduce((sum, a) => sum + a.indicators, 0);
        const completed = axisScores.reduce((sum, a) => sum + a.completed, 0);
        setTotalIndicators(total);
        setCompletedIndicators(completed);
      } else {
        const axisScores: AxisScore[] = axesData.map((axis) => ({
          axis,
          score: 0,
          maxScore: 0,
          percentage: 0,
          indicators: (axis.indicators as SurveyIndicator[]).length,
          completed: 0
        }));
        setAxes(axisScores);

        const total = axisScores.reduce((sum, a) => sum + a.indicators, 0);
        setTotalIndicators(total);
        setCompletedIndicators(0);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'emerald';
    if (percentage >= 40) return 'amber';
    return 'red';
  };

  const overallPercentage = axes.length > 0
    ? axes.reduce((sum, a) => sum + a.percentage, 0) / axes.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة المعلومات</h1>
          <p className="text-slate-400">نظرة عامة على أداء الجمعية واحتياجاتها</p>
        </div>
        {!latestResponse && (
          <button
            onClick={() => onNavigate?.('survey')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <ClipboardList className="w-5 h-5" />
            <span>ابدأ الاستبيان</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مستوى النضج الكلي"
          value={`${overallPercentage.toFixed(0)}%`}
          subtitle="معدل الجاهزية الشامل"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="المؤشرات المكتملة"
          value={`${completedIndicators}/${totalIndicators}`}
          subtitle={`من ${totalIndicators} مؤشر`}
          icon={<Target className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="موظفين الجمعية"
          value={association?.employee_count || '-'}
          subtitle="عدد الموظفين"
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="الميزانية السنوية"
          value={association?.annual_budget ? `${(association.annual_budget / 1000000).toFixed(1)}M` : '-'}
          subtitle="ريال سعودي"
          icon={<DollarSign className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              أداء المحاور
            </h2>
            <span className="text-sm text-slate-400">10 محاور رئيسية</span>
          </div>

          <div className="space-y-4">
            {axes.map((axisScore) => {
              const color = getStatusColor(axisScore.percentage);
              const Icon = Building2;
              return (
                <div key={axisScore.axis.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-white text-sm font-medium">{axisScore.axis.name_ar}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {axisScore.completed}/{axisScore.indicators} مؤشر
                      </span>
                      <span className={`text-sm font-bold ${
                        color === 'emerald' ? 'text-emerald-400' :
                        color === 'amber' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {axisScore.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={axisScore.percentage}
                    max={100}
                    color={color}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-4">حالة الاستبيان</h2>

          {latestResponse ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${
                latestResponse.status === 'submitted'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : latestResponse.status === 'draft'
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-slate-500/10 border border-slate-500/20'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {latestResponse.status === 'submitted' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                  <span className={`font-medium ${
                    latestResponse.status === 'submitted' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {latestResponse.status === 'submitted' ? 'مكتمل' : 'قيد الإنجاز'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  عام {latestResponse.year}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">درجة التقدم</span>
                  <span className="text-white font-medium">
                    {completedIndicators}/{totalIndicators}
                  </span>
                </div>
                <ProgressBar value={completedIndicators} max={totalIndicators} color="emerald" />
              </div>

              <button
                onClick={() => onNavigate?.('survey')}
                className="w-full py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all text-sm font-medium"
              >
                متابعة الاستبيان
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-white font-medium mb-2">لم يبدأ الاستبيان بعد</h3>
              <p className="text-slate-400 text-sm mb-4">
                ابدأ بتعبئة الاستبيان لتحليل احتياجات جمعيتك
              </p>
              <button
                onClick={() => onNavigate?.('survey')}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all"
              >
                ابدأ الآن
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
