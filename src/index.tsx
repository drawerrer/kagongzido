import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

// Kakao Maps SDK 동적 주입 (RSBuild HTML 처리에 의존하지 않음)
const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;
if (kakaoKey && !(window as any).kakao) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;
  document.head.appendChild(script);
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <TDSMobileAITProvider brandPrimaryColor="#252525">
      <App />
    </TDSMobileAITProvider>
  );
}
