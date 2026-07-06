# 카공지도 디자인 시스템

## 1. 색상 토큰

### 주요 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#252525` | 주요 CTA 배경, 활성 칩, 하트(찜), 슬라이더 트랙, 체크박스 |
| `primary-text` | `#FFFFFF` | primary 버튼 위 텍스트 |
| `title-dark` | `rgba(0, 12, 30, 0.80)` | 시트/모달 타이틀, 섹션 레이블 |
| `body-primary` | `#191F28` | 카드 카페명, 섹션 헤더 |
| `body-secondary` | `#6B7684` | 주소, 거리, 리뷰 수 등 보조 텍스트 |
| `body-muted` | `#777777` | 체크박스 레이블 등 약한 텍스트 |
| `body-disabled` | `rgba(0, 0, 0, 0.30)` | 비활성 텍스트 |

### 배경 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `sheet-bg` | `#F3F3F3` | FilterModal, 필터 시트 배경 |
| `surface` | `#FFFFFF` | 일반 시트·카드 배경 |
| `chip-inactive-bg` | `rgba(46, 46, 46, 0.08)` | 비활성 칩 배경 (MapPage 상단 Chip) |
| `chip-inactive-bg-modal` | `rgba(7, 25, 76, 0.05)` | 비활성 칩 배경 (FilterModal 내부) |
| `chip-disabled-bg` | `rgba(46, 46, 46, 0.05)` | 비활성(disabled) 칩 배경 |
| `divider` | `#F2F4F6` | 구분선, 이미지 플레이스홀더 배경 |
| `badge-bg` | `#D1D6DB` | 뱃지/태그 배경 |
| `badge-text` | `#4E5968` | 뱃지/태그 텍스트 |
| `cta-disabled-bg` | `#E5E8EB` | 비활성 CTA 버튼 배경 |
| `cta-disabled-text` | `#B0B8C1` | 비활성 CTA 버튼 텍스트 |
| `cta-secondary-bg` | `rgba(7, 25, 76, 0.05)` | 보조 CTA 버튼(초기화 등) 배경 |
| `cta-secondary-text` | `rgba(3, 18, 40, 0.70)` | 보조 CTA 버튼 텍스트 |

### 딤/오버레이

| 토큰 | 값 | 용도 |
|------|-----|------|
| `dim` | `rgba(0, 0, 0, 0.20)` | FilterModal 배경 딤 |
| `slider-border` | `rgba(0, 29, 58, 0.18)` | 슬라이더 Knob 보더 |
| `chip-stroke` | `rgba(0, 23, 51, 0.02)` | 비활성 칩 보더 (매우 연함) |

---

## 2. 타이포그래피

> 기본 폰트: **Pretendard** (앱인토스 TDS 기준)

| 용도 | fontSize | fontWeight | color |
|------|----------|-----------|-------|
| 모달/시트 타이틀 | 20px | 700 | `rgba(0,12,30,0.80)` |
| 섹션 헤더 (SectionHeader) | 17px | 700 | `#191F28` |
| CTA 버튼 | 17px | 590 | — |
| 카드 카페명 | 15px | 600 | `#191F28` |
| 가격대 수치 | 15px | 700 | `rgba(0,12,30,0.80)` |
| 필터 섹션 레이블 | 14px | 400 | `rgba(0,12,30,0.80)` |
| 체크박스 레이블 | 14px | 400 | `#777777` |
| 분위기 칩 텍스트 | 13px | 590 | — |
| 빈 상태 문구 (EmptyState) | 13px | 590 | `#4E5968` |
| MapPage 상단 Chip | 13px | 590 | — |
| 편의시설 칩 텍스트 | 12px | 590 | — |
| 카드 보조 텍스트 | 12px | 400 | `#6B7684` |
| 뱃지/태그 | 11px | 400 | `#4E5968` |

---

## 3. 컴포넌트

### Chip (MapPage 상단 필터 칩)

```
height: 32  |  padding: 0 14px  |  borderRadius: 999 (pill)
active   : bg=#252525, color=#ffffff
inactive : bg=rgba(46,46,46,0.08), color=rgba(0,0,0,0.7)
transition: background 0.15s
```

### Chip (FilterModal 내부)

```
height: 32  |  borderRadius: 8  |  fontWeight: 590
아이콘 있음 : padding=0 12px, gap=4
아이콘 없음 : padding=0 14px

active   : bg=#252525, color=#ffffff
inactive : bg=rgba(46,46,46,0.08), color=rgba(0,0,0,0.7)
disabled : bg=rgba(46,46,46,0.05), color=rgba(0,0,0,0.30)
```

### Checkbox

```
width: 20  |  height: 20  |  borderRadius: 5
checked   : bg=#252525, border=none  /  체크마크: stroke=#ffffff, strokeWidth=2
unchecked : bg=white, border=1.5px solid #D1D6DB
```

### Divider

```
height: 1  |  bg: #F2F4F6  |  margin: 0 -20px (패딩 상쇄로 전체폭)
```

### FilterModal 시트

```
position: fixed, bottom: 0, left: 10, right: 10
background: #F3F3F3  |  borderRadius: 28  |  maxHeight: 92vh

핸들:
  - Handle Area height: 20
  - 막대: width=48, height=4, borderRadius=40, bg=#E5E8EB

타이틀 영역: height=48, padding=0 24px
  - "필터" : fontSize=20, fontWeight=700, color=rgba(0,12,30,0.80)

스크롤 콘텐츠: flex:1, overflowY=auto, padding=0 20px

등장 애니메이션:
  @keyframes filterSlideUp { from: translateY(100%) → to: translateY(0) }
  duration: 0.25s, easing: ease
```

### 슬라이더 (가격대)

```
트랙: height=5, borderRadius=2.5, bg=#E5E8EB
활성 트랙: bg=#252525 (disabled 시 rgba(37,37,37,0.18))
Knob: 26×26, borderRadius=9999, bg=#ffffff
      border=1px solid rgba(0,29,58,0.18)
      box-shadow=0 2px 6px rgba(0,0,0,0.12)
범위: min=5000, max=15000, step=1000
```

### SheetCTA

```
height: 56  |  borderRadius: 16  |  gap: 8  |  padding: 0 20px
fontSize: 17  |  fontWeight: 590
상단 그라데이션 페이드: 24px (투명 → 시트 배경색)

Single (primary) : bg=#252525, color=#ffffff
Single (secondary): bg=rgba(7,25,76,0.05), color=rgba(3,18,40,0.70)
Disabled          : bg=#E5E8EB, color=#B0B8C1

Double (비대칭 예시 — FilterModal):
  좌: width=88, bg=secondary, label="초기화"
  우: flex:1, bg=primary, label="적용하기"
```

### StoreCard (Home)

```
layout: flex row, gap=12, padding=12px 16px
구분선: borderBottom=1px solid #F2F4F6

썸네일: 80×80, borderRadius=4, bg=#F2F4F6 (플레이스홀더)

카페명: fontSize=15, fontWeight=600, color=#191F28
주소  : fontSize=12, color=#6B7684
거리/리뷰: fontSize=12, color=#6B7684

뱃지: padding=0 8px, bg=#D1D6DB, borderRadius=20, fontSize=11, color=#4E5968

하트 버튼 히트에리어: 44×44
  찜됨: fill=#252525  |  미찜: fill=#D1D6DB
```

### SectionHeader

```
layout: flex row, alignItems=center
제목: fontSize=17, fontWeight=700, color=#191F28, lineHeight=21.25px
우측 슬롯: right prop (ReactNode)
```

### EmptyState

```
layout: flex column, alignItems=center, justifyContent=center (flex=true 시 전체 채움)
문구: fontSize=13, fontWeight=590, color=#4E5968, lineHeight=22.5px
버튼(GhostButton): marginTop=52
```

---

## 4. 레이아웃 & 간격

| 항목 | 값 |
|------|-----|
| 시트 좌우 여백 | 10px (화면 끝에서) |
| 시트 내부 콘텐츠 패딩 | 0 20px |
| 시트 타이틀 패딩 | 0 24px |
| 칩 행 간격 | gap: 8px |
| 카드 행 간격 | gap: 12px (썸네일↔정보), gap: 4px (뱃지 간) |
| 섹션 레이블 높이 | 40px |
| 체크박스 행 높이 | 39px |
| safe-area 하단 여백 | `calc(env(safe-area-inset-bottom, 0px) + 16px)` |

---

## 5. 아이콘 규격 (FilterModal 편의시설)

SVG 아이콘 공통 사양:
- `width="14" height="14"`
- `viewBox="0 0 24 24"`
- `fill="none"` (또는 `fill="currentColor"`)
- `color: inherit` (칩 텍스트 색상 상속)

아이콘 목록: 소음적당(SoundOn), 조용(SoundOff), 남녀화장실구분(PublicToilet), 내부화장실(Toilet), 단체방문(People), 반려동물(Dog), 시간제한없음(TimerOff), 주차(Parking), 커피머신(Coffee), 무선인터넷(Wifi), 포장가능(Takeout), 휠체어(Wheelchair)

---

## 6. FilterModal 섹션 구성

| 섹션 | 카페 | 도서관 | 공유공간 |
|------|------|--------|--------|
| 지금 영업 중 | O | O | O |
| 노트북 사용 | disabled | **활성** | disabled |
| 입장 조건 | disabled | 일부 disabled | 일부 disabled |
| 분위기 | **활성** | disabled | disabled |
| 가격대 | **활성** | disabled | disabled |
| 편의시설 | O (디카페인 disabled) | O (커피머신 disabled) | O |

입장 조건 칩: `조건 없음` / `예약 필요` / `입장료` / `회원 가입` / `열람증 발급` / `연령 제한`
- 도서관: `연령 제한` disabled
- 공유공간: `예약 필요`, `입장료`, `열람증 발급` disabled

분위기 칩: `웜톤 조명` / `화이트 조명` / `로우톤 조명` / `우드` / `메탈` / `화이트` / `블랙` / `플랜트` / `스톤`

---

## 7. 애니메이션

| 항목 | 값 |
|------|-----|
| FilterModal 등장 | `filterSlideUp` 0.25s ease (translateY 100%→0) |
| 칩 배경 전환 | `transition: background 0.15s` |
| CTA 버튼 전환 | `transition: background 0.15s, color 0.15s` |
| 바텀시트 패널 전환 | 320ms (panelState 변경 후 bounds 재계산 타이밍) |

---

## 8. 주요 의존성

| 항목 | 패키지 |
|------|--------|
| UI 컴포넌트 | `@toss/tds-mobile` (WebView 기반) |
| BottomSheet | `@toss/tds-mobile` → `BottomSheet` |
| 지도 | Kakao Maps SDK (MarkerClusterer 포함) |
| DB | Supabase |
| 애널리틱스 | `@apps-in-toss/web-framework` → `Analytics` + GA (`window.gtag`) |
| 프레임워크 | `@apps-in-toss/web-framework` (Granite 1.0+) |
