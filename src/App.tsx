import { useState } from 'react';
import MapPage from './pages/MapPage';
import FavoritesPage from './pages/FavoritesPage';
import MyPage from './pages/MyPage';

// 디자이너 참고: 앱의 탭 구조를 정의하는 곳이에요
// 피그마에서 만든 탭 네비게이션과 1:1로 대응돼요
type TabId = 'map' | 'favorites' | 'mypage';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'map', label: '지도', icon: '🗺️' },
  { id: 'favorites', label: '즐겨찾기', icon: '⭐' },
  { id: 'mypage', label: '마이', icon: '👤' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('map');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 화면 영역 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'favorites' && <FavoritesPage />}
        {activeTab === 'mypage' && <MyPage />}
      </div>

      {/* 탭 바 - 피그마 Bottom Navigation과 동일한 구조 */}
      <nav style={{
        display: 'flex',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
