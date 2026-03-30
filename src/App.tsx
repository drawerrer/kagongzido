import { useState } from 'react';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
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
            {activeTab === 'guidebook'  && <GuidebookPlaceholder />}
            {activeTab === 'collection' && <CollectionPage />}
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

// 가이드북은 feature/guidebook 브랜치에서 작업 예정
function GuidebookPlaceholder() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
      }}
    >
      <span style={{ fontSize: 48 }}>📖</span>
      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        가이드북
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        feature/guidebook 브랜치에서 개발 예정
      </p>
    </div>
  );
}
