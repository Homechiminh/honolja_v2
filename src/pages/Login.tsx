// ... (상단 import 동일)

const Login: React.FC = () => {
  const { currentUser, initialized } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 초기화가 끝났고 유저가 있다면 홈으로!
    if (initialized && currentUser) {
      window.location.replace('/');
    }
  }, [currentUser, initialized]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true); 

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) window.location.replace('/'); 
    } catch (err: any) {
      alert(err.message === 'Invalid login credentials' ? '이메일/비밀번호를 확인해주세요.' : err.message);
      setIsLoading(false);
    }
  };

  // 🔴 "검은 화면" 방지: 이 부분이 실행되어야 로그인이 가능합니다.
  if (!initialized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-white/50 text-xs font-black tracking-widest animate-pulse">
          INITIALIZING SECURE SESSION...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* ... (기존 UI 레이아웃 그대로 사용) ... */}
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-2xl italic">H</span>
            </div>
            <span className="text-3xl font-black text-white uppercase italic tracking-tighter">{BRAND_NAME}</span>
          </Link>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter leading-none">Welcome Back !</h2>
        </div>

        <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <input type="email" placeholder="Email Address" required value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-600 transition-all placeholder:text-gray-700" 
              />
              <input type="password" placeholder="Password" required value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-600 transition-all placeholder:text-gray-700" 
              />
            </div>
            <button type="submit" disabled={isLoading} 
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg active:scale-95 disabled:opacity-50 uppercase shadow-xl"
            >
              {isLoading ? 'VERIFYING...' : `Login to ${BRAND_NAME}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
