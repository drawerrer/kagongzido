# 카공지도 배포 프로세스

> 프로덕트 디자이너 관점의 배포 전 체크리스트 및 단계별 가이드

---

## 배포 흐름 요약

```
디자인 QA → 에셋 준비 → 콘솔 설정 → 빌드 → 업로드 → 심사 → 출시
```

---

## STEP 1. 디자인 QA

### 1-1. 화면별 시각 검수

배포 전 실기기(토스 앱)에서 아래 화면을 직접 확인한다.

| 화면 | 확인 항목 |
|------|-----------|
| **진입 / 닉네임 설정** | 닉네임 입력 UI, 완료 버튼 활성/비활성 상태 |
| **지도 (MapPage)** | 마커 렌더링, 클러스터, 위치 권한 거부 시 fallback |
| **카페 상세 (DetailPage)** | 이미지, 정보 레이아웃, 사진 리뷰 섹션 |
| **검색 (SearchPage)** | 검색 결과 없음 상태, 키보드 올라올 때 레이아웃 |
| **가이드북 (GuidebookPage)** | 카드 UI, 빈 상태 |
| **모음집 (CollectionPage / CollectionDetailPage)** | 목록 레이아웃, 카페 추가/제거 흐름 |
| **마이페이지 (MyPage)** | 닉네임 표시, 내 리뷰 목록 |
| **사진 리뷰 작성 (WriteReviewPage)** | 이미지 선택, 미리보기, 제출 |

### 1-2. 공통 UX 항목

- [ ] 내비게이션 바 백버튼 동작 (모든 오버레이에서 정상 닫힘)
- [ ] 엣지 스와이프 = 백버튼 동작과 동일
- [ ] 오버레이 중첩 시 하위 화면 backEvent 비활성 확인
- [ ] 빈 상태(Empty State) 화면 표시 여부
- [ ] 로딩 상태(Skeleton / Spinner) 표시 여부
- [ ] 에러 상태 처리 (네트워크 오류 등)
- [ ] 다크모드 대응 여부 (미지원이면 라이트모드 고정 확인)

### 1-3. 내비게이션 바 검수

- [ ] 상단 로고 이미지 노출 확인 (`brand.icon` URL)
- [ ] 우측 검색 아이콘 버튼 노출 및 동작
- [ ] 백버튼 노출 (`withBackButton: true`)
- [ ] 홈버튼 미노출 (`withHomeButton: false`)

---

## STEP 2. 에셋 준비

### 2-1. 앱 아이콘

| 항목 | 규격 | 현재 값 |
|------|------|---------|
| 앱 아이콘 | PNG, 1024×1024px | 앱인토스 콘솔 업로드 |
| 내비게이션 바 로고 | PNG, 권장 2:1 비율 | `https://static.toss.im/appsintoss/28041/ea0a9c34-064b-4632-8e7c-a06f27955f91.png` |

> **주의**: `granite.config.ts`의 `brand.icon`은 반드시 콘솔에서 업로드 후 발급된 URL을 사용해야 한다.
> 로컬 파일 경로(예: `./src/assets/logo.png`)는 적용되지 않는다.

### 2-2. 앱 스토어 소재 (앱인토스 콘솔 > 앱 정보)

- [ ] 앱 이름: `카공지도`
- [ ] 한 줄 설명: 카페에서 공부하는 사람들을 위한 카공 스팟 지도
- [ ] 상세 설명: 기능 중심으로 작성 (지도 탐색, 필터, 가이드북, 모음집 등)
- [ ] 스크린샷: 주요 화면 3~5장 (1080×1920 권장)
- [ ] 카테고리 설정

### 2-3. 스크린샷 권장 화면

1. 지도 화면 (마커 + 카페 패널)
2. 카페 상세 화면
3. 가이드북 화면
4. 모음집 화면
5. 검색 화면

---

## STEP 3. 콘솔 설정 확인

> 앱인토스 콘솔: [https://appsintoss.toss.im](https://appsintoss.toss.im)

### 3-1. 앱 정보

- [ ] `appName`: `kagongzido` (granite.config.ts와 일치)
- [ ] `displayName`: `카공지도`
- [ ] `primaryColor`: `#252525`
- [ ] 권한 설정: 위치(geolocation), 사진(photos), 카메라(camera)

### 3-2. 앱 내 기능 (딥링크)

| 기능명 | 이동 URL | 비고 |
|--------|----------|------|
| 카공지도 홈 | `intoss://kagongzido/` | 지도 메인 화면 |

### 3-3. 슬롯 확인

| 슬롯 | appName | 용도 |
|------|---------|------|
| 1번 슬롯 | `cafeindex-test` | 개발/테스트 |
| 2번 슬롯 | `kagongzido` | 실제 배포 |

> 배포 전 `granite.config.ts`의 `appName`이 `'kagongzido'`로 설정되어 있는지 반드시 확인한다.

---

## STEP 4. 빌드

```bash
# 프로젝트 루트에서 실행
cd /Users/youngju/Desktop/kagongzido

# 의존성 설치 (최초 또는 패키지 변경 시)
npm install

# 프로덕션 빌드 (.ait 번들 생성)
npm run build
```

빌드 성공 시 `kagongzido.ait` 파일이 생성된다.

### 빌드 전 체크리스트

- [ ] `granite.config.ts` > `appName: 'kagongzido'` 확인
- [ ] 환경변수 (Supabase URL, Anon Key) 설정 확인
- [ ] 콘솔 오류 없는지 로컬 개발 서버에서 최종 확인

---

## STEP 5. 업로드 및 심사 제출

```bash
# CLI로 직접 배포 (선택)
npm run deploy
```

또는 **앱인토스 콘솔 > 앱 출시 > 번들 업로드**에서 `.ait` 파일을 직접 업로드한다.

### 업로드 후 확인

- [ ] 번들 업로드 완료
- [ ] 버전 정보 확인 (`package.json`의 `version` 필드)
- [ ] 심사 제출 버튼 클릭

---

## STEP 6. 심사 대응

### 주요 반려 사유 및 대응

| 반려 사유 | 대응 방법 |
|-----------|-----------|
| `brand.icon` 로컬 경로 사용 | 콘솔 업로드 URL로 교체 후 재빌드 |
| 권한 사용 목적 미기재 | 콘솔 권한 설명 텍스트 보완 |
| 외부 링크 정책 위반 | 외부 URL은 반드시 `WebView` 컴포넌트 또는 토스 브라우저로 오픈 |
| 앱 내 기능 URL 오류 | `intoss://kagongzido/` 형식 확인 |

---

## STEP 7. 배포 후 모니터링

### 7-1. 앱인토스 콘솔 > 분석 > 이벤트

배포 다음 날부터 데이터 확인 가능.

| 확인 항목 | 이벤트명 |
|-----------|----------|
| 앱 진입 수 | `appsintoss_app_visit::impression__enter_appsintoss` |
| 화면 방문 | `/:screen` |
| 체류 시간 | `appsintoss_app_visit__common_module::impression__stay_time` |
| 닉네임 생성 완료 | `nickname_setup_complete` *(Analytics.Press 추가 후)* |

### 7-2. 전환 지표

- **유저 식별키를 발급받은 유저** = 앱 정상 진입 유저 수 (전체 진입)
- 닉네임 생성 완료 퍼널 = `impression__enter_appsintoss` → `nickname_setup_complete`

### 7-3. Supabase 모니터링

- 테이블별 row 수 증가 추이 확인 (cafes, reviews, collections)
- 스토리지 사용량 확인 (리뷰 이미지)
- RLS 정책 오류 로그 확인

---

## 버전 관리 규칙

`package.json`의 `version` 필드를 날짜 기반으로 관리한다.

```
형식: YYYYMMDD-{n}
예시: 20260611-1  (2026년 6월 11일 첫 번째 빌드)
      20260611-2  (같은 날 두 번째 빌드)
```

---

## 긴급 롤백

앱인토스 콘솔 > 앱 출시에서 이전 번들 버전으로 즉시 롤백 가능하다.
