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

    // 🔴 'event' 앞에 '_'를 붙여 '_event'로 수정합니다. 
    // TypeScript에게 "이 변수는 문법상 필요해서 뒀지만 사용하지는 않을 거야"라고 알려주는 관례입니다.
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

  // 🛡️ 근본 해결: initialized가 true가 될 때까지 앱의 렌더링을 막습니다.
  // 이 가드가 있어야 Supabase가 세션을 다 읽어오기 전에 페이지가 멋대로 데이터를 요청(406 에러)하는 걸 막습니다.
  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
