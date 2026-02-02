import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

// 1. 컨텍스트 생성
const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false); // 앱 준비 상태

  useEffect(() => {
    // 세션 초기화 로직
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single();
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setInitialized(true); // 어떤 경우에도 준비 완료 처리
      }
    };

    initialize();

    // 실시간 상태 변경 리스너 (탭 전환, 재로그인 대응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 🔴 [중요] 이 부분이 빠지면 TS2305 에러가 발생합니다.
 * 'export' 키워드가 반드시 붙어 있어야 다른 파일에서 useAuth를 import 할 수 있습니다.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
