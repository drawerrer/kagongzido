export interface Collection {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface SavedCafe {
  id: string;
  name: string;
  address: string;
  distance: string;
  isFavorite: boolean;
  collectionIds: string[];
}

export interface RecentSearch {
  id: string;
  keyword: string;
  date: string; // 'MM.DD'
}

export interface AutocompleteResult {
  id: string;
  type: 'favorite' | 'place';
  name: string;
  address: string;
  distance: string;
}
