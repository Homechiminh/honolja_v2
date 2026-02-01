import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // 🔴 중요: hooks가 아니라 contexts에서 가져옵니다.
import { Region } from './types'; 
import './index.css';

// 레이아웃 & 페이지 임포트 (생략 - 기존과 동일)
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';
import Community from './pages/Community';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import VipLounge from './pages/VipLounge';
import CreatePost from './pages/CreatePost';
import AdminDashboard from './pages/AdminDashboard';
// ... 나머지 관리자 페이지들

// 🔒 [가드 1] 관리자 전용
const AdminRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null; // 인증 확인 중에는 아무것도 안 보여줌
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

// 🔒 [가드 2] 일반 로그인 유저 전용
const PrivateRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// 🔒 [가드 3] 특정 등급(Level) 이상 전용
const LevelRoute = ({ user, loading, minLevel }: { user: any; loading: boolean; minLevel: number }) => {
  if (loading) return null;
  return user && user.level >= minLevel ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  const { currentUser, loading } = useAuth(); // 🔴 Context에서 뿜어주는 전역 상태 사용

  // 전역 로딩: 앱 첫 접속 시 인증 정보를 가져올 때까지의 스피너
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
        <Header currentUser={currentUser} />
        
        <main className="flex-grow pt-[80px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            {/* ... 중략 ... */}
            <Route path="/community" element={<Community currentUser={currentUser} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/store/:id" element={<StoreDetail currentUser={currentUser} />} />

            {/* VIP 라운지 (레벨 3 이상) */}
            <Route element={<LevelRoute user={currentUser} loading={loading} minLevel={3} />}>
              <Route path="/vip-lounge" element={<VipLounge />} />
            </Route>

            {/* 일반 회원 구역 */}
            <Route element={<PrivateRoute user={currentUser} loading={loading} />}>
              <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
              <Route path="/community/create" element={<CreatePost currentUser={currentUser} />} />
            </Route>

            {/* 👑 관리자 보호 구역 */}
            <Route element={<AdminRoute user={currentUser} loading={loading} />}>
              <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
              {/* ... 기타 관리자 라우트 ... */}
            </Route>

            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
