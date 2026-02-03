import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true); // 추가: 프로필 로딩 상태 관리

  // 유저 프로필 가져오기 함수 (공통 사용)
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      return null;
    }
  }, []);

  // 🔴 핵심: 프로필까지 다 가져온 후 상태를 업데이트하는 함수
  const syncUserSession = useCallback(async (session: any) => {
    if (session?.user) {
      setLoading(true);
      const profile = await fetchProfile(session.user.id);
      // 프로필이 있으면 프로필을, 없으면 기본 유저 정보라도 넣음
      setCurrentUser(profile || session.user);
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
    setInitialized(true); // 🔴 이제야 진짜 준비 완료!
  }, [fetchProfile]);

  useEffect(() => {
    // 1. 초기 세션 체크
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUserSession(session);
    };

    initialize();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃/탭전환 세션체크 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 탭 전환 시 세션 재검증 로직 대응
      await syncUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, [syncUserSession]);

  // 외부에서 유저 정보를 강제로 새로고침하고 싶을 때 사용 (MyPage 등)
  const refreshUser = async () => {
    if (currentUser?.id) {
      const profile = await fetchProfile(currentUser.id);
      if (profile) setCurrentUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
