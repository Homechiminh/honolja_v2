import './index.css'
import Header from './components/Header'
import Home from './pages/Home'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-red-600/30">
      {/* 1. 상단 GNB (오류 수정 완료) */}
      <Header />

      {/* 2. 메인 페이지 콘텐츠 */}
      <div className="flex-grow">
        <Home />
      </div>

      {/* 3. 하단 푸터 (이미지 f29465 완벽 복구) */}
      <Footer />
    </div>
  )
}

export default App
