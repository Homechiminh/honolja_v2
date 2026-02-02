import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { initialized, currentUser } = useAuth();
  const retryCount = useRef(0);

  useEffect(() => {
    // 1. 아직 시스템 초기화 전이면 실행하지 않고 대기
    if (!initialized) return;

    const execute = async () => {
      try {
        // 브라우저가 토큰을 안착시킬 미세한 딜레이
        await new Promise(res => setTimeout(res, 200));
        await fetchFn();
        retryCount.current = 0; 
      } catch (err: any) {
        // 406 에러(인증 지연) 발생 시 1회 자동 재시도
        if (err.status === 406 && retryCount.current < 1) {
          retryCount.current++;
          console.warn("🔄 Auth lag detected. Retrying...");
          setTimeout(execute, 600);
        }
      }
    };

    execute();
    
    // 🔴 근본 해결: currentUser?.id를 감시하여 세션이 뒤늦게 잡히는 순간 다시 실행함
  }, [initialized, currentUser?.id, ...deps]); 
};
