import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail'; 
import NoticeEdit from './pages/NoticeEdit';
import NoticeCreate from './pages/NoticeCreate';
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons';

const AdminRoute = () => {
  const { currentUser, initialized, loading } = useAuth();
  // 아직 로딩 중이거나 초기화 전이면 기다림 (튕김 방지 핵심)
  if (!initialized || loading) return <div className="min-h-screen bg-black" />;
  // 확실히 관리자일 때만 통과, 아니면 홈으로
  return currentUser?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

const PrivateRoute = () => {
  const { currentUser, initialized, loading } = useAuth();
  if (!initialized || loading) return <div className="min-h-screen bg-black" />;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-white">
          <Header />
          <main className="flex-grow pt-[80px]">
            <Routes>
              {/* 공개 페이지 */}
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

              {/* 일반 유저 전용 */}
              <Route element={<PrivateRoute />}>
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/coupon-shop" element={<CouponShop />} />
                <Route path="/community/create" element={<CreatePost />} />
                <Route path="/post/edit/:id" element={<PostEdit />} />
                <Route path="/vip-lounge" element={<VipLounge />} />
              </Route>

              {/* 🔴 관리자 통합 가드 구역 (NoticeEdit, AdminDashboard 모두 포함) */}
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
