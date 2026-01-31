// 1. 유저 권한 정의
export const UserRole = {
  USER: 'USER',
  VETERAN: 'VETERAN',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// 2. 등급(레벨) 명칭 정의
export const LEVEL_NAMES: { [key: number]: string } = {
  1: '여행자',
  2: '방랑자',
  3: '베테랑',
  4: 'VIP'
} as const;

// 3. 업소 카테고리 정의
export const CategoryType = {
  MASSAGE: 'massage',
  BARBER: 'barber',
  KARAOKE: 'karaoke',
  BAR_CLUB: 'barclub',
  COMMUNITY: 'community',
  VILLA: 'villa',
  TOUR: 'tour',
  VEHICLE: 'vehicle',
  VISA: 'visa_guide',
} as const;
export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

// 4. 지역 정의
export const Region = {
  HCMC: 'HCMC',
  DANANG: 'DANANG',
  NHA_TRANG: 'NHA_TRANG'
} as const;
export type Region = typeof Region[keyof typeof Region];

// 5. 사용자 정보 인터페이스 (profiles 테이블 기반)
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  level: number;
  points: number;
  review_count: number;
  avatar_url?: string;
  is_blocked: boolean;
  created_at: string;
}

// 6. 업소 정보 인터페이스 (stores 테이블 기반)
export interface Store {
  id: string;
  name: string;
  category: CategoryType;
  region: Region;
  rating: number;
  description: string;
  image_url: string;
  image_index: number;
  tags: string[];
  benefits?: string[];
  address: string;
  is_hot: boolean;
  author_id: string;
  promo_images?: string[];
  kakao_url?: string;
  telegram_url?: string;
  created_at?: string;
}

// 7. 게시글 인터페이스 (posts 테이블 기반 - 조회수/좋아요 포함)
export interface Post {
  id: string;
  author_id: string;
  store_id?: string | null;     // 후기 작성 시 연결된 업소 ID
  title: string;
  content: string;
  category: string;             // 'free', 'vip', 'review' 등
  sub_category?: string;        // '실시간 현황' 등
  view_count: number;           // 조회수 (DB 컬럼명 일치)
  likes: number;                // 좋아요 수 (DB 컬럼명 일치)
  image_urls?: string[];        // 첨부 이미지 배열 (text[])
  link_url?: string | null;     // 외부 링크
  created_at: string;
  updated_at: string;
}

// 8. 댓글 인터페이스 (comments 테이블 기반)
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// 9. 공지사항 인터페이스 (notices 테이블 기반)
export interface Notice {
  id: string;
  author_id: string;
  title: string;
  content: string;
  is_important: boolean;        // 중요 공지 여부
  views: number;                // 공지사항 조회수
  created_at: string;
  updated_at: string;
}

// 10. 쿠폰 인터페이스 (coupons 테이블 기반)
export interface Coupon {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_used: boolean;             // 사용 여부 (필수 체크!)
  expired_at: string;           // 만료 일시
  created_at: string;
}

// 11. 포인트 내역 인터페이스 (point_history 테이블 기반)
export interface PointHistory {
  id: string;
  user_id: string;
  amount: number;               // 증감 수치 (예: -200)
  reason: string;               // 사유 (예: 쿠폰 교환)
  created_at: string;
}
