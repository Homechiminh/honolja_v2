import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import Home from './pages/Home';
import Footer from './components/Footer';

// 나중에 추가될 페이지들을 위해 미리 import 경로를 확인해두세요
// import Login from './pages/Login'; 
// import StoreList from './pages/StoreList';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
        {/* 1. 상단 GNB (모든 페이지 공통) */}
        <Header />

        {/* 2. 라우팅에 따른 메인 콘텐츠 영역 */}
        <div className="flex-grow">
          <Routes>
            {/* 기본 홈 화면 */}
            <Route path="/" element={<Home />} />
            
            {/* 이미 만들어진 다른 페이지들도 아래와 같이 연결할 수 있습니다.
               <Route path="/login" element={<Login />} />
               <Route path="/stores/:category" element={<StoreList />} />
            */}
          </Routes>
        </div>

        {/* 3. 하단 푸터 (모든 페이지 공통) */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
