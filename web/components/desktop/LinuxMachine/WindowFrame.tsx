'use client';

/**
 * WindowFrame — individual OS window chrome
 *
 * Responsibilities:
 *   • Title bar with traffic-light controls (close / minimize / maximize)
 *   • Pointer-capture drag — mutates DOM directly mid-drag, dispatches WINDOW_MOVE
 *     on pointerUp to keep the reducer out of every mousemove.
 *   • Focus management — grabs focus when `isFocused` becomes true.
 *   • Keyboard: Escape → minimize; Tab → cycle within the window (focus trap).
 *   • AODA: role="region", aria-labelledby pointing at title span.
 *     Traffic-light buttons have explicit aria-label.
 *     Focus rings use the `.linux-desktop :focus-visible` override in globals.css
 *     (white, 2 px) which passes on all dark backgrounds.
 */

import {
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useMachine } from './MachineContext';
import type { WindowEntry } from './MachineTypes';

export interface WindowFrameProps {
  win: WindowEntry;
  isFocused: boolean;
  children: ReactNode;
}

const TITLE_H = 40; // px — exported so apps can offset their own layout

const FOCUSABLE_SEL = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function WindowFrame({ win, isFocused, children }: WindowFrameProps) {
  const { kernel } = useMachine();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef  = useRef<{
    startX: number; startY: number;
    origX:  number; origY:  number;
  } | null>(null);

  // ── Focus ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFocused) frameRef.current?.focus();
  }, [isFocused]);

  // ── Keyboard ──────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      kernel.minimizeWindow(win.id);
      return;
    }
    if (e.key !== 'Tab') return;

    const frame = frameRef.current;
    if (!frame) return;
    const focusable = Array.from(frame.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
    if (focusable.length < 2) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [kernel, win.id]);

  // ── Drag (pointer capture on the title bar) ────────────────────────────────
  const onTitleDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return; // buttons fire their own click
    if (win.displayState === 'maximized') return;           // can't drag maximized window
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX:  win.position.x, origY: win.position.y,
    };
  }, [win.displayState, win.position.x, win.position.y]);

  const onTitleMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !frameRef.current) return;
    const l = dragRef.current.origX + (e.clientX - dragRef.current.startX);
    const t = Math.max(0, dragRef.current.origY + (e.clientY - dragRef.current.startY));
    // Direct DOM mutation during drag — skips React reconciliation every mousemove
    frameRef.current.style.left = `${l}px`;
    frameRef.current.style.top  = `${t}px`;
  }, []);

  const onTitleUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const newX = dragRef.current.origX + (e.clientX - dragRef.current.startX);
    const newY = Math.max(0, dragRef.current.origY + (e.clientY - dragRef.current.startY));
    kernel.moveWindow(win.id, newX, newY);
    dragRef.current = null;
  }, [kernel, win.id]);

  // ── Window frame focus (click-to-focus any part of window) ────────────────
  const onFramePointerDown = useCallback(() => {
    if (!isFocused) kernel.focusWindow(win.id);
  }, [isFocused, kernel, win.id]);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const isMaximized = win.displayState === 'maximized';

  const frameStyle: CSSProperties = isMaximized
    ? {
        position: 'absolute',
        inset: 0,
        zIndex: win.zIndex,
        border: '1px solid #3d5070',
      }
    : {
        position: 'absolute',
        left:   win.position.x,
        top:    win.position.y,
        width:  win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        border: `1px solid ${isFocused ? '#3d5070' : '#252e3d'}`,
      };

  return (
    <div
      ref={frameRef}
      role="region"
      aria-labelledby={`wintitle-${win.id}`}
      tabIndex={-1}
      style={frameStyle}
      className={[
        'flex flex-col overflow-hidden outline-none',
        isMaximized ? '' : 'rounded-lg',
        isFocused
          ? 'shadow-[0_8px_32px_rgba(0,0,0,0.7)]'
          : 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
      ].join(' ')}
      onPointerDown={onFramePointerDown}
      onKeyDown={handleKeyDown}
    >
      {/* ── Title bar ────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: TITLE_H,
          backgroundColor: isFocused ? '#253047' : '#1a2230',
          flexShrink: 0,
        }}
        className="flex items-center gap-2 px-3 select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
      >
        {/* Traffic lights — close / minimize / maximize */}
        <button
          type="button"
          aria-label={`Close ${win.title}`}
          className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] shrink-0"
          onClick={() => kernel.closeWindow(win.id)}
        />
        <button
          type="button"
          aria-label={`Minimize ${win.title}`}
          className="w-3.5 h-3.5 rounded-full bg-[#febc2e] hover:bg-[#ffb300] shrink-0"
          onClick={() => kernel.minimizeWindow(win.id)}
        />
        <button
          type="button"
          aria-label={isMaximized ? `Restore ${win.title}` : `Maximize ${win.title}`}
          aria-pressed={isMaximized}
          className="w-3.5 h-3.5 rounded-full bg-[#28c840] hover:bg-[#1db534] shrink-0"
          onClick={() =>
            isMaximized
              ? kernel.restoreWindow(win.id)
              : kernel.maximizeWindow(win.id)
          }
        />

        <span
          id={`wintitle-${win.id}`}
          className="flex-1 text-center text-[13px] font-medium text-[#c9d1d9] truncate pointer-events-none"
        >
          {win.title}
        </span>
      </div>

      {/* ── App content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden min-h-0 bg-[#0d1117]">
        {children}
      </div>
    </div>
  );
}
