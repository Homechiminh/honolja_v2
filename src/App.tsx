import { useState } from 'react'
import './index.css'
import Header from './components/Header' // 1. 모듈화된 헤더 불러오기

// 카테고리 데이터 정의
const CATEGORIES = [
  { id: 'massage', name: '마사지', icon: '💆‍♂️' },
  { id: 'barber', name: '이발소', icon: '💈' },
  { id: 'karaoke', name: '가라오케', icon: '🎤' },
  { id: 'club', name: '바/클럽', icon: '🍸' },
  { id: 'community', name: '커뮤니티', icon: '💬' },
];

// 샘플 업소 데이터
const SAMPLE_SHOPS = [
  { id: 1, name: '호치민 1번 마사지', category: '마사지', rating: 4.9, reviews: 128, area: '1군', tags: ['최고급', '한국인매니저'] },
  { id: 2, name: '불금 가라오케', category: '가라오케', rating: 4.7, reviews: 85, area: '7군', tags: ['대형룸', '최신시설'] },
  { id: 3, name: '강남 이발소', category: '이발소', rating: 4.8, reviews: 210, area: '1군', tags: ['풀서비스', '친절'] },
  { id: 4, name: '루프탑 바 88', category: '바/클럽', rating: 4.6, reviews: 56, area: '3군', tags: ['야경', '데이트'] },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-sans selection:bg-red-500/30">
      
      {/* 2. 기존 헤더 자리를 컴포넌트로 교체 (로그인 연동 완료) */}
      <Header />

      {/* 3. 히어로 섹션 */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* 배경 빛 효과 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-none">
            호치민에서 <br className="md:hidden" />
            <span className="text-gradient">놀자!</span>
          </h2>
          <p className="text-xl md:text-2xl font-bold text-gray-300 mb-10 drop-shadow-md">
            베트남 여행의 모든 정답을 찾다
          </p>

          {/* 검색바 */}
          <div className="relative max-w-2xl mx-auto group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="업소 이름, 지역, 카테고리를 검색하세요..."
              className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all text-lg shadow-2xl"
            />
            <button className="absolute right-3 top-2.5 px-8 py-2.5 bg-red-600 hover:bg-red-700 rounded-2xl font-black transition-all active:scale-95">
              검색
            </button>
          </div>
        </div>
      </section>

      {/* 4. 카테고리 퀵 메뉴 */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-red-600/30 transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-sm text-gray-400 group-hover:text-white">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. 메인 리스트 섹션 */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-3xl font-black mb-2">인기 급상승 업소 🔥</h3>
            <p className="text-gray-500 font-medium">실시간 가장 핫한 호치민의 명소들을 확인하세요.</p>
          </div>
          <button className="text-gray-400 hover:text-white font-bold text-sm border-b border-transparent hover:border-white transition-all">
            전체보기
          </button>
        </div>

        {/* 업소 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SAMPLE_SHOPS.map((shop) => (
            <div key={shop.id} className="group cursor-pointer">
              {/* 이미지 썸네일 */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-900 mb-4 border border-white/5 group-hover:border-red-600/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase rounded-lg tracking-widest shadow-xl">TOP 10</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-xs font-bold bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">{shop.area}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-xs">★</span>
                    <span className="text-xs font-bold">{shop.rating}</span>
                  </div>
                </div>
              </div>
              
              {/* 정보 */}
              <h4 className="text-xl font-black mb-1 group-hover:text-red-500 transition-colors tracking-tight">
                {shop.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {shop.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-bold text-gray-500">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-white/5 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm font-bold">© 2026 HONOLJA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
