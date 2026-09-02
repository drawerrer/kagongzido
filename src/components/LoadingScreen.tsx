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
      {/* 제자리 걸음 — 좌우 이동 없이, 발을 내딛듯 위아래로 튀면서 살짝 좌우로 기울여
          체중이 한쪽 발에서 다른 쪽 발로 옮겨가는 느낌을 냄(다리 프레임이 따로 없는 정지 이미지라 흉내만 냄) */}
      <style>{`
        @keyframes loading-bear-walk {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-7px) rotate(-4deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-7px) rotate(4deg); }
        }
      `}</style>
      <img
        src={LoadingBearImg}
        alt=""
        style={{ width: 140, transformOrigin: 'bottom center', animation: 'loading-bear-walk 900ms ease-in-out infinite' }}
      />
      <p style={{ marginTop: 20, fontSize: 15, fontWeight: 500, color: '#6B7684' }}>
        근처 카페를 찾고 있어요
      </p>
    </div>
  );
}
