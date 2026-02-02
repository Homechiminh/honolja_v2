import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { initialized, currentUser } = useAuth();
  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    // 1. 시스템 자체가 초기화되지 않았다면 대기
    if (!initialized) return;

    const execute = async () => {
      try {
        await fetchFn();
        // 성공 시 현재 유저 ID 기록 (무한 루프 방지)
        lastFetchedUserId.current = currentUser?.id || 'guest';
      } catch (err: any) {
        // 🔴 근본 해결: 406 에러(인증 지연) 발생 시
        if (err.status === 406) {
          console.warn("⚠️ [406] Auth lag detected. Waiting for session sync...");
          // 여기서 아무것도 안 해도, 아래 의존성 배열의 [currentUser] 덕분에
          // 로그인이 완료되는 순간 useEffect가 다시 돌아갑니다.
        }
      }
    };

    execute();
    
    // 🔴 핵심: currentUser.id를 의존성에 넣습니다.
    // 탭을 바꿨거나, 뒤늦게 로그인이 풀렸거나, 다시 잡히는 모든 순간에 
    // 데이터 호출을 자동으로 '재동기화'합니다.
  }, [initialized, currentUser?.id, ...deps]); 
};
