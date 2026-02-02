export const useFetchGuard = (fetchFn: () => Promise<void>, deps: any[]) => {
  const { loading: authLoading, currentUser } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    // 1. 인증 로딩 중이면 대기
    if (authLoading) return;

    // 2. 인증 로딩이 끝났다면 실행
    const execute = async () => {
      try {
        await fetchFn();
        hasFetched.current = true;
      } catch (err: any) {
        // 406 에러 발생 시 0.5초 뒤 자동 재시도
        if (err.status === 406) {
          setTimeout(fetchFn, 500);
        }
      }
    };

    execute();
  }, [authLoading, currentUser?.id, ...deps]); // 🔴 유저 정보가 뒤늦게 오면 자동으로 재실행
};
