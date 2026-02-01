import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // 🔴 인증 로딩이 true일 때는 절대 실행하지 않음
    if (authLoading) return;

    // 인증 로딩이 false가 되는 순간 딱 한 번(또는 deps 변경 시) 실행
    fetchFn();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, ...deps]); 
};
