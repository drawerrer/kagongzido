import { SavedCafe, RecentSearch, AutocompleteResult, Collection } from '../types/search';

export const COLLECTIONS: Collection[] = [
  { id: 'favorites', name: '즐겨찾기', isDefault: true },
  { id: 'collection1', name: '컬렉션1', isDefault: false },
  { id: 'mangwon', name: '망원카페', isDefault: false },
];

export const SAVED_CAFES: SavedCafe[] = [
  {
    id: '1',
    name: '카페 그라브',
    address: '서울 강남구 학동로 168',
    distance: '1.7km',
    isFavorite: true,
    collectionIds: ['favorites', 'collection1'],
  },
  {
    id: '2',
    name: '채원콩',
    address: '서울 강남구 학동로 168',
    distance: '2km',
    isFavorite: true,
    collectionIds: ['favorites'],
  },
  {
    id: '3',
    name: '영주빵집',
    address: '서울 강남구 학동로 168',
    distance: '2.3km',
    isFavorite: true,
    collectionIds: ['favorites', 'mangwon'],
  },
  {
    id: '4',
    name: '카페 헤일메리',
    address: '서울 강남구 학동로 168',
    distance: '9.7km',
    isFavorite: true,
    collectionIds: ['favorites', 'mangwon'],
  },
];

export const RECENT_SEARCHES: RecentSearch[] = [
  { id: '1', keyword: '대형카페', date: '03.19' },
  { id: '2', keyword: '카공', date: '03.19' },
  { id: '3', keyword: '마포구', date: '03.19' },
  { id: '4', keyword: '성수카페', date: '03.18' },
  { id: '5', keyword: '프로젝트 헤일메리', date: '03.18' },
];

export const AUTOCOMPLETE_KEYWORDS = [
  '대형카페', '브런치카페', '카페거리', '카페 투어', '카공족 카페',
];

export const POI_RESULTS: AutocompleteResult[] = [
  {
    id: 'p1',
    type: 'favorite',
    name: '카페 그라브',
    address: '서울 강남구 학동로 168',
    distance: '9.7km',
  },
  {
    id: 'p2',
    type: 'place',
    name: '카페 헤일메리',
    address: '서울 종로구 틸운대로 44',
    distance: '297m',
  },
  {
    id: 'p3',
    type: 'place',
    name: '케이오피피아이',
    address: '경기 과천시 중앙로 135 과천중앙...',
    distance: '1.5km',
  },
  {
    id: 'p4',
    type: 'place',
    name: '케이오피피아이',
    address: '경기 과천시 중앙로 135',
    distance: '1.5km',
  },
];
