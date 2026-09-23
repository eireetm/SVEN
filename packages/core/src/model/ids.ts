/** CR 1.1.1 — a standard game has exactly two players. */
export type PlayerId = 0 | 1;

/**
 * Identity of a card *object*. CR 4.1.4: a card that moves to a different zone is a new card
 * in that zone, so every zone move assigns a fresh CardId. Persistent effects keyed by the old
 * id therefore stop applying automatically (CR 10.9.2).
 */
export type CardId = string;

export const PLAYERS: readonly PlayerId[] = [0, 1];

export function opponentOf(p: PlayerId): PlayerId {
  return p === 0 ? 1 : 0;
}
