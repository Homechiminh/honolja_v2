import React from 'react';

const Home: React.FC = () => {
  const categories = [
    { name: '마사지/스파', icon: '💆‍♀️' },
    { name: '이발소', icon: '💈' },
    { name: '가라오케', icon: '🎤' },
    { name: '바/클럽', icon: '🍸' },
    { name: '숙소/차량', icon: '🏠' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* 장식용 배경 광원 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* 메인 타이틀 (이미지 f2f27b와 동일) */}
        <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-8 z-10">
          호치민에서 <span className="text-glow-red">놀자!</span>
        </h2>

        {/* 서브 멘트 (이미지 텍스트 100% 반영) */}
        <div className="space-y-4 mb-16 z-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg">
            남성들을 위한 호치민의 모든 것
          </p>
          <div className="space-y-1">
            <p className="text-blue-500 font-black text-lg md:text-2xl">
              실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)
            </p>
            <p className="text-cyan-400 font-bold text-sm md:text-lg opacity-90">
              풀빌라 · 아파트 예약까지 호놀자에서 한번에 !
            </p>
          </div>
        </div>

        {/* 카테고리 퀵 메뉴 (이미지 하단 아이콘) */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl w-full mt-6 z-10 px-4">
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className="flex flex-col items-center gap-4 p-8 bg-white/5 backdrop-blur-sm rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-red-600/30 transition-all cursor-pointer group shadow-2xl"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span className="text-sm font-black text-gray-400 group-hover:text-white tracking-tighter">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 플로팅 버튼 (카톡/텔레) */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-3 z-[100]">
        <div className="w-14 h-14 bg-[#FEE500] rounded-full flex items-center justify-center text-black font-black text-[11px] cursor-pointer shadow-[0_0_20px_rgba(254,229,0,0.3)] hover:scale-110 transition-transform">KAKAO</div>
        <div className="w-14 h-14 bg-[#0088cc] rounded-full flex items-center justify-center text-white font-black text-[11px] cursor-pointer shadow-[0_0_20px_rgba(0,136,204,0.3)] hover:scale-110 transition-transform">TELE</div>
      </div>
    </main>
  );
};

export default Home;
