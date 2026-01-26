import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store } from '../types';

export const useStores = (category?: string) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      let query = supabase.from('stores').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching stores:', error);
      } else {
        setStores(data as Store[]);
      }
      setLoading(false);
    };

    fetchStores();
  }, [category]);

  return { stores, loading };
};
