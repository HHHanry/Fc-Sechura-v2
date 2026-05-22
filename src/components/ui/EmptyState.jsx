import React from 'react';

export const EmptyState = ({ icon, title, description, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--sn-space-7) var(--sn-space-5)',
      color: 'var(--sn-text-muted)',
      gap: 'var(--sn-space-3)',
    }}
  >
    {icon && (
      <div style={{
        width: 64, height: 64,
        borderRadius: 'var(--sn-radius-lg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'color-mix(in srgb, var(--sn-brand-glow) 10%, transparent)',
        border: '1px solid var(--sn-border-faint)',
        color: 'var(--sn-brand-glow)',
        fontSize: 26,
      }}>{icon}</div>
    )}
    {title && (
      <h4 style={{
        margin: 0, fontFamily: 'var(--sn-font-display)',
        color: 'var(--sn-text-primary)', fontSize: 'var(--sn-fs-md)', fontWeight: 700,
      }}>{title}</h4>
    )}
    {description && (
      <p style={{ margin: 0, fontSize: 'var(--sn-fs-sm)', maxWidth: 360 }}>{description}</p>
    )}
    {action}
  </div>
);
