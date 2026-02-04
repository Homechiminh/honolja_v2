import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (session: any) => {
    setLoading(true);
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
    setInitialized(true); // 🔴 프로필까지 다 가져온 후 "준비 완료" 신호 보냄
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => subscription.unsubscribe();
  }, [syncUser]);

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
