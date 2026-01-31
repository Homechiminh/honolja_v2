// ✅ 'React' 대신 필요한 { useState }만 임포트하여 에러 해결
import { useState } from 'react';

const Policies = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'guide'>('terms');
  const TELEGRAM_URL = "https://t.me/honolja84";

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen bg-white">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Policies</h1>
        <p className="text-lg text-blue-600 font-bold uppercase tracking-widest">호놀자 운영 정책 및 약관</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-10 overflow-x-auto">
        {[
          { id: 'terms', label: '이용약관' },
          { id: 'privacy', label: '개인정보 처리방침' },
          { id: 'guide', label: '커뮤니티 가이드라인' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] py-4 text-sm md:text-base font-bold transition-all ${
              activeTab === tab.id 
                ? 'border-b-4 border-blue-600 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 정책 내용 */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm leading-relaxed text-gray-700">
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">제 1조. 서비스 이용약관</h2>
            <p>본 약관은 '호놀자'가 제공하는 호치민 기반 레저 커뮤니티 서비스의 이용 조건 및 절차를 규정합니다.</p>
            <p>회원은 현지 법규를 준수해야 하며, 허위 사실 유포로 인한 타인의 영업 방해 시 이용이 제한됩니다.</p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-600 italic">"익명성은 호놀자의 자부심입니다."</h2>
            <p>우리는 유저의 프라이버시를 최우선으로 합니다. 로그인용 이메일 외의 불필요한 개인정보는 절대 수집하지 않으며, 모든 데이터는 철저히 암호화됩니다.</p>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-red-600">클린 커뮤니티 가이드라인</h2>
            <ul className="list-disc pl-5 space-y-3 text-red-800 font-medium">
              <li>특정 업체나 개인에 대한 근거 없는 비방 금지</li>
              <li>상업적인 목적의 도배 및 스팸 게시물 삭제</li>
              <li>현지 법규 및 풍속을 해치는 게시물 즉시 차단</li>
            </ul>
          </div>
        )}
      </div>

      {/* 텔레그램 연동 푸터 */}
      <div className="mt-12 p-8 bg-gray-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">도움이 필요하신가요?</h3>
          <p className="text-gray-400 text-sm">모든 문의 및 신고는 텔레그램 고객센터가 가장 빠릅니다.</p>
        </div>
        <a 
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all"
        >
          텔레그램 @honolja84
        </a>
      </div>
    </div>
  );
};

export default Policies;
