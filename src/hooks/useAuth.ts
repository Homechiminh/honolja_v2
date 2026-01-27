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
        
        if (error) throw error;
        if (data) setCurrentUser(data as User);
      } catch (err) {
        console.error("프로필 로드 에러:", err);
      } finally {
        setLoading(false); // 성공하든 실패하든 로딩은 끝내야 합니다.
      }
    };

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { currentUser, loading };
};
