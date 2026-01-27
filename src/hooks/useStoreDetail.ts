// src/hooks/useStoreDetail.ts 전문
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Store } from '../types';

export const useStoreDetail = (id: string | undefined) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      // 'stores' 테이블에서 id가 일치하는 단 하나의 데이터(.single())를 가져옵니다.
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('업소 상세 정보 로드 실패:', error);
      } else {
        setStore(data as Store);
      }
      setLoading(false);
    };

    fetchStore();
  }, [id]); // id가 바뀔 때마다 새로 데이터를 가져옵니다.

  return { store, loading };
};
