import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const getProfile = async (userId: string) => {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        return data;
      } catch (err) {
        return null;
      }
    };

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // 🔴 일단 기본 유저 정보를 넣고 문부터 엽니다.
          setCurrentUser(session.user); 
          
          // 프로필은 백그라운드에서 조용히 가져옵니다.
          getProfile(session.user.id).then(profile => {
            if (profile) setCurrentUser(profile);
          });
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        // 🔴 세션 확인만 끝나면 무조건 초기화 완료!
        setInitialized(true); 
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        getProfile(session.user.id).then(profile => {
          if (profile) setCurrentUser(profile);
        });
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

export const useAuth = () => useContext(AuthContext);
