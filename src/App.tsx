import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './index.css';

// 레이아웃 컴포넌트
import Header from './components/Header';
import Footer from './components/Footer';

// 일반 사용자 페이지
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';

// 🔴 관리자 전용 페이지
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminManageStores from './pages/AdminManageStores'; // 현황 관리
import AdminStoreEdit from './pages/AdminStoreEdit';     // 정보 수정

function App() {
  const { currentUser, loading } = useAuth();

  // 1. 초기 로딩 상태 처리 (인증 정보 확인 전)
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
        <Header currentUser={currentUser} />
        
        <main className="flex-grow pt-[80px]">
          <Routes>
            {/* 기본 라우팅 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            
            {/* 업소 관련 라우팅 */}
            <Route path="/stores/:category" element={<StoreList />} />
            <Route path="/store/detail/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 🔴 관리자 메뉴 라우팅 */}
            {/* 대시보드 메인 */}
            <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
            {/* 신규 업소 등록 */}
            <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
            {/* 회원/포인트 관리 */}
            <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />
            {/* 🔴 업소 현황/삭제 관리 */}
            <Route path="/admin/manage-stores" element={<AdminManageStores currentUser={currentUser} />} />
            {/* 🔴 기존 업소 정보 수정 */}
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
