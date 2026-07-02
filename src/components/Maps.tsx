import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SurveyAxis, SurveyIndicator, Association, AssociationCategory } from '../lib/supabase';
import {
  Map as MapIcon,
  Target,
  Users,
  Building2,
  DollarSign,
  Cpu,
  Handshake,
  TreePine,
  Award,
  AlertTriangle,
  TrendingUp,
  Globe,
  Layers
} from 'lucide-react';

interface MapData {
  axis: SurveyAxis;
  score: number;
  priority: 'high' | 'medium' | 'low';
  needs: string[];
}

type MapType = 'needs' | 'priorities' | 'partnerships' | 'opportunities' | 'investment';

export function Maps() {
  const { association } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeMap, setActiveMap] = useState<MapType>('needs');
  const [mapData, setMapData] = useState<MapData[]>([]);

  useEffect(() => {
    if (association) {
      loadMapData();
    }
  }, [association]);

  const loadMapData = async () => {
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

      const data: MapData[] = axesData.map((axis) => {
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
        const priority: 'high' | 'medium' | 'low' =
          percentage < 40 ? 'high' : percentage < 60 ? 'medium' : 'low';

        const needs: string[] = [];
        indicators.forEach((ind) => {
          const score = scoresMap.get(ind.id) || 0;
          if (score < 4 && score > 0) {
            needs.push(ind.name_ar);
          }
        });

        return {
          axis: axis as SurveyAxis,
          score: percentage,
          priority,
          needs: needs.slice(0, 5)
        };
      });

      setMapData(data);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
    const configs = {
      high: {
        label: 'أولوية عالية',
        color: 'red',
        bgClass: 'bg-red-500/20',
        borderClass: 'border-red-500/30',
        textClass: 'text-red-400',
        gradient: 'from-red-500 to-rose-600'
      },
      medium: {
        label: 'أولوية متوسطة',
        color: 'amber',
        bgClass: 'bg-amber-500/20',
        borderClass: 'border-amber-500/30',
        textClass: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-600'
      },
      low: {
        label: 'أولوية منخفضة',
        color: 'emerald',
        bgClass: 'bg-emerald-500/20',
        borderClass: 'border-emerald-500/30',
        textClass: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600'
      }
    };
    return configs[priority];
  };

  const mapTabs: { id: MapType; label: string; icon: React.ElementType }[] = [
    { id: 'needs', label: 'خارطة الاحتياج', icon: MapIcon },
    { id: 'priorities', label: 'خارطة الأولويات', icon: Target },
    { id: 'partnerships', label: 'خارطة الشراكات', icon: Handshake },
    { id: 'opportunities', label: 'خارطة الفرص', icon: TrendingUp },
    { id: 'investment', label: 'خارطة الاستثمار', icon: DollarSign }
  ];

  const renderNeedsMap = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mapData.map((data) => {
        const config = getPriorityConfig(data.priority);
        return (
          <div
            key={data.axis.id}
            className={`relative ${config.bgClass} ${config.borderClass} border rounded-2xl p-6 overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${config.gradient} opacity-10 rounded-bl-full`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${config.bgClass}`}>
                  <AlertTriangle className={`w-6 h-6 ${config.textClass}`} />
                </div>
                <div className="text-left">
                  <p className={`text-2xl font-bold ${config.textClass}`}>
                    {data.score.toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400">{config.label}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3">{data.axis.name_ar}</h3>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">الاحتياجات الملحة</p>
                {data.needs.length > 0 ? (
                  data.needs.map((need, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${config.textClass.replace('text', 'bg')}`} />
                      <span>{need}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">لا توجد احتياجات ملحة</p>
                )}
              </div>

              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPrioritiesMap = () => {
    const sorted = [...mapData].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">تصنيف الأولويات</h3>

          {(['high', 'medium', 'low'] as const).map((priority) => {
            const config = getPriorityConfig(priority);
            const items = sorted.filter((d) => d.priority === priority);

            if (items.length === 0) return null;

            return (
              <div key={priority} className="mb-6 last:mb-0">
                <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${config.bgClass}`}>
                  <AlertTriangle className={`w-5 h-5 ${config.textClass}`} />
                  <span className={`${config.textClass} font-medium`}>{config.label}</span>
                  <span className="text-slate-400 text-sm">({items.length} محاور)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((data) => (
                    <div
                      key={data.axis.id}
                      className={`p-4 rounded-xl ${config.bgClass} ${config.borderClass} border`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{data.axis.name_ar}</p>
                        <span className={`${config.textClass} font-bold`}>
                          {data.score.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">خارطة الأولويات الزمنية</h3>
          <div className="relative">
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500" />

            <div className="space-y-8">
              {sorted.slice(0, 5).map((data, index) => {
                const config = getPriorityConfig(data.priority);
                return (
                  <div key={data.axis.id} className="relative pr-12">
                    <div className={`absolute right-2.5 w-4 h-4 rounded-full ${config.bgClass} border-2 ${config.borderClass} top-1`} />
                    <div className={`${config.bgClass} ${config.borderClass} border rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{data.axis.name_ar}</span>
                        <span className={`text-sm ${config.textClass}`}>فترة {index + 1}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{data.axis.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPartnershipsMap = () => {
    const partnershipTypes = [
      { name: 'وزارة الصحة', role: 'دعم تنظيمي ومعياري', score: 85, type: 'government' },
      { name: 'التجمعات الصحية', role: 'شراكات خدماتية', score: 70, type: 'cluster' },
      { name: 'الجامعات', role: 'بحث علمي وتدريب', score: 60, type: 'academic' },
      { name: 'الشركات الخاصة', role: 'مسؤولية اجتماعية', score: 50, type: 'corporate' },
      { name: 'المانحون', role: 'التمويل والموارد', score: 75, type: 'donors' },
      { name: 'المجتمع المحلي', role: 'التطوع والدعم', score: 65, type: 'community' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partnershipTypes.map((partner) => (
          <div
            key={partner.name}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  partner.type === 'government' ? 'bg-blue-500/20' :
                  partner.type === 'cluster' ? 'bg-emerald-500/20' :
                  partner.type === 'academic' ? 'bg-purple-500/20' :
                  partner.type === 'corporate' ? 'bg-amber-500/20' :
                  'bg-teal-500/20'
                }`}>
                  <Handshake className={`w-5 h-5 ${
                    partner.type === 'government' ? 'text-blue-400' :
                    partner.type === 'cluster' ? 'text-emerald-400' :
                    partner.type === 'academic' ? 'text-purple-400' :
                    partner.type === 'corporate' ? 'text-amber-400' :
                    'text-teal-400'
                  }`} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{partner.name}</h4>
                  <p className="text-slate-400 text-xs">{partner.role}</p>
                </div>
              </div>
              <div className="text-left">
                <p className={`text-xl font-bold ${
                  partner.score >= 70 ? 'text-emerald-400' :
                  partner.score >= 50 ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {partner.score}%
                </p>
                <p className="text-xs text-slate-400">الشراكة</p>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-full rounded-full ${
                  partner.score >= 70 ? 'bg-emerald-500' :
                  partner.score >= 50 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${partner.score}%` }}
              />
            </div>

            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400">تأثير عالي</span>
              <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400">موارد متاحة</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOpportunitiesMap = () => {
    const opportunities = [
      {
        title: 'التحول الرقمي',
        description: 'تطوير منصات ذكية للخدمات الصحية',
        potential: 90,
        ease: 60,
        axis: 'التقني'
      },
      {
        title: 'الطب عن بعد',
        description: 'توسيع نطاق الخدمات الصحية',
        potential: 85,
        ease: 75,
        axis: 'الابتكار'
      },
      {
        title: 'شراكات التجمعات',
        description: 'التكامل مع التجمعات الصحية',
        potential: 80,
        ease: 70,
        axis: 'الشراكات'
      },
      {
        title: 'الاستثمار الوقفي',
        description: 'بناء أوقاف داعمة للجمعية',
        potential: 70,
        ease: 50,
        axis: 'المالي'
      },
      {
        title: 'التطوع المؤهل',
        description: 'برامج تطوع صحية متخصصة',
        potential: 85,
        ease: 80,
        axis: 'البشري'
      },
      {
        title: 'البحث العلمي',
        description: 'مشاريع بحثية مشتركة',
        potential: 75,
        ease: 60,
        axis: 'الابتكار'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">خارطة الفرص الاستراتيجية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => {
              const avgScore = (opp.potential + opp.ease) / 2;
              return (
                <div
                  key={opp.title}
                  className={`p-4 rounded-xl border ${
                    avgScore >= 70
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : avgScore >= 55
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <h4 className="text-white font-medium mb-1">{opp.title}</h4>
                  <p className="text-slate-400 text-xs mb-3">{opp.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">الإمكانية</span>
                      <span className="text-white">{opp.potential}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${opp.potential}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">سهولة التنفيذ</span>
                      <span className="text-white">{opp.ease}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${opp.ease}%` }} />
                    </div>
                  </div>
                  <span className="inline-block mt-3 px-2 py-1 bg-white/5 rounded text-xs text-slate-400">
                    {opp.axis}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderInvestmentMap = () => {
    const investmentAreas = [
      {
        area: 'التحول الرقمي',
        roi: 'عالية',
        timeFrame: '6-12 شهر',
        cost: 'متوسط',
        impact: 85,
        risk: 30
      },
      {
        area: 'تطوير القدرات البشرية',
        roi: 'عالية جداً',
        timeFrame: '3-6 شهر',
        cost: 'منخفض',
        impact: 90,
        risk: 20
      },
      {
        area: 'الأجهزة والمعدات الطبية',
        roi: 'متوسطة',
        timeFrame: '12-24 شهر',
        cost: 'عالي',
        impact: 75,
        risk: 40
      },
      {
        area: 'الشراكات الاستراتيجية',
        roi: 'عالية',
        timeFrame: '3-12 شهر',
        cost: 'منخفض',
        impact: 95,
        risk: 25
      },
      {
        area: 'الابتكار والبحث',
        roi: 'عالية',
        timeFrame: '12-24 شهر',
        cost: 'متوسط',
        impact: 80,
        risk: 35
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">خارطة الاستثمار الاجتماعي</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right p-3 text-slate-400 font-medium">المجال</th>
                  <th className="text-center p-3 text-slate-400 font-medium">العائد على الاستثمار</th>
                  <th className="text-center p-3 text-slate-400 font-medium">التكلفة</th>
                  <th className="text-center p-3 text-slate-400 font-medium">الإطار الزمني</th>
                  <th className="text-center p-3 text-slate-400 font-medium">الأثر</th>
                  <th className="text-center p-3 text-slate-400 font-medium">المخاطرة</th>
                </tr>
              </thead>
              <tbody>
                {investmentAreas.map((area) => (
                  <tr key={area.area} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-white font-medium">{area.area}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        area.roi.includes('عالية جداً') ? 'bg-emerald-500/20 text-emerald-400' :
                        area.roi.includes('عالية') ? 'bg-teal-500/20 text-teal-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {area.roi}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-sm ${
                        area.cost === 'منخفض' ? 'text-emerald-400' :
                        area.cost === 'متوسط' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {area.cost}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-300 text-sm">{area.timeFrame}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${area.impact}%` }} />
                        </div>
                        <span className="text-white text-sm">{area.impact}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${area.risk}%` }} />
                        </div>
                        <span className="text-white text-sm">{area.risk}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">توصية الاستثمار</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                بناءً على التحليل، نوصي بالتركيز على تطوير القدرات البشرية والشراكات الاستراتيجية
                كأولوية قصوى، حيث تحقق أعلى عائد على الاستثمار مع مخاطر منخفضة وتكلفة معقولة.
              </p>
            </div>
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الخرائط الاستراتيجية</h1>
          <p className="text-slate-400">تصور شامل للاحتياجات والأولويات والفرص</p>
        </div>
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-emerald-400" />
          <Globe className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {mapTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMap(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeMap === tab.id
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

      {activeMap === 'needs' && renderNeedsMap()}
      {activeMap === 'priorities' && renderPrioritiesMap()}
      {activeMap === 'partnerships' && renderPartnershipsMap()}
      {activeMap === 'opportunities' && renderOpportunitiesMap()}
      {activeMap === 'investment' && renderInvestmentMap()}
    </div>
  );
}
