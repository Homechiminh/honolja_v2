// 1. 사용자 등급 정의
export const UserRole = {
  GUEST: 'GUEST',
  USER: 'USER',
  VETERAN: 'VETERAN',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// 2. 업종 카테고리 정의
export const CategoryType = {
  MASSAGE: 'massage',
  BARBER: 'barber',
  KARAOKE: 'karaoke',
  BAR_CLUB: 'barclub',
  COMMUNITY: 'community',
  VILLA: 'villa'
} as const;
export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

// 3. 지역 정의
export const Region = {
  HCMC: 'HCMC',
  DANANG: 'DANANG',
  NHA_TRANG: 'NHA_TRANG'
} as const;
export type Region = typeof Region[keyof typeof Region];

// 4. 업소(Store) 인터페이스
export interface Store {
  id: string;
  name: string;
  category: CategoryType;
  region: Region;
  rating: number;
  review_count: number;    // snake_case 반영
  description: string;
  image_url: string;       // snake_case 반영
  image_index: number;     // snake_case 반영
  tags: string[];
  address: string;
  is_hot: boolean;         // snake_case 반영
  author_id: string;       // snake_case 반영
  
  // --- 상세 페이지(StoreDetail)를 위한 추가 필드 ---
  benefits?: string[];     // 호놀자 제휴 혜택 리스트
  promo_images?: string[]; // 홍보 갤러리 이미지 배열
  kakao_url?: string;      // 해당 업소 담당자 카톡 링크
  telegram_url?: string;   // 해당 업소 담당자 텔레그램 링크
}

// 5. 사용자(User) 인터페이스
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  points: number;
  created_at: string;
  profile_image?: string;  // snake_case 반영
}
