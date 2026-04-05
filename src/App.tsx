import { useState } from 'react';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import GuidebookPage from './pages/GuidebookPage';
import MyPage from './pages/MyPage';
import DetailPage from './pages/DetailPage';
import { FavoritesProvider } from './context/FavoritesContext';

// 피그마 "홈 | 가이드북 | 모음집 | 마이페이지" 탭 구조와 동일
type TabId = 'home' | 'guidebook' | 'collection' | 'mypage';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home',       label: '홈',     icon: '🏠' },
  { id: 'guidebook',  label: '가이드북', icon: '📖' },
  { id: 'collection', label: '모음집',  icon: '⭐' },
  { id: 'mypage',     label: '마이',   icon: '👤' },
];

export default function App() {
  return (
    <FavoritesProvider>
      <AppInner />
    </FavoritesProvider>
  );
}

// FavoritesProvider 안에서 렌더링 — useFavorites를 DetailPage에서 안전하게 사용 가능
function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showSearch, setShowSearch] = useState(false);
  const [detailCafeId, setDetailCafeId] = useState<string | null>(null);

  // 상세페이지 (탭바 완전히 가림)
  if (detailCafeId) {
    return (
      <div style={{ height: '100%' }}>
        <DetailPage
          cafeId={detailCafeId}
          onBack={() => setDetailCafeId(null)}
          onClose={() => setDetailCafeId(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {showSearch ? (
        /* ── 검색 화면 (탭바 숨김) ── */
        <SearchPage onClose={() => setShowSearch(false)} />
      ) : (
        <>
          {/* ── 화면 영역 ── */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'home'       && (
              <MapPage
                onSearchOpen={() => setShowSearch(true)}
                onDetailOpen={(id) => setDetailCafeId(id)}
              />
            )}
            {activeTab === 'guidebook'  && (
              <GuidebookPage
                onDetailOpen={(id) => setDetailCafeId(id)}
                onBack={() => setActiveTab('home')}
                onClose={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'collection' && (
              <CollectionPage
                onDetailOpen={(id) => setDetailCafeId(id)}
                onGoHome={() => setActiveTab('home')}
                onBack={() => setActiveTab('home')}
                onClose={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'mypage'     && <MyPage />}
          </div>

          {/* ── 탭 바 ── */}
          <nav
            style={{
              display: 'flex',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {TABS.map(tab => (
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
        </>
      )}
    </div>
  );
}

