import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
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
        setInitialized(true);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  // 초기 로딩 중에는 하위 컴포넌트(App의 Routes 등)를 렌더링하지 않음
  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔴 이 부분이 빠져서 모든 페이지에서 에러가 났던 것입니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
