import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, Association } from '../lib/supabase';

export type UserRole = 'admin' | 'supervisor' | 'consultant' | 'association';

export interface InitiativeProfile {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  phone: string;
  is_active: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  association: Association | null;
  initiativeProfile: InitiativeProfile | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAssociation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [association, setAssociation] = useState<Association | null>(null);
  const [initiativeProfile, setInitiativeProfile] = useState<InitiativeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssociation = async (userId: string) => {
    const { data } = await supabase
      .from('associations')
      .select('*, category:association_categories(*)')
      .eq('user_id', userId)
      .maybeSingle();
    setAssociation(data);
  };

  const fetchInitiativeProfile = async (userId: string) => {
    const { data } = await supabase
      .from('initiative_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setInitiativeProfile(data);
    return data?.role || null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchAssociation(session.user.id),
          fetchInitiativeProfile(session.user.id)
        ]);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchAssociation(session.user.id),
          fetchInitiativeProfile(session.user.id)
        ]);
      } else {
        setAssociation(null);
        setInitiativeProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAssociation(null);
    setInitiativeProfile(null);
  };

  const refreshAssociation = async () => {
    if (user) {
      await fetchAssociation(user.id);
    }
  };

  const userRole: UserRole = initiativeProfile?.role || 'association';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      association,
      initiativeProfile,
      userRole,
      loading,
      signUp,
      signIn,
      signOut,
      refreshAssociation
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
