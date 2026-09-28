// The table: two playmats (Misc/field, one player's half of the table) facing each other — the opponent's is the same
// picture turned 180 degrees — with a hand outside each. Zones are placed at their spots on the picture, in percent of the
// mat, so any window size (and any player-made field picture of the same layout) lines up.

/** The playmat picture's size (Misc/field.png); a custom field picture should keep this aspect and layout. */
export const MAT_WIDTH = 1586;
export const MAT_HEIGHT = 992;

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where things are on the viewer's own mat, in percent (measured on Misc/field.png: its slots and the divider). */
export const MAT_ZONES = {
  leader: { left: 86.76, top: 6.35, width: 11.79, height: 25.5 },
  deck: { left: 86.76, top: 34.38, width: 11.79, height: 25.6 },
  cemetery: { left: 86.7, top: 63.81, width: 11.92, height: 26.31 },
  evolveDeck: { left: 1.45, top: 34.27, width: 11.85, height: 25.81 },
  banished: { left: 1.45, top: 64.42, width: 11.92, height: 26.61 },
  // Above the divider (58%): the field. Below it: the EX area.
  field: { left: 14.3, top: 2, width: 71.4, height: 54 },
  ex: { left: 14.3, top: 60, width: 71.4, height: 38.5 },
} satisfies Record<string, Rect>;

export type MatZone = keyof typeof MAT_ZONES;

/** A zone of the opponent's mat: the same spot turned 180 degrees around the mat's center. */
export function zoneRect(zone: MatZone, opponent: boolean): Rect {
  const r = MAT_ZONES[zone];
  return opponent ? { left: 100 - r.left - r.width, top: 100 - r.top - r.height, width: r.width, height: r.height } : r;
}

export const rectStyle = (r: Rect) => ({ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` });

export interface TableLayout {
  matWidth: number;
  matHeight: number;
  /** A card on the field (the mat's slots are 11.8% of its width; a little less leaves gaps). */
  cardWidth: number;
  /** Heights of the strips for the hands, outside the mats, and the width a hand may spread over. */
  handHeight: number;
  opponentHandHeight: number;
  handWidth: number;
  handCardWidth: number;
  opponentHandCardWidth: number;
  /** The room beside each mat (panels, status, buttons). */
  sideWidth: number;
}

const clamp = (x: number, min: number, max: number): number => Math.max(min, Math.min(max, x));

/** A field card is this part of the mat's width (the slots are 11.8%; a little less leaves gaps). */
const CARD_OF_MAT = 0.108;
/** Your hand's cards are this much larger than the field's. */
const HAND_SCALE = 1.3;
const CARD_RATIO = 88 / 63;
const HAND_MARGIN = 16;

/**
 * Sizes for a table area of `width` x `height` pixels: the two mats as large as fit between the opponent's hand strip
 * and yours (just tall enough for your cards), leaving room beside the mats for the panels and buttons.
 */
export function computeLayout(width: number, height: number): TableLayout {
  const opponentHandHeight = clamp(height * 0.06, 36, 72);
  const side = clamp(width * 0.15, 120, 220);
  // height = opponent hand + 2 mats + your hand (card height + margin), your cards sized from the mat.
  const handPerMat = (MAT_WIDTH / MAT_HEIGHT) * CARD_OF_MAT * HAND_SCALE * CARD_RATIO;
  const byHeight = (height - opponentHandHeight - HAND_MARGIN - 8) / (2 + handPerMat);
  const byWidth = ((width - 2 * side) * MAT_HEIGHT) / MAT_WIDTH;
  const matHeight = Math.max(120, Math.min(byHeight, byWidth));
  const matWidth = (matHeight * MAT_WIDTH) / MAT_HEIGHT;
  const cardWidth = matWidth * CARD_OF_MAT;
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
  };
}
