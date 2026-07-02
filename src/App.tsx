import { useState, ReactNode } from 'react';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import { AuthScreen } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Survey } from './components/Survey';
import { Analysis } from './components/Analysis';
import { Maps } from './components/Maps';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { InitiativeDashboard } from './components/InitiativeDashboard';
import { Building2, Users, ClipboardList } from 'lucide-react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}

function RoleBasedLanding() {
  const { userRole, association } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [selectedView, setSelectedView] = useState<'initiative' | 'association' | null>(null);

  // If user has initiative role (not just association), show landing choice
  if ((userRole === 'admin' || userRole === 'supervisor' || userRole === 'consultant') && showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في منصة بوصلة</h1>
            <p className="text-slate-400">اختر الواجهة التي تريد الوصول إليها</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Initiative Dashboard Card */}
            <button
              onClick={() => {
                setSelectedView('initiative');
                setShowLanding(false);
              }}
              className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all text-right group"
            >
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">لوحة تحكم المبادرة</h3>
              <p className="text-slate-400 text-sm">
                إدارة الجمعيات، مراجعة الاستجابات، التقارير العامة
              </p>
            </button>

            {/* Association Dashboard Card - only if user has an association */}
            {association && (
              <button
                onClick={() => {
                  setSelectedView('association');
                  setShowLanding(false);
                }}
                className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-right group"
              >
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">لوحة تحكم الجمعية</h3>
                <p className="text-slate-400 text-sm">
                  إدارة استبيان جمعيتك، التحليلات، التقارير
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default to association view for association role
  if (userRole === 'association' || selectedView === 'association') {
    return <AppLayout />;
  }

  // Initiative view for admin/supervisor/consultant
  return <InitiativeLayout />;
}

function AppLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === 'survey' && <Survey onNavigate={handleNavigate} />}
          {currentPage === 'analysis' && <Analysis />}
          {currentPage === 'maps' && <Maps />}
          {currentPage === 'reports' && <Reports />}
          {currentPage === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}

function InitiativeLayout() {
  const [currentPage, setCurrentPage] = useState('initiative');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} isInitiative />
      <main className="lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {currentPage === 'initiative' && <InitiativeDashboard onNavigate={setCurrentPage} />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <RoleBasedLanding />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
