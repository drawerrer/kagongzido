interface WorldcupChoiceCardProps {
  image: string;
  label: string;
  onClick: () => void;
  /** 선택된 카드 효과 — Figma Drop shadow(0 0 10 blur, #252525 30%) 반영 */
  selected?: boolean;
}

export default function WorldcupChoiceCard({ image, label, onClick, selected = false }: WorldcupChoiceCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: '#ffffff', border: '1px solid rgba(37,37,37,0.1)', borderRadius: 8,
        padding: '20px 10px', gap: 20, cursor: 'pointer',
        boxShadow: selected ? '0 0 10px rgba(37,37,37,0.3)' : 'none',
        transition: 'box-shadow 0.15s',
      }}
    >
      <img src={image} alt={label} style={{ width: '100%', aspectRatio: '144 / 155', objectFit: 'cover', borderRadius: 8 }} />
      <span style={{ fontSize: 15, fontWeight: 510, color: '#4E5968' }}>{label}</span>
    </button>
  );
}
