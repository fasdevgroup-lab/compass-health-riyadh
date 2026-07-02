import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SurveyAxis, SurveyIndicator, IndicatorScore } from '../lib/supabase';
import {
  Building2,
  DollarSign,
  Users,
  Cpu,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  Handshake,
  Lightbulb,
  Target,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  CheckCircle2,
  Info,
  Loader2
} from 'lucide-react';

const axisIcons: Record<string, React.ElementType> = {
  institutional: Building2,
  financial: DollarSign,
  human: Users,
  technical: Cpu,
  health: Stethoscope,
  beneficiaries: HeartHandshake,
  training: GraduationCap,
  partnerships: Handshake,
  innovation: Lightbulb,
  priorities: Target
};

interface Score {
  indicatorId: string;
  score: number;
  notes: string;
  evidence: string;
}

interface SurveyProps {
  onNavigate?: (page: string) => void;
}

export function Survey({ }: SurveyProps) {
  const { association, refreshAssociation } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [axes, setAxes] = useState<(SurveyAxis & { indicators: SurveyIndicator[] })[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [scores, setScores] = useState<Map<string, Score>>(new Map());
  const [responseId, setResponseId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const currentAxis = axes[currentAxisIndex];
  const totalIndicators = axes.reduce((sum, a) => sum + a.indicators.length, 0);
  const completedIndicators = Array.from(scores.values()).filter(s => s.score > 0).length;

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

      if (axesData) {
        const sortedAxes = axesData.map((axis) => ({
          ...axis,
          indicators: ((axis.indicators as SurveyIndicator[]) || [])
            .sort((a, b) => a.sort_order - b.sort_order)
        }));
        setAxes(sortedAxes as (SurveyAxis & { indicators: SurveyIndicator[] })[]);
      }

      const { data: response } = await supabase
        .from('survey_responses')
        .select('*, scores:indicator_scores(*)')
        .eq('association_id', association.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (response) {
        setResponseId(response.id);
        const existingScores = new Map<string, Score>();
        (response.scores || []).forEach((s: IndicatorScore) => {
          existingScores.set(s.indicator_id, {
            indicatorId: s.indicator_id,
            score: s.score,
            notes: s.notes || '',
            evidence: s.evidence || ''
          });
        });
        setScores(existingScores);
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = useCallback((indicatorId: string, score: number) => {
    setScores(prev => {
      const newScores = new Map(prev);
      const existing = newScores.get(indicatorId) || { indicatorId, score: 0, notes: '', evidence: '' };
      newScores.set(indicatorId, { ...existing, score });
      return newScores;
    });
  }, []);

  const handleNotesChange = useCallback((indicatorId: string, notes: string) => {
    setScores(prev => {
      const newScores = new Map(prev);
      const existing = newScores.get(indicatorId) || { indicatorId, score: 0, notes: '', evidence: '' };
      newScores.set(indicatorId, { ...existing, notes });
      return newScores;
    });
  }, []);

  const handleEvidenceChange = useCallback((indicatorId: string, evidence: string) => {
    setScores(prev => {
      const newScores = new Map(prev);
      const existing = newScores.get(indicatorId) || { indicatorId, score: 0, notes: '', evidence: '' };
      newScores.set(indicatorId, { ...existing, evidence });
      return newScores;
    });
  }, []);

  const saveProgress = async () => {
    if (!association || !currentAxis) return;

    setSaving(true);
    try {
      let respId = responseId;

      if (!respId) {
        const { data: newResponse } = await supabase
          .from('survey_responses')
          .insert({
            association_id: association.id,
            year: new Date().getFullYear(),
            status: 'draft'
          })
          .select()
          .single();

        if (newResponse) {
          respId = newResponse.id;
          setResponseId(respId);
        }
      }

      if (!respId) return;

      const scoresToSave = currentAxis.indicators
        .map(ind => {
          const score = scores.get(ind.id);
          return {
            response_id: respId,
            indicator_id: ind.id,
            score: score?.score || 0,
            notes: score?.notes || null,
            evidence: score?.evidence || null
          };
        })
        .filter(s => s.score > 0);

      if (scoresToSave.length > 0) {
        for (const scoreData of scoresToSave) {
          await supabase
            .from('indicator_scores')
            .upsert(scoreData, { onConflict: 'response_id,indicator_id' });
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const submitSurvey = async () => {
    if (!association || !responseId) return;

    setSubmitting(true);
    try {
      await saveProgress();

      const { data: indicators } = await supabase
        .from('survey_indicators')
        .select('id, weight');

      const { data: allScores } = await supabase
        .from('indicator_scores')
        .select('indicator_id, score')
        .eq('response_id', responseId);

      let totalScore = 0;
      let maxScore = 0;

      indicators?.forEach(ind => {
        maxScore += 5 * (ind.weight || 1);
        const score = allScores?.find(s => s.indicator_id === ind.id);
        if (score) {
          totalScore += score.score * (ind.weight || 1);
        }
      });

      const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      await supabase
        .from('survey_responses')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          overall_score: overallScore
        })
        .eq('id', responseId);

      await supabase
        .from('associations')
        .update({
          survey_completed: true,
          survey_completed_at: new Date().toISOString()
        })
        .eq('id', association.id);

      await refreshAssociation();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-emerald-500';
    if (score >= 3) return 'bg-teal-500';
    if (score >= 2) return 'bg-amber-500';
    if (score >= 1) return 'bg-orange-500';
    return 'bg-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentAxis) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">لا توجد محاور متاحة</p>
      </div>
    );
  }

  const AxisIcon = axisIcons[currentAxis.code] || Building2;
  const axisProgress = currentAxis.indicators.length > 0
    ? Math.round(
        currentAxis.indicators.filter(ind => scores.get(ind.id)?.score && scores.get(ind.id)!.score > 0).length /
        currentAxis.indicators.length * 100
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">استبيان قياس الاحتياجات</h1>
        <p className="text-slate-400">
          قياس شامل لعشرة محاور رئيسية تساعد في تحديد احتياجات الجمعية
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 mb-6">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {axes.map((axis, index) => {
            const Icon = axisIcons[axis.code] || Building2;
            const isActive = index === currentAxisIndex;
            const completed = axis.indicators.every(
              ind => scores.get(ind.id)?.score && scores.get(ind.id)!.score > 0
            );
            const hasScore = axis.indicators.some(
              ind => scores.get(ind.id)?.score && scores.get(ind.id)!.score > 0
            );

            return (
              <button
                key={axis.id}
                onClick={() => setCurrentAxisIndex(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : completed
                    ? 'bg-emerald-500/10 text-emerald-400/80'
                    : hasScore
                    ? 'bg-amber-500/10 text-amber-400/80'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{axis.name_ar}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 mb-4">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <AxisIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{currentAxis.name_ar}</h2>
              <p className="text-sm text-slate-400">
                المحور {currentAxisIndex + 1} من {axes.length}
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-emerald-400">{axisProgress}%</p>
            <p className="text-xs text-slate-400">مكتمل</p>
          </div>
        </div>

        <div className="w-full bg-white/5 h-1">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${axisProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {currentAxis.indicators.map((indicator) => {
          const currentScore = scores.get(indicator.id)?.score || 0;
          const notes = scores.get(indicator.id)?.notes || '';
          const evidence = scores.get(indicator.id)?.evidence || '';

          return (
            <div
              key={indicator.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{indicator.name_ar}</h3>
                    <button
                      onClick={() => setShowInfo(showInfo === indicator.id ? null : indicator.id)}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  {showInfo === indicator.id && indicator.description && (
                    <p className="text-slate-400 text-sm bg-white/5 rounded-lg p-2 mb-2">
                      {indicator.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    الوزن: {indicator.weight} | النوع: {indicator.measurement_type}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${getScoreColor(currentScore)} flex items-center justify-center text-white text-sm font-bold`}>
                  {currentScore || '-'}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleScoreChange(indicator.id, value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      currentScore === value
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : value === 0
                        ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {value === 0 ? 'غير محدد' : value}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ملاحظات</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => handleNotesChange(indicator.id, e.target.value)}
                    placeholder="أضف ملاحظاتك..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الأدلة والوثائق</label>
                  <input
                    type="text"
                    value={evidence}
                    onChange={(e) => handleEvidenceChange(indicator.id, e.target.value)}
                    placeholder="روابط أو مراجع..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentAxisIndex(Math.max(0, currentAxisIndex - 1))}
            disabled={currentAxisIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>
          <button
            onClick={() => setCurrentAxisIndex(Math.min(axes.length - 1, currentAxisIndex + 1))}
            disabled={currentAxisIndex === axes.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {completedIndicators}/{totalIndicators} مؤشر
          </span>
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>حفظ</span>
          </button>
          {completedIndicators >= totalIndicators * 0.8 && (
            <button
              onClick={submitSurvey}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>إرسال الاستبيان</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
