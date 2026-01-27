import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { SNS_LINKS } from '../constants'; // SNS 링크 활용
import StoreCard from '../components/StoreCard';

const StoreList: React.FC = () => {
  // 1. 주소창에서 카테고리명을 가져옵니다.
  const { category } = useParams<{ category: string }>();
  
  // 2. 해당 카테고리의 데이터를 실시간으로 가져옵니다.
  const { stores, loading } = useStores(category);

  // 카테고리별 한글 타이틀 매핑 로직
  const getTitle = (cat: string | undefined) => {
    switch(cat) {
      case 'massage': return '마사지 / 스파';
      case 'barber': return '이발소 / 그루밍';
      case 'karaoke': return '가라오케';
      case 'barclub': return '바 / 클럽 / 라운지';
      case 'realestate': return '부동산 중개';
      case 'golf': return '골프 & 투어';
      case 'villa': return '숙소 / 풀빌라';
      default: return '프리미엄 서비스';
    }
  };

  return (
    <div className="container mx-auto px-4 py-32 min-h-screen bg-[#050505]">
      {/* 상단 헤더 섹션 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-10">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
            <span className="text-red-500 text-sm font-black uppercase tracking-widest">{category}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase">{getTitle(category)}</h1>
          <p className="text-slate-400 mt-6 text-xl font-medium max-w-2xl leading-relaxed">
            호치민에서 가장 엄선된 {getTitle(category)} 업체의 실시간 정보와 할인 혜택을 확인하세요.
          </p>
        </div>
      </div>

      {/* 리스트 본문 영역 */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {stores.length === 0 && (
            <div className="col-span-full py-60 text-center bg-[#080808] rounded-[3rem] border border-white/5">
              <p className="text-slate-500 font-black text-2xl italic tracking-tighter uppercase">등록된 업체 정보가 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* 하단 CTA: 친근한 상담 멘트 적용 */}
      <div className="mt-40 bg-gradient-to-br from-[#111] to-black rounded-[4rem] p-16 md:p-32 border border-white/5 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        <span className="text-red-500 font-black text-xs uppercase tracking-[0.5em] block mb-8">Honolja Direct Contact</span>
        <h3 className="text-4xl md:text-7xl font-black mb-12 text-white italic tracking-tighter">
          언제든 열려있으니 <br /> 편하게 연락주세요.
        </h3>
        <p className="text-slate-400 mb-16 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
          업소 예약 문의부터 광고 제휴까지, 궁금하신 점은 무엇이든 좋습니다. <br className="hidden md:block" />
          호놀자는 여러분의 즐거운 호치민 생활을 위해 항상 대기하고 있습니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a 
            href={SNS_LINKS.kakao} 
            target="_blank" 
            rel="noreferrer"
            className="px-14 py-6 bg-[#FEE500] text-[#3C1E1E] rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
          >
            카카오톡으로 물어보기
          </a>
          <a 
            href={SNS_LINKS.telegram} 
            target="_blank" 
            rel="noreferrer" 
            className="px-14 py-6 bg-[#0088cc] text-white rounded-3xl font-black text-xl border border-white/10 hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
          >
            텔레그램으로 물어보기
          </a>
        </div>
        
        <div className="mt-12">
          <Link to="/partnership" className="text-slate-500 font-bold text-sm underline hover:text-white transition-colors">
            광고 및 입점 제휴 안내
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreList;
