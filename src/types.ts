export const UserRole = {
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

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  points: number;
  created_at: string;
  profile_image?: string;
}
