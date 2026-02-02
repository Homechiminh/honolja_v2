import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading } = useAuth();
  const retryCount = useRef(0); // 페이지 이탈 전까지 재시도 횟수 추적

  useEffect(() => {
    // 1. 인증 정보가 아직 로딩 중이라면 절대 실행하지 않고 대기
    if (authLoading) return;

    let isMounted = true; // 언마운트된 컴포넌트에서 상태 업데이트 방지

    const executeWithRetry = async () => {
      try {
        // 🔴 핵심 1: 0.1초의 미세한 딜레이를 줍니다. 
        // 브라우저가 구글 로그인 리다이렉트 후 쿠키와 세션을 정리할 시간을 벌어줍니다.
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        await fetchFn();
        
        // 성공 시 재시도 카운트 초기화
        retryCount.current = 0; 
      } catch (err: any) {
        if (!isMounted) return;

        /**
         * 🔴 핵심 2: 406(Not Acceptable) 또는 세션 불일치 에러 발생 시
         * 유저에게 에러를 보여주지 않고 0.5초 뒤에 '딱 한 번만 더' 시도합니다.
         */
        const isAuthError = err.status === 406 || err.code === 'PGRST106' || err.message?.includes('JWT');
        
        if (isAuthError && retryCount.current < 1) {
          retryCount.current++;
          console.warn("⚠️ Auth sync delay detected. Retrying in 500ms...");
          setTimeout(executeWithRetry, 500);
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
