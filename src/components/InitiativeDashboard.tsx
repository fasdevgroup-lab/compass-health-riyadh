import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Building2,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  Map,
  Target
} from 'lucide-react';

type UserRole = 'admin' | 'supervisor' | 'consultant' | 'association';

interface InitiativeUser {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  phone: string;
  is_active: boolean;
  last_login: string | null;
}

interface AssociationStats {
  total: number;
  active: number;
  pending: number;
  completedSurvey: number;
  inProgress: number;
}

interface ResponseStats {
  total: number;
  submitted: number;
  draft: number;
  avgScore: number;
}

interface InitiativeDashboardProps {
  onNavigate?: (page: string) => void;
}

export function InitiativeDashboard({ onNavigate }: InitiativeDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<InitiativeUser | null>(null);
  const [associationStats, setAssociationStats] = useState<AssociationStats | null>(null);
  const [responseStats, setResponseStats] = useState<ResponseStats | null>(null);
  const [recentAssociations, setRecentAssociations] = useState<any[]>([]);
  const [recentResponses, setRecentResponses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'associations' | 'responses' | 'users' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user profile
      const { data: profileData } = await supabase
        .from('initiative_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setCurrentRole(profileData.role);
      }

      // Load stats
      await Promise.all([
        loadAssociationStats(),
        loadResponseStats(),
        loadRecentAssociations(),
        loadRecentResponses()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssociationStats = async () => {
    const { count: total } = await supabase
      .from('associations')
      .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
      .from('associations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: completedSurvey } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    const { count: inProgress } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    setAssociationStats({
      total: total || 0,
      active: active || 0,
      pending: (total || 0) - (active || 0),
      completedSurvey: completedSurvey || 0,
      inProgress: inProgress || 0
    });
  };

  const loadResponseStats = async () => {
    const { data: responses } = await supabase
      .from('survey_responses')
      .select('status, overall_score');

    const total = responses?.length || 0;
    const submitted = responses?.filter(r => r.status === 'submitted').length || 0;
    const draft = responses?.filter(r => r.status === 'draft').length || 0;
    const scores = responses?.filter(r => r.overall_score).map(r => r.overall_score) || [];
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    setResponseStats({ total, submitted, draft, avgScore });
  };

  const loadRecentAssociations = async () => {
    const { data } = await supabase
      .from('associations')
      .select(`
        id, name, city, status, created_at,
        category:association_categories(name_ar)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentAssociations(data || []);
  };

  const loadRecentResponses = async () => {
    const { data } = await supabase
      .from('survey_responses')
      .select(`
        id, year, status, overall_score, created_at,
        association:associations(name, city)
      `)
      .order('updated_at', { ascending: false })
      .limit(5);

    setRecentResponses(data || []);
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'مدير النظام',
      supervisor: 'مشرف',
      consultant: 'استشاري',
      association: 'جمعية'
    };
    return labels[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      supervisor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      consultant: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      association: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return colors[role];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show access denied for association role
  if (currentRole === 'association') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center" dir="rtl">
        <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">هذه المنطقة مخصصة لفريق المبادرة</h2>
        <p className="text-slate-400 mb-4">يمكنك الوصول إلى لوحة تحكم جمعيتك من القائمة الجانبية</p>
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          الانتقال إلى لوحة التحكم
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة تحكم المبادرة</h1>
          <p className="text-slate-400 flex items-center gap-2">
            <span>مرحباً، {profile?.full_name}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full border ${getRoleColor(currentRole!)}`}>
              {getRoleLabel(currentRole!)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={loadUserData}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
          { id: 'associations', label: 'الجمعيات', icon: Building2 },
          { id: 'responses', label: 'الاستجابات', icon: ClipboardCheck },
          { id: 'reports', label: 'التقارير', icon: FileText },
          ...(currentRole === 'admin' ? [{ id: 'users', label: 'المستخدمين', icon: Users }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الجمعيات"
              value={associationStats?.total || 0}
              subtitle={`${associationStats?.active} نشطة`}
              icon={<Building2 className="w-5 h-5" />}
              color="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="استبيانات مكتملة"
              value={associationStats?.completedSurvey || 0}
              subtitle={`${associationStats?.inProgress} قيد الإنجاز`}
              icon={<ClipboardCheck className="w-5 h-5" />}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="متوسط درجة النضج"
              value={`${responseStats?.avgScore.toFixed(0) || 0}%`}
              subtitle="معدل الجاهزية"
              icon={<Target className="w-5 h-5" />}
              color="from-amber-500 to-orange-600"
            />
            <StatCard
              title="نسبة الإنجاز"
              value={associationStats && associationStats.total > 0
                ? `${((associationStats.completedSurvey / associationStats.total) * 100).toFixed(0)}%`
                : '0%'}
              subtitle="من إجمالي الجمعيات"
              icon={<TrendingUp className="w-5 h-5" />}
              color="from-purple-500 to-pink-600"
            />
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Associations */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  أحدث الجمعيات
                </h3>
                <button
                  onClick={() => setActiveTab('associations')}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  عرض الكل
                </button>
              </div>
              <div className="space-y-3">
                {recentAssociations.map((assoc) => (
                  <div
                    key={assoc.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{assoc.name}</p>
                      <p className="text-slate-400 text-sm">{assoc.city} - {assoc.category?.name_ar}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assoc.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {assoc.status === 'active' ? 'نشط' : 'قيد المراجعة'}
                    </span>
                  </div>
                ))}
                {recentAssociations.length === 0 && (
                  <p className="text-slate-400 text-center py-4">لا توجد جمعيات مسجلة بعد</p>
                )}
              </div>
            </div>

            {/* Recent Responses */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  آخر الاستجابات
                </h3>
                <button
                  onClick={() => setActiveTab('responses')}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  عرض الكل
                </button>
              </div>
              <div className="space-y-3">
                {recentResponses.map((resp) => (
                  <div
                    key={resp.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{resp.association?.name}</p>
                      <p className="text-slate-400 text-sm">عام {resp.year}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {resp.overall_score !== null && (
                        <span className="text-sm text-slate-300">{resp.overall_score.toFixed(0)}%</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        resp.status === 'submitted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {resp.status === 'submitted' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            مكتمل
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            قيد الإنجاز
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                {recentResponses.length === 0 && (
                  <p className="text-slate-400 text-center py-4">لا توجد استجابات بعد</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Associations Tab */}
      {activeTab === 'associations' && (
        <AssociationsView
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <ResponsesView
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          canReview={currentRole === 'admin' || currentRole === 'supervisor'}
        />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <ReportsView canExport={currentRole === 'admin'} />
      )}

      {/* Users Tab (Admin only) */}
      {activeTab === 'users' && currentRole === 'admin' && (
        <UsersView onRefresh={loadUserData} />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-300 text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}

// Associations View Component
function AssociationsView({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
}) {
  const [associations, setAssociations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: catData } = await supabase
        .from('association_categories')
        .select('*')
        .order('name_ar');
      setCategories(catData || []);

      // Load associations
      let query = supabase
        .from('associations')
        .select(`
          id, name, city, status, employee_count, annual_budget, created_at,
          category:association_categories(id, name_ar)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      const { data } = await query;
      setAssociations(data || []);
    } catch (error) {
      console.error('Error loading associations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث عن جمعية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
        >
          <option value="all">جميع التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الجمعية</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">التصنيف</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">المدينة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الموظفين</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الميزانية</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : associations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    لا توجد جمعيات
                  </td>
                </tr>
              ) : (
                associations.map((assoc) => (
                  <tr key={assoc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{assoc.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{assoc.category?.name_ar || '-'}</td>
                    <td className="px-6 py-4 text-slate-300">{assoc.city}</td>
                    <td className="px-6 py-4 text-slate-300">{assoc.employee_count || '-'}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {assoc.annual_budget ? `${(assoc.annual_budget / 1000000).toFixed(1)}M` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assoc.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {assoc.status === 'active' ? 'نشط' : 'قيد المراجعة'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Responses View Component
function ResponsesView({ searchTerm, setSearchTerm, canReview }: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  canReview: boolean;
}) {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  useEffect(() => {
    loadResponses();
  }, [searchTerm]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('survey_responses')
        .select(`
          id, year, status, overall_score, created_at, updated_at,
          association:associations(id, name, city)
        `)
        .order('updated_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('associations.name', `%${searchTerm}%`);
      }

      const { data } = await query;
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث عن جمعية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : responses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            لا توجد استجابات
          </div>
        ) : (
          responses.map((resp) => (
            <div
              key={resp.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">{resp.association?.name}</h3>
                  <p className="text-slate-400 text-sm">{resp.association?.city}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                  resp.status === 'submitted'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {resp.status === 'submitted' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      مكتمل
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      قيد الإنجاز
                    </>
                  )}
                </span>
              </div>

              {resp.overall_score !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">درجة النضج</span>
                    <span className="text-white font-bold">{resp.overall_score.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        resp.overall_score >= 70 ? 'bg-emerald-500' :
                        resp.overall_score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${resp.overall_score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-slate-400 text-sm">عام {resp.year}</span>
                {canReview && (
                  <button
                    onClick={() => setSelectedResponse(resp)}
                    className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    مراجعة
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Reports View Component
function ReportsView({ canExport }: { canExport: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="تقرير ملخص المبادرة"
        description="نظرة عامة على جميع الجمعيات ومستويات نضجها"
        icon={<BarChart3 className="w-5 h-5" />}
        canExport={canExport}
      />
      <ReportCard
        title="تقرير مقارنة الجمعيات"
        description="مقارنة أداء الجمعيات حسب المحاور"
        icon={<TrendingUp className="w-5 h-5" />}
        canExport={canExport}
      />
      <ReportCard
        title="خريطة الاحتياجات"
        description="تحليل احتياجات الجمعيات المشاركة"
        icon={<Map className="w-5 h-5" />}
        canExport={canExport}
      />
      <ReportCard
        title="تقرير الأولويات"
        description="ترتيب الجمعيات حسب الأولوية"
        icon={<Target className="w-5 h-5" />}
        canExport={canExport}
      />
      <ReportCard
        title="التقرير التنفيذي"
        description="ملخص تنفيذي للمبادرة"
        icon={<FileText className="w-5 h-5" />}
        canExport={canExport}
      />
      <ReportCard
        title="تقرير التقدم"
        description="متابعة نسبة الإنجاز"
        icon={<ClipboardCheck className="w-5 h-5" />}
        canExport={canExport}
      />
    </div>
  );
}

function ReportCard({ title, description, icon, canExport }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  canExport: boolean;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm">
          معاينة
        </button>
        {canExport && (
          <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </button>
        )}
      </div>
    </div>
  );
}

// Users View Component (Admin only)
function UsersView({ onRefresh }: { onRefresh: () => void }) {
  const [users, setUsers] = useState<InitiativeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('initiative_users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">إدارة المستخدمين</h3>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Users className="w-4 h-4" />
          دعوة مستخدم
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الاسم</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">البريد</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الدور</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">القسم</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  لا يوجد مستخدمين
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white">{user.full_name}</td>
                  <td className="px-6 py-4 text-slate-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' :
                      user.role === 'supervisor' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'consultant' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.role === 'admin' ? 'مدير' :
                       user.role === 'supervisor' ? 'مشرف' :
                       user.role === 'consultant' ? 'استشاري' : 'جمعية'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{user.department || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
