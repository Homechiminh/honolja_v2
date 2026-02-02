import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

// 1. 컨텍스트 생성
const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false); // 🔴 앱 준비 완료 상태

  useEffect(() => {
    // 초기 세션 확인 로직
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setInitialized(true); // 🔴 성공하든 실패하든 '준비 완료' 신호를 보냄
      }
    };
    init();

    // 실시간 인증 상태 변화 감지 (탭 전환, 재로그인 대응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
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
 * 🔴 핵심 해결책: TS2305 에러는 이 코드가 없어서 발생한 것입니다.
 * 반드시 'export'가 붙어 있어야 다른 파일에서 useAuth를 import 할 수 있습니다.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
