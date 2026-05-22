import React from 'react';

const tones = {
  neutral: { bg: 'rgba(148,163,184,0.12)', fg: 'var(--sn-text-secondary)', border: 'var(--sn-border-soft)' },
  brand:   { bg: 'color-mix(in srgb, var(--sn-brand-glow) 14%, transparent)',  fg: 'var(--sn-brand-glow)',     border: 'color-mix(in srgb, var(--sn-brand-glow) 40%, transparent)' },
  success: { bg: 'var(--sn-success-soft)', fg: 'var(--sn-success)',        border: 'rgba(16,185,129,0.40)' },
  warn:    { bg: 'var(--sn-warn-soft)',    fg: 'var(--sn-warn)',           border: 'rgba(245,158,11,0.40)' },
  crit:    { bg: 'var(--sn-crit-soft)',    fg: 'var(--sn-crit)',           border: 'rgba(239,68,68,0.40)' },
  elite:   { bg: 'rgba(251,191,36,0.14)',  fg: 'var(--sn-tier-elite)',     border: 'rgba(251,191,36,0.45)' },
  info:    { bg: 'var(--sn-info-soft)',    fg: 'var(--sn-info)',           border: 'rgba(56,189,248,0.40)' },
};

export const Badge = ({ tone = 'neutral', size = 'sm', icon, children, style, ...rest }) => {
  const t = tones[tone] ?? tones.neutral;
  const fontSize = size === 'lg' ? 'var(--sn-fs-sm)' : 'var(--sn-fs-xs)';
  const padding  = size === 'lg' ? '0.35rem 0.8rem' : '0.22rem 0.6rem';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 'var(--sn-radius-pill)',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        fontFamily: 'var(--sn-font-ui)',
        fontWeight: 700,
        fontSize,
        letterSpacing: 'var(--sn-tracking-wide)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
};
