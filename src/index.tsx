import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

function showError(msg: string) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;z-index:99999;padding:20px;font-size:13px;font-family:monospace;overflow:auto;white-space:pre-wrap;color:red;';
  div.textContent = 'ERROR:\n' + msg;
  document.body.appendChild(div);
}

window.onerror = (_msg, _src, _line, _col, err) => {
  showError(err ? (err.stack || err.message) : String(_msg));
};
window.addEventListener('unhandledrejection', (e) => {
  showError(e.reason?.stack || String(e.reason));
});

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <TDSMobileAITProvider brandPrimaryColor="#252525">
      <App />
    </TDSMobileAITProvider>
  );
}
