'use client';

import type { ReactNode } from 'react';
import { Icon } from '../Icon';

export function Panel({ title, tag, caption, children, actions }: { title?: ReactNode; tag?: string; caption?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <figure className="panel" style={{ marginInline: 0 }}>
      {(title || tag || actions) && (
        <div className="panel-head">
          <div className="panel-title">
            {tag && <span className="tag">{tag}</span>}
            {title}
          </div>
          {actions}
        </div>
      )}
      {children}
      {caption && <figcaption className="panel-caption">{caption}</figcaption>}
    </figure>
  );
}

export function SimControls({
  value,
  onChange,
  onReset,
  onStep,
  playing,
  onTogglePlay,
  canStep,
  label = 'Input',
  presets,
  stepLabel = 'Step',
}: {
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  onStep: () => void;
  playing: boolean;
  onTogglePlay: () => void;
  canStep: boolean;
  label?: string;
  presets?: string[];
  stepLabel?: string;
}) {
  return (
    <>
      <div className="controls">
        <div className="field">
          <label>{label}</label>
          <input
            value={value}
            spellCheck={false}
            autoComplete="off"
            aria-label={label}
            onChange={(e) => onChange(e.target.value.replace(/\s+/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && onTogglePlay()}
            placeholder="ε (empty)"
          />
        </div>
        <button type="button" className="pill-btn" onClick={onReset} aria-label="Reset">
          <Icon name="reset" /> Reset
        </button>
        <button type="button" className="pill-btn" onClick={onStep} disabled={!canStep}>
          <Icon name="step" /> {stepLabel}
        </button>
        <button type="button" className="pill-btn primary" onClick={onTogglePlay}>
          <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'Pause' : 'Run'}
        </button>
      </div>
      {presets && presets.length > 0 && (
        <div className="presets" aria-label="Try these inputs">
          {presets.map((p) => (
            <button key={p || 'eps'} type="button" className="preset" onClick={() => onChange(p)}>
              {p || 'ε'}
            </button>
          ))}
        </div>
      )}
    </>
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
