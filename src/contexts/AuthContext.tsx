export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false); // 🔴 앱 시작 준비 완료 여부

  useEffect(() => {
    // 1. 초기 세션 로드 (딱 한 번)
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
      }
      setInitialized(true); // 🔴 세션 확인이 끝나야만 앱을 염
    };

    initSession();

    // 2. 실시간 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔴 준비가 안 됐으면 아무것도 렌더링하지 않음 (이게 근본 가드입니다)
  if (!initialized) return null; 

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};
