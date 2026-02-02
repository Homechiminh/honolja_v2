export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔴 타임아웃을 2초로 단축 (유저 체감 속도 향상)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚡ Auth Fast-track: Releasing UI at 2s");
        setLoading(false);
      }
    }, 2000);

    const syncAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 프로필은 배경에서 조용히 가져옵니다.
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
      }
      setLoading(false);
      clearTimeout(timeoutId);
    };

    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
