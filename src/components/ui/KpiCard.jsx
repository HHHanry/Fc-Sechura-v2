import React, { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

/**
 * KPI Card con count-up animado al cambiar el valor.
 * Reemplaza los 4 bloques duplicados de Dashboard.
 */
const useCountUp = (target, duration = 800) => {
  const [val, setVal] = useState(0);
  const start = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) {
      setVal(target);
      return;
    }
    cancelAnimationFrame(rafId.current);
    start.current = null;
    const from = val;
    const tick = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (progress < 1) rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return val;
};

export const KpiCard = ({ label, value, suffix = '', accent = 'brand', icon, hint, loading, format }) => {
  const numeric = typeof value === 'number';
  const animated = useCountUp(numeric ? value : 0);
  const displayValue = numeric ? (format ? format(animated) : animated) : value;

  const accentColor = {
    brand:   'var(--sn-brand-glow)',
    success: 'var(--sn-success)',
    warn:    'var(--sn-warn)',
    crit:    'var(--sn-crit)',
    elite:   'var(--sn-tier-elite)',
  }[accent];

  return (
    <Card interactive style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 80% at 100% 0%, ${accentColor}22 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', padding: 'var(--sn-space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sn-space-3)' }}>
          <span style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-text-muted)' }}>
            {label}
          </span>
          {icon && (
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--sn-radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accentColor}1A`, color: accentColor, border: `1px solid ${accentColor}40`,
            }}>{icon}</div>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--sn-font-display)',
          fontSize: 'var(--sn-fs-3xl)', fontWeight: 800, lineHeight: 1,
          color: 'var(--sn-text-primary)', letterSpacing: 'var(--sn-tracking-tight)',
        }}>
          {loading ? <Skeleton width={120} height={40} /> : <>{displayValue}{suffix}</>}
        </div>
        {hint && (
          <div style={{ marginTop: 'var(--sn-space-3)', fontSize: 'var(--sn-fs-sm)', color: 'var(--sn-text-muted)' }}>
            {hint}
          </div>
        )}
      </div>
    </Card>
  );
};
