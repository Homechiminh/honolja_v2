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

// 3. 카테고리 정의 (숙소와 여행 서비스를 분리하여 확장)
export const CategoryType = {
  MASSAGE: 'massage',
  BARBER: 'barber',
  KARAOKE: 'karaoke',
  BAR_CLUB: 'barclub',
  COMMUNITY: 'community',
  VILLA: 'villa',          // 숙소/풀빌라 전용
  TOUR: 'tour',            // 투어/골프
  VEHICLE: 'vehicle',      // 차량/픽업
  VISA: 'visa_guide',      // 비자 연장 및 가이드 포함
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
  rating: number;         // 관리자 지정 별점
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

// 6. 사용자 정보 인터페이스
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  level: number;         // 1~4 등급
  points: number;        // 활동 포인트
  review_count: number;  // 등업 조건: 실제 작성한 업소후기 수
  avatar_url?: string;   // 프로필 이미지 주소
  is_blocked: boolean;
  created_at: string;
}
