# 카공지도 — 앱인토스 미니앱 포트폴리오

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 카공지도 |
| 플랫폼 | 앱인토스(Apps in Toss) — WebView 기반 미니앱 |
| 앱 ID | `28041` |
| 앱 scheme | `intoss://cafeindex` |
| 프레임워크 | `@apps-in-toss/web-framework` (Granite) |
| 개발 기간 | 2025 |
| 상태 | 앱인토스 배포 완료 |

### 서비스 소개

카페를 좋아하는 사람들을 위한 카공(카페에서 공부/작업) 특화 지도 서비스. 카카오맵 기반 지도 위에 카페 위치를 표시하고, 와이파이·콘센트·주차 등 카공 필수 정보를 한눈에 확인할 수 있다. 토스 앱 내에서 별도 설치 없이 30만+ 사용자에게 노출된다.

---

## 기술 스택

### 프론트엔드
- **React 18** + **TypeScript**
- **Vite** (번들러)
- **@apps-in-toss/web-framework** (Granite) — 앱인토스 WebView 프레임워크
- **Kakao Maps SDK** — 지도 렌더링 및 마커 관리
- **CSS Modules** / 인라인 스타일 (TDS 없이 자체 디자인)

### 백엔드 / 인프라
- **Supabase** — PostgreSQL DB, Auth (Anonymous + Toss OAuth), Storage, RLS
- **Supabase Edge Functions** — 서버사이드 로직 처리

### 앱인토스 연동
- `@apps-in-toss/web-framework` — 네비게이션 바, backEvent, 토스 로그인
- `granite.config.ts` — 앱 브랜드·스킴·네비게이션 설정
- 앱 내 기능 URL: `intoss://cafeindex/` (메인)

---

## 프로젝트 구조

```
kagongzido/
├── granite.config.ts          # 앱인토스 앱 설정 (brand, scheme, nav)
├── index.html
├── vite.config.ts
├── src/
│   ├── App.tsx                # 루트 컴포넌트 (전역 상태 관리, 인증 플로우)
│   ├── pages/
│   │   ├── MapPage.tsx        # 메인 지도 화면
│   │   ├── SearchPage.tsx     # 카페 검색
│   │   ├── CafeDetailPage.tsx # 카페 상세 정보
│   │   ├── CollectionDetailPage.tsx  # 모음집 상세
│   │   ├── MyPage.tsx         # 마이페이지
│   │   ├── NicknameSetupPage.tsx     # 닉네임 설정 (최초 1회)
│   │   ├── GuidebookPage.tsx  # 카공 가이드북
│   │   └── ReportPage.tsx     # 카페 정보 제보
│   ├── components/
│   │   ├── CafeCard.tsx       # 카페 목록 카드 UI
│   │   ├── FilterBar.tsx      # 필터 바 (와이파이/콘센트/주차 등)
│   │   ├── BottomSheet.tsx    # 공통 바텀싯
│   │   ├── PhotoReview.tsx    # 사진 리뷰 업로드/표시
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts        # Supabase 클라이언트
│   │   └── kakao.ts           # 카카오맵 유틸
│   └── assets/
│       └── LOGO/
└── supabase/
    └── functions/             # Edge Functions
```

---

## 주요 기능

### 1. 지도 탐색
- 카카오맵 위에 카페 마커 표시
- 현재 위치 기반 주변 카페 탐색
- 마커 클릭 시 카페 요약 패널 (하프/풀 모드 전환)
- 지도 이동 시 해당 영역 카페 재검색

### 2. 카공 조건 필터
- 와이파이 / 콘센트 / 주차 / 조용함 등 다중 필터
- 필터 조합 실시간 반영
- 필터 상태 URL 파라미터에 동기화

### 3. 카페 상세 정보
- 기본 정보 (이름, 주소, 영업시간, 전화번호)
- 카공 조건 아이콘 표시
- 사진 리뷰 갤러리
- 좋아요 / 즐겨찾기 기능
- 제보하기 (정보 오류 신고)

### 4. 카페 검색
- 이름/지역 키워드 검색
- 검색 결과 목록 → 지도 연동
- 최근 검색어 저장

### 5. 카공 가이드북
- 카공 에티켓, 추천 카페 유형, 꿀팁 콘텐츠
- 콘텐츠 카드 형태 제공

### 6. 모음집 (컬렉션)
- 카페를 주제별로 묶어 저장
- 공개/비공개 설정
- 모음집 상세에서 포함된 카페 목록 확인

### 7. 마이페이지
- 닉네임 설정 및 변경
- 내가 즐겨찾기한 카페 목록
- 내 모음집 관리
- 내가 작성한 리뷰 내역

### 8. 사진 리뷰
- Supabase Storage 기반 이미지 업로드
- 카페별 사진 리뷰 피드

---

## 화면 구성 및 내비게이션 플로우

```
[메인 - MapPage]
    ├── 카페 마커 클릭 → CafeDetailPage (오버레이)
    │       └── 모음집 담기 → CollectionDetailPage
    ├── 검색 버튼 → SearchPage (오버레이)
    │       └── 검색 결과 → CafeDetailPage (오버레이)
    ├── 가이드북 탭 → GuidebookPage
    └── 마이페이지 탭 → MyPage

[최초 진입]
    └── 토스 로그인 → 닉네임 미설정 시 → NicknameSetupPage
```

---

## 데이터베이스 설계 (Supabase PostgreSQL)

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `cafes` | 카페 기본 정보 (이름, 주소, 좌표, 카공 조건) |
| `users` | 앱 내 유저 정보 (toss_id, nickname) |
| `reviews` | 사진 리뷰 (카페 ID, 유저 ID, 이미지 URL) |
| `favorites` | 즐겨찾기 (유저 ID, 카페 ID) |
| `collections` | 모음집 헤더 (유저 ID, 이름, 공개 여부) |
| `collection_items` | 모음집 ↔ 카페 다대다 관계 |
| `reports` | 카페 정보 오류 제보 |

### RLS (Row Level Security) 설계
- `cafes`: 전체 SELECT 허용 (공개 데이터)
- `users`: 본인 행만 SELECT/UPDATE 허용
- `reviews`, `favorites`, `collections`: 본인 데이터만 INSERT/UPDATE/DELETE
- `collection_items`: 공개 모음집은 전체 SELECT, 비공개는 본인만

### Supabase Storage
- `review-images` 버킷: 사진 리뷰 이미지 저장
- 업로드는 인증된 유저만, 조회는 공개

---

## 해결한 기술적 문제

### 1. Supabase Anonymous Auth 세션 만료로 인한 닉네임 재입력 문제
**문제**: 앱 재진입 시마다 닉네임 입력창이 다시 표시됨
**원인**: Anonymous Auth 세션 만료 → 새 `auth.uid()` 발급 → 기존 users 레코드와 uid 불일치 → RLS SELECT 실패 → 신규 유저 처리
**해결**: `localStorage`에 `tossId → { userId, nickname }` 캐시 저장. 앱 진입 시 DB 쿼리 전 캐시 확인, 히트 시 즉시 인증 상태 복원

```typescript
const USER_CACHE_KEY = 'cafeindex_user_v2';
const getCachedUser = (tossId: string) => { ... };
const setCachedUser = (tossId: string, uid: string, nick: string) => { ... };
```

### 2. backEvent 핸들러 중복 발화 (엣지 스와이프 충돌)
**문제**: 오버레이가 쌓인 상태에서 엣지 스와이프 시 모든 페이지의 `useBackEvent` 핸들러가 동시 실행
**원인**: `graniteEvent.addEventListener('backEvent')`는 마운트된 모든 컴포넌트에서 동시 발화
**해결**: `hasDetailOverlay` / `hasOverlay` prop을 하위 페이지에 전달, 상위 오버레이가 존재할 때 `useBackEvent(handler, false)`로 비활성화

```typescript
// SearchPage, CollectionDetailPage
useBackEvent(handleBack, !hasDetailOverlay);

// MapPage
useBackEvent(handler, !!selectedMapCafe && !hasOverlay);
```

### 3. brand.icon 로컬 파일 경로 미적용
**문제**: `granite.config.ts`에 로컬 이미지 경로 설정 시 내비게이션 바 로고 미표시
**원인**: 앱인토스 프레임워크는 `brand.icon`에 콘솔에서 업로드한 이미지의 외부 URL만 허용
**해결**: 콘솔 앱 정보에서 이미지 우클릭 → 링크 복사 → `granite.config.ts`에 CDN URL 입력

```typescript
brand: {
  displayName: '카공지도',
  primaryColor: '#252525',
  icon: 'https://static.toss.im/appsintoss/28041/ea0a9c34-064b-4632-8e7c-a06f27955f91.png',
},
```

### 4. 카카오맵 마커 대량 렌더링 성능 최적화
**문제**: 마커 수백 개 동시 렌더링 시 지도 조작 버벅임
**해결**: 현재 지도 영역(bounds) 내 카페만 필터링해 마커 생성, 지도 이동 완료(idle 이벤트) 후 마커 갱신

### 5. 바텀싯 높이 동적 계산
**문제**: iOS 안전 영역(safe area), 키보드 팝업 등 다양한 환경에서 바텀싯 높이 오차
**해결**: `visualViewport` API + CSS 환경 변수(`env(safe-area-inset-bottom)`) 조합으로 동적 높이 계산

### 6. 앱 내 기능 URL 라우팅
**문제**: WebView 앱 특성상 별도 딥링크 라우터 없이 기능 스킴 URL 처리 필요
**해결**: 단일 진입점(`/`) 사용, 쿼리 파라미터로 초기 상태 전달 (`?cafeId=xxx`)

### 7. 토스 로그인 인가 코드 → 자체 JWT 패턴
**문제**: Toss OAuth AccessToken을 클라이언트에 노출하면 보안 취약점
**해결**: 앱에서 `appLogin()`으로 인가 코드만 획득 → Supabase Edge Function에서 토큰 교환 → 앱 자체 JWT 발급 → 클라이언트에는 자체 JWT만 저장

---

## 앱인토스 출시 설정

### granite.config.ts 주요 설정
```typescript
export default defineConfig({
  appName: 'cafeindex',
  brand: {
    displayName: '카공지도',
    primaryColor: '#252525',
    icon: 'https://static.toss.im/appsintoss/28041/...',
  },
  scheme: {
    main: 'intoss://cafeindex/',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
});
```

### 앱 내 기능 (콘솔 등록)
| 기능명 | 이동 URL |
|--------|----------|
| 카공지도 메인 | `intoss://cafeindex/` |

---

## 배포 프로세스

1. `npm run build` — Vite 빌드, `kagongzido.ait` 생성
2. 앱인토스 콘솔 → 버전 관리 → `.ait` 파일 업로드
3. 검수 제출 → 앱인토스 심사 → 배포 승인
4. 라이브 사용자에게 즉시 반영 (별도 앱 업데이트 불필요)
