import type { CardView, PlayerSideView } from "@sve/core";
import type { Catalog } from "../../app/catalog";

/** What a card on the board looks like: its definition and printing, and whether its back face is up (CR 2.14.3). */
export interface Display {
  def: string;
  printing: string;
  back: boolean;
}

/**
 * An evolved follower shows its evolve card (CR 5.16.1: linked in the evolve zone), a double-faced card the face that is up.
 * The stats the view gives are already the current ones (the core's characteristics, CR 10.9); this is only the art and
 * the printed values to compare with.
 */
export function displayOf(card: CardView, side: PlayerSideView | undefined, catalog: Catalog): Display {
  let shown: CardView = card;
  if (card.evolvedWith && side) shown = side.evolveZone.find((c) => c.id === card.evolvedWith) ?? card;
  const base = catalog.def(shown.def);
  const def = shown.backFace && base?.backFace ? base.backFace : shown.def;
  return { def, printing: shown.printing, back: shown.backFace };
}
