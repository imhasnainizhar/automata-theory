'use client';

import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import type { Stepper } from './useAutoplay';

/** Card that hosts an interactive figure. The tag is a small kicker above the title, never squeezed beside it. */
export function Panel({ title, tag, caption, children, actions }: { title?: ReactNode; tag?: string; caption?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <figure className="panel" style={{ marginInline: 0 }}>
      {(title || tag) && (
        <div className="panel-head">
          {tag && <span className="panel-kicker">{tag}</span>}
          {title && <div className="panel-title">{title}</div>}
        </div>
      )}
      {actions && <div className="panel-actions">{actions}</div>}
      {children}
      {caption && <figcaption className="panel-caption">{caption}</figcaption>}
    </figure>
  );
}

/** Equal-width segmented control. Never wraps: labels truncate, and with icons they stack under the icon on narrow screens. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className={`seg${options.some((o) => o.icon) ? ' with-icons' : ''}`}
      role="tablist"
      aria-label={label}
      style={{ ['--n' as string]: options.length, ['--i' as string]: i }}
    >
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={`seg-btn${o.value === value ? ' on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The input string field plus quick presets. */
export function InputBar({
  value,
  onChange,
  onEnter,
  label = 'Input',
  presets,
  maxLength = 24,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  label?: string;
  presets?: string[];
  maxLength?: number;
}) {
  return (
    <>
      <div className="field input-bar">
        <label>{label}</label>
        <input
          value={value}
          spellCheck={false}
          autoComplete="off"
          aria-label={label}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.replace(/\s+/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          placeholder="ε (empty)"
        />
      </div>
      {presets && presets.length > 0 && (
        <div className="presets" aria-label="Try these inputs">
          {presets.map((p) => (
            <button key={p || 'eps'} type="button" className={`preset${p === value ? ' on' : ''}`} onClick={() => onChange(p)}>
              {p || 'ε'}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Playback bar: rewind, step back, play/pause, step forward, speed. Fits one row on a phone. */
export function Transport({ s, stepWord = 'step' }: { s: Stepper; stepWord?: string }) {
  return (
    <div className="transport" role="group" aria-label="Playback">
      <button type="button" className="t-btn" onClick={s.rewind} disabled={s.atStart && !s.playing} aria-label="Rewind to start" title="Rewind">
        <Icon name="skipBack" />
      </button>
      <button type="button" className="t-btn" onClick={s.back} disabled={s.atStart} aria-label={`Previous ${stepWord}`} title={`Previous ${stepWord}`}>
        <Icon name="stepBack" />
      </button>
      <button type="button" className="t-btn t-play" onClick={s.toggle} aria-label={s.playing ? 'Pause' : s.atEnd ? 'Replay' : 'Play'}>
        <Icon name={s.playing ? 'pause' : s.atEnd && s.last > 0 ? 'reset' : 'play'} />
        <span>{s.playing ? 'Pause' : s.atEnd && s.last > 0 ? 'Replay' : 'Run'}</span>
      </button>
      <button type="button" className="t-btn" onClick={s.forward} disabled={s.atEnd} aria-label={`Next ${stepWord}`} title={`Next ${stepWord}`}>
        <Icon name="step" />
      </button>
      <button type="button" className="t-btn t-speed" onClick={s.cycleSpeed} aria-label={`Speed ${s.speed}×, tap to change`} title="Playback speed">
        {s.speed}×
      </button>
      <span className="t-count" aria-live="off">
        {s.k}<small>/{s.last}</small>
      </span>
    </div>
  );
}

export function Verdict({ ok, children }: { ok: boolean; children?: ReactNode }) {
  return (
    <span className={`verdict ${ok ? 'ok' : 'bad'}`}>
      {ok ? '✓ Accepted' : '✗ Rejected'}
      {children}
    </span>
  );
}
