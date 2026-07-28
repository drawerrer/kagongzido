// 기계식 키보드 키캡 사운드 합성 (외부 오디오 파일 없이 Web Audio API로 즉석 생성)
// 노이즈를 필터로 깎은 "클릭"(접점) + 낮은 사인파 "토크"(바닥 닿는 울림) 조합

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = ctx.sampleRate * 0.15;
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

function playNoiseClick(ctx: AudioContext, { freq = 4500, q = 1.2, duration = 0.02, gain = 0.16 } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq, ctx.currentTime);
  filter.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + duration + 0.02);
}

function playThump(ctx: AudioContext, { freqStart = 150, freqEnd = 85, duration = 0.09, gain = 0.22 } = {}) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration + 0.01);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

/** 누르는 순간 — 스위치 접점 "딸깍" (하이톤 클릭만, 아주 짧고 가볍게) */
export function playHeartTick() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    playNoiseClick(ctx, { freq: 5200, q: 1.4, duration: 0.015, gain: 0.14 });
  } catch { /* 토스 앱 외 환경 등에서 무시 */ }
}

/** 찜 ON — 클릭 + 저음 토크가 겹쳐 "딸깍-톡" 하고 묵직하게 마무리 */
export function playHeartOn() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    playNoiseClick(ctx, { freq: 4200, q: 1.1, duration: 0.02, gain: 0.18 });
    playThump(ctx, { freqStart: 170, freqEnd: 95, duration: 0.1, gain: 0.24 });
  } catch { /* 토스 앱 외 환경 등에서 무시 */ }
}

/** 찜 OFF — 가벼운 "딸깍" (클릭만, 토크 없이 톤 다운) */
export function playHeartOff() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    playNoiseClick(ctx, { freq: 3200, q: 1.0, duration: 0.018, gain: 0.1 });
  } catch { /* 토스 앱 외 환경 등에서 무시 */ }
}

/** 찜 ON 시 하트 아이콘에 스프링 팝 애니메이션 적용 (Web Animations API, 별도 CSS 불필요) */
export function playHeartPopAnimation(el: SVGElement | HTMLElement | null) {
  if (!el) return;
  try {
    el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.85)', offset: 0.3 },
        { transform: 'scale(1.25)', offset: 0.55 },
        { transform: 'scale(0.95)', offset: 0.75 },
        { transform: 'scale(1)' },
      ],
      { duration: 380, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    );
  } catch { /* 구형 웹뷰 등 미지원 환경에서 무시 */ }
}
