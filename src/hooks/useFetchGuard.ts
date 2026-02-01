import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => void, deps: any[]) => {
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // 인증 로딩이 끝났을 때만 실행
    if (!authLoading) {
      fetchFn();
    }
  }, [authLoading, ...deps]); // authLoading이 바뀌는 찰나를 감시
};
