import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 유저 정보를 가져오는 통합 함수
    const getProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data;
    };

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setCurrentUser(profile || session.user);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setInitialized(true);
      }
    };

    initialize();

    // 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setCurrentUser(profile || session.user);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
