import React from 'react';

export const Skeleton = ({ width = '100%', height = 16, radius = 'var(--sn-radius-sm)', style, className = '' }) => (
  <span
    aria-hidden
    className={className}
    style={{
      display: 'inline-block',
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.18) 50%, rgba(148,163,184,0.08) 100%)',
      backgroundSize: '200% 100%',
      animation: 'sn-shimmer 1.4s linear infinite',
      ...style,
    }}
  />
);

export const SkeletonStack = ({ rows = 3, gap = 8 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height={14} width={`${85 - i * 10}%`} />
    ))}
  </div>
);
