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

// 🔴 신규 서비스 페이지 임포트
import Booking from './pages/Booking';

// 🔵 추가된 페이지 임포트 (파일을 생성하셔야 에러가 안 납니다)
import Partnership from './pages/Partnership';
import Policies from './pages/Policies';
import Community from './pages/Community'; 

// 관리자 전용 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores';
import AdminStoreEdit from './pages/AdminStoreEdit';

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

            {/* 🟢 여행 서비스(투어/차량/비자) 페이지 연결 */}
            <Route path="/booking" element={<Booking />} />

            {/* 🔵 제휴 및 정책 페이지 추가 */}
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/policies" element={<Policies />} />
            
            {/* 🔵 커뮤니티 페이지 (로그인 정보 전달) */}
            <Route path="/community" element={<Community currentUser={currentUser} />} />

            {/* 공용 서비스 페이지 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            
            {/* 🔴 경로 일치: /store/:id */}
            <Route path="/store/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 관리자 메뉴 라우팅 */}
            <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
            <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
            <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />
            <Route path="/admin/manage-stores" element={<AdminManageStores currentUser={currentUser} />} />
            <Route path="/admin/edit-store/:id" element={<AdminStoreEdit currentUser={currentUser} />} />

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
