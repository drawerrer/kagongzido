import { useState, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

// ── 페이지 단위 에러바운더리 ─────────────────────────────────
class PageErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[PageErrorBoundary]', error, info); }
  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import GuidebookPage from './pages/GuidebookPage';
import MyPage from './pages/MyPage';
import DetailPage from './pages/DetailPage';
import PhotoReviewPage from './pages/PhotoReviewPage';
import { FavoritesProvider } from './context/FavoritesContext';
import { useFavorites } from './context/FavoritesContext';

// ── 탭바 SVG 아이콘 (TDS Mobile) ─────────────────────────────
function TabHomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.0688 8.20407L12.6218 1.48707C12.4451 1.34623 12.2258 1.26953 11.9998 1.26953C11.7738 1.26953 11.5545 1.34623 11.3778 1.48707L2.9298 8.20407C2.69436 8.39135 2.50419 8.62933 2.37347 8.90029C2.24275 9.17126 2.17484 9.46822 2.1748 9.76907V19.1871C2.1748 19.8236 2.42766 20.434 2.87775 20.8841C3.32784 21.3342 3.93828 21.5871 4.5748 21.5871H9.9998V16.8351C9.9998 16.5699 10.1052 16.3155 10.2927 16.128C10.4802 15.9404 10.7346 15.8351 10.9998 15.8351H12.9998C13.265 15.8351 13.5194 15.9404 13.7069 16.128C13.8944 16.3155 13.9998 16.5699 13.9998 16.8351V21.5871H19.4238C20.0603 21.5871 20.6708 21.3342 21.1209 20.8841C21.5709 20.434 21.8238 19.8236 21.8238 19.1871V9.77007C21.8238 9.46922 21.7559 9.17226 21.6251 8.90129C21.4944 8.63033 21.3043 8.39135 21.0688 8.20407Z" fill="currentColor"/>
    </svg>
  );
}
function TabGuideIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19.2891 2.91016C19.8765 2.91076 20.3516 3.38623 20.3516 3.97363H6.45996C5.6393 3.95937 4.92137 4.52432 4.74316 5.3252C4.72156 5.4344 4.71094 5.5466 4.71094 5.6582C4.71057 6.59027 5.46538 7.34549 6.39746 7.3457H14.4004V12.749C14.4006 12.8664 14.5173 12.954 14.6113 12.8955L16.2588 11.7197C16.3529 11.6609 16.4469 11.6609 16.541 11.7197L18.1885 12.8955C18.2825 12.9837 18.4002 12.8959 18.4004 12.749V7.3457H19.2744C19.869 7.3469 20.3504 7.82923 20.3516 8.42383H20.3545V21.21C20.3545 21.8064 19.8708 22.29 19.2744 22.29H6.30664C4.83854 22.29 3.64859 21.0999 3.64844 19.6318V5.56836C3.64844 4.10016 4.83845 2.91016 6.30664 2.91016H19.2891Z" fill="currentColor"/>
    </svg>
  );
}
function TabCollectionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.5 3.9998C3.5 3.2998 4 2.7998 4.7 2.7998H19.3C20 2.7998 20.5 3.2998 20.5 3.9998V21.1998C20.5 21.6998 20 21.9998 19.6 21.6998L12.6 17.6998C12.2 17.4998 11.8 17.4998 11.4 17.6998L4.4 21.6998C4 21.8998 3.5 21.5998 3.5 21.1998V3.9998Z" fill="currentColor"/>
    </svg>
  );
}
function TabMypageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M16.8872 6.64352C16.8872 7.28634 16.7607 7.92288 16.5148 8.5168C16.2688 9.11071 15.9083 9.65037 15.4538 10.105C14.9993 10.5595 14.4597 10.9202 13.8659 11.1662C13.272 11.4123 12.6355 11.539 11.9927 11.539C10.6944 11.5392 9.44932 11.0236 8.53124 10.1057C7.61315 9.18777 7.0973 7.94276 7.09717 6.64452C7.09711 6.0017 7.22365 5.36516 7.46959 4.77125C7.71553 4.17734 8.07603 3.63768 8.53053 3.18309C9.44843 2.265 10.6934 1.74916 11.9917 1.74902C13.2899 1.74889 14.535 2.26449 15.4531 3.18238C16.3712 4.10028 16.887 5.34529 16.8872 6.64352ZM11.9922 13.0365C4.94317 13.0365 2.20117 17.5225 2.20117 19.6095C2.20117 21.6955 8.03817 22.2515 11.9922 22.2515C15.9462 22.2515 21.7832 21.6955 21.7832 19.6095C21.7832 17.5225 19.0412 13.0365 11.9922 13.0365Z" fill="currentColor"/>
    </svg>
  );
}

// 피그마 "홈 | 가이드북 | 모음집 | 마이페이지" 탭 구조와 동일
type TabId = 'home' | 'guidebook' | 'collection' | 'mypage';

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'home',       label: '홈',     icon: <TabHomeIcon /> },
  { id: 'guidebook',  label: '가이드북', icon: <TabGuideIcon /> },
  { id: 'collection', label: '모음집',  icon: <TabCollectionIcon /> },
  { id: 'mypage',     label: '마이',   icon: <TabMypageIcon /> },
];

// 개발 단계: 임시 userId 사용 (배포 시 토스 SDK user_id로 교체)
const DEV_USER_ID = 'dev-user-001';

export default function App() {
  return (
    <FavoritesProvider userId={DEV_USER_ID}>
      <AppInner />
    </FavoritesProvider>
  );
}

// FavoritesProvider 안에서 렌더링 — useFavorites를 DetailPage에서 안전하게 사용 가능
function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [tabKeys, setTabKeys] = useState<Record<TabId, number>>({ home: 0, guidebook: 0, collection: 0, mypage: 0 });
  const lastTabTapRef = useRef<{ id: TabId; time: number } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [detailCafeId, setDetailCafeId] = useState<string | null>(null);
  const [collectionDetail, setCollectionDetail] = useState<{ id: string; name: string } | null>(null);
  const [photoReview, setPhotoReview] = useState<{ storeId: string; cafeName: string; photos: string[] } | null>(null);
  const [deletedCollectionData, setDeletedCollectionData] = useState<{ id: string; name: string; storeIds: string[] } | null>(null);
  const [isCollectionEditMode, setIsCollectionEditMode] = useState(false);
  const { isFavorited, addFavorite, removeFavorite, favorites } = useFavorites();
  const [myPageSubPage, setMyPageSubPage] = useState<string | null>(null);
  const [guidebookView, setGuidebookView] = useState<string | null>(null);
  const [guidebookStoreIndex, setGuidebookStoreIndex] = useState(0);
  const [detailScrollToReview, setDetailScrollToReview] = useState(false);
  const [detailOpenDirections, setDetailOpenDirections] = useState(false);

  // 포토리뷰 전체보기
  if (photoReview) {
    const store = favorites.find(f => f.id === photoReview.storeId);
    return (
      <div style={{ height: '100%' }}>
        <PhotoReviewPage
          photos={photoReview.photos.map((bg, i) => ({
            bg, reviewId: `${photoReview.storeId}-${i}`,
            reviewAuthor: '', reviewAvatarColor: '#e8edf4',
            reviewDate: '', reviewContent: '', isReporter: false,
          }))}
          cafeName={photoReview.cafeName}
          isFavorite={isFavorited(photoReview.storeId)}
          onFavoriteToggle={() => {
            if (!store) return;
            isFavorited(photoReview.storeId) ? removeFavorite(photoReview.storeId) : addFavorite(store);
          }}
          onBack={() => setPhotoReview(null)}
          onClose={() => setPhotoReview(null)}
        />
      </div>
    );
  }

  // 카페 상세페이지 (자체 탭바 포함)
  if (detailCafeId) {
    return (
      <div style={{ height: '100%' }}>
        <DetailPage
          cafeId={detailCafeId}
          onBack={() => { setDetailCafeId(null); setDetailScrollToReview(false); setDetailOpenDirections(false); }}
          onClose={() => { setDetailCafeId(null); setShowSearch(false); setDetailScrollToReview(false); setDetailOpenDirections(false); }}
          activeTab={activeTab}
          onTabChange={(tab) => { setDetailCafeId(null); setDetailScrollToReview(false); setDetailOpenDirections(false); setActiveTab(tab as TabId); }}
          scrollToReview={detailScrollToReview}
          openDirections={detailOpenDirections}
          onGoToCollection={(col) => {
            setDetailCafeId(null);
            setDetailScrollToReview(false);
            if (col.id) {
              setCollectionDetail({ id: col.id, name: col.name });
            } else {
              setActiveTab('collection');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {showSearch ? (
        /* ── 검색 화면 (탭바 숨김) ── */
        <SearchPage
          onClose={() => setShowSearch(false)}
          onDetailOpen={(id) => { setDetailCafeId(id); }}
          onReportCafe={() => {
            setShowSearch(false);
            setActiveTab('mypage');
            setMyPageSubPage('report-cafe');
          }}
        />
      ) : (
        <>
          {/* ── 화면 영역 ── */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {collectionDetail ? (
              <CollectionDetailPage
                collectionId={collectionDetail.id}
                collectionName={collectionDetail.name}
                onBack={() => setCollectionDetail(null)}
                onClose={() => { setCollectionDetail(null); setActiveTab('collection'); }}
                onDetailOpen={(id) => setDetailCafeId(id)}
                onPhotoMore={(storeId, photos, cafeName) => setPhotoReview({ storeId, photos, cafeName })}
                onCollectionDeleted={(data) => { setCollectionDetail(null); setDeletedCollectionData(data); }}
                onGoHome={() => { setCollectionDetail(null); setActiveTab('home'); }}
                onEditModeChange={setIsCollectionEditMode}
              />
            ) : (
              <>
                {activeTab === 'home'       && (
                  <MapPage
                    key={tabKeys.home}
                    onSearchOpen={() => setShowSearch(true)}
                    onDetailOpen={(id) => setDetailCafeId(id)}
                    onGoToFavorites={() => setActiveTab('collection')}
                  />
                )}
                {activeTab === 'guidebook'  && (
                  <PageErrorBoundary key={tabKeys.guidebook}>
                    <GuidebookPage
                      onDetailOpen={(id) => setDetailCafeId(id)}
                      onDetailOpenToReview={(id) => { setDetailCafeId(id); setDetailScrollToReview(true); }}
                      onBack={() => setActiveTab('home')}
                      onClose={() => setActiveTab('home')}
                      onGoToFavorites={() => setActiveTab('collection')}
                      initialView={(guidebookView as any) ?? 'main'}
                      onViewChange={(v) => setGuidebookView(v)}
                      initialStoreIndex={guidebookStoreIndex}
                      onStoreIndexChange={(i) => setGuidebookStoreIndex(i)}
                    />
                  </PageErrorBoundary>
                )}
                {activeTab === 'collection' && (
                  <PageErrorBoundary key={tabKeys.collection}>
                    <CollectionPage
                      onDetailOpen={(id) => setDetailCafeId(id)}
                      onCollectionOpen={(id, name) => setCollectionDetail({ id, name })}
                      onGoHome={() => setActiveTab('home')}
                      onBack={() => setActiveTab('home')}
                      onClose={() => setActiveTab('home')}
                      onPhotoMore={(storeId, photos, cafeName) => setPhotoReview({ storeId, photos, cafeName })}
                      deletedCollection={deletedCollectionData}
                      onClearDeletedCollection={() => setDeletedCollectionData(null)}
                      onEditModeChange={setIsCollectionEditMode}
                    />
                  </PageErrorBoundary>
                )}
                {activeTab === 'mypage'     && (
                  <MyPage
                    key={tabKeys.mypage}
                    onDetailOpen={(id) => setDetailCafeId(id)}
                    initialSubPage={myPageSubPage as any}
                    onSubPageChange={setMyPageSubPage}
                  />
                )}
              </>
            )}
          </div>

          {/* ── 탭 바 (Toss 플로팅 형태) — 편집모드 진입 시 숨김 ── */}
          <nav
            style={{
              position: 'fixed',
              left: 16,
              right: 16,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
              height: 56,
              display: isCollectionEditMode ? 'none' : 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: 28,
              boxShadow: '0 4px 24px rgba(0, 27, 55, 0.14)',
              zIndex: 100,
            }}
          >
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    const now = Date.now();
                    const last = lastTabTapRef.current;
                    if (last?.id === tab.id && now - last.time < 400) {
                      // 더블탭: 해당 탭 첫 화면으로 리셋
                      lastTabTapRef.current = null;
                      setCollectionDetail(null);
                      setActiveTab(tab.id);
                      setTabKeys(k => ({ ...k, [tab.id]: k[tab.id] + 1 }));
                    } else {
                      lastTabTapRef.current = { id: tab.id, time: now };
                      setCollectionDetail(null);
                      setActiveTab(tab.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '8px 0',
                    color: isActive ? '#252525' : '#b0b8c1',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'color 0.15s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}

