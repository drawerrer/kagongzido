import { splitVibeTags } from './vibeTags';

/** 카페 취향 월드컵 결과(1순위 조건) — TasteWorldcup.tsx는 지연 로드 청크라 타입만 여기 따로 둠 */
export interface TasteWorldcupWinner {
  id: string;
  label: string;
}

const STORAGE_KEY = 'kagongzido_taste_worldcup_winner';

/** 월드컵 결과 화면에서 winner가 정해지는 즉시 호출 — 기기에 로컬로 저장 */
export function saveTasteWorldcupWinner(winner: TasteWorldcupWinner): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(winner));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) 시 조용히 무시 — 결과 화면 자체는 정상 동작
  }
}

/** 마이페이지 "카페 취향", 상세페이지 매칭 인터랙션에서 공통으로 읽음 */
export function getTasteWorldcupWinner(): TasteWorldcupWinner | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string' && typeof parsed.label === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

/** 매칭 판단에 필요한 카페 쪽 최소 정보 */
export interface TasteMatchCafe {
  /** 좌석 규모 — '소형' | '중형' | '대형' */
  seats?: string;
  /** 콘센트 상태 — '부족' | '적당' | '넉넉' */
  outlets?: string;
  /** 소음 상태 — '조용' | '적당' | '시끄러움' */
  noise?: string;
  /** vibe_tags 원본 배열(정규화 전) — splitVibeTags로 내부에서 분해함 */
  vibeTagsRaw?: string[] | null;
}

// 1순위 조건 id → 카페 데이터 매칭 규칙. TASTE_WORLDCUP_CONDITIONS(TasteWorldcup.tsx)의
// 16개 id와 반드시 동기화할 것 — 새 조건 추가 시 여기도 같이 추가해야 매칭이 동작함
const CONDITION_MATCHERS: Record<string, (cafe: TasteMatchCafe, tags: string[]) => boolean> = {
  lamp_warm: (_c, tags) => tags.some(t => t.includes('웜톤')),
  lamp_low: (_c, tags) => tags.some(t => t.includes('로우톤')),
  lamp_white: (_c, tags) => tags.some(t => t.includes('화이트') && t.includes('조명')),
  cafe_large: c => c.seats === '대형',
  cafe_small: c => c.seats === '소형',
  noise_normal: c => c.noise === '적당',
  noise_small: c => c.noise === '조용',
  outlet: c => c.outlets === '넉넉',
  mood_wood: (_c, tags) => tags.some(t => t.includes('우드') && !t.includes('조명')),
  mood_metal: (_c, tags) => tags.some(t => t.includes('메탈') && !t.includes('조명')),
  mood_white: (_c, tags) => tags.some(t => t.includes('화이트') && !t.includes('조명')),
  mood_black: (_c, tags) => tags.some(t => t.includes('블랙') && !t.includes('조명')),
  mood_plant: (_c, tags) => tags.some(t => t.includes('플랜트') || t.includes('식물')),
  mood_stone: (_c, tags) => tags.some(t => t.includes('스톤')),
  mood_brick: (_c, tags) => tags.some(t => t.includes('브릭')),
  mood_modern: (_c, tags) => tags.some(t => t.includes('모던')),
};

/** 이 카페가 사용자의 1순위 취향 조건과 일치하는지 */
export function matchesTasteWorldcupWinner(winnerId: string, cafe: TasteMatchCafe): boolean {
  const matcher = CONDITION_MATCHERS[winnerId];
  if (!matcher) return false;
  return matcher(cafe, splitVibeTags(cafe.vibeTagsRaw));
}

// 결과 화면 이미지 프레임 배경색 — 기본은 페이지 배경(#f3f3f3)과 동일하게.
// 전구 조건만 예외: lamp_idle.svg에 어두운 오버레이(#00132B, 58%)가 추가돼 있어 장면 자체가 어두우므로,
// 같은 색(오버레이를 #f3f3f3 위에 얹었을 때의 실제 합성 결과, rgb(102,113,127))으로 프레임을 맞춤.
// TasteWorldcup.tsx와 상세페이지 매칭 인터랙션이 공통으로 씀 — 무거운 애셋 import 없는 순수 함수라
// 여기 둬야 상세페이지에서 TasteWorldcup.tsx 청크(~700KB)를 정적으로 끌어오지 않음
export function getResultFrameBg(conditionId: string): string {
  if (conditionId.startsWith('lamp_')) return '#66717F';
  return '#f3f3f3';
}

// 조건별 인터랙션이 "정착" 상태(더 볼 게 없어지는 시점)에 이르기까지 걸리는 시간 — 상세페이지
// 매칭 배지처럼 인터랙션 재생이 끝난 뒤 다른 UI로 전환해야 하는 곳에서 씀. TasteWorldcup.tsx의
// 각 인터랙션 컴포넌트(LampInteraction/SpaceInteraction/NoiseInteraction/ImageSequence/
// MoodInteraction) phase 타이머 합과 수동으로 동기화한 값 — 그쪽 타이밍을 바꾸면 여기도 같이 바꿀 것
// 16개 조건 id + 라벨(텍스트만, 애셋 없음) — TasteWorldcup.tsx의 TASTE_WORLDCUP_CONDITIONS와
// 반드시 동기화할 것. 상세페이지 매칭 인터랙션 개발용 페이저(DetailPageTasteMatchDebugPager)에서만
// 씀 — 거기서 TasteWorldcup.tsx를 직접 import하면 무거운 청크가 딸려오므로 텍스트만 여기 따로 둠
export const TASTE_WORLDCUP_CONDITION_LABELS: TasteWorldcupWinner[] = [
  { id: 'lamp_warm', label: '웜톤 조명' },
  { id: 'lamp_low', label: '로우톤 조명' },
  { id: 'lamp_white', label: '화이트톤 조명' },
  { id: 'cafe_large', label: '대형 공간' },
  { id: 'cafe_small', label: '소형 공간' },
  { id: 'noise_normal', label: '적당한 소음' },
  { id: 'noise_small', label: '조용한 소음' },
  { id: 'outlet', label: '넉넉한 콘센트' },
  { id: 'mood_wood', label: '우드 인테리어' },
  { id: 'mood_metal', label: '메탈 인테리어' },
  { id: 'mood_white', label: '화이트 인테리어' },
  { id: 'mood_black', label: '블랙 인테리어' },
  { id: 'mood_plant', label: '플랜트 인테리어' },
  { id: 'mood_stone', label: '스톤 인테리어' },
  { id: 'mood_brick', label: '브릭 인테리어' },
  { id: 'mood_modern', label: '모던 인테리어' },
];

// cafe_large/cafe_small(대형/소형 공간)은 DetailPage.tsx의 FallingChairsInteraction이 따로
// 자체 타이밍으로 처리해서 여기 안 거침 — 없어도 되지만 굳이 값을 추측해 넣지 않음
//
// skipNoiseBars: 상세페이지 매칭 인터랙션 전용 — NoiseInteraction의 skipBars와 짝을 맞춤(파동
// 단계 없이 바로 다이얼부터 시작하므로 그만큼(1700ms) 짧게 잡음). 결과 페이지는 항상 false
export function getResultInteractionDurationMs(conditionId: string, opts: { skipNoiseBars?: boolean } = {}): number {
  if (conditionId.startsWith('lamp_')) return 2850; // idle(1000)+approach(700)+tug(250)+lit 유지(500)+깜빡임(220+140)
  if (conditionId.startsWith('noise_')) {
    // (bars(1700) 생략) + dial 정착/회전/정착(2300) + 헤드폰 크로스페이드(350) + 헤드폰 유지(900)
    // — 상세페이지는 헤드폰이 자리잡은 뒤 배지로 넘어가기 전 잠깐 더 보여주고 싶다는 요청으로 유지 시간 추가
    return opts.skipNoiseBars ? 3550 : 4350;
  }
  if (conditionId === 'outlet') return 3300; // empty(750)+plugged(900)+batteryLow(650)+채움 애니메이션(900)
  if (conditionId.startsWith('mood_')) return 3450; // idle(300)+zoom(600)+sweep(700)+코멧 회전(1600)+페이드(250)
  return 2000;
}
