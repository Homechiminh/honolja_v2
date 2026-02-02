import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading, currentUser } = useAuth();
  const retryCount = useRef(0);

  useEffect(() => {
    // 인증 확인 중이면 대기
    if (authLoading) return;

    const execute = async () => {
      try {
        // 🔴 브라우저 세션 안착을 위한 미세 딜레이 (300ms)
        await new Promise(res => setTimeout(res, 300));
        await fetchFn();
        retryCount.current = 0;
      } catch (err: any) {
        // 406 에러 발생 시 1회 자동 재시도
        if (err.status === 406 && retryCount.current < 1) {
          retryCount.current++;
          console.warn("🔄 406 Detected - Auto retrying after auth sync...");
          setTimeout(execute, 800);
        }
      }
    };

    execute();
  }, [authLoading, currentUser?.id, ...deps]); // 🔴 currentUser?.id를 감지에 추가
};
