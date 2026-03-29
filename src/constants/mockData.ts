import { Cafe } from '../types/cafe';

export const CATEGORY_CHIPS = ['두쫀쿠', '버터떡', '조용한', '넓은', '콘센트 많은', '뷰 좋은'];

export const MOCK_CAFES: Cafe[] = [
  {
    id: '1',
    name: '영주빵집',
    tags: ['조용한', '콘센트 충분'],
    rating: 4.8,
    reviewCount: 132,
    distance: '200m',
    thumbnail: 'https://picsum.photos/seed/cafe1/200',
    latitude: 37.4979,
    longitude: 127.0276,
  },
  {
    id: '2',
    name: '카페 그라브',
    tags: ['넓은', '뷰 좋은'],
    rating: 4.6,
    reviewCount: 98,
    distance: '350m',
    thumbnail: 'https://picsum.photos/seed/cafe2/200',
    latitude: 37.4985,
    longitude: 127.0281,
  },
  {
    id: '3',
    name: '채원콩',
    tags: ['버터떡', '두쫀쿠'],
    rating: 4.5,
    reviewCount: 74,
    distance: '500m',
    thumbnail: 'https://picsum.photos/seed/cafe3/200',
    latitude: 37.4972,
    longitude: 127.0268,
  },
  {
    id: '4',
    name: '카페 헤일메리',
    tags: ['조용한', '넓은'],
    rating: 4.3,
    reviewCount: 56,
    distance: '700m',
    thumbnail: 'https://picsum.photos/seed/cafe4/200',
    latitude: 37.4990,
    longitude: 127.0290,
  },
  {
    id: '5',
    name: '프로젝트 헤일메리',
    tags: ['콘센트 충분', '조용한'],
    rating: 4.7,
    reviewCount: 110,
    distance: '900m',
    thumbnail: 'https://picsum.photos/seed/cafe5/200',
    latitude: 37.4965,
    longitude: 127.0260,
  },
];

export const DEFAULT_REGION = {
  latitude: 37.4979,
  longitude: 127.0276,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};
