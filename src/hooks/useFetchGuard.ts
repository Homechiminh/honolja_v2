// 🔴 1. 리액트 기본 도구들을 가져옵니다. (useEffect, useRef 누락 해결)
import { useEffect, useRef } from 'react';
// 🔴 2. 우리가 만든 인증 도구를 가져옵니다. (useAuth 누락 해결)
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading, currentUser } = useAuth();
  const retryCount = useRef(0);

  useEffect(() => {
    // 인증 확인 중이면 대기
    if (authLoading) return;

    let isMounted = true;

    const executeWithRetry = async () => {
      try {
        // 브라우저 세션 안착을 위한 미세 딜레이 (300ms)
        await new Promise(res => setTimeout(res, 300));
        
        if (!isMounted) return;
        await fetchFn();
        
        retryCount.current = 0; // 성공 시 횟수 초기화
      } catch (err: any) {
        if (!isMounted) return;

        // 406 또는 세션 불일치 에러 시 딱 한 번 자동 재시도
        const isAuthError = err.status === 406 || err.code === 'PGRST106';
        
        if (isAuthError && retryCount.current < 1) {
          retryCount.current++;
          console.warn("🔄 Auth Sync Issue Detected. Auto retrying...");
          setTimeout(executeWithRetry, 800);
        } else {
          console.error("❌ Fetch failed after retry strategy:", err);
        }
      }
    };

    executeWithRetry();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, currentUser?.id, ...deps]); 
};
