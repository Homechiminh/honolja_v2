import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { initialized, currentUser } = useAuth();

  useEffect(() => {
    // 1. 초기화가 안 됐거나 유저가 없으면 아예 실행하지 않음
    if (!initialized || !currentUser) return;

    const execute = async () => {
      try {
        // 아주 미세한 찰나의 네트워크 안정화를 위한 딜레이만 남김
        await new Promise(res => setTimeout(res, 100));
        await fetchFn();
      } catch (err) {
        console.error("FetchGuard Error:", err);
      }
    };

    execute();
    
    // currentUser.id가 바뀔 때(로그인 성공 시) 다시 실행하도록 설정
  }, [initialized, currentUser?.id, ...deps]); 
};
