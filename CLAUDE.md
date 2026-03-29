# 카공지도 프로젝트

> 당신 근처에 있는 카공하기 좋은 카페를 알려드려요

---

## 팀 구성

| 역할 | 담당 |
|------|------|
| UX/UI 디자이너 | 화면 설계, 컴포넌트 디자인, 사용자 경험 |
| 개발자 | 기능 구현, API 연동, 데이터 처리 |

---

## 기술 스택

- **플랫폼**: 토스 미니앱 WebView (`@apps-in-toss/web-framework 1.1.2`)
- **프레임워크**: React 18 + TypeScript
- **빌드**: Rsbuild + Granite
- **지도**: 카카오맵 JavaScript SDK
- **카페 데이터**: 카카오 로컬 API (카테고리: CE7)
- **DB**: Supabase

---

## 폴더 구조

```
src/
├── pages/          # 화면 단위 컴포넌트 (피그마 Frame과 1:1 대응)
│   ├── MapPage.tsx       → 피그마 "홈 - 지도" 화면
│   ├── FavoritesPage.tsx → 피그마 "즐겨찾기" 화면
│   └── MyPage.tsx        → 피그마 "마이페이지" 화면
├── components/     # 재사용 UI 컴포넌트 (피그마 Component와 1:1 대응)
├── hooks/          # 비즈니스 로직 (위치, API 호출 등)
├── services/       # 외부 API 호출 (카카오, Supabase)
└── App.tsx         # 탭 네비게이션 루트
```

---

## 디자인 토큰

CSS 변수는 `src/index.css`에서 관리해요. 피그마 Color/Text Style과 맞춰주세요.

```
--color-primary: #3182F6
--color-background: #F9FAFB
--color-surface: #FFFFFF
--color-text-primary: #191F28
--color-text-secondary: #6B7684
```

---

## 브랜치 전략

```
main              ← 배포 브랜치 (직접 커밋 금지)
  └── feature/frontend-[기능명]   ← 디자이너/프론트 작업
  └── feature/backend-[기능명]    ← 개발자 작업
```

**예시:**
- `feature/frontend-map-ui` — 지도 화면 UI
- `feature/backend-kakao-api` — 카카오 API 연동

---

## 커밋 메시지 규칙

```
[feat]   새 기능 추가
[fix]    버그 수정
[style]  UI/스타일 변경 (기능 변경 없음)
[refactor] 코드 리팩토링
[docs]   문서 수정
```

**예시:** `[feat] 카페 카드 컴포넌트 추가`

---

## 코딩 규칙

- TypeScript 필수 (`any` 타입 사용 금지)
- 컴포넌트는 함수형으로만 작성
- CSS는 CSS 변수(`--color-*`, `--space-*`) 적극 활용
- 새 페이지는 `src/pages/` 에, 공통 컴포넌트는 `src/components/` 에

---

## 개발 명령어

```bash
npm install      # 의존성 설치 (처음 한 번)
npm run dev      # 개발 서버 시작
npm run build    # 배포용 번들 빌드
npm run deploy   # 토스 콘솔에 배포
```

---

## 주요 API

### 카카오 로컬 API — 주변 카페 검색
```
GET https://dapi.kakao.com/v2/local/search/category.json
  ?category_group_code=CE7   ← 카페 카테고리
  &x={경도}&y={위도}
  &radius=1000               ← 반경 1km
Headers: Authorization: KakaoAK {REST_API_KEY}
```

### 환경변수 (.env 파일 — git에 올리지 않음!)
```
VITE_KAKAO_MAP_KEY=카카오맵_JS키
VITE_KAKAO_REST_KEY=카카오_REST_API키
VITE_SUPABASE_URL=Supabase_URL
VITE_SUPABASE_ANON_KEY=Supabase_익명키
```
