import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  // 🔴 'loading' 대신 'initialized'를 가져옵니다. 
  // AuthContext에서 보낸 이름과 똑같아야 에러가 나지 않습니다.
  const { initialized } = useAuth();
  const retryCount = useRef(0);

  useEffect(() => {
    // 🔴 근본 해결: 아직 준비(initialized)가 안 됐다면 아무것도 하지 않습니다.
    if (!initialized) return;

    const safeFetch = async () => {
      try {
        // 브라우저가 세션을 인식할 시간을 0.2초 정도 더 줍니다.
        await new Promise(res => setTimeout(res, 200));
        await fetchFn();
        retryCount.current = 0; // 성공 시 카운트 리셋
      } catch (err: any) {
        // 🔴 근본 해결: 406 에러 발생 시 중앙 시스템이 0.6초 뒤 '딱 한 번' 자동 재시도
        if (err.status === 406 && retryCount.current < 1) {
          retryCount.current++;
          console.warn("🔄 Auth sync delay detected. Central system retrying...");
          setTimeout(safeFetch, 600);
        } else {
          console.error("Critical Fetch Error:", err);
        }
      }
    };

    safeFetch();
    
    // 🔴 'initialized'가 true로 바뀔 때 다시 실행되도록 의존성 배열에 넣습니다.
  }, [initialized, ...deps]); 
};
