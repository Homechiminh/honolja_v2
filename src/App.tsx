import './index.css'
import Header from './components/Header'

function App() {
  const categories = [
    { name: '마사지/스파', icon: '💆‍♀️' },
    { name: '이발소', icon: '💈' },
    { name: '가라오케', icon: '🎤' },
    { name: '바/클럽', icon: '🍸' },
    { name: '숙소/차량', icon: '🏠' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
        {/* 중앙 메인 타이틀 */}
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 flex items-center gap-4">
          호치민에서 <span className="text-glow-red">놀자!</span>
        </h2>

        {/* 서브 타이틀 멘트 (이미지와 동일) */}
        <div className="space-y-3 mb-12">
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            남성들을 위한 호치민의 모든 것
          </p>
          <p className="text-blue-400 font-bold text-lg md:text-xl">
            실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)
          </p>
          <p className="text-cyan-400 font-bold text-sm md:text-base opacity-80">
            풀빌라 · 아파트 예약까지 호놀자에서 한번에 !
          </p>
        </div>

        {/* 하단 카테고리 그리드 */}
        <div className="grid grid-cols-5 gap-3 max-w-4xl w-full mt-10">
          {categories.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-white/5">
              <span className="text-4xl">{cat.icon}</span>
              <span className="text-[12px] font-bold text-gray-400">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 우측 하단 플로팅 버튼 (이미지 참조) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-[10px] cursor-pointer shadow-lg">KAKAO</div>
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] cursor-pointer shadow-lg">TELE</div>
      </div>
    </div>
  )
}

export default App
