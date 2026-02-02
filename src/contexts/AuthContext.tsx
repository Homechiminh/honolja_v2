export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. 초기 세션 체크 (가장 빠른 시점에 실행)
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
      }
      setInitialized(true); // 어떤 결과든 일단 앱의 문을 엶
    };
    init();

    // 2. 인증 이벤트 리스너 (탭 전환, 세션 만료, 재로그인 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`📡 Auth Event: ${event}`); // 로그로 흐름 확인 가능
      
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

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};
