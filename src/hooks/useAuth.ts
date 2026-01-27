import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
      if (data) setCurrentUser(data as User);
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchProfile(session.user);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { currentUser, loading };
};
