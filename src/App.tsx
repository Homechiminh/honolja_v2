import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; 
import { Region } from './types'; 
import './index.css';

import Header from './components/Header';
import Footer from './components/Footer';

// 페이지 임포트
import Home from './pages/Home';
import DanangHome from './pages/DanangHome';
import NhatrangHome from './pages/NhatrangHome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';
import Booking from './pages/Booking';
import Partnership from './pages/Partnership';
import Policies from './pages/Policies';
import Community from './pages/Community'; 
import CouponShop from './pages/CouponShop';
import VipLounge from './pages/VipLounge'; 
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import PostEdit from './pages/PostEdit';

// 관리자 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons';

/**
 * 🔒 [가드 1] 관리자 전용 (내부 구독형)
 * 부모로부터 props를 받지 않고 Context에서 직접 꺼내어 엇박자를 방지합니다.
 */
const AdminRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return null; // 로딩 중에는 판단 유보
  return currentUser?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * 🔒 [가드 2] 일반 로그인 유저 전용 (내부 구독형)
 */
const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * 🔒 [가드 3] 특정 등급(Level) 이상 전용 (내부 구독형)
 */
const LevelRoute = ({ minLevel }: { minLevel: number }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return (currentUser?.level || 0) >= minLevel ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  const { loading } = useAuth();

  // 🔴 앱 최상단 로딩 가드: 인증이 확정될 때까지 (최대 3초) 라우터 실행을 대기합니다.
  // 이 처리가 되어야 직접 링크 접속 시 '존재하지 않는 유저'로 오판하여 홈으로 튕기는 걸 막습니다.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse tracking-[0.3em] text-xl italic">
          HONOLJA SYNCING...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
        {/* 🔴 Header에서도 currentUser 프롭 제거 (Header 내부에서 useAuth 사용 권장) */}
        <Header />
        
        <main className="flex-grow pt-[80px]">
          <Routes>
            {/* --- 공용 구역 --- */}
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            <Route path="/danang" element={<DanangHome />} />
            <Route path="/danang/:category" element={<StoreList forcedRegion={Region.DANANG} />} />
            <Route path="/nhatrang" element={<NhatrangHome />} />
            <Route path="/nhatrang/:category" element={<StoreList forcedRegion={Region.NHA_TRANG} />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/policies" element={<Policies />} />
            
            <Route path="/community" element={<Community />} />
            <Route path="/store/:id" element={<StoreDetail />} />
            <Route path="/post/:id" element={<PostDetail />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* --- 보호 구역 (로그인 필수) --- */}
            <Route element={<PrivateRoute />}>
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/coupon-shop" element={<CouponShop />} />
              <Route path="/community/create" element={<CreatePost />} />
              <Route path="/post/edit/:id" element={<PostEdit />} />
            </Route>

            {/* --- VIP 구역 (Lv.3 이상) --- */}
            <Route element={<LevelRoute minLevel={3} />}>
              <Route path="/vip-lounge" element={<VipLounge />} />
            </Route>

            {/* --- 관리자 구역 (ADMIN 전용) --- */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-store" element={<AdminStoreCreate />} />
              <Route path="/admin/manage-users" element={<AdminManageUsers />} />
              <Route path="/admin/manage-stores" element={<AdminManageStores />} />
              <Route path="/admin/edit-store/:id" element={<AdminStoreEdit />} />
              <Route path="/admin/manage-coupons" element={<AdminManageCoupons />} />
            </Route>

            {/* 잘못된 경로는 홈으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
