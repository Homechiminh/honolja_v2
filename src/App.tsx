import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { useAuth } from './hooks/useAuth';

// 레이아웃 컴포넌트
import Header from './components/Header';
import Footer from './components/Footer';

// 페이지 컴포넌트
import Home from './pages/Home';
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminStoreCreate from './pages/AdminStoreCreate';
import AdminManageUsers from './pages/AdminManageUsers';

function App() {
  const { currentUser, loading } = useAuth();

  // 인증 로딩 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
        <Header currentUser={currentUser} />

        <div className="flex-grow">
          <Routes>
            {/* 기본 서비스 페이지 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            
            {/* 업소 관련 페이지 */}
            <Route path="/stores/:category" element={<StoreList />} />
            <Route path="/store/detail/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 🔴 관리자 전용 영역 */}
            <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
            <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
            <Route path="/admin/manage-users" element={<AdminManageUsers currentUser={currentUser} />} />

            {/* 잘못된 접근 시 홈으로 리다이렉트 */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
