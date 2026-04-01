// Kakao Maps SDK 전역 타입 선언
interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapsStatic {
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
}

interface Window {
  kakao: {
    maps: KakaoMapsStatic;
  };
}
