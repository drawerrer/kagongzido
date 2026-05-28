// 폴백용 로고 — 투명 배경 버전 (logo.png 는 흰 배경이 있어 다른 배경색 위에 얹으면 경계가 보임)
import LogoImg from '../assets/LOGO/logo_mockup.png';

/**
 * 카페 썸네일/카드/아바타에 사진이 없을 때 표시하는 로고 폴백.
 * ☕ 이모지를 대체 — 모든 자리에 동일한 카공지도 로고를 통일된 톤으로 노출.
 *
 * 사용 예
 *  - 정사각형 카드 가운데에 25% 크기로 살짝:  <CafePlaceholder size="25%" />
 *  - 작은 인라인 아바타 (52px 내부에 22px):    <CafePlaceholder size={22} />
 *
 * opacity 기본값 0.75 — 스트로크 포함 로고에 약간의 흐림 효과를 더해 폴백 분위기 유지
 * (필요 시 prop 으로 override)
 */
export interface CafePlaceholderProps {
  /** 픽셀(number) 또는 부모 대비 비율 문자열('25%') */
  size: number | string;
  /** 기본 0.75 — 스트로크 포함 로고 톤. 다크 배경에서도 식별 가능 */
  opacity?: number;
  /** 추가 인라인 스타일 */
  style?: React.CSSProperties;
}

export default function CafePlaceholder({ size, opacity = 0.75, style }: CafePlaceholderProps) {
  return (
    <img
      src={LogoImg}
      alt="카공지도"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        opacity,
        pointerEvents: 'none',
        ...style,
      }}
      draggable={false}
    />
  );
}
