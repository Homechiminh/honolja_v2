import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading } = useAuth();
  const retryCount = useRef(0);

  useEffect(() => {
    // 🔴 근본 해결 2: 인증 로딩 중에는 아예 데이터를 부르지 않음
    if (authLoading) return;

    const safeFetch = async () => {
      try {
        // 0.2초의 아주 미세한 여유 (브라우저 쿠키 안착 시간)
        await new Promise(res => setTimeout(res, 200));
        await fetchFn();
        retryCount.current = 0; // 성공 시 카운트 리셋
      } catch (err: any) {
        // 🔴 근본 해결 3: 406 에러 발생 시 여기서 중앙 집중적으로 재시도
        if (err.status === 406 && retryCount.current < 1) {
          retryCount.current++;
          console.warn("🔄 Auth delay detected. Central system retrying...");
          setTimeout(safeFetch, 600); // 0.6초 뒤 재시도
        } else {
          // 재시도까지 실패하거나 다른 에러일 경우에만 콘솔 출력
          console.error("Critical Fetch Error:", err);
        }
      }
    };

    safeFetch();
  }, [authLoading, ...deps]);
};
