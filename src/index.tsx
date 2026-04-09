import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  );
}
