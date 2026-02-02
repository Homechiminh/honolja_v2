import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading } = useAuth();
  const retryCount = useRef(0); 

  useEffect(() => {
    // 1. 인증 로딩이 true일 때는 절대 실행하지 않음 (이전과 동일)
    if (authLoading) return;

    let isMounted = true; 

    const executeWithRetry = async () => {
      try {
        // 🔴 핵심 수정: 0.1초는 너무 짧습니다. 0.3초(300ms)로 늘립니다.
        // 현재 발생하는 'Auth Timeout' 상황에서 브라우저가 세션을 안착시키는 최소한의 시간입니다.
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!isMounted) return;
        await fetchFn();
        
        retryCount.current = 0; 
      } catch (err: any) {
        if (!isMounted) return;

        // 406, PGRST106(세션 불일치), JWT 관련 에러 체크
        const isAuthError = err.status === 406 || err.code === 'PGRST106' || err.message?.includes('JWT');
        
        if (isAuthError && retryCount.current < 1) {
          retryCount.current++;
          // 🔴 재시도 대기도 0.5초에서 0.8초로 늘려 확실하게 한 번 더 시도합니다.
          console.warn("⚠️ Auth sync delay detected. Retrying with longer delay (800ms)...");
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
  }, [authLoading, ...deps]); 
};
