import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Region } from './types'; 
import './index.css';

// 레이아웃 컴포넌트
import Header from './components/Header';
import Footer from './components/Footer';

// 일반 사용자 및 지역별 홈 페이지
import Home from './pages/Home';
import DanangHome from './pages/DanangHome';
import NhatrangHome from './pages/NhatrangHome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';

// 신규 서비스 및 커뮤니티 페이지
import Booking from './pages/Booking';
import Partnership from './pages/Partnership';
import Policies from './pages/Policies';
import Community from './pages/Community'; 
import CouponShop from './pages/CouponShop'; // 🔵 추가: 유저 쿠폰샵

// 관리자 전용 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';
import AdminManageCoupons from './pages/AdminManageCoupons'; // 🔴 추가: 관리자 쿠폰 관리

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
            {/* 1. 호치민 (기본) */}
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            
            {/* 2. 다낭 놀자 */}
            <Route path="/danang" element={<DanangHome />} />
            <Route path="/danang/:category" element={<StoreList forcedRegion={Region.DANANG} />} />

            {/* 3. 나트랑 놀자 */}
            <Route path="/nhatrang" element={<NhatrangHome />} />
            <Route path="/nhatrang/:category" element={<StoreList forcedRegion={Region.NHA_TRANG} />} />

            {/* 여행 서비스 및 정보 페이지 */}
            <Route path="/booking" element={<Booking />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/community" element={<Community currentUser={currentUser} />} />
            <Route path="/coupon-shop" element={<CouponShop currentUser={currentUser} />} />

            {/* 계정 관련 페이지 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            
            {/* 업소 상세 페이지 */}
            <Route path="/store/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 관리자(ADMIN) 전용 라우팅 */}
            <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
            <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
            <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />
            <Route path="/admin/manage-stores" element={<AdminManageStores currentUser={currentUser} />} />
            <Route path="/admin/edit-store/:id" element={<AdminStoreEdit currentUser={currentUser} />} />
            <Route path="/admin/manage-coupons" element={<AdminManageCoupons currentUser={currentUser} />} />

            {/* 잘못된 경로는 홈으로 자동 리다이렉트 */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
