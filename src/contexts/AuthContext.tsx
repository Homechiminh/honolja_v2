import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase'; 
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 프로필 동기화 함수
   * 유저 ID를 받아 Supabase 'profiles' 테이블에서 추가 정보를 가져옵니다.
   * 성공/실패 여부와 상관없이 마지막에는 반드시 loading을 false로 변경합니다.
   */
  const syncProfile = async (userId: string | undefined) => {
    if (!userId) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setCurrentUser(data as User);
      } else {
        // 프로필이 없거나 에러가 난 경우 유저 정보는 비우되 서비스는 계속 이용 가능하게 처리
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Profile Sync Error:", err);
      setCurrentUser(null);
    } finally {
      // 🔴 어떤 네트워크 상황에서도 로딩 상태를 해제하여 앱이 멈추지 않게 함
      setLoading(false);
    }
  };

  /**
   * 🔴 수동 유저 정보 갱신 함수 (포인트 변동 등 실시간 반영용)
   */
  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await syncProfile(session?.user?.id);
  };

  useEffect(() => {
    // 1. 안전장치: 네트워크 지연이나 Supabase 응답 미도착 시 3초 후 강제 로딩 해제
    // 이 로직이 있어야 직접 링크 접속 시 "Syncing..." 화면에 갇히지 않습니다.
    const backupTimer = setTimeout(() => {
      setLoading((prevLoading) => {
        if (prevLoading) {
          console.warn("Auth initial check timed out. Forcing UI render for stability.");
          return false;
        }
        return prevLoading;
      });
    }, 3000);

    // 2. 앱 초기 구동 시 세션 복구 시도
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Init Auth Error:", err);
        setLoading(false);
      }
    };

    initAuth();

    /**
     * 3. 인증 상태 변화 감지 리스너
     * 로그인, 로그아웃, 토큰 만료, 탭 전환 시 자동 실행됩니다.
     * _event: 사용하지 않는 인자임을 명시하여 TS6133 에러 방지
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    // 클린업: 컴포넌트 언마운트 시 타이머 및 리스너 제거
    return () => {
      clearTimeout(backupTimer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용 가능합니다.');
  }
  return context;
};
