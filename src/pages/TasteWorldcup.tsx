import { useState, useRef } from 'react';
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

function TasteWorldcupPage({ onBack, onStart, enabled = true }: { onBack: () => void; onStart: () => void; enabled?: boolean }) {
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

// 서브 페이지: 카페 취향 월드컵 결과 화면 (Figma "Worldcup_result" 스펙 반영)
// 상단 IMG 영역은 추후 실제 이미지 자산 + 탭/스와이프 인터랙션이 붙을 예정 — 지금은 자리만 동일하게 확보
function TasteWorldcupResultPage({
  winner, onBack, onConfirm, enabled = true,
}: {
  winner: { id: string; label: string };
  onBack: () => void;
  onConfirm: () => void;
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
        {/* 상단 IMG 영역 — 추후 실제 이미지 + 인터랙션 연결 예정, 지금은 자리만 확보 */}
        <div style={{ width: '100%', aspectRatio: '315 / 350', borderRadius: 12, background: '#E5E8EB' }} />

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

      <FocusBottomCTA.SingleWithUndo label="확인" onClick={onConfirm} />
    </div>
  );
}

type TasteWorldcupPhase = 'onboarding' | 'game' | 'result';

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

  return (
    <TasteWorldcupPage
      onBack={onExit}
      onStart={() => setPhase('game')}
      enabled={enabled}
    />
  );
}
