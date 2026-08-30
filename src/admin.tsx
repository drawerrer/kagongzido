import { createRoot } from 'react-dom/client';
import AdminApp from './pages/AdminPage';

const root = document.getElementById('root');
if (root) createRoot(root).render(<AdminApp />);
