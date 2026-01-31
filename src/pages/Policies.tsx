import React, { useState } from 'react';

const Policies = () => {
  // 탭 상태 관리 (약관 / 개인정보 / 가이드라인)
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'guide'>('terms');

  const TELEGRAM_URL = "https://t.me/honolja84";

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen bg-white">
      {/* 타이틀 섹션 */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">POLICIES</h1>
        <p className="text-lg text-blue-600 font-bold uppercase tracking-widest">호놀자 운영 정책 및 약관</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-10">
        {[
          { id: 'terms', label: '이용약관' },
          { id: 'privacy', label: '개인정보 처리방침' },
          { id: 'guide', label: '커뮤니티 가이드라인' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 text-sm md:text-base font-bold transition-all ${
              activeTab === tab.id 
                ? 'border-b-4 border-blue-600 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 정책 내용 섹션 */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm leading-relaxed text-gray-700">
        
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">제 1조. 서비스 이용약관</h2>
            <section className="space-y-4">
              <h3 className="font-bold text-gray-800">[목적]</h3>
              <p>본 약관은 '호놀자'(이하 "회사")가 제공하는 호치민 기반 레저 및 커뮤니티 서비스의 이용 조건 및 절차를 규정합니다.</p>
              
              <h3 className="font-bold text-gray-800">[서비스의 제공]</h3>
              <p>회사는 이용자에게 베트남 현지 업소 정보, 커뮤니티 게시판, 제휴 혜택 등의 서비스를 제공하며, 모든 정보는 현지 사정에 따라 변동될 수 있습니다.</p>
              
              <h3 className="font-bold text-gray-800">[이용자의 의무]</h3>
              <p>회원은 타인의 정보를 도용하거나, 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다. 특히 허위 사실 유포로 인한 업소 피해 발생 시 법적 책임을 물을 수 있습니다.</p>
            </section>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 italic">"유저의 익명성은 호놀자의 자부심입니다."</h2>
            <section className="space-y-4">
              <div className="bg-blue-600 text-white p-4 rounded-xl font-bold mb-4">
                호놀자는 불필요한 개인정보를 수집하지 않습니다.
              </div>
              <h3 className="font-bold text-gray-800">[수집 항목]</h3>
              <p>로그인을 위한 이메일 주소, 닉네임, 서비스 이용 기록(IP, 쿠키) 등 서비스 제공에 필요한 최소한의 데이터만을 수집합니다.</p>
              
              <h3 className="font-bold text-gray-800">[개인정보의 파기]</h3>
              <p>회원 탈퇴 시 수집된 모든 정보는 즉각적이고 복구 불가능한 방법으로 파기됩니다.</p>
            </section>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-red-600 mb-6">클린 커뮤니티 가이드라인</h2>
            <section className="space-y-4">
              <p className="font-medium text-gray-900">건강한 호놀자 문화를 위해 아래 행위를 엄격히 금지합니다.</p>
              <ul className="list-disc pl-5 space-y-3 text-red-700 font-medium">
                <li>특정 업체나 개인에 대한 악의적인 비방 및 욕설</li>
                <li>광고성 도배 및 상업적인 목적의 무단 게시물</li>
                <li>음란물, 도박 등 현지 법규 및 미풍양속에 어긋나는 콘텐츠</li>
                <li>타인의 개인정보(연락처, 사진 등) 무단 공유</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4 italic">* 위반 시 사전 경고 없이 계정이 영구 정지될 수 있습니다.</p>
            </section>
          </div>
        )}

      </div>

      {/* 텔레그램 고객지원 섹션 */}
      <div className="mt-12 p-8 bg-gray-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">정책 관련 문의 및 불편사항</h3>
          <p className="text-gray-400 text-sm italic">24시간 텔레그램 상담 센터가 운영 중입니다.</p>
        </div>
        <a 
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
        >
          텔레그램 @honolja84
        </a>
      </div>

      <p className="mt-10 text-center text-gray-300 text-xs tracking-tighter">
        Copyright © HONOLJA. All rights reserved.
      </p>
    </div>
  );
};

export default Policies;
