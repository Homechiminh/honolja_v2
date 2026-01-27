// 1. 유저 권한 정의
export const UserRole = {
  USER: 'USER',
  VETERAN: 'VETERAN',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// 2. 등급(레벨) 명칭 정의 (여행자 > 방랑자 > 베테랑 > VIP)
export const LEVEL_NAMES: { [key: number]: string } = {
  1: '여행자',
  2: '방랑자',
  3: '베테랑',
  4: 'VIP'
} as const;

// 3. 카테고리 정의
export const CategoryType = {
  MASSAGE: 'massage',
  BARBER: 'barber',
  KARAOKE: 'karaoke',
  BAR_CLUB: 'barclub',
  COMMUNITY: 'community',
  VILLA: 'villa'
} as const;
export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

// 4. 지역 정의
export const Region = {
  HCMC: 'HCMC',
  DANANG: 'DANANG',
  NHA_TRANG: 'NHA_TRANG'
} as const;
export type Region = typeof Region[keyof typeof Region];

// 5. 업소 정보 인터페이스
export interface Store {
  id: string;
  name: string;
  category: CategoryType;
  region: Region;
  rating: number;
  review_count: number;
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
}

// 6. 사용자 정보 인터페이스 (신규 필드 포함)
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  level: number;       // 1~4 등급
  points: number;      // 활동 포인트
  is_blocked: boolean; // 차단 여부
  created_at: string;
  profile_image?: string;
}
