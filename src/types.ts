// src/types.ts 전문

export const UserRole = {
  GUEST: 'GUEST',
  USER: 'USER',
  VETERAN: 'VETERAN',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const CategoryType = {
  MASSAGE: 'massage',
  BARBER: 'barber',
  KARAOKE: 'karaoke',
  BAR_CLUB: 'barclub',
  COMMUNITY: 'community',
  VILLA: 'villa'
} as const;
export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export const Region = {
  HCMC: 'HCMC',
  DANANG: 'DANANG',
  NHA_TRANG: 'NHA_TRANG'
} as const;
export type Region = typeof Region[keyof typeof Region];

export interface Store {
  id: string;
  name: string;
  category: CategoryType;
  region: Region;
  rating: number;
  review_count: number;
  description: string;
  image_url: string;
  image_index?: number;
  tags: string[];
  address: string;
  is_hot: boolean;
  author_id: string;
}

// User 인터페이스 통합 (사용자님의 Profile 정보 포함)
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  points: number;
  created_at: string;
  profile_image?: string;
}
