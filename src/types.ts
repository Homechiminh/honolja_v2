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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number;
  points: number;
  profileImage?: string;
}

export interface Store {
  id: string;
  name: string;
  category: CategoryType;
  region: Region;
  rating: number;
  review_count: number; // snake_case 반영
  description: string;
  image_url: string;    // snake_case 반영
  image_index?: number; // snake_case 반영
  tags: string[];
  address: string;
  is_hot: boolean;
  author_id: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  author_id: string;
  level: number;
  created_at: string;
  views: number;
  likes: number;
  content: string;
  is_veteran?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  created_at: string;
  views: number;
  is_important: boolean;
  content: string;
}
