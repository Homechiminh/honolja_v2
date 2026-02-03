import { useEffect, useState } from 'react';
import { supabase } from '../supabase'; 
import type { Store } from '../types'; 

export const useStores = (category?: string) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        console.log(`📡 [useStores] 1. 요청 시작 (Category: ${category || 'all'})`);

        const query = supabase.from('stores').select('*');
        if (category && category !== 'all') {
          query.eq('category', category);
        }

        // 🔴 여기서 응답이 올 때까지 기다립니다.
        const { data, error } = await query.order('rating', { ascending: false });

        console.log("📡 [useStores] 2. 서버 응답 도착!"); // 이 로그가 찍히는지 봐야 합니다.

        if (error) {
          console.error('❌ [useStores] 3. Supabase 에러 발생:', error.message);
          setStores([]);
        } else {
          console.log(`✅ [useStores] 3. 데이터 수신 완료: ${data?.length || 0}개`);
          setStores(data as Store[] || []);
        }
      } catch (err) {
        console.error('❌ [useStores] 3. 시스템 치명적 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [category]);

  return { stores, loading };
};
