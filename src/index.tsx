import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

// Kakao Maps SDK는 index.html에서 정적 로드

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <TDSMobileAITProvider brandPrimaryColor="#252525">
      <App />
    </TDSMobileAITProvider>
  );
}
