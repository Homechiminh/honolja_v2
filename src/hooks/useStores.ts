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
        // 🔍 진단 로그: 어떤 카테고리를 요청 중인지 확인
        console.log(`📡 [useStores] 데이터 요청 시작 (Category: ${category || 'all'})`);

        let query = supabase.from('stores').select('*');
        
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        // 별점순으로 가져오기
        const { data, error } = await query.order('rating', { ascending: false });

        if (error) {
          console.error('❌ [useStores] Supabase 에러:', error.message);
          setStores([]);
        } else {
          // ✅ 진단 로그: 실제로 몇 개의 데이터를 받았는지 확인
          console.log(`✅ [useStores] 성공! 수신된 업소 개수: ${data?.length || 0}개`);
          
          if (data && data.length > 0) {
            // 디버깅: 받은 데이터 중 첫 번째 업소의 is_hot 상태 출력
            console.log(`💡 [Check] 첫 번째 업소 HOT 상태:`, data[0].is_hot);
          }
          
          setStores(data as Store[]);
        }
      } catch (err) {
        console.error('❌ [useStores] 시스템 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [category]);

  return { stores, loading };
};
