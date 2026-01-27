import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Region } from './types'; // 🔴 Region Enum 임포트
import './index.css';

// 레이아웃 컴포넌트
import Header from './components/Header';
import Footer from './components/Footer';

// 일반 사용자 및 지역별 홈 페이지
import Home from './pages/Home';
import DanangHome from './pages/DanangHome';   // 🔴 다낭 홈
import NhatrangHome from './pages/NhatrangHome'; // 🔴 나트랑 홈
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';

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
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
        {/* 모든 페이지에 currentUser 전달 */}
        <Header currentUser={currentUser} />
        
        <main className="flex-grow pt-[80px]">
          <Routes>
            {/* 1. 호치민 (기본) - 메인 홈 및 지역 필터 리스트 */}
            <Route path="/" element={<Home />} />
            <Route path="/stores/:category" element={<StoreList forcedRegion={Region.HCMC} />} />
            
            {/* 2. 다낭 놀자 (독립 홈 및 카테고리 리스트) */}
            <Route path="/danang" element={<DanangHome />} />
            <Route path="/danang/:category" element={<StoreList forcedRegion={Region.DANANG} />} />

            {/* 3. 나트랑 놀자 (독립 홈 및 카테고리 리스트) */}
            <Route path="/nhatrang" element={<NhatrangHome />} />
            <Route path="/nhatrang/:category" element={<StoreList forcedRegion={Region.NHA_TRANG} />} />

            {/* 공용 서비스 페이지 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            <Route path="/store/detail/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 🔴 관리자 메뉴 라우팅 전문 */}
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
