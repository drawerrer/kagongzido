import { useState, useRef, useEffect } from 'react';
import { useBackEvent } from '../hooks/useBackEvent';
import { useFavorites } from '../context/FavoritesContext';
import FocusBottomCTA from '../components/FocusBottomCTA';
import RoundBadge from '../components/RoundBadge';
import WorldcupProgressIndicator from '../components/WorldcupProgressIndicator';
import WorldcupChoiceCard from '../components/WorldcupChoiceCard';
import VsBadge from '../components/VsBadge';
import LampWarmImg from '../assets/condition/lamp_warm.svg';
import LampLowImg from '../assets/condition/lamp_low.svg';
import LampWhiteImg from '../assets/condition/lamp_white.svg';
import CafeLargeImg from '../assets/condition/cafe_large.svg';
import CafeSmallImg from '../assets/condition/cafe_small.svg';
import NoiseNormalImg from '../assets/condition/noise_normal.svg';
import NoiseSmallImg from '../assets/condition/noise_small.svg';
import OutletImg from '../assets/condition/outlet.svg';
import MoodWoodImg from '../assets/condition/mood_wood.svg';
import MoodMetalImg from '../assets/condition/mood_metal.svg';
import MoodWhiteImg from '../assets/condition/mood_white.svg';
import MoodBlackImg from '../assets/condition/mood_black.svg';
import MoodPlantImg from '../assets/condition/mood_plant.svg';
import MoodStoneImg from '../assets/condition/mood_stone.svg';
import MoodBrickImg from '../assets/condition/mood_brick.svg';
import MoodModernImg from '../assets/condition/mood_modern.svg';
import LampIdleImg from '../assets/interaction/lamp_idle.svg';
import LampHandImg from '../assets/interaction/lamp_hand.svg';
import LampLitWarmImg from '../assets/interaction/lamp_lit_warm.svg';
import LampLitLowImg from '../assets/interaction/lamp_lit_low.svg';
import LampLitWhiteImg from '../assets/interaction/lamp_lit_white.svg';
import OutletLowImg from '../assets/interaction/outlet_low.svg';
import OutletEmptyImg from '../assets/interaction/outlet_empty.svg';
import OutletPluggedImg from '../assets/interaction/outlet_plugged.svg';
import OutletFullImg from '../assets/interaction/outlet_full.svg';
import ChairSingleImg from '../assets/interaction/chair_single.svg';
import ChairLargeImg from '../assets/interaction/chair_large.svg';
import ChairSmallImg from '../assets/interaction/chair_small.svg';
import NoiseDialNormalGridImg from '../assets/interaction/noise_dial_normal_grid.svg';
import NoiseDialKnobImg from '../assets/interaction/noise_dial_normal_knob.svg';
import NoiseDialSmallImg from '../assets/interaction/noise_dial_small.svg';
import NoiseDialHandImg from '../assets/interaction/noise_dial_hand.svg';
import NoiseHeadphonesNormalImg from '../assets/interaction/noise_headphones_normal.svg';
import NoiseHeadphonesSmallImg from '../assets/interaction/noise_headphones_small.svg';

// ─────────────────────────────────────────────────────────────
// 카페 취향 월드컵 — 온보딩 → 진행(대진) → 결과 3단계 플로우
// 조건 이미지(16종, 약 700KB)를 포함해 이 기능에서만 쓰는 코드를 한 청크로 분리,
// MyPage에서 React.lazy로 지연 로드하여 취향 월드컵을 열 때만 다운로드되게 함
// ─────────────────────────────────────────────────────────────

// 서브 페이지: 카페 취향 월드컵 온보딩 (3장, 좌우 스와이프 — Figma 스펙 반영)
const TASTE_WORLDCUP_ONBOARDING_SLIDES = [
  { main: '나는 어떤 카공 스타일일까?', sub: '콘센트, 조명, 분위기... 카공 취향을 알아봐요' },
  { main: '둘 중 더 끌리는 조건을 선택해요', sub: '2개의 보기 중 내 마음에 쏙 드는 걸 가볍게 툭툭 선택해요' },
  { main: '카공 스팟을 한눈에 찾아드려요', sub: '내 1순위 조건과 일치하는 카페를 발견했을 때 특별한 효과로 확실하게 알려드릴게요' },
];

// 헤드라인 영역과 인디케이터 영역의 높이를 동일하게 맞추기 위한 기준값
//  - 메인 22px(줄높이 27.5px, 1줄) + 사이 패딩 14px + 서브 14px(줄높이 17.5px × 최대 2줄 = 36px)
const HEADLINE_MAIN_HEIGHT = 27.5;
const HEADLINE_GAP = 14;
const HEADLINE_SUB_MAX_HEIGHT = 36;
const HEADLINE_AREA_HEIGHT = HEADLINE_MAIN_HEIGHT + HEADLINE_GAP + HEADLINE_SUB_MAX_HEIGHT;

function TasteWorldcupPage({ onBack, onStart, onDebugPager, enabled = true }: { onBack: () => void; onStart: () => void; onDebugPager?: () => void; enabled?: boolean }) {
  useBackEvent(onBack, enabled);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveStep(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`.taste-worldcup-carousel::-webkit-scrollbar { display: none; }`}</style>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* 캐러셀 — 헤드라인 + 이미지, 장마다 좌우 스와이프로 전환 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="taste-worldcup-carousel"
          style={{
            width: '100%', display: 'flex', overflowX: 'auto',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
          }}
        >
          {TASTE_WORLDCUP_ONBOARDING_SLIDES.map((slide, i) => (
            <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', padding: '0 30px' }}>
              {/* 헤드라인 — 메인 22px + 서브 14px(최대 2줄), 사이 패딩 14px. 인디케이터와 높이를 맞추기 위해 고정 높이 */}
              <div style={{ height: HEADLINE_AREA_HEIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: HEADLINE_GAP, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 590, color: '#252525', lineHeight: '27.5px' }}>
                  {slide.main}
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: '#9b9b9b', lineHeight: '17.5px' }}>
                  {slide.sub}
                </p>
              </div>

              {/* 이미지 영역 — 텍스트와 50px 간격, 300:280 비율로 화면 폭에 맞춰 반응형 리사이즈 */}
              {/* TODO: Figma "Character" 노드가 아직 빈 이미지라 실제 일러스트 에셋 없음 — 받는 대로 교체 필요 */}
              <div style={{ marginTop: 50, width: '100%', aspectRatio: '300 / 280', background: '#e5e8eb' }} />
            </div>
          ))}
        </div>

        {/* 인디케이터 — 캐러셀 밖에 하나만 두고 activeStep에 따라 갱신. 헤드라인과 동일한 높이로 좌우 대칭 */}
        <div style={{ marginTop: 40, height: HEADLINE_AREA_HEIGHT, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {TASTE_WORLDCUP_ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: 4,
              background: i === activeStep ? '#252525' : '#bbbbbb',
              transition: 'background 0.15s',
            }} />
          ))}
        </div>
      </div>

      {/* 하단 CTA와의 여백 확보용 스페이서 — 바디 바깥, 바디 아래 */}
      <div style={{ flexShrink: 0, height: 120 }} />

      {/* TODO(임시 개발용): 결과 인터랙션 점검용 페이저 진입 버튼 — 다듬기 끝나면 제거 */}
      {onDebugPager && (
        <button
          onClick={onDebugPager}
          style={{
            position: 'absolute', top: 12, right: 16,
            background: 'none', border: 'none', padding: 4,
            fontSize: 12, color: '#B0B8C1', cursor: 'pointer', zIndex: 1,
          }}
        >
          결과 인터랙션 미리보기(개발용)
        </button>
      )}

      <FocusBottomCTA.Single label="시작하기" onClick={onStart} />
    </div>
  );
}

// 서브 페이지: 카페 취향 월드컵 진행 화면 (Figma "Worldcup_checking" 스펙 반영)
// 16조건 싱글 엘리미네이션 랜덤 대진 — 조명/콘센트/공간/소음/분위기 5카테고리
const TASTE_WORLDCUP_TOTAL_PICKS = 15;

type TasteCondition = { id: string; image: string; label: string };

// 카페 취향 조건 16종 (조명 3 + 콘센트 1 + 공간 2 + 소음 2 + 분위기 8)
const TASTE_WORLDCUP_CONDITIONS: TasteCondition[] = [
  { id: 'lamp_warm', image: LampWarmImg, label: '웜톤 조명' },
  { id: 'lamp_low', image: LampLowImg, label: '로우톤 조명' },
  { id: 'lamp_white', image: LampWhiteImg, label: '화이트톤 조명' },
  { id: 'cafe_large', image: CafeLargeImg, label: '대형 공간' },
  { id: 'cafe_small', image: CafeSmallImg, label: '소형 공간' },
  { id: 'noise_normal', image: NoiseNormalImg, label: '적당한 소음' },
  { id: 'noise_small', image: NoiseSmallImg, label: '조용한 소음' },
  { id: 'outlet', image: OutletImg, label: '넉넉한 콘센트' },
  { id: 'mood_wood', image: MoodWoodImg, label: '우드 인테리어' },
  { id: 'mood_metal', image: MoodMetalImg, label: '메탈 인테리어' },
  { id: 'mood_white', image: MoodWhiteImg, label: '화이트 인테리어' },
  { id: 'mood_black', image: MoodBlackImg, label: '블랙 인테리어' },
  { id: 'mood_plant', image: MoodPlantImg, label: '플랜트 인테리어' },
  { id: 'mood_stone', image: MoodStoneImg, label: '스톤 인테리어' },
  { id: 'mood_brick', image: MoodBrickImg, label: '브릭 인테리어' },
  { id: 'mood_modern', image: MoodModernImg, label: '모던 인테리어' },
];

// 결과 화면 상단 설명 문구 — 조건별 분위기를 짧게 풀어 쓴 카피 (기획 확정본)
const TASTE_WORLDCUP_RESULT_DESC: Record<string, string> = {
  lamp_warm: '눈이 편안해지는 따뜻한 곳',
  lamp_white: '집중력이 확 올라가는 곳',
  lamp_low: '차분하게 몰입하기 좋은 곳',
  outlet: '배터리 걱정 없이 든든한 곳',
  cafe_large: '자유롭고 탁 트인 넓은 공간',
  cafe_small: '나만의 아지트처럼 아늑한 곳',
  noise_small: '온전히 나에게만 집중하는 곳',
  noise_normal: '카공 능률이 쑥쑥 오르는 곳',
  mood_wood: '따스한 온기가 느껴지는 곳',
  mood_metal: '세련된 감각이 돋보이는 곳',
  mood_white: '머리가 맑아지는 깔끔한 곳',
  mood_black: '묵직하고 차분한 어두운 곳',
  mood_plant: '눈이 맑아지는 싱그러운 곳',
  mood_stone: '차분하고 묵직한 질감의 곳',
  mood_brick: '따뜻한 감성의 빈티지한 곳',
  mood_modern: '군더더기 없이 세련된 공간',
};

// Fisher–Yates 셔플 — 매 판마다 16조건의 대진표 순서를 랜덤으로 섞음
function shuffleConditions(conditions: TasteCondition[]): TasteCondition[] {
  const arr = [...conditions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 진행 단계(1~15)를 라운드 뱃지 텍스트로 변환 — 16강 8번(1~8) → 8강 4번(9~12) → 4강 2번(13~14) → 결승 1번(15)
function getWorldcupRoundLabel(step: number): string {
  if (step <= 8) return '16강';
  if (step <= 12) return '8강';
  if (step <= 14) return '4강';
  return '결승';
}

// 싱글 엘리미네이션 대진 트리 — step(1~15)이 곧 매치 번호.
//  16강 1~8번의 승자가 8강 9~12번을 구성하고, 8강 승자가 4강 13~14번을, 4강 승자가 결승 15번을 구성.
//  bracket: 게임 시작 시 한 번 섞인 16조건 순서(고정) / history: 매치별 선택('left'|'right') 기록
function getMatchPlayers(
  step: number,
  bracket: TasteCondition[],
  history: Record<number, 'left' | 'right'>,
): [TasteCondition, TasteCondition] | null {
  if (step >= 1 && step <= 8) {
    const i = step - 1;
    return [bracket[i * 2], bracket[i * 2 + 1]];
  }
  if (step >= 9 && step <= 12) {
    const i = step - 9;
    const a = getMatchWinner(1 + i * 2, bracket, history);
    const b = getMatchWinner(2 + i * 2, bracket, history);
    return a && b ? [a, b] : null;
  }
  if (step === 13 || step === 14) {
    const i = step - 13;
    const a = getMatchWinner(9 + i * 2, bracket, history);
    const b = getMatchWinner(10 + i * 2, bracket, history);
    return a && b ? [a, b] : null;
  }
  if (step === 15) {
    const a = getMatchWinner(13, bracket, history);
    const b = getMatchWinner(14, bracket, history);
    return a && b ? [a, b] : null;
  }
  return null;
}

function getMatchWinner(
  step: number,
  bracket: TasteCondition[],
  history: Record<number, 'left' | 'right'>,
): TasteCondition | null {
  const players = getMatchPlayers(step, bracket, history);
  const side = history[step];
  if (!players || !side) return null;
  return side === 'left' ? players[0] : players[1];
}

function TasteWorldcupGamePage({ onBack, onFinish, enabled = true }: { onBack: () => void; onFinish: (winner: { id: string; label: string }) => void; enabled?: boolean }) {
  useBackEvent(onBack, enabled);
  // 대진표 순서 — 이 화면에 진입할 때(=재도전 포함) 한 번만 랜덤으로 섞고 판이 끝날 때까지 고정
  const [bracket] = useState(() => shuffleConditions(TASTE_WORLDCUP_CONDITIONS));
  const [step, setStep] = useState(1); // 1~15
  // 매치(step)별 선택 기록 — 이전으로 돌아갔을 때 그 매치에서 골랐던 카드를 그대로 보여주기 위함
  const [selectionHistory, setSelectionHistory] = useState<Record<number, 'left' | 'right'>>({});
  const selectedSide = selectionHistory[step] ?? null;
  const match = getMatchPlayers(step, bracket, selectionHistory);

  // 다음으로 CTA — 선택 고정된 카드로 매치를 확정하고 다음 매치로 이동, 마지막 라운드(결승)면 결과 화면으로 이동
  const handleNext = () => {
    if (step === TASTE_WORLDCUP_TOTAL_PICKS) {
      if (!selectedSide || !match) return;
      const winner = selectedSide === 'left' ? match[0] : match[1];
      onFinish(winner);
      return;
    }
    setStep(s => Math.min(TASTE_WORLDCUP_TOTAL_PICKS, s + 1));
  };
  // 이전으로 — 매치만 되돌리면 selectedSide는 그 매치의 기록에서 자동으로 복원됨
  const handleUndo = () => setStep(s => Math.max(1, s - 1));

  // 카드 선택 — 현재 매치의 선택을 기록에 저장 (매치 이동은 다음으로 CTA에서)
  //  이전 선택과 다른 카드로 바꾸면, 그 결과에 의존하던 이후 라운드 대진이 전부 달라지므로
  //  현재 매치보다 뒤의 기록은 모두 무효화(삭제)한다 — 다시 그 라운드부터 진행해야 함
  const handlePick = (side: 'left' | 'right') => {
    setSelectionHistory(h => {
      if (h[step] === side) return h;
      const next: Record<number, 'left' | 'right'> = {};
      for (const key of Object.keys(h)) {
        const n = Number(key);
        if (n <= step) next[n] = h[n];
      }
      next[step] = side;
      return next;
    });
  };

  if (!match) return null; // 이전 라운드 대진이 아직 확정되지 않은 경우(정상 플로우에서는 발생하지 않음)

  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, padding: '30px 20px 0', overflow: 'hidden' }}>
        {/* 헤딩 — 라운드 뱃지 + 진행률 인디케이터 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <RoundBadge label={getWorldcupRoundLabel(step)} />
          <WorldcupProgressIndicator step={step} total={TASTE_WORLDCUP_TOTAL_PICKS} />
        </div>

        <p style={{ marginTop: 50, fontSize: 18, fontWeight: 510, color: '#252525', textAlign: 'center' }}>
          나의 최애 카공 조건은?
        </p>

        {/* container_boxes — box_L / box_R + 중앙 VS */}
        <div style={{ marginTop: 60, position: 'relative', display: 'flex', gap: 7 }}>
          <WorldcupChoiceCard
            image={match[0].image}
            label={match[0].label}
            onClick={() => handlePick('left')}
            selected={selectedSide === 'left'}
          />
          <WorldcupChoiceCard
            image={match[1].image}
            label={match[1].label}
            onClick={() => handlePick('right')}
            selected={selectedSide === 'right'}
          />

          {/* VS 뱃지 — 두 박스 경계, 이미지 영역 세로 중앙에 겹쳐 위치 */}
          <div style={{ position: 'absolute', left: '50%', top: '41%', transform: 'translate(-50%, -50%)' }}>
            <VsBadge />
          </div>
        </div>
      </div>

      <FocusBottomCTA.SingleWithUndo
        label={step === TASTE_WORLDCUP_TOTAL_PICKS ? '결과보기' : '다음으로'}
        onClick={handleNext}
        disabled={!selectedSide}
        undoLabel="← 이전으로"
        onUndo={handleUndo}
        undoDisabled={step <= 1}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 결과 화면 이미지 인터랙션 — 1순위 조건 카테고리별로 다른 모션 재생
//  - 전구(조명 3종)/콘센트/소음: 여러 장면을 순서대로 크로스페이드
//  - 공간(대형/소형 카페): 완성된 한 장면을 확대 상태로 시작해 CSS transform으로 줌아웃
//  - 분위기(우드/메탈 등) 8종: 스티커 인터랙션 애셋 준비 전이라 기존 플레이스홀더 유지
// 마운트 시 한 번만 재생하고 멈춤(반복 없음) — 앱인토스 심사의 "과도한 반복 애니메이션" 반려 규칙 준수
// ─────────────────────────────────────────────────────────────
interface InteractionFrame {
  src: string;
  /** 다음 프레임으로 넘어가기까지 유지 시간(ms). 마지막 프레임은 더 이상 전환이 없어 무시됨 */
  holdMs: number;
  /** 이 프레임이 보이는 동안만 적용할 1회성 강조 애니메이션 클래스 */
  animateClassName?: string;
  /** 지정하면 이 위치에서 슬라이드해오며 페이드인 (예: 손이 다가오는 느낌). 기본은 제자리 크로스페이드 */
  enterFromTransform?: string;
  /** enterFromTransform 사용 시 전환 시간(ms) — 기본 크로스페이드(350ms)보다 느리게 "다가오는" 느낌을 주고 싶을 때 */
  enterMs?: number;
}

function ImageSequence({ frames }: { frames: InteractionFrame[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= frames.length - 1) return;
    const timer = setTimeout(() => setIndex(i => i + 1), frames[index].holdMs);
    return () => clearTimeout(timer);
  }, [index, frames]);

  return (
    <>
      {frames.map((frame, i) => {
        const active = i === index;
        const duration = frame.enterMs ?? 350;
        return (
          <img
            key={frame.src}
            src={frame.src}
            alt=""
            className={active ? frame.animateClassName : undefined}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: active ? 1 : 0,
              transform: frame.enterFromTransform
                ? (active ? 'none' : frame.enterFromTransform)
                : undefined,
              transition: frame.enterFromTransform
                ? `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
                : 'opacity 0.35s ease',
            }}
          />
        );
      })}
    </>
  );
}

// 공간(대형/소형 카페) 전용 인터랙션 — chair_large/small은 의자 간 간격이 좁아서 그냥 확대하면
// 포커스한 의자 하나만이 아니라 주변 의자까지 같이 보여버림. 그래서:
//  (1) 의자 하나만 그려진 chair_single을 원본 그대로(scale 1)의 크기로 잠깐 고정
//  (2) chair_single을 "실제 배치 안에서 의자 한 개가 보이는 크기"까지 축소(scale 1보다 작아짐)
//  (3) 그 크기가 같아지는 시점에 chair_large/small로 교체 — 이때 chair_large/small도 그 크기에 맞춰
//      확대된 상태(GROUP_ZOOM_IN_SCALE)로 나타나서 크기가 자연스럽게 이어짐
//  (4) chair_large/small이 이어서 원본 크기(scale 1)까지 줄어들며 전체 배치가 드러남
// TODO: 실제 애셋에서 의자 하나의 상대 크기 비율에 맞춰 튜닝 필요 — 지금은 추정치.
// 교체 시점에 크기가 어긋나 보이면 이 두 값을 조정할 것
const SPACE_MATCH_SCALE = 0.4;     // chair_single이 축소되다가 교체되는 시점의 배율
const GROUP_ZOOM_IN_SCALE = 3.5;   // chair_large/small이 교체된 직후 시작하는 확대 배율(이후 1까지 축소)

function SpaceInteraction({ groupSrc }: { groupSrc: string }) {
  const [phase, setPhase] = useState<'focus' | 'toMatch' | 'group'>('focus');

  useEffect(() => {
    if (phase === 'focus') {
      const t = setTimeout(() => setPhase('toMatch'), 1000); // 원본 크기로 고정 유지하는 시간
      return () => clearTimeout(t);
    }
    if (phase === 'toMatch') {
      const t = setTimeout(() => setPhase('group'), 600); // 매칭 배율까지 축소되는 시간
      return () => clearTimeout(t);
    }
  }, [phase]);

  const baseStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: 'center' } as const;

  return (
    <>
      {/* 의자 1개 — 원본 크기로 고정(focus) → 매칭 배율까지 축소(toMatch) → group 단계에서 교체되며 사라짐 */}
      <img
        src={ChairSingleImg}
        alt=""
        style={{
          ...baseStyle,
          opacity: phase === 'group' ? 0 : 1,
          transform: `scale(${phase === 'focus' ? 1 : SPACE_MATCH_SCALE})`,
          transition: phase === 'focus' ? 'none' : 'transform 600ms ease-out, opacity 300ms ease',
        }}
      />
      {/* 실제 배치(대형/소형) — 교체 시점엔 확대 상태(GROUP_ZOOM_IN_SCALE)로 나타나 chair_single과
          크기를 맞추고, 그대로 원본 크기(scale 1)까지 줄어들며 전체 배치가 드러남 */}
      <img
        src={groupSrc}
        alt=""
        style={{
          ...baseStyle,
          opacity: phase === 'group' ? 1 : 0,
          transform: `scale(${phase === 'group' ? 1 : GROUP_ZOOM_IN_SCALE})`,
          transition: phase === 'group' ? 'transform 900ms ease-out, opacity 300ms ease' : 'none',
        }}
      />
    </>
  );
}

// 전구 전용 인터랙션 — 램프(lamp_idle)는 고정해두고, 손(lamp_hand, 투명 배경)만 별도 레이어로
// (1) 아래에서 올라와 줄을 잡고 (2) 살짝 아래로 당긴 뒤 (3) 불이 켜지는 3단계로 구성
const LAMP_PHASES = ['idle', 'approach', 'tug', 'lit'] as const;
type LampPhase = typeof LAMP_PHASES[number];
const LAMP_PHASE_DURATION_MS: Record<Exclude<LampPhase, 'lit'>, number> = {
  idle: 1000,     // 대기(흔들림)
  approach: 700,  // 손이 올라와 줄을 잡음
  tug: 250,       // 줄을 살짝 아래로 당김 — 당기는 동작이라 approach보다 빠르고 스냅감 있게
};

function LampInteraction({ litSrc }: { litSrc: string }) {
  const [phase, setPhase] = useState<LampPhase>('idle');

  useEffect(() => {
    if (phase === 'lit') return;
    const next = LAMP_PHASES[LAMP_PHASES.indexOf(phase) + 1];
    const t = setTimeout(() => setPhase(next), LAMP_PHASE_DURATION_MS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const baseStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const;

  // 손: idle(아래 숨김) → approach(올라와 줄을 잡음, lamp_idle 줄 끝과 정렬되는 -20px 지점에 고정) →
  //     tug(위치는 그대로 유지한 채 살짝 쥐는 스퀴즈 모션만 재생) → lit(같이 페이드아웃)
  // -20px는 lamp_hand.svg와 lamp_pull.svg(당기기 전 손 위치)를 좌표 단위로 대조해 확인한 실제 차이값.
  // tug 단계에서 손을 실제로 더 내리면 배경 램프의 줄(고정 길이)과 어긋나 손이 줄을 놓친 것처럼 보이므로,
  // 위치는 그대로 두고 스퀴즈(twc-tug) 애니메이션으로만 "당기는 힘"을 표현함
  const handTransform = phase === 'idle' ? 'translateY(40px)' : 'translateY(-5px)';
  const handTransition =
    phase === 'approach' ? 'opacity 700ms ease-out, transform 700ms ease-out' :
    phase === 'lit' ? 'opacity 0.35s ease' :
    'none';

  return (
    <>
      {/* 배경 램프 — idle/approach/tug 동안 고정, lit로 넘어갈 때 페이드아웃 */}
      <img
        src={LampIdleImg}
        alt=""
        className={phase === 'idle' ? 'twc-wobble' : undefined}
        style={{ ...baseStyle, opacity: phase === 'lit' ? 0 : 1, transition: 'opacity 0.35s ease' }}
      />
      {/* 손 — 올라와 줄을 잡고(approach) 제자리에서 살짝 쥐는 스퀴즈(tug) 뒤 lit로 넘어갈 때 같이 사라짐
          lamp_hand.svg는 translateY로 움직여도 잘리지 않도록 세로로 여유(315×420, 프레임보다 70px 큼)를
          두고 받은 애셋 — height를 100%로 강제하지 않고 원본 비율 그대로(auto) 키워서 상단은 프레임에
          맞추고 늘어난 70px는 아래로 자연스럽게 넘치게 한 뒤, 프레임 자체의 overflow:hidden이 잘라줌 */}
      <img
        src={LampHandImg}
        alt=""
        className={phase === 'tug' ? 'twc-tug' : undefined}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',
          opacity: phase === 'approach' || phase === 'tug' ? 1 : 0,
          transform: handTransform,
          transition: handTransition,
        }}
      />
      {/* 켜진 램프 — lit 단계에서 페이드인 후 유지 */}
      <img
        src={litSrc}
        alt=""
        style={{ ...baseStyle, opacity: phase === 'lit' ? 1 : 0, transition: 'opacity 0.35s ease' }}
      />
    </>
  );
}

// 소음 전용 인터랙션 — noise_bars.svg의 막대 5개가 원래 하나의 path로 합쳐져 있어 개별 애니메이션이
// 불가능했으므로, 그 좌표를 그대로 가져와 막대마다 별도 <line>으로 분리한 인라인 SVG로 재구현.
// 막대별로 진폭/속도/딜레이를 다르게 줘서 소리에 맞춰 각자 다르게 파동치는 느낌을 살림
const NOISE_BARS = [
  { x: 96, y1: 135.5, y2: 214.5 },
  { x: 128, y1: 140.5, y2: 209.5 },
  { x: 160, y1: 129.5, y2: 220.5 },
  { x: 192, y1: 140.5, y2: 209.5 },
  { x: 224, y1: 124.5, y2: 225.5 },
];

function NoiseBars() {
  return (
    <svg viewBox="0 0 315 350" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <rect width="315" height="350" fill="#F3F3F3" />
      {NOISE_BARS.map((bar, i) => (
        <line
          key={i}
          x1={bar.x} y1={bar.y1} x2={bar.x} y2={bar.y2}
          stroke="#000" strokeWidth={5} strokeLinecap="round"
          className={`twc-noise-bar-${i}`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

// noise_headphones_normal 전용 — 헤드폰 아래 파동 선도 noise_bars와 같은 방식으로 하나의 path에서
// 좌표만 뽑아 개별 <line>으로 분리(원본 svg에서는 이 path를 제거함). 배경 없는 투명 오버레이라
// 헤드폰 이미지 위에 겹쳐서 파동만 움직이게 함
const HEADPHONE_WAVE_BARS = [
  { x: 116.672, y1: 260.559, y2: 274.002 },
  { x: 138.336, y1: 256.059, y2: 278.502 },
  { x: 160, y1: 262.559, y2: 272.002 },
  { x: 181.664, y1: 252.559, y2: 282.002 },
  { x: 203.328, y1: 262.559, y2: 272.002 },
];

function HeadphoneWave() {
  return (
    <svg viewBox="0 0 315 350" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      {HEADPHONE_WAVE_BARS.map((bar, i) => (
        <line
          key={i}
          x1={bar.x} y1={bar.y1} x2={bar.x} y2={bar.y2}
          stroke="#000" strokeWidth={5} strokeLinecap="round"
          className={`twc-noise-bar-${i}`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

// 다이얼 등장 — 두 형태 지원:
//  - 분리형(grid+knob): 눈금/위치선(grid)은 고정, 가운데 원형 조작부(knob)만 회전
//  - 통짜형(flatSrc): 아직 grid/knob으로 분리된 애셋이 없는 조건 — 회전 없이 그대로 페이드인
// active(다이얼 단계 진입)가 true로 바뀌는 시점에 회전이 시작되도록 별도 상태로 관리 —
// 그냥 마운트 시점에 걸면 아직 안 보이는 bars 단계에서 미리 끝나버림
type NoiseDialSpec = { gridSrc: string; knobSrc: string } | { flatSrc: string };

function DialReveal({ dial, active }: { dial: NoiseDialSpec; active: boolean }) {
  const [rotated, setRotated] = useState(true);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setRotated(false), 800); // 등장 직후 잠깐 정착했다가 회전 시작
    return () => clearTimeout(t);
  }, [active]);

  const baseStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const;

  if ('flatSrc' in dial) {
    return (
      <img
        src={dial.flatSrc}
        alt=""
        style={{ ...baseStyle, opacity: active ? 1 : 0, transition: active ? 'opacity 0.35s ease' : 'none' }}
      />
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: active ? 'opacity 0.35s ease' : 'none' }}>
      <img src={dial.gridSrc} alt="" style={baseStyle} />
      {/* 조작부만 회전 — 오른쪽으로 살짝 치우친 상태(25deg)에서 반시계 방향(오른쪽→왼쪽)으로 제자리(0deg)까지 */}
      <img
        src={dial.knobSrc}
        alt=""
        style={{
          ...baseStyle, transformOrigin: 'center',
          // 시작(rotated=true): 그리드의 볼륨 위치 표시선 방향(5시경, 시계 기준 약 150°)
          // 끝(rotated=false): 상단 중앙(12시)으로 정착
          transform: rotated ? 'rotate(20deg)' : 'rotate(-130deg)',
          transition: 'transform 0.7s ease-out',
        }}
      />
      {/* 손 — knob이 회전을 시작하는 순간(rotated=false) 오른쪽에서 슬라이드+페이드로 등장,
          우측에서 좌측으로 다이얼을 돌리는 느낌(lamp_hand와 같은 방식) */}
      <img
        src={NoiseDialHandImg}
        alt=""
        style={{
          ...baseStyle,
          opacity: rotated ? 0 : 1,
          transform: rotated ? 'translateX(40px)' : 'translateX(0)',
          transition: rotated ? 'none' : 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      />
    </div>
  );
}

function NoiseInteraction({ dial, headphonesSrc, headphonesWave = false }: { dial: NoiseDialSpec; headphonesSrc: string; headphonesWave?: boolean }) {
  const [phase, setPhase] = useState<'bars' | 'dial' | 'headphones'>('bars');

  useEffect(() => {
    if (phase === 'bars') {
      const t = setTimeout(() => setPhase('dial'), 1700); // 막대 애니메이션(0.8s × 2회 + 딜레이) 다 끝날 때까지 유지
      return () => clearTimeout(t);
    }
    if (phase === 'dial') {
      const t = setTimeout(() => setPhase('headphones'), 2300); // 정착(0.8s) + 회전(0.7s) + 정착(0.8s) 다 끝날 때까지 유지
      return () => clearTimeout(t);
    }
  }, [phase]);

  const baseStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const;

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: phase === 'bars' ? 1 : 0, transition: 'opacity 0.35s ease' }}>
        <NoiseBars />
      </div>
      <DialReveal dial={dial} active={phase === 'dial'} />
      <div style={{ position: 'absolute', inset: 0, opacity: phase === 'headphones' ? 1 : 0, transition: 'opacity 0.35s ease' }}>
        <img src={headphonesSrc} alt="" style={baseStyle} />
        {/* phase가 'headphones'로 바뀌는 순간 새로 마운트돼야 애니메이션이 그때 시작함 —
            그냥 opacity로만 숨겨두면 안 보이는 동안 이미 재생이 끝나버림(DialReveal과 같은 문제) */}
        {headphonesWave && phase === 'headphones' && <HeadphoneWave />}
      </div>
    </>
  );
}

type ResultInteractionSpec =
  | { kind: 'sequence'; frames: InteractionFrame[] }
  | { kind: 'space'; groupSrc: string }
  | { kind: 'lamp'; litSrc: string }
  | { kind: 'noise'; dial: NoiseDialSpec; headphonesSrc: string; headphonesWave?: boolean };

// 결과 화면 이미지 프레임 배경색 — 기본은 페이지 배경(#f3f3f3)과 동일하게.
// 전구 조건만 예외: lamp_idle.svg에 어두운 오버레이(#00132B, 58%)가 추가돼 있어 장면 자체가 어두우므로,
// 같은 색(오버레이를 #f3f3f3 위에 얹었을 때의 실제 합성 결과, rgb(102,113,127))으로 프레임을 맞춤
function getResultFrameBg(conditionId: string): string {
  if (conditionId.startsWith('lamp_')) return '#66717F';
  return '#f3f3f3';
}

// 1순위 조건 id → 결과 화면 인터랙션. 분위기 8종은 아직 스티커 애셋이 없어 매핑에서 제외(플레이스홀더 유지)
const WORLDCUP_RESULT_INTERACTIONS: Record<string, ResultInteractionSpec> = {
  lamp_warm: { kind: 'lamp', litSrc: LampLitWarmImg },
  lamp_low: { kind: 'lamp', litSrc: LampLitLowImg },
  lamp_white: { kind: 'lamp', litSrc: LampLitWhiteImg },
  outlet: {
    kind: 'sequence',
    frames: [
      { src: OutletLowImg, holdMs: 1000, animateClassName: 'twc-blink' },
      { src: OutletEmptyImg, holdMs: 750 },
      { src: OutletPluggedImg, holdMs: 750 },
      { src: OutletFullImg, holdMs: 0 },
    ],
  },
  cafe_large: { kind: 'space', groupSrc: ChairLargeImg },
  cafe_small: { kind: 'space', groupSrc: ChairSmallImg },
  noise_normal: {
    kind: 'noise',
    dial: { gridSrc: NoiseDialNormalGridImg, knobSrc: NoiseDialKnobImg },
    headphonesSrc: NoiseHeadphonesNormalImg,
    headphonesWave: true, // 약간의 파동이 남아있는 조건이라 헤드폰 아래 파동 선이 움직임
  },
  // TODO: noise_small도 grid/knob 분리 애셋 받으면 위와 동일하게 교체 — 지금은 통짜 이미지로 회전 없이 표시
  noise_small: { kind: 'noise', dial: { flatSrc: NoiseDialSmallImg }, headphonesSrc: NoiseHeadphonesSmallImg },
};

function ResultInteraction({ conditionId }: { conditionId: string }) {
  const spec = WORLDCUP_RESULT_INTERACTIONS[conditionId];
  // 탭하면 처음부터 다시 재생 — replayKey를 바꿔서 내부 컴포넌트를 강제로 리마운트시킴
  const [replayKey, setReplayKey] = useState(0);

  if (!spec) {
    // 분위기 조건 8종 — 스티커 인터랙션 애셋 준비되면 연결 예정
    return <div style={{ position: 'absolute', inset: 0, background: '#E5E8EB' }} />;
  }

  return (
    <div
      onClick={() => setReplayKey(k => k + 1)}
      style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
    >
      <style>{`
        @keyframes twc-wobble { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-4deg); } 75% { transform: rotate(4deg); } }
        .twc-wobble { animation: twc-wobble 0.5s ease-in-out 2; transform-origin: top center; }
        @keyframes twc-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .twc-blink { animation: twc-blink 0.5s ease-in-out 2; }
        @keyframes twc-bar-0 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3); } }
        @keyframes twc-bar-1 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.15); } }
        @keyframes twc-bar-2 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.4); } }
        @keyframes twc-bar-3 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.2); } }
        @keyframes twc-bar-4 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.35); } }
        .twc-noise-bar-0 { animation: twc-bar-0 0.8s ease-in-out 2; }
        .twc-noise-bar-1 { animation: twc-bar-1 0.8s ease-in-out 2 40ms; }
        .twc-noise-bar-2 { animation: twc-bar-2 0.8s ease-in-out 2 80ms; }
        .twc-noise-bar-3 { animation: twc-bar-3 0.8s ease-in-out 2 120ms; }
        .twc-noise-bar-4 { animation: twc-bar-4 0.8s ease-in-out 2 20ms; }
        @keyframes twc-tug { 0%, 100% { transform: translateY(-5px) scale(1); } 50% { transform: translateY(-5px) scale(0.94); } }
        .twc-tug { animation: twc-tug 260ms ease-in-out 1; transform-origin: center; }
      `}</style>
      {spec.kind === 'space' && <SpaceInteraction key={replayKey} groupSrc={spec.groupSrc} />}
      {spec.kind === 'lamp' && <LampInteraction key={replayKey} litSrc={spec.litSrc} />}
      {spec.kind === 'noise' && (
        <NoiseInteraction key={replayKey} dial={spec.dial} headphonesSrc={spec.headphonesSrc} headphonesWave={spec.headphonesWave} />
      )}
      {spec.kind === 'sequence' && <ImageSequence key={replayKey} frames={spec.frames} />}
    </div>
  );
}

// 서브 페이지: 카페 취향 월드컵 결과 화면 (Figma "Worldcup_result" 스펙 반영)
function TasteWorldcupResultPage({
  winner, onBack, onConfirm, confirmLabel = '확인', onPrev, prevLabel, enabled = true,
}: {
  winner: { id: string; label: string };
  onBack: () => void;
  onConfirm: () => void;
  /** 기본 "확인" — 디버그 페이저에서 "다음으로"로 재사용하기 위해 오버라이드 가능 */
  confirmLabel?: string;
  /** 지정하면 버튼 위에 "이전으로" 텍스트 링크가 추가됨 — 디버그 페이저 전용, 실제 결과 화면에선 생략 */
  onPrev?: () => void;
  prevLabel?: string;
  enabled?: boolean;
}) {
  useBackEvent(onBack, enabled);
  const { nickname } = useFavorites();
  const displayName = nickname ?? '나';
  const resultDesc = TASTE_WORLDCUP_RESULT_DESC[winner.id] ?? '나에게 딱 맞는 곳';

  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
        {/* 상단 IMG 영역 — 1순위 조건에 맞는 인터랙션 재생
            프레임 배경은 인터랙션 장면의 실제 배경색과 맞춤(getResultFrameBg) — 회전/스퀴즈 애니메이션이
            프레임 경계 밖으로 살짝 벗어날 때 드러나는 모서리 색이 장면과 어긋나 튀지 않도록 함 */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '315 / 350', borderRadius: 12, overflow: 'hidden', background: getResultFrameBg(winner.id) }}>
          <ResultInteraction conditionId={winner.id} />
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 590, color: '#191F28', lineHeight: '27.5px' }}>
            취향을 발견했어요!
          </p>
          <div style={{ marginTop: 24 }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#6B7684', lineHeight: '21.28px' }}>
              {resultDesc}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 17, fontWeight: 400, color: '#6B7684', lineHeight: '21.28px' }}>
              {displayName}님의 1순위 취향은
            </p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 400, lineHeight: '21.28px' }}>
              <span style={{ color: '#4E5968' }}>{winner.label}</span>
              <span style={{ color: '#6B7684' }}> 카페예요</span>
            </p>
          </div>
        </div>
      </div>

      <FocusBottomCTA.SingleWithUndo
        label={confirmLabel}
        onClick={onConfirm}
        undoLabel={onPrev ? (prevLabel ?? '← 이전으로') : undefined}
        onUndo={onPrev}
      />
    </div>
  );
}

// TODO(임시 개발용): 결과 인터랙션을 라운드를 다 돌지 않고 실제 결과 화면 그대로, 한 조건씩 넘겨보며
// 점검하기 위한 페이저. "다음으로"를 누를 때마다 다음 조건의 인터랙션이 처음부터 재생됨(끝까지 가면 처음으로 순환).
// 인터랙션 디테일 다듬기 끝나면 이 컴포넌트와 TasteWorldcupPage의 진입 버튼을 함께 제거할 것.
function TasteWorldcupResultDebugPager({ onExit }: { onExit: () => void }) {
  const total = TASTE_WORLDCUP_CONDITIONS.length;
  const [index, setIndex] = useState(0);
  const condition = TASTE_WORLDCUP_CONDITIONS[index];

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* 현재 몇 번째 조건인지 표시 — 디버그 전용 오버레이 */}
      <div style={{
        position: 'absolute', top: 12, left: 20, zIndex: 2,
        fontSize: 12, color: '#B0B8C1', background: 'rgba(255,255,255,0.85)',
        padding: '2px 8px', borderRadius: 8,
      }}>
        {index + 1} / {total} · {condition.id}
      </div>
      <TasteWorldcupResultPage
        // 조건이 바뀔 때마다 컴포넌트를 새로 마운트해서 인터랙션 애니메이션이 처음부터 재생되게 함
        key={condition.id}
        winner={condition}
        onBack={onExit}
        onConfirm={() => setIndex(i => (i + 1) % total)}
        confirmLabel="다음으로"
        onPrev={() => setIndex(i => (i - 1 + total) % total)}
        prevLabel="← 이전으로"
      />
    </div>
  );
}

type TasteWorldcupPhase = 'onboarding' | 'game' | 'result' | 'debug-pager';

/**
 * 카페 취향 월드컵 플로우 전체를 감싸는 진입점.
 * MyPage에서 React.lazy(() => import('./TasteWorldcup'))로 지연 로드해서
 * 이 화면을 열 때만 16개 조건 이미지(~700KB)를 다운로드하게 함.
 */
export default function TasteWorldcupFlow({ onExit, enabled = true }: { onExit: () => void; enabled?: boolean }) {
  const [phase, setPhase] = useState<TasteWorldcupPhase>('onboarding');
  const [winner, setWinner] = useState<{ id: string; label: string } | null>(null);

  if (phase === 'game') {
    return (
      <TasteWorldcupGamePage
        onBack={() => setPhase('onboarding')}
        onFinish={(w) => { setWinner(w); setPhase('result'); }}
        enabled={enabled}
      />
    );
  }

  if (phase === 'result' && winner) {
    return (
      <TasteWorldcupResultPage
        winner={winner}
        onBack={() => setPhase('game')}
        onConfirm={onExit}
        enabled={enabled}
      />
    );
  }

  if (phase === 'debug-pager') {
    return <TasteWorldcupResultDebugPager onExit={() => setPhase('onboarding')} />;
  }

  return (
    <TasteWorldcupPage
      onBack={onExit}
      onStart={() => setPhase('game')}
      onDebugPager={() => setPhase('debug-pager')}
      enabled={enabled}
    />
  );
}
