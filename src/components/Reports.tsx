import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SurveyAxis, SurveyIndicator } from '../lib/supabase';
import {
  FileText,
  Download,
  Printer,
  BarChart3,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Award,
  Loader2,
  Eye
} from 'lucide-react';

type ReportType = 'full' | 'executive' | 'axis' | 'recommendations';

interface ReportData {
  association: {
    name: string;
    category: string;
    year: number;
  };
  overallScore: number;
  axesScores: {
    axis: SurveyAxis;
    score: number;
    percentage: number;
    grade: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priorities: string[];
}

export function Reports() {
  const { association } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('executive');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (association) {
      generateReportData();
    }
  }, [association]);

  const generateReportData = async () => {
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
      if (response && response.scores) {
        response.scores.forEach((s: { indicator_id: string; score: number }) => {
          scoresMap.set(s.indicator_id, s.score);
        });
      }

      const axesScores: ReportData['axesScores'] = axesData.map((axis) => {
        const indicators = (axis.indicators as SurveyIndicator[]) || [];
        let totalWeight = 0;
        let weightedScore = 0;

        indicators.forEach((ind) => {
          const weight = ind.weight || 1;
          totalWeight += 5 * weight;
          const score = scoresMap.get(ind.id) || 0;
          weightedScore += score * weight;
        });

        const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
        let grade = '';

        if (percentage >= 80) grade = 'متميز';
        else if (percentage >= 60) grade = 'جيد جداً';
        else if (percentage >= 40) grade = 'جيد';
        else if (percentage >= 20) grade = 'يحتاج تحسين';
        else grade = 'ضعيف';

        return {
          axis: axis as SurveyAxis,
          score: weightedScore,
          percentage,
          grade
        };
      });

      const overallScore = axesScores.reduce((sum, a) => sum + a.percentage, 0) / axesScores.length;
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      axesScores.forEach((a) => {
        if (a.percentage >= 70) {
          strengths.push(`${a.axis.name_ar} (${a.percentage.toFixed(0)}%)`);
        } else if (a.percentage < 40) {
          weaknesses.push(`${a.axis.name_ar} (${a.percentage.toFixed(0)}%)`);
        }
      });

      const recommendations = [
        'تعزيز البنية التحتية الرقمية وتحسين الأنظمة الإلكترونية',
        'تطوير برامج التدريب والتأهيل للموظفين والمتطوعين',
        'بناء شراكات استراتيجية مع الجهات الحكومية والخاصة',
        'تنويع مصادر الإيرادات وتحسين الاستدامة المالية',
        'تحسين آليات التواصل مع المستفيدين وقياس رضاهم'
      ];

      const priorities = axesScores
        .filter((a) => a.percentage < 60)
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3)
        .map((a) => a.axis.name_ar);

      setReportData({
        association: {
          name: association.name,
          category: association.category_id || 'جمعية صحية',
          year: response?.year || new Date().getFullYear()
        },
        overallScore,
        axesScores,
        strengths,
        weaknesses,
        recommendations,
        priorities
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    await generateReportData();
    setPreviewMode(true);
    setGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderExecutiveSummary = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-8">
        <div className="text-center py-8 border-b border-white/10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mb-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">التقرير التنفيذي</h1>
          <h2 className="text-xl text-emerald-400">{reportData.association.name}</h2>
          <p className="text-slate-400 mt-2">دراسة قياس الاحتياج التنموي - {reportData.association.year}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <p className="text-5xl font-bold text-emerald-400 mb-2">{reportData.overallScore.toFixed(0)}%</p>
            <p className="text-slate-300">مستوى النضج الكلي</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-6 text-center">
            <p className="text-5xl font-bold text-teal-400 mb-2">{reportData.axesScores.length}</p>
            <p className="text-slate-300">محاور تم تقييمها</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
            <p className="text-5xl font-bold text-blue-400 mb-2">{reportData.priorities.length}</p>
            <p className="text-slate-300">أولويات للتدخل</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            ملخص الأداء
          </h3>
          <div className="space-y-4">
            {reportData.axesScores.map((a) => {
              const colorClass = a.percentage >= 70 ? 'bg-emerald-500' :
                a.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={a.axis.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{a.axis.name_ar}</span>
                    <span className={`text-sm font-medium ${
                      a.percentage >= 70 ? 'text-emerald-400' :
                      a.percentage >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {a.percentage.toFixed(0)}% - {a.grade}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${a.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              نقاط القوة
            </h3>
            <ul className="space-y-2">
              {reportData.strengths.length > 0 ? reportData.strengths.map((s, i) => (
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
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              مجالات التحسين
            </h3>
            <ul className="space-y-2">
              {reportData.weaknesses.length > 0 ? reportData.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </li>
              )) : (
                <li className="text-slate-400 text-sm">لا توجد نقاط ضعف بارزة</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            التوصيات الرئيسية
          </h3>
          <div className="space-y-3">
            {reportData.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 text-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFullReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-8">
        <div className="text-center py-8 border-b border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">التقرير الشامل</h1>
          <h2 className="text-xl text-emerald-400">{reportData.association.name}</h2>
          <p className="text-slate-400">دراسة قياس الاحتياج التنموي للجمعيات الصحية - {reportData.association.year}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            معلومات الجمعية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">اسم الجمعية</p>
              <p className="text-white font-medium">{reportData.association.name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">التصنيف</p>
              <p className="text-white font-medium">{reportData.association.category}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">سنة التقييم</p>
              <p className="text-white font-medium">{reportData.association.year}</p>
            </div>
          </div>
        </div>

        {reportData.axesScores.map((a) => (
          <div key={a.axis.id} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{a.axis.name_ar}</h3>
              <div className="text-left">
                <p className={`text-2xl font-bold ${
                  a.percentage >= 70 ? 'text-emerald-400' :
                  a.percentage >= 40 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {a.percentage.toFixed(0)}%
                </p>
                <p className="text-sm text-slate-400">{a.grade}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4">{a.axis.description}</p>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className={`h-full rounded-full ${
                  a.percentage >= 70 ? 'bg-emerald-500' :
                  a.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${a.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!reportData) return null;

    const recommendationsByAxis = reportData.axesScores.map((a) => ({
      axis: a.axis,
      score: a.percentage,
      recommendations: a.percentage < 60 ? [
        `تحسين أداء ${a.axis.name_ar}`,
        `تطوير القدرات في مجال ${a.axis.name_ar}`,
        `بناء خطط استراتيجية لرفع مستوى ${a.axis.name_ar}`
      ] : [
        `الحفاظ على مستوى الأداء في ${a.axis.name_ar}`,
        `تحسين العمليات الضعيفة`
      ]
    }));

    return (
      <div className="space-y-8">
        <div className="text-center py-8 border-b border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">خارطة التدخلات</h1>
          <p className="text-slate-400">مصفوفة التدخلات المقترحة للجمعية</p>
        </div>

        <div className="space-y-6">
          {recommendationsByAxis.map((item) => (
            <div
              key={item.axis.id}
              className={`p-6 rounded-2xl border ${
                item.score < 40
                  ? 'bg-red-500/10 border-red-500/20'
                  : item.score < 60
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{item.axis.name_ar}</h3>
                <span className={`text-xl font-bold ${
                  item.score >= 60 ? 'text-emerald-400' :
                  item.score >= 40 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {item.score.toFixed(0)}%
                </span>
              </div>
              <div className="space-y-3">
                {item.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      item.score < 60 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-slate-200 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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

  const reportTypes: { id: ReportType; label: string; description: string }[] = [
    { id: 'executive', label: 'التقرير التنفيذي', description: 'ملخص شامل للأداء والتوصيات' },
    { id: 'full', label: 'التقرير الكامل', description: 'تقرير تفصيلي لجميع المحاور' },
    { id: 'recommendations', label: 'مصفوفة التدخلات', description: 'خارطة التدخلات والمقترحات' }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">التقارير الاستراتيجية</h1>
          <p className="text-slate-400">تقارير تفصيلية وتنفيذية عن أداء الجمعية</p>
        </div>
        {reportData && previewMode && (
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all"
            >
              <Eye className="w-5 h-5" />
              <span>تحرير</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة</span>
            </button>
          </div>
        )}
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setReportType(type.id);
                handleGenerateReport();
              }}
              disabled={generating}
              className={`p-6 rounded-2xl border text-right transition-all ${
                reportType === type.id
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${
                  reportType === type.id ? 'bg-emerald-500/20' : 'bg-white/5'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    reportType === type.id ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                </div>
                <h3 className="text-white font-medium">{type.label}</h3>
              </div>
              <p className="text-slate-400 text-sm">{type.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 print:bg-white print:text-black">
          {reportType === 'executive' && renderExecutiveSummary()}
          {reportType === 'full' && renderFullReport()}
          {reportType === 'recommendations' && renderRecommendations()}
        </div>
      )}

      {!previewMode && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التوليد...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>توليد التقرير</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
