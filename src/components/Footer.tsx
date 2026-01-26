import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* 상단 3개 섹션 레이아웃 (이미지 f29465 기준) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* 1. 브랜드 정보 섹션 (좌측) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-1 mb-6">
              <span className="text-2xl font-black text-white tracking-tighter">호놀자</span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2"></span>
            </div>
            <p className="text-gray-400 text-[15px] leading-relaxed mb-8 max-w-sm font-medium">
              베트남 여행의 모든 즐거움을 한 곳에, 호놀자입니다.<br />
              정직한 리뷰와 프리미엄 정보를 통해 여러분의 여행을 더욱 특별하게 만들어드리겠습니다.
            </p>
            
            {/* 소셜 버튼 세트 - 이미지와 동일한 컬러 적용 */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-[#FEE500] text-black px-5 py-3 rounded-xl font-black text-[13px] hover:bg-[#F7D600] transition-colors shadow-lg shadow-yellow-500/10">
                <span className="text-lg">💬</span> 호놀자 카톡
              </button>
              <button className="flex items-center gap-2 bg-[#0088cc] text-white px-5 py-3 rounded-xl font-black text-[13px] hover:bg-[#0077b5] transition-colors shadow-lg shadow-blue-500/10">
                <span className="text-lg">✈️</span> 호놀자 텔레그램
              </button>
            </div>
          </div>

          {/* 2. SERVICE 섹션 (중앙) */}
          <div className="lg:col-span-4 lg:pl-20">
            <h4 className="text-white font-black text-[13px] mb-8 tracking-[0.2em] uppercase italic">Service</h4>
            <ul className="space-y-4 text-gray-500 text-[14px] font-bold">
              <li className="hover:text-white cursor-pointer transition-colors">힐링 & 테라피 (마사지)</li>
              <li className="hover:text-white cursor-pointer transition-colors">토탈 그루밍 케어 (이발소)</li>
              <li className="hover:text-white cursor-pointer transition-colors">가라오케</li>
              <li className="hover:text-white cursor-pointer transition-colors">럭셔리 나이트라이프 (바/클럽)</li>
              <li className="hover:text-white cursor-pointer transition-colors">커뮤니티 게시판</li>
            </ul>
          </div>

          {/* 3. SUPPORT 섹션 (우측) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-black text-[13px] mb-8 tracking-[0.2em] uppercase italic">Support</h4>
            <ul className="space-y-4 text-gray-500 text-[14px] font-bold">
              <li className="hover:text-white cursor-pointer transition-colors">공지사항</li>
              <li className="hover:text-white cursor-pointer transition-colors">숙소 및 투어 문의</li>
              {/* 이미지 f29465에서 빨간색으로 강조된 부분 반영 */}
              <li className="text-red-600 hover:text-red-500 cursor-pointer transition-colors">광고 및 제휴문의</li>
              <li className="hover:text-white cursor-pointer transition-colors">이용약관 및 정책</li>
            </ul>
          </div>
        </div>

        {/* 하단 카피라이트 섹션 (이미지 하단 텍스트 반영) */}
        <div className="pt-10 border-t border-white/5 text-center">
          <p className="text-[12px] text-gray-600 font-bold mb-2">
            © 2024 호놀자 VIETNAM. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-700 font-bold italic uppercase tracking-wider">
            High-End Lifestyle Concierge for Vietnam Travelers.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
