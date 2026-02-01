import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Region } from './types'; 
import './index.css';

// 레이아웃
import Header from './components/Header';
import Footer from './components/Footer';

// 일반 페이지
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

// 관리자 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons';

// 🔒 [보호 장치 1] 관리자 전용 가드
const AdminRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null; // 유저 정보 로딩 중이면 대기
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

// 🔒 [보호 장치 2] 로그인 유저 전용 가드 (마이페이지, 쿠폰숍 등)
const PrivateRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const { currentUser, loading } = useAuth();

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
            {/* 누구나 접근 가능 */}
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            <Route path="/danang" element={<DanangHome />} />
            <Route path="/danang/:category" element={<StoreList forcedRegion={Region.DANANG} />} />
            <Route path="/nhatrang" element={<NhatrangHome />} />
            <Route path="/nhatrang/:category" element={<StoreList forcedRegion={Region.NHA_TRANG} />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/store/:id" element={<StoreDetail currentUser={currentUser} />} />

            {/* 🔑 로그인 유저 전용 (CouponShop 포함) */}
            <Route element={<PrivateRoute user={currentUser} loading={loading} />}>
              <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
              <Route path="/coupon-shop" element={<CouponShop currentUser={currentUser} />} />
              <Route path="/community" element={<Community currentUser={currentUser} />} />
            </Route>

            {/* 👑 관리자 전용 보호 구역 */}
            <Route element={<AdminRoute user={currentUser} loading={loading} />}>
              <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
              <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
              <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />
              <Route path="/admin/manage-stores" element={<AdminManageStores currentUser={currentUser} />} />
              <Route path="/admin/edit-store/:id" element={<AdminStoreEdit currentUser={currentUser} />} />
              <Route path="/admin/manage-coupons" element={<AdminManageCoupons currentUser={currentUser} />} />
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
