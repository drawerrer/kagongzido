import { useEffect, useState } from 'react';
import LoadingBearImg from '../assets/interaction/Loading.png';

// 지도/카페 데이터를 처음 불러오는 동안 보여주는 전체화면 로딩 오버레이.
// visible이 false로 바뀌면 페이드아웃(400ms) 후 렌더 트리에서 완전히 제거됨
export default function LoadingScreen({ visible }: { visible: boolean }) {
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: '#F3F3F3',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      transition: 'opacity 400ms ease',
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {/* 둥둥 떠 있는 느낌 — 회전 없이 위아래로만 천천히 오르내리고,
          정점에서 아주 살짝 커져 부력이 실린 것처럼 보이게 함.
          무한 반복이지만 로딩이 끝나면 오버레이째 사라지는 일시적 모션 */}
      <style>{`
        @keyframes loading-bear-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-19px) scale(1.015); }
        }
        .loading-bear {
          width: 140px;
          animation: loading-bear-float 1400ms ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-bear { animation: none; }
        }
      `}</style>
      <img src={LoadingBearImg} alt="" className="loading-bear" />
      <p style={{ marginTop: 20, fontSize: 15, fontWeight: 500, color: '#6B7684' }}>
        근처 카페를 찾고 있어요
      </p>
    </div>
  );
}
