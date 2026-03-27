"use client";

interface Props {
  active: boolean;
  onChange: (active: boolean) => void;
}

export default function EcoModeBadge({ active, onChange }: Props) {
  return (
    <div
      onClick={() => onChange(!active)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: `1px solid ${active ? 'var(--eco-green)' : 'var(--eco-muted)'}`,
        borderRadius: '20px',
        padding: '6px 12px',
        fontSize: '12px',
        color: active ? 'var(--eco-green)' : 'var(--eco-muted)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
      }}
    >
      <span>{active ? '✓' : '○'}</span>
      <span>{active ? 'Eco mode active' : 'Eco mode off'}</span>
    </div>
  );
}
