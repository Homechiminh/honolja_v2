import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      return null;
    }
  }, []);

  const syncUserSession = useCallback(async (session: any) => {
    setLoading(true);
    try {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        // 프로필이 있으면 합치고, 없으면 기본 유저 정보 반환
        setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      // 🔴 핵심: 성공하든 실패하든 로딩을 끄고 초기화를 완료함 (화면 멈춤 방지)
      setLoading(false);
      setInitialized(true);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await syncUserSession(session);
      } catch (err) {
        setInitialized(true); // 에러 시에도 문은 열어줌
      }
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, [syncUserSession]);

  const refreshUser = async () => {
    if (currentUser?.id) {
      const profile = await fetchProfile(currentUser.id);
      if (profile) setCurrentUser({ ...currentUser, ...profile });
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
