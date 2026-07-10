// Kakao Maps SDK 전역 타입 선언
// 공식 npm 타입 패키지 없이 <script> 태그로 로드하는 SDK라, 실제 코드에서
// 사용하는 만큼만 직접 선언해 관리한다. 새 API를 쓰게 되면 여기에 추가할 것.

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoBounds {
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
}

interface KakaoSize {
  width: number;
  height: number;
}

interface KakaoMarkerImage {
  src: string;
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  setLevel(level: number): void;
  getLevel(): number;
  getBounds(): KakaoBounds;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  getContent(): HTMLElement | string;
  setContent(content: HTMLElement | string): void;
}

interface KakaoCluster {
  getMarkers(): KakaoMarker[];
}

interface KakaoMarkerClusterer {
  addMarkers(markers: KakaoMarker[]): void;
  clear(): void;
}

interface KakaoMapsStatic {
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMap; image?: KakaoMarkerImage }) => KakaoMarker;
  MarkerImage: new (src: string, size: KakaoSize) => KakaoMarkerImage;
  Size: new (width: number, height: number) => KakaoSize;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: HTMLElement | string;
    map?: KakaoMap;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlay;
  MarkerClusterer: new (options: {
    map: KakaoMap;
    averageCenter?: boolean;
    minLevel?: number;
    gridSize?: number;
    styles?: Record<string, string>[];
  }) => KakaoMarkerClusterer;
  event: {
    addListener(target: KakaoMap, type: 'dragstart' | 'dragend' | 'bounds_changed', handler: () => void): void;
    addListener(target: KakaoMarkerClusterer, type: 'clusterclick', handler: () => void): void;
    addListener(target: KakaoMarkerClusterer, type: 'clustered', handler: (clusters: KakaoCluster[]) => void): void;
    removeListener(target: object, type: string, handler: () => void): void;
  };
}

interface Window {
  kakao: {
    maps: KakaoMapsStatic;
  };
}
