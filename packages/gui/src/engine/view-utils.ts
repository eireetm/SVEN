import type { CardView, HiddenCardView, PlayerSideView, PlayerView } from "@sve/core";

/** The zones of a player's side that hold cards, in the order the GUI lists them. */
export const SIDE_ZONES = [
  "hand",
  "field",
  "ex",
  "cemetery",
  "banished",
  "evolveDeck",
  "evolveZone",
  "raceZone",
  "driveZone",
  "triggerZone",
  "equipmentZone",
] as const satisfies readonly (keyof PlayerSideView)[];

export type SideZone = (typeof SIDE_ZONES)[number];

/** Every card of a view the viewer may see (leaders and the resolution zone included). */
export function forEachCard(view: PlayerView, fn: (card: CardView) => void): void {
  const visit = (card: CardView | HiddenCardView | null): void => {
    if (card && !card.hidden) fn(card);
  };
  for (const side of view.players) {
    visit(side.leader);
    for (const zone of SIDE_ZONES) (side[zone] as readonly (CardView | HiddenCardView)[]).forEach(visit);
  }
  view.resolution.forEach(visit);
}

/** A visible card of the view by id. */
export function findCard(view: PlayerView, id: string): CardView | null {
  let found: CardView | null = null;
  forEachCard(view, (card) => {
    if (card.id === id) found = card;
  });
  return found;
}
