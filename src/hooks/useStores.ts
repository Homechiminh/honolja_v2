import { useEffect, useState } from 'react';
import { supabase } from '../supabase'; // 경로 수정 (image_f22824.png 기준)
import type { Store } from '../types'; // import type 적용 (TS1484 해결)

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
