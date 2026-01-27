import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { useAuth } from './hooks/useAuth'; // 실시간 인증 감시 훅

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
import AdminStoreCreate from './pages/AdminStoreCreate';

function App() {
  // 1. 앱 최상단에서 사용자의 로그인 상태를 계속 낚아챕니다.
  const { currentUser, loading } = useAuth();

  // 2. 인증 정보를 불러오는 동안(Loading) 화면이 깜빡이지 않도록 처리합니다.
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
        {/* 3. 모든 페이지 공통 상단 GNB: 로그인 상태(currentUser)를 전달합니다. */}
        <Header currentUser={currentUser} />

        {/* 4. 주소(Path)에 따라 메인 콘텐츠가 바뀌는 영역 */}
        <div className="flex-grow">
          <Routes>
            {/* 메인 홈 */}
            <Route path="/" element={<Home />} />
            
            {/* 인증 관련 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* 사용자 공간 */}
            <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />
            
            {/* 업소 리스트 및 상세 정보 */}
            {/* 카테고리별 리스트 (예: /stores/massage) */}
            <Route path="/stores/:category" element={<StoreList />} />
            {/* 업소 상세 페이지 (예: /store/detail/uuid) */}
            <Route path="/store/detail/:id" element={<StoreDetail currentUser={currentUser} />} />
            
            {/* 관리자 전용 영역 (Admin 전용 등록 페이지) */}
            <Route path="/admin/create-store" element={<AdminStoreCreate currentUser={currentUser} />} />
          </Routes>
        </div>

        {/* 5. 모든 페이지 공통 하단 푸터 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
