// Spreadsheet-shorts kit — a pixel-ish Excel/Sheets clone rendered in TSX.
// Built series-generic: SheetGrid + FormulaBar + KeyCombo are the primitives for the
// whole Excel series (Flash Fill, XLOOKUP, $ absolute refs, pivot). short-6 (Flash Fill)
// drives them with a per-column type→Ctrl+E→cascade choreography; cue frames are LOCAL.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';
import { EASE_OUT, prog } from './shorts';

export type SheetTheme = 'excel' | 'sheets';

const THEME: Record<
  SheetTheme,
  {
    accent: string;
    gridLine: string;
    head: string;
    headText: string;
    cellText: string;
    fillFlash: string;
    panel: string;
  }
> = {
  excel: {
    accent: '#217346', // classic Excel green
    gridLine: '#d9d9d9',
    head: '#f3f3f3',
    headText: '#5f6368',
    cellText: '#1b1b1b',
    fillFlash: '#54c982',
    panel: '#ffffff',
  },
  sheets: {
    accent: '#1a73e8', // Sheets selects in blue
    gridLine: '#e2e3e5',
    head: '#f8f9fa',
    headText: '#5f6368',
    cellText: '#202124',
    fillFlash: '#8ab4f8',
    panel: '#ffffff',
  },
};

// Default grid geometry — shared so the hook/loop composed grid and the live demo grid
// line up pixel-for-pixel (a shift between scenes would break the seamless loop).
export type SheetCol = { letter: string; header: string; width: number };
export const SHEET = {
  x: 46,
  yTop: 356,
  gutterW: 64,
  letterH: 44,
  rowH: 72,
  cols: [
    { letter: 'A', header: 'Full Name', width: 280 },
    { letter: 'B', header: 'First Name', width: 240 },
    { letter: 'C', header: 'Email', width: 392 },
  ] as SheetCol[],
};
export const sheetWidth = (cols: SheetCol[] = SHEET.cols) =>
  SHEET.gutterW + cols.reduce((a, c) => a + c.width, 0);

// One rendered cell's view state at the current frame.
export type CellView = {
  text: string;
  box?: 'sel' | 'active' | null; // green selection box / editing box
  cursor?: boolean; // blinking caret after the text (typing)
  flash?: number; // 0..1 green flash as a cascade fills the cell
  mono?: boolean;
};

// =============================================================================
// SHEET GRID — the spreadsheet panel: column letters, row numbers, header row,
// data cells, selection box + fill-handle. Pure render from a cells matrix.
// =============================================================================
export const SheetGrid: React.FC<{
  theme?: SheetTheme;
  cols?: SheetCol[];
  cells: CellView[][]; // [dataRow][col]
  fillHandle?: boolean; // draw the little square on the selected cell's corner
}> = ({ theme = 'excel', cols = SHEET.cols, cells, fillHandle = true }) => {
  const frame = useCurrentFrame();
  const t = THEME[theme];
  const { x, yTop, gutterW, letterH, rowH } = SHEET;
  const nRows = cells.length;
  const gridW = sheetWidth(cols);
  const gridH = letterH + (nRows + 1) * rowH; // +1 = the header-labels row
  const blink = Math.floor(frame / 15) % 2 === 0;

  const colX = (c: number) => gutterW + cols.slice(0, c).reduce((a, col) => a + col.width, 0);

  const cellBox = (kind: 'sel' | 'active', hasHandle: boolean) => (
    <>
      <div
        style={{
          position: 'absolute',
          inset: -1,
          border: `3px solid ${t.accent}`,
          borderRadius: 2,
          boxShadow: kind === 'active' ? `0 0 0 1px ${t.accent}55` : 'none',
          pointerEvents: 'none',
        }}
      />
      {hasHandle ? (
        <div
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 12,
            height: 12,
            background: t.accent,
            border: '2px solid #fff',
            borderRadius: 2,
          }}
        />
      ) : null}
    </>
  );

  const textCell = (cv: CellView, header: boolean) => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontFamily: FONT_BODY,
        fontWeight: header ? 700 : 500,
        // long values (emails) auto-shrink so they never clip the column
        fontSize: header ? 30 : cv.text.length > 15 ? 26 : 31,
        color: header ? '#333' : t.cellText,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {/* green cascade flash */}
      {cv.flash && cv.flash > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            inset: 1,
            background: t.fillFlash,
            opacity: 0.55 * cv.flash,
          }}
        />
      ) : null}
      <span style={{ position: 'relative' }}>{cv.text}</span>
      {cv.cursor && blink ? (
        <span
          style={{
            position: 'relative',
            width: 2,
            height: 38,
            marginLeft: 2,
            background: t.cellText,
          }}
        />
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: yTop,
        width: gridW,
        height: gridH,
        background: t.panel,
        borderRadius: 8,
        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        overflow: 'hidden',
      }}
    >
      {/* ---- column-letter header strip ---- */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: letterH, background: t.head }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: gutterW,
            height: letterH,
            borderRight: `1px solid ${t.gridLine}`,
            borderBottom: `1px solid ${t.gridLine}`,
          }}
        />
        {cols.map((col, c) => (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: colX(c),
              top: 0,
              width: col.width,
              height: letterH,
              borderRight: `1px solid ${t.gridLine}`,
              borderBottom: `1px solid ${t.gridLine}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 26,
              color: t.headText,
            }}
          >
            {col.letter}
          </div>
        ))}
      </div>

      {/* ---- rows: gridRow 0 = header labels (sheet row 1), then data rows ---- */}
      {Array.from({ length: nRows + 1 }).map((_, gr) => {
        const y = letterH + gr * rowH;
        const isHeader = gr === 0;
        const dataRow = gr - 1;
        return (
          <div key={gr} style={{ position: 'absolute', top: y, left: 0, right: 0, height: rowH }}>
            {/* row-number gutter */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: gutterW,
                height: rowH,
                background: t.head,
                borderRight: `1px solid ${t.gridLine}`,
                borderBottom: `1px solid ${t.gridLine}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_BODY,
                fontWeight: 500,
                fontSize: 24,
                color: t.headText,
              }}
            >
              {gr + 1}
            </div>
            {cols.map((col, c) => {
              const cv: CellView = isHeader
                ? { text: col.header }
                : cells[dataRow]?.[c] ?? { text: '' };
              return (
                <div
                  key={c}
                  style={{
                    position: 'absolute',
                    left: colX(c),
                    top: 0,
                    width: col.width,
                    height: rowH,
                    borderRight: `1px solid ${t.gridLine}`,
                    borderBottom: `1px solid ${t.gridLine}`,
                    background: isHeader ? '#fafafa' : t.panel,
                  }}
                >
                  {textCell(cv, isHeader)}
                  {!isHeader && (cv.box === 'sel' || cv.box === 'active')
                    ? cellBox(cv.box, fillHandle)
                    : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// FORMULA BAR — name box (active cell ref) + fx + live content. Sits above the grid.
// =============================================================================
export const FormulaBar: React.FC<{
  theme?: SheetTheme;
  cellRef: string;
  content: string;
  cursor?: boolean;
  y?: number;
}> = ({ theme = 'excel', cellRef, content, cursor = false, y = SHEET.yTop - 70 }) => {
  const frame = useCurrentFrame();
  const t = THEME[theme];
  const blink = Math.floor(frame / 15) % 2 === 0;
  const gridW = sheetWidth();
  return (
    <div
      style={{
        position: 'absolute',
        left: SHEET.x,
        top: y,
        width: gridW,
        height: 52,
        display: 'flex',
        alignItems: 'stretch',
        background: '#ffffff',
        border: `1px solid ${t.gridLine}`,
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
      }}
    >
      <div
        style={{
          width: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: `1px solid ${t.gridLine}`,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 26,
          color: t.cellText,
        }}
      >
        {cellRef}
      </div>
      <div
        style={{
          width: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: `1px solid ${t.gridLine}`,
          fontFamily: FONT_DISPLAY,
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 26,
          color: t.headText,
        }}
      >
        fx
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 28,
          color: t.cellText,
        }}
      >
        {content}
        {cursor && blink ? (
          <span style={{ width: 2, height: 30, marginLeft: 1, background: t.cellText }} />
        ) : null}
      </div>
    </div>
  );
};

// =============================================================================
// KEY COMBO — animated keycaps (Ctrl + E) that press and glow. The hero shortcut.
// press: 0..1 pulse (composition passes a sin pulse at the keystroke frame).
// glow:  0..1 accent halo.
// =============================================================================
export const KeyCombo: React.FC<{
  keys: string[];
  x?: number; // center x
  y: number; // center y
  press?: number;
  glow?: number;
  theme?: SheetTheme;
  scale?: number;
}> = ({ keys, x = 540, y, press = 0, glow = 0, theme = 'excel', scale = 1 }) => {
  const t = THEME[theme];
  const cap = (label: string, i: number) => {
    const wide = label.length > 1;
    return (
      <div
        key={i}
        style={{
          minWidth: wide ? 118 : 74,
          height: 74,
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background: press > 0.3 ? '#ececec' : '#fdfdfd',
          border: `2px solid ${glow > 0.05 ? t.accent : '#c9c9c9'}`,
          borderBottom: `${6 - press * 4}px solid ${glow > 0.05 ? t.accent : '#b6b6b6'}`,
          boxShadow:
            glow > 0.05
              ? `0 0 ${30 * glow}px ${t.accent}bb, 0 8px 18px rgba(0,0,0,0.35)`
              : '0 8px 18px rgba(0,0,0,0.35)',
          transform: `translateY(${press * 4}px)`,
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 34,
          color: '#2a2a2a',
        }}
      >
        {label}
      </div>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: '#ffffff' }}>+</span>
          ) : null}
          {cap(k, i)}
        </React.Fragment>
      ))}
    </div>
  );
};

// A short 0→1→0 keystroke pulse for KeyCombo.press.
export const pressPulse = (frame: number, at: number, len = 12) =>
  Math.sin(Math.PI * prog(frame, at, at + len));

// Convenience: build the row of CellViews for a Flash-Fill target column at `frame`.
// row 0 is the typed example; rows 1..n cascade-fill from `cascadeStart` with `stagger`.
export type FlashCue = {
  typeStart: number;
  typeEnd: number;
  cascadeStart: number;
  stagger: number;
};
export const flashFillCol = (
  vals: string[],
  cue: FlashCue,
  frame: number,
): CellView[] =>
  vals.map((val, i) => {
    if (i === 0) {
      if (frame < cue.typeStart) return { text: '' };
      if (frame < cue.typeEnd) {
        const p = prog(frame, cue.typeStart, cue.typeEnd);
        return { text: val.slice(0, Math.round(p * val.length)), cursor: true, box: 'active' };
      }
      return { text: val, box: frame < cue.cascadeStart ? 'active' : null };
    }
    const fillFrame = cue.cascadeStart + (i - 1) * cue.stagger;
    if (frame < fillFrame) return { text: '' };
    return { text: val, flash: 1 - EASE_OUT(prog(frame, fillFrame, fillFrame + 12)) };
  });
