// The table: two playmats (one player's half of the table each) facing each other — the opponent's is the same picture
// turned 180 degrees — with a hand outside each. The picture (Misc/field.png, or public/textures/board/field.*) has drawn
// slots: the leader and four piles at the sides, five field slots above the divider and five EX area slots below it.
//
// The table shows the picture wider than it is drawn, without stretching anything drawn: the picture is cut into its pieces
// (each pile and slot, the divider's ornament and its two ends), and the room between the piles and the slots grows by
// SPREAD, so that engaged cards (lying sideways, as wide as a card is tall, CR 4.2.2) never overlap each other or a pile.
// Only the drawn part of the picture's height is shown (TOP to BOTTOM), so the mats and their cards can be larger.
// Positions are in percent of that wide mat, so any window size (and any player-made picture of the same layout) lines up.

/** The playmat picture's size; a custom field picture should keep this size and layout. */
export const MAT_WIDTH = 1586;
export const MAT_HEIGHT = 992;

/** A rectangle in the picture's pixels, glow included (measured on the alpha channel of Misc/field.png). */
export interface PictureRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rectangle on the wide mat, in percent of it. */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const PILES = {
  leader: { x: 1375, y: 62, w: 190, h: 255 },
  deck: { x: 1375, y: 339, w: 191, h: 258 },
  cemetery: { x: 1375, y: 632, w: 190, h: 264 },
  evolveDeck: { x: 22, y: 339, w: 191, h: 258 },
  banished: { x: 22, y: 638, w: 192, h: 267 },
} satisfies Record<string, PictureRect>;

export type PileZone = keyof typeof PILES;

/** The field (CR 4.4) above the divider and the EX area (CR 4.8) below it: five slots each, their limits (4.4.4.1, 4.8.3.1). */
export type SlotZone = "field" | "ex";
export const SLOT_COUNT = 5;
const SLOT_XS = [234, 465, 696, 928, 1159];
const SLOT_Y: Record<SlotZone, number> = { field: 195, ex: 635 };
const SLOT_W = 196;
const SLOT_H = 273;

const DIVIDER = { x: 238, y: 564, w: 1111, h: 24 };
/** The divider's ornament, in the middle: kept at its size; the plain line on each side of it is stretched. */
const ORNAMENT = { x: 645, w: 295 };

/** The part of the picture's height the mat shows: its drawn parts (the leader's top to the EX slots' bottom), a little more. */
const TOP = 54;
const BOTTOM = 916;
/** The mat's height, in picture pixels. */
export const MAT_BOX_HEIGHT = BOTTOM - TOP;

/** The middle of the picture (between the left piles' right edge and the right piles' left edge) is shown SPREAD wider. */
const LEFT = 214;
const RIGHT = 1375;
const SPREAD = 1.17;
const EXTRA = (RIGHT - LEFT) * (SPREAD - 1);

/** The wide mat's width, in picture pixels. */
export const WIDE_WIDTH = MAT_WIDTH + EXTRA;

/** A card on the mat, in picture pixels: it fits inside a slot's outline. */
export const CARD_WIDTH = 182;
const CARD_RATIO = 88 / 63;

/** Where a picture x goes on the wide mat: the left piles stay, the right ones move by EXTRA, the middle spreads. */
function wideX(x: number): number {
  if (x <= LEFT) return x;
  if (x >= RIGHT) return x + EXTRA;
  return LEFT + (x - LEFT) * SPREAD;
}

const toRect = (x: number, y: number, w: number, h: number): Rect => ({
  left: (x / WIDE_WIDTH) * 100,
  top: ((y - TOP) / MAT_BOX_HEIGHT) * 100,
  width: (w / WIDE_WIDTH) * 100,
  height: (h / MAT_BOX_HEIGHT) * 100,
});

/** A piece kept at its size, its middle moved to where the middle goes. */
const kept = (r: PictureRect): Rect => toRect(wideX(r.x + r.w / 2) - r.w / 2, r.y, r.w, r.h);

/** The same spot on the opponent's mat: turned 180 degrees around the mat's center. */
const turned = (r: Rect, opponent: boolean): Rect => (opponent ? { left: 100 - r.left - r.width, top: 100 - r.top - r.height, width: r.width, height: r.height } : r);

/** Where the leader or a pile is. */
export function pileRect(zone: PileZone, opponent: boolean): Rect {
  return turned(kept(PILES[zone]), opponent);
}

/** Where slot `index` of the field or the EX area is (0 is the player's own leftmost). */
export function slotRect(zone: SlotZone, index: number, opponent: boolean): Rect {
  return turned(kept({ x: SLOT_XS[index]!, y: SLOT_Y[zone], w: SLOT_W, h: SLOT_H }), opponent);
}

/** The whole row of the field or the EX area: the zone's outline, and where cards go when there are more than slots. */
export function rowRect(zone: SlotZone, opponent: boolean): Rect {
  const first = kept({ x: SLOT_XS[0]!, y: SLOT_Y[zone], w: SLOT_W, h: SLOT_H });
  const last = kept({ x: SLOT_XS[SLOT_COUNT - 1]!, y: SLOT_Y[zone], w: SLOT_W, h: SLOT_H });
  return turned({ left: first.left, top: first.top, width: last.left + last.width - first.left, height: first.height }, opponent);
}

/** A piece of the picture and where it goes on the wide mat. */
export interface Piece {
  src: PictureRect;
  dst: Rect;
  /** A slot or a pile (drawn with an outline when there is no picture). */
  kind: "slot" | "pile" | "line";
}

function dividerPieces(): Piece[] {
  const middle = wideX(ORNAMENT.x + ORNAMENT.w / 2);
  const ornamentLeft = middle - ORNAMENT.w / 2;
  const ornamentRight = middle + ORNAMENT.w / 2;
  const start = wideX(DIVIDER.x);
  const end = wideX(DIVIDER.x + DIVIDER.w);
  const { y, h } = DIVIDER;
  return [
    { src: { x: DIVIDER.x, y, w: ORNAMENT.x - DIVIDER.x, h }, dst: toRect(start, y, ornamentLeft - start, h), kind: "line" },
    { src: { x: ORNAMENT.x, y, w: ORNAMENT.w, h }, dst: toRect(ornamentLeft, y, ORNAMENT.w, h), kind: "line" },
    { src: { x: ORNAMENT.x + ORNAMENT.w, y, w: DIVIDER.x + DIVIDER.w - ORNAMENT.x - ORNAMENT.w, h }, dst: toRect(ornamentRight, y, end - ornamentRight, h), kind: "line" },
  ];
}

/** The picture's pieces on the viewer's own mat (the opponent's picture is turned as a whole). */
export const PIECES: readonly Piece[] = [
  ...Object.values(PILES).map((src): Piece => ({ src, dst: kept(src), kind: "pile" })),
  ...(["field", "ex"] as const).flatMap((zone) =>
    SLOT_XS.map((x): Piece => {
      const src = { x, y: SLOT_Y[zone], w: SLOT_W, h: SLOT_H };
      return { src, dst: kept(src), kind: "slot" };
    }),
  ),
  ...dividerPieces(),
];

/** A piece's box and the part of the picture it shows (background size and position in percent of the box). */
export function pieceStyle(piece: Piece): Record<string, string> {
  const { src, dst } = piece;
  return {
    ...rectStyle(dst),
    backgroundSize: `${(MAT_WIDTH / src.w) * 100}% ${(MAT_HEIGHT / src.h) * 100}%`,
    backgroundPosition: `${(src.x / (MAT_WIDTH - src.w)) * 100}% ${(src.y / (MAT_HEIGHT - src.h)) * 100}%`,
  };
}

export const rectStyle = (r: Rect) => ({ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` });

/** The distance between two slots' middles and the room an engaged card needs, in picture pixels (for the tests). */
export const SLOT_PITCH = (SLOT_XS[1]! - SLOT_XS[0]!) * SPREAD;
export const ENGAGED_WIDTH = CARD_WIDTH * CARD_RATIO;

export interface TableLayout {
  matWidth: number;
  matHeight: number;
  /** A card on the mat. */
  cardWidth: number;
  /** Heights of the strips for the hands, outside the mats, and the width a hand may spread over. */
  handHeight: number;
  opponentHandHeight: number;
  handWidth: number;
  handCardWidth: number;
  opponentHandCardWidth: number;
  /** The room beside each mat (panels, status, buttons). */
  sideWidth: number;
  /**
   * A small screen (a phone held sideways): the mats take the whole height, your hand is beside your mat
   * (bottom right), the panels and the status are on the left, the buttons on the right.
   */
  compact: boolean;
}

const clamp = (x: number, min: number, max: number): number => Math.max(min, Math.min(max, x));

/** Your hand's cards are this much larger than the mat's. */
const HAND_SCALE = 1.3;
const HAND_MARGIN = 16;

/** Tables less tall than this are laid out for a small screen (app/compact.ts has the same limit for the screen). */
export const COMPACT_HEIGHT = 560;

/**
 * Sizes for a table area of `width` x `height` pixels: the two mats as large as fit between the opponent's hand strip
 * and yours (just tall enough for your cards), leaving room beside the mats for the panels and buttons.
 */
export function computeLayout(width: number, height: number): TableLayout {
  if (height < COMPACT_HEIGHT) return computeCompactLayout(width, height);
  const opponentHandHeight = clamp(height * 0.06, 36, 72);
  const side = clamp(width * 0.13, 110, 220);
  // height = opponent hand + 2 mats + your hand (card height + margin), cards sized from the mat's height.
  const cardPerMat = CARD_WIDTH / MAT_BOX_HEIGHT;
  const handPerMat = cardPerMat * HAND_SCALE * CARD_RATIO;
  const byHeight = (height - opponentHandHeight - HAND_MARGIN - 8) / (2 + handPerMat);
  const byWidth = ((width - 2 * side) * MAT_BOX_HEIGHT) / WIDE_WIDTH;
  const matHeight = Math.max(120, Math.min(byHeight, byWidth));
  const matWidth = (matHeight * WIDE_WIDTH) / MAT_BOX_HEIGHT;
  const cardWidth = matHeight * cardPerMat;
  const handCardWidth = cardWidth * HAND_SCALE;
  return {
    matWidth,
    matHeight,
    cardWidth,
    handHeight: handCardWidth * CARD_RATIO + HAND_MARGIN,
    opponentHandHeight,
    handWidth: Math.max(matWidth, Math.min(width - 32, matWidth + side)),
    handCardWidth,
    opponentHandCardWidth: (opponentHandHeight - 6) / CARD_RATIO,
    sideWidth: Math.max(90, (width - matWidth) / 2 - 20),
    compact: false,
  };
}

/**
 * A small screen: the height is what limits the mats, so they take all of it but a thin strip for the opponent's hand; your
 * hand goes beside your mat, fanned in the room on the right (its cards larger than the mat's, as they are read).
 */
function computeCompactLayout(width: number, height: number): TableLayout {
  const opponentHandHeight = clamp(height * 0.06, 20, 30);
  const side = clamp(width * 0.2, 150, 280);
  const cardPerMat = CARD_WIDTH / MAT_BOX_HEIGHT;
  const byHeight = (height - opponentHandHeight - 6) / 2;
  const byWidth = ((width - 2 * side) * MAT_BOX_HEIGHT) / WIDE_WIDTH;
  const matHeight = Math.max(100, Math.min(byHeight, byWidth));
  const matWidth = (matHeight * WIDE_WIDTH) / MAT_BOX_HEIGHT;
  const cardWidth = matHeight * cardPerMat;
  const sideWidth = Math.max(120, (width - matWidth) / 2 - 12);
  const handWidth = sideWidth - 8;
  const handCardWidth = clamp(Math.min((height * 0.42) / CARD_RATIO, handWidth * 0.34), cardWidth, cardWidth * 2);
  return {
    matWidth,
    matHeight,
    cardWidth,
    handHeight: handCardWidth * CARD_RATIO + 10,
    opponentHandHeight,
    handWidth,
    handCardWidth,
    opponentHandCardWidth: (opponentHandHeight - 4) / CARD_RATIO,
    sideWidth,
    compact: true,
  };
}
