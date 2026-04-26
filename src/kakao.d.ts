// Kakao Maps SDK 전역 타입 선언
interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

interface KakaoMapsStatic {
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMap }) => KakaoMarker;
  event: {
    addListener(target: object, type: string, handler: () => void): void;
    removeListener(target: object, type: string, handler: () => void): void;
  };
}

interface Window {
  kakao: {
    maps: KakaoMapsStatic;
  };
}
