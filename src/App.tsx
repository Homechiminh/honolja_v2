import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext'; 
import { Region } from './types'; 
import './index.css';

import Header from './components/Header';
import Footer from './components/Footer';

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

// 공지사항 관련 페이지
import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail'; 
import NoticeEdit from './pages/NoticeEdit';
import NoticeCreate from './pages/NoticeCreate';

// 관리자 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons';

/**
 * 🔒 [가드 1] 관리자 전용
 */
const AdminRoute = () => {
  const { currentUser, initialized, loading } = useAuth();
  
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse italic uppercase tracking-[0.3em]">
          Verifying Security Clearance...
        </div>
      </div>
    );
  }
  
  return currentUser?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * 🔒 [가드 2] 일반 로그인 유저 전용
 */
const PrivateRoute = () => {
  const { currentUser, initialized, loading } = useAuth();
  
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white italic animate-pulse">
        Syncing Session...
      </div>
    );
  }
  
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * 🔒 [가드 3] 특정 등급(Level) 이상 전용
 */
const LevelRoute = ({ minLevel }: { minLevel: number }) => {
  const { currentUser, initialized, loading } = useAuth();
  
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 italic animate-pulse">
        Checking Level...
      </div>
    );
  }
  
  return (currentUser?.level || 0) >= minLevel ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Helmet>
          <title>호놀자 | 호치민 여행 & 밤문화 정보</title>
        </Helmet>

        <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30 font-sans">
          <Header />
          
          <main className="flex-grow pt-[80px]">
            <Routes>
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
              <Route path="/notice" element={<Notice />} />
              <Route path="/notice/:id" element={<NoticeDetail />} />
              <Route path="/store/:id" element={<StoreDetail />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<PrivateRoute />}>
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/coupon-shop" element={<CouponShop />} />
                <Route path="/community/create" element={<CreatePost />} />
                <Route path="/post/edit/:id" element={<PostEdit />} />
              </Route>

              <Route element={<LevelRoute minLevel={3} />}>
                <Route path="/vip-lounge" element={<VipLounge />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create-store" element={<AdminStoreCreate />} />
                <Route path="/admin/manage-users" element={<AdminManageUsers />} />
                <Route path="/admin/manage-stores" element={<AdminManageStores />} />
                <Route path="/admin/edit-store/:id" element={<AdminStoreEdit />} />
                <Route path="/admin/manage-coupons" element={<AdminManageCoupons />} />
                <Route path="/notice/create" element={<NoticeCreate />} />
                <Route path="/notice/edit/:id" element={<NoticeEdit />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
