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

/** Where a visible card is: its side's player and zone (a leader: "leader"); null for the resolution zone's cards. */
export function zoneOf(view: PlayerView, id: string): { player: PlayerSideView["id"]; zone: SideZone | "leader" } | null {
  const here = (card: CardView | HiddenCardView | null): boolean => !!card && !card.hidden && card.id === id;
  for (const side of view.players) {
    if (here(side.leader)) return { player: side.id, zone: "leader" };
    const zone = SIDE_ZONES.find((z) => (side[z] as readonly (CardView | HiddenCardView)[]).some(here));
    if (zone) return { player: side.id, zone };
  }
  return null;
}

/** The side a visible card is on (undefined for the resolution zone's cards). */
export function sideOf(view: PlayerView, id: string): PlayerSideView | undefined {
  const here = (card: CardView | HiddenCardView | null): boolean => !!card && !card.hidden && card.id === id;
  return view.players.find((side) => here(side.leader) || SIDE_ZONES.some((zone) => (side[zone] as readonly (CardView | HiddenCardView)[]).some(here)));
}

/**
 * Whether a card is on the table as a card of its own, which a person can click there: a leader, a card in a hand, on the
 * field, in the EX area or linked to a follower (race, drive, equipment zones), or in the trigger zone. Cards in piles
 * (cemetery, banished, evolve deck) and in the deck are not.
 */
export function isOnTable(view: PlayerView, id: string): boolean {
  const here = (card: CardView | HiddenCardView | null): boolean => !!card && !card.hidden && card.id === id;
  return view.players.some(
    (side) => here(side.leader) || [side.hand, side.field, side.ex, side.raceZone, side.driveZone, side.equipmentZone, side.triggerZone].some((zone) => (zone as readonly (CardView | HiddenCardView)[]).some(here)),
  );
}
