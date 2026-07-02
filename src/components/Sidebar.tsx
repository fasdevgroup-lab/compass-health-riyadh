import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Map,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Building2,
  Users,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isInitiative?: boolean;
}

const associationMenuItems = [
  { id: 'dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard },
  { id: 'survey', label: 'الاستبيان', icon: ClipboardList },
  { id: 'analysis', label: 'التحليلات', icon: BarChart3 },
  { id: 'maps', label: 'الخرائط', icon: Map },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

const initiativeMenuItems = [
  { id: 'initiative', label: 'لوحة المبادرة', icon: Shield },
];

export function Sidebar({ currentPage, onNavigate, isInitiative }: SidebarProps) {
  const { association, initiativeProfile, userRole, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = isInitiative ? initiativeMenuItems : associationMenuItems;

  const getRoleBadge = () => {
    if (!initiativeProfile) return null;
    const roleLabels = {
      admin: 'مدير النظام',
      supervisor: 'مشرف',
      consultant: 'استشاري',
      association: 'جمعية'
    };
    const roleColors = {
      admin: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      supervisor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      consultant: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      association: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${roleColors[userRole]}`}>
        {roleLabels[userRole]}
      </span>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate">COMPASS Health</h3>
              <p className="text-emerald-200/60 text-xs truncate">
                {isInitiative ? 'إدارة المبادرة' : 'مرصد الاحتياجات'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !collapsed && (
                  <ChevronRight className="w-4 h-4 mr-auto text-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        {(association || initiativeProfile) && !collapsed && (
          <div className="mb-3 px-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {isInitiative ? initiativeProfile?.full_name : association?.name}
                </p>
                <p className="text-emerald-200/60 text-xs">
                  {isInitiative ? getRoleBadge() : 'جمعية صحية'}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-emerald-600 rounded-xl shadow-lg"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className="hidden lg:block">
        <aside
          className={`fixed right-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-l border-white/10 transition-all duration-300 z-40 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <SidebarContent />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-white transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </aside>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-l border-white/10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute left-4 top-4 p-2 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
