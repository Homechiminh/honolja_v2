import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 처음엔 무조건 '확인 중'

  useEffect(() => {
    // 🔴 세션과 프로필을 한 번에 싱크하는 함수
    const syncUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 프로필 정보를 가져올 때까지 loading은 true 유지 (이게 핵심)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // 모든 확인이 끝난 후에야 '확인 끝'
    };

    syncUser();

    // 인증 상태 변화 감지 (로그아웃 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 탭 전환 시 불필요하게 loading을 true로 바꾸지 않음 (튕김 방지)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
