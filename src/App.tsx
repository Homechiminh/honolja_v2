import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Region } from './types'; 
import './index.css';

// 레이아웃
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
import VipLounge from './pages/VipLounge'; // 🔴 대소문자 수정 (VipLounge)

// 관리자 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons';

// 🔒 가드 설정
const AdminRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null;
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};

const PrivateRoute = ({ user, loading }: { user: any; loading: boolean }) => {
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const LevelRoute = ({ user, loading, minLevel }: { user: any; loading: boolean; minLevel: number }) => {
  if (loading) return null;
  return user && user.level >= minLevel ? <Outlet /> : <Navigate to="/" replace />;
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
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            <Route path="/danang" element={<DanangHome />} />
            <Route path="/danang/:category" element={<StoreList forcedRegion={Region.DANANG} />} />
            <Route path="/nhatrang" element={<NhatrangHome />} />
            <Route path="/nhatrang/:category" element={<StoreList forcedRegion={Region.NHA_TRANG} />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/community" element={<Community currentUser={currentUser} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/store/:id" element={<StoreDetail currentUser={currentUser} />} />

            {/* VIP 라운지 (레벨 3 이상) */}
            <Route element={<LevelRoute user={currentUser} loading={loading} minLevel={3} />}>
              <Route path="/vip-lounge" element={<VipLounge currentUser={currentUser} />} />
            </Route>

            {/* 일반 회원 구역 */}
            <Route element={<PrivateRoute user={currentUser} loading={loading} />}>
              <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
              <Route path="/coupon-shop" element={<CouponShop currentUser={currentUser} />} />
            </Route>

            {/* 관리자 구역 */}
            <Route element={<AdminRoute user={currentUser} loading={loading} />}>
              <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
              <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
              <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />
              <Route path="/admin/manage-stores" element={<AdminManageStores currentUser={currentUser} />} />
              {/* 🔴 currentUser 전달 제거 (TS2741 해결) */}
              <Route path="/admin/edit-store/:id" element={<AdminStoreEdit />} />
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
