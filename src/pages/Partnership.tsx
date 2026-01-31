import React from 'react';

const Partnership = () => {
  // 사용자님이 말씀하신 텔레그램 단일 창구
  const TELEGRAM_URL = "https://t.me/honolja84";

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h2 className="text-blue-600 font-bold mb-4 tracking-widest text-xl">VIETNAM NO.1 PLATFORM</h2>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
          호치민에서 <span className="text-blue-600">최고의 트래픽</span>을 선점하세요
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          호놀자는 베트남 현지 실사용자가 가장 밀집된 플랫폼입니다.<br/>
          성공적인 비즈니스를 위한 파트너십을 시작해보세요.
        </p>
      </div>

      {/* Partnership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        
        {/* 1. 업소 등록 문의 */}
        <div className="group p-10 rounded-[2.5rem] border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-2xl bg-white">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <span className="text-3xl group-hover:scale-110 transition-transform">🏢</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">업소 등록 문의</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            마사지, KTV, 식당, 골프 등 호치민 전역의 업소 사장님을 위한 서비스입니다. 
            상세 페이지 구축과 실시간 리뷰 관리로 홍보 효과를 극대화하세요.
          </p>
          {/* ✅ 버튼에 텔레그램 링크 연결 */}
          <a 
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-gray-900 text-white text-center rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg"
          >
            입점 신청하기 (Telegram)
          </a>
        </div>

        {/* 2. 프리미엄 광고 제휴 */}
        <div className="group p-10 rounded-[2.5rem] border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-2xl bg-white">
          <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
            <span className="text-3xl group-hover:scale-110 transition-transform">🚀</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">프리미엄 광고 제휴</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            메인 페이지 최상단 배너 및 카테고리별 상단 노출을 통해 
            가장 빠른 예약 전환율과 브랜드 인지도를 보장해 드립니다.
          </p>
          {/* ✅ 버튼에 텔레그램 링크 연결 */}
          <a 
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-gray-900 text-white text-center rounded-2xl font-bold hover:bg-orange-500 transition shadow-lg"
          >
            광고 문의하기 (Telegram)
          </a>
        </div>

      </div>

      {/* 하단 CTA Section */}
      <div className="bg-blue-600 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-200">
        <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.1.83.67.83 1.5z"/>
          </svg>
        </div>
        <h3 className="text-3xl font-black mb-4 tracking-tight">상담은 24시간 열려있습니다</h3>
        <p className="mb-10 text-blue-100 text-lg font-medium">텔레그램 고객센터 @honolja84</p>
        <a 
          href={TELEGRAM_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-16 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1"
        >
          지금 바로 상담하기
        </a>
      </div>
    </div>
  );
};

export default Partnership;
