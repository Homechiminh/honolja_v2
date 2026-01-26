// src/types.ts 전문

export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  VETERAN = 'VETERAN',
  ADMIN = 'ADMIN'
}

export enum CategoryType {
  MASSAGE = 'massage',
  BARBER = 'barber',
  KARAOKE = 'karaoke',
  BAR_CLUB = 'barclub',
  COMMUNITY = 'community',
  VILLA = 'villa'
}

export enum Region {
  HCMC = 'HCMC',
  DANANG = 'DANANG',
  NHA_TRANG = 'NHA_TRANG'
}

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
  reviewCount: number;
  description: string;
  imageUrl: string;
  imageIndex?: number;
  tags: string[];
  address: string;
  isHot: boolean;
  authorId: string;
  promoImages?: string[];
  benefits?: string[];
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  level: number;
  createdAt: string;
  views: number;
  likes: number;
  content: string;
  isVeteran?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  createdAt: string;
  views: number;
  isImportant: boolean;
  content: string;
}

export interface Coupon {
  id: string;
  title: string;
  category: CategoryType;
  pointCost: number;
  discount: string;
  description: string;
}
