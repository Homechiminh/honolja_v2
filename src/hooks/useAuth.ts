import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) {
          console.warn("프로필 없음, 기본값 세팅");
          setCurrentUser({
            id: sessionUser.id,
            email: sessionUser.email,
            nickname: sessionUser.email.split('@')[0],
            role: 'USER' as any,
            level: 1,
            points: 0,
            is_blocked: false,
            created_at: new Date().toISOString()
          });
        } else {
          setCurrentUser(data as User);
        }
      } finally {
        setLoading(false);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await fetchProfile(session.user);
      else setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await fetchProfile(session.user);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { currentUser, loading };
};
