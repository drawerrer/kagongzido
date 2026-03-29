export type SortType = '조회순' | '거리순' | '평점순';

export interface CafeMarker {
  id: string;
  latitude: number;
  longitude: number;
}

export interface Cafe {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  distance: string;
  thumbnail: string;
  latitude: number;
  longitude: number;
}
