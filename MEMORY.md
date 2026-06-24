# 카공지도 프로젝트 대화 기록 요약

> 새 대화창에서 이 파일을 참조해 이전 맥락을 이어갈 수 있도록 작성된 문서입니다.
> 마지막 업데이트: 2026-06-12

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 카공지도 |
| 플랫폼 | 앱인토스(Apps in Toss) 미니앱 — WebView 기반 |
| appName | `kagongzido` (배포 슬롯 2번) |
| 테스트 appName | `cafeindex-test` (슬롯 1번) |
| 프로젝트 경로 | `/Users/youngju/Desktop/kagongzido` |
| 빌드 명령어 | `npm run build` → `kagongzido.ait` 생성 |
| 배포 명령어 | `npm run deploy` 또는 콘솔 수동 업로드 |
| 버전 형식 | `YYYYMMDD-{n}` (예: `20260522-1`) |

---

## 2. 기술 스택

- **프레임워크**: `@apps-in-toss/web-framework` v2.5.0
- **빌드**: Rsbuild + Granite
- **UI**: React 18 + TypeScript
- **DB/Auth**: Supabase (Anonymous Auth + RLS)
- **지도**: Kakao Maps SDK (Leaflet 병행)
- **디자인**: @toss/tds-mobile, @toss/tds-mobile-ait
- **설정 파일**: `granite.config.ts`

---

## 3. granite.config.ts 현재 설정

```typescript
export default defineConfig({
  appName: 'kagongzido',  // ⚠️ 테스트 시 'cafeindex-test'로 변경
  web: {
    host: '172.16.11.250',
    port: 3010,
    commands: {
      dev: 'rsbuild dev --host 0.0.0.0 --port 3010',
      build: 'rsbuild build',
    },
  },
  permissions: [
    { name: 'geolocation', access: 'access' },
    { name: 'photos', access: 'read' },
    { name: 'camera', access: 'access' },
  ],
  brand: {
    displayName: '카공지도',
    primaryColor: '#252525',
    icon: 'https://static.toss.im/appsintoss/28041/ea0a9c34-064b-4632-8e7c-a06f27955f91.png',
    // ⚠️ brand.icon은 반드시 콘솔 업로드 후 발급된 URL이어야 함 (로컬 경로 불가)
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    initialAccessoryButton: {
      id: 'search',
      title: '검색',
      icon: { name: 'icon-search-mono' },
    },
  },
  webViewProps: { type: 'partner' },
});
```

---

## 4. 해결한 버그 목록

### 4-1. brand.icon 로컬 경로 문제
- **증상**: 내비게이션 바에 로고 미표시, 심사 반려
- **원인**: `'./src/assets/LOGO/logo.png'` 로컬 경로 사용
- **해결**: 콘솔 업로드 URL `'https://static.toss.im/appsintoss/...'` 로 교체

### 4-2. 닉네임 매번 재입력 문제
- **증상**: 앱 켤 때마다 닉네임 입력창 재표시
- **원인**: Supabase Anonymous Auth 세션 만료 → 새 `auth.uid()` → RLS SELECT 실패 → 신규 유저 취급
- **해결**: `localStorage` 캐시 도입 (`cafeindex_user_v2` 키)
  - `tossId → { userId, nickname }` 형태로 저장
  - 세션 만료와 무관하게 캐시 히트 시 즉시 진입

```typescript
// App.tsx
const USER_CACHE_KEY = 'cafeindex_user_v2';
const getCachedUser = (tossId: string) => { ... };
const setCachedUser = (tossId: string, uid: string, nick: string) => { ... };
```

### 4-3. 엣지 스와이프 backEvent 중복 발화 문제
- **증상**: 엣지 스와이프가 뒤로가기와 다르게 동작 (여러 오버레이 동시 닫힘)
- **원인**: `graniteEvent.addEventListener('backEvent')` 핸들러가 모든 마운트된 컴포넌트에서 동시 발화
- **해결**: `hasDetailOverlay` / `hasOverlay` prop으로 하위 페이지 backEvent 비활성화

수정 파일:
- `MapPage.tsx`: `useBackEvent(..., !!selectedMapCafe && !detailHasSubPage && !hasOverlay)`
- `SearchPage.tsx`: `useBackEvent(_onClose, !hasDetailOverlay)`
- `CollectionDetailPage.tsx`: `useBackEvent(handleBack, !hasDetailOverlay)`

### 4-4. updateUserNickname 에러 핸들링 누락 (최근 수정)
- **증상**: 닉네임 입력 후 DB에 반영 안 됨 (테스트 때는 됐었음)
- **원인**: RLS UPDATE 정책 미설정 + 에러를 잡지 않아 조용히 실패
- **해결 (코드)**: `db.ts`의 `updateUserNickname`에 에러 핸들링 + boolean 반환 추가
- **해결 (Supabase)**: 아래 SQL 실행 필요 (아직 미완료 상태일 수 있음)

```sql
-- Supabase SQL Editor에서 실행
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
USING (auth.uid() = auth_user_id);
```

에러 코드별 의미:
- `42501`: RLS 정책 없음 → 위 SQL 실행
- `PGRST116`: users 행을 못 찾음 (userId 불일치)

---

## 5. 주요 파일 구조

```
kagongzido/
├── granite.config.ts          # 앱인토스 설정
├── src/
│   ├── App.tsx                # 루트 컴포넌트, 인증 로직, 탭바
│   ├── services/
│   │   ├── db.ts              # Supabase DB 쿼리 함수 전체
│   │   └── supabase.ts        # Supabase 클라이언트 초기화
│   ├── pages/
│   │   ├── MapPage.tsx
│   │   ├── DetailPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── CollectionPage.tsx
│   │   ├── CollectionDetailPage.tsx
│   │   ├── GuidebookPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── WriteReviewPage.tsx
│   │   └── PhotoReviewPage.tsx
│   ├── context/
│   │   └── FavoritesContext.tsx
│   └── hooks/
├── portfolio/
│   ├── data-slide.html        # 배포 후 데이터 시각화 슬라이드
│   ├── slide.pdf              # PDF 버전
│   ├── 유입 경로 내역(...).csv
│   └── 리텐션 내역(...).csv
├── DEPLOY.md                  # 배포 프로세스 가이드
└── MEMORY.md                  # 이 파일
```

---

## 6. 앱 인증 흐름 (App.tsx)

```
앱 진입
  ↓
getTossUserId() → getAnonymousKey() 호출 (토스 고유 해시)
  ↓
getCachedUser(tossId) → 캐시 히트 시 즉시 진입 (세션 만료 무관)
  ↓ (캐시 미스 시)
supabase.auth.getSession() → 기존 세션 복원 시도
  ↓ (없으면)
supabase.auth.signInAnonymously() → 새 auth.uid() 발급
  ↓
getOrCreateUserWithAuth(tossId, authUid) → users 테이블 조회/생성
  ↓
nickname 있음 → setCachedUser() 저장 → 앱 진입
nickname 없음 → NicknameSetupPage 표시
  ↓
닉네임 입력 → updateUserNickname(userId, name) → DB 저장
           → setCachedUser() → 앱 진입
```

---

## 7. Supabase DB 구조 (주요 테이블)

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | `id(uuid PK)`, `toss_user_id`, `auth_user_id`, `nickname` |
| `stores` | `id`, `api_place_id`, `name`, `closed_at` |
| `favorites` | `user_id(FK)`, `store_id(FK)`, `sort_order` |
| `collections` | `id`, `user_id(FK)`, `name`, `sort_order` |
| `collection_stores` | `collection_id(FK)`, `store_id(FK)`, `memo` |
| `reviews` | `id`, `user_id(FK)`, `store_id(FK)`, `content`, `photo_urls` |
| `reviews_likes` | `user_id(FK)`, `review_id(FK)` |
| `reports` | `user_id`, `store_name`, `content`, `status` |
| `guidebooks` | `id`, `title`, `is_published` |
| `notices` | `id`, `title`, `content`, `is_published` |

RLS 핵심 정책 (users 테이블):
- SELECT: `auth.uid() = auth_user_id`
- INSERT: `auth.uid() = auth_user_id`
- UPDATE: `auth.uid() = auth_user_id` ← **미설정 상태일 수 있음, 확인 필요**

---

## 8. 배포 후 데이터 (2026.06.02 ~ 06.10, 9일)

### 핵심 지표
| 지표 | 수치 |
|------|------|
| 신규 유저 | 29명 |
| 총 세션(앱 오픈) | 54건 |
| 화면 진입 | 116건 (세션당 2.1개) |
| 자연 이탈률 | 80% (33건 나가기 확인 / 8건 X버튼) |

### 유입 경로 (총 38세션)
| 경로 | 건수 | 비율 |
|------|------|------|
| 검색 | 13건 | 34.2% |
| 기타(공유/딥링크) | 10건 | 26.3% |
| 전체탭 | 8건 | 21.1% |
| 미니앱홈 | 7건 | 18.4% |

### 리텐션 (29명 코호트)
| 지표 | 수치 |
|------|------|
| D1 전체 | 13.8% (4명) |
| D2 전체 | 13.8% |
| 06-03 코호트 D1 | **75%** (4명 중 3명) |
| 특징 | 격일 재방문 패턴 (카공 목적 앱 특성) |

---

## 9. Analytics 관련 (미구현 상태)

현재 앱에 `Analytics` 코드가 전혀 없음. 닉네임 생성 등 커스텀 이벤트 추적 불가.

```typescript
// 추가하면 좋을 코드 (NicknameSetupPage 완료 시점)
import { Analytics } from '@apps-in-toss/framework';

// Analytics.init()은 App.tsx 최상단에 1회 호출
// 완료 버튼을 Analytics.Press로 감싸기:
<Analytics.Press params={{ log_name: 'nickname_setup_complete' }}>
  <button onClick={handleConfirm}>시작하기</button>
</Analytics.Press>
```

---

## 10. 미완료 / 확인 필요 사항

- [ ] Supabase `users` 테이블 UPDATE RLS 정책 존재 여부 확인 및 추가
- [ ] 닉네임 저장 오류 재현 확인 (배포 후 콘솔 로그 `[updateUserNickname]` 확인)
- [ ] Analytics.Press 추가 (닉네임 완료, 리뷰 작성, 검색 사용 등)
- [ ] 포트폴리오 MD 파일 최종 작성 (`PORTFOLIO.md`)

---

## 11. 자주 쓰는 명령어

```bash
# 개발 서버 (appName: 'cafeindex-test' 로 바꾸고 실행)
npm run dev

# 배포 빌드 (appName: 'kagongzido' 확인 후 실행)
npm run build

# 배포
npm run deploy

# 포트폴리오 슬라이드 서버
cd portfolio && python3 -m http.server 4321
# → http://localhost:4321/data-slide.html
```

---

## 12. 앱인토스 콘솔

- **URL**: https://appsintoss.toss.im
- **앱 내 기능 URL**: `intoss://kagongzido/`
- **brand.icon**: 반드시 콘솔에서 업로드한 이미지 우클릭 → 링크 복사 후 사용
- **유저 식별키를 발급받은 유저** = 앱 정상 진입 유저 수 (닉네임 생성과 무관)
