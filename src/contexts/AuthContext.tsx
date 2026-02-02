import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 🔴 [근본 해결: 긴급 탈출구] 
    // Supabase가 너무 늦으면 3초 뒤에 강제로 앱을 엽니다. (검은 화면 방지)
    const failSafe = setTimeout(() => {
      if (!initialized) {
        console.warn("⚠️ Auth Timeout: Forcing app start after 3s delay.");
        setInitialized(true);
      }
    }, 3000);

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
        clearTimeout(failSafe);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setInitialized(true);
      clearTimeout(failSafe);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(failSafe);
    };
  }, []);

  // 🔴 이 가드가 검은 화면의 원인이었지만, 
  // 위에서 3초 타임아웃을 걸었으므로 이제 무한 로딩은 없습니다.
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
