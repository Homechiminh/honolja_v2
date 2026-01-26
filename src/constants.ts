import { CategoryType, Region, Store, CommunityPost, Coupon, User, UserRole, Notice } from './types';

export const BRAND_NAME = "호놀자";
export const BRAND_NAME_EN = "Honolja";

// 테스트용 계정 데이터
export const MOCK_USER_GUEST: User = {
  id: 'user_guest_1',
  name: '사이공나그네',
  email: 'guest@honolja.com',
  role: UserRole.GUEST,
  level: 1, 
  points: 2500,
  profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest1`
};

export const MOCK_USER_ADMIN: User = {
  id: 'admin_root',
  name: '호놀자관리자',
  email: 'admin@honolja.com',
  role: UserRole.ADMIN,
  level: 99,
  points: 999999,
  profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
};

export const SPRITE_IMAGE_URL_9 = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1768906189/Gemini_Generated_Image_12t6r212t6r212t6_fyruur.png'; 
export const SPRITE_IMAGE_URL_12 = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1768960502/lucid-origin_9_asian_girls_with_well_dressed_such_as_Sequin_Dress_off_shoulder_dress_Slip_Dre-0_2_kuf0m2.jpg';

const IMG_PREMIUM_SPA = 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop';
const IMG_LUXURY_KARAOKE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop';

export const MOCK_STORES: Store[] = [
  { 
    id: 'h1', 
    name: '아우라 프리미엄 스파', 
    category: CategoryType.MASSAGE, 
    region: Region.HCMC, 
    rating: 4.9, 
    reviewCount: 482, 
    description: '호치민 1등 미인 관리사 상시 대기. 최상급 아로마 오일 테라피.', 
    imageUrl: IMG_PREMIUM_SPA, 
    imageIndex: 0, 
    tags: ['1군', '프리미엄', '에이스'], 
    address: '135 Bùi Viện, Quận 1, Hồ Chí Minh', 
    isHot: true, 
    authorId: 'admin_root'
  },
  { 
    id: 'h2', 
    name: '블랙잭 가라오케', 
    category: CategoryType.KARAOKE, 
    region: Region.HCMC, 
    rating: 4.8, 
    reviewCount: 312, 
    description: '호치민 최대 규모, 최신식 K-POP 음향 설비 및 럭셔리 인테리어.', 
    imageUrl: IMG_LUXURY_KARAOKE, 
    imageIndex: 0, 
    tags: ['수질최상', '대형룸', '1군'], 
    address: '102 Lê Lai, Quận 1, Hồ Chí Minh', 
    isHot: true, 
    authorId: 'admin_root'
  },
  { id: 'h3', name: '클럽 오블리비언', category: CategoryType.BAR_CLUB, region: Region.HCMC, rating: 4.7, reviewCount: 256, description: '가장 핫한 밤문화의 중심', imageUrl: SPRITE_IMAGE_URL_9, imageIndex: 2, tags: ['EDM', '헌팅'], address: '2 Thi Sách, Quận 1, Hồ Chí Minh', isHot: true, authorId: 'admin_root' },
  { id: 'h6', name: '골드문 스파', category: CategoryType.MASSAGE, region: Region.HCMC, rating: 4.6, reviewCount: 98, description: '전신 릴렉스 케어와 아로마 테라피', imageUrl: SPRITE_IMAGE_URL_12, imageIndex: 0, tags: ['아로마', '전신'], address: '8A/A1 Thái Văn Lung, Quận 1, Hồ Chí Minh', isHot: false, authorId: 'admin_root' },
  { id: 'h7', name: '다이아몬드 이발소', category: CategoryType.BARBER, region: Region.HCMC, rating: 4.5, reviewCount: 77, description: '가성비 최고의 서비스와 친절한 응대', imageUrl: SPRITE_IMAGE_URL_12, imageIndex: 1, tags: ['가성비', '친절'], address: '229 Phạm Ngũ Lão, Quận 1, Hồ Chí Minh', isHot: true, authorId: 'admin_root' },
];

export const MOCK_POSTS: CommunityPost[] = [
  { id: '1', title: '푸미흥 미드타운 급매물 정보', author: '호놀자부동산', authorId: 'admin_root', level: 10, createdAt: '10분 전', views: 2450, likes: 82, content: '미드타운 매물 정보입니다.' },
  { id: '2', title: '어제 다녀온 1군 마사지 솔직 후기', author: '사이공나그네', authorId: 'user_guest_1', level: 3, createdAt: '1시간 전', views: 1240, likes: 45, content: '시설이 정말 깨끗하고 관리사분들이 너무 친절하시네요.' },
  { id: '3', title: '호치민 클럽 테이블 예약 꿀팁', author: '밤의황제', authorId: 'user_guest_2', level: 5, createdAt: '3시간 전', views: 890, likes: 21, content: '미리 예약하고 가야 좋은 자리 잡습니다.' },
  { id: '4', title: '다낭 나트랑 이번주 날씨 어떤가요?', author: '여행자A', authorId: 'user_guest_3', level: 1, createdAt: '5시간 전', views: 560, likes: 3, content: '비 소식이 있나요?' },
];

export const VETERAN_MOCK_POSTS = [
  { id: 'vet1', title: '[비밀] 1군 가라오케 에이스 마담 5인 직통 번호', author: '사이공고수', authorId: 'v_1', level: 15, createdAt: '30분 전', views: 125, likes: 42, isVeteran: true, content: '리스트입니다.' },
  { id: 'vet2', title: '레탄톤 신규 업장 수질 보고 (사진포함)', author: '밤의대통령', authorId: 'v_2', level: 20, createdAt: '1시간 전', views: 890, likes: 110, isVeteran: true, content: '수질 보고서.' },
  { id: 'vet3', title: '호놀자 전용 풀빌라 심야 픽업 서비스 코드', author: '관리자', authorId: 'admin_root', level: 99, createdAt: '3시간 전', views: 2100, likes: 340, isVeteran: true, content: '픽업 코드.' },
  { id: 'vet4', title: '악질 브로커 리스트 공유합니다 (필독)', author: '정의구현', authorId: 'v_3', level: 12, createdAt: '5시간 전', views: 1500, likes: 98, isVeteran: true, content: '리스트.' },
];

export const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: '[공지] 호놀자 커뮤니티 이용 규칙 안내 (필독)', createdAt: '2024.03.10', views: 5400, isImportant: true, content: '규칙 안내.' },
  { id: 'n2', title: '[이벤트] 3월 우수 리뷰어 포인트 2배 적립 혜택', createdAt: '2024.03.15', views: 3200, isImportant: false, content: '이벤트.' },
  { id: 'n3', title: '[업데이트] 모바일 앱 푸시 알림 기능 추가 안내', createdAt: '2024.03.18', views: 1200, isImportant: false, content: '업데이트.' },
];

export const MOCK_ACCOMMODATIONS = [
  { id: 'v1', name: '1군 럭셔리 펜트하우스', price: '150,000원~', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800' },
  { id: 'v2', name: '타오디엔 풀빌라', price: '400,000원~', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800' }
];

export const SNS_LINKS = {
  kakao: 'https://pf.kakao.com/',
  telegram: 'https://t.me/honolja_official',
  naverCafe: 'https://cafe.naver.com/',
  consultation: 'https://example.com/chat'
};
