import type { CardDefinition } from "../model/card";
import type { Engine } from "../engine/engine";
import { hasCardText, type DeckList } from "../engine/deck";
import { randomInt, seedRng } from "../rng/rng";

/**
 * The cards a random deck can use: implemented, not tokens or leaders, one definition per
 * double-faced card. Main-deck cards and evolve-deck cards (evolved and advanced, CR 6.1.1.3).
 */
export function deckPool(engine: Engine, cards: readonly CardDefinition[] = engine.db.all()): {
  main: CardDefinition[];
  evolve: CardDefinition[];
} {
  const usable = cards.filter(
    (c) => (engine.scripts[c.id] !== undefined || !hasCardText(c)) && !c.token && c.type !== "leader" && c.frontFace === undefined,
  );
  return {
    main: usable.filter((c) => !c.evolved && !c.advanced),
    evolve: usable.filter((c) => c.evolved || c.advanced),
  };
}

/**
 * A random 40-card deck with a 10-card evolve deck from the pool, for fuzzing. It ignores the
 * construction rules, so games using it need `deckRestrictions: false`.
 */
export function randomDeck(pool: { main: readonly CardDefinition[]; evolve: readonly CardDefinition[] }, seed: string | number): DeckList {
  const rng = seedRng(`deck:${seed}`);
  return {
    main: Array.from({ length: 40 }, () => pool.main[randomInt(rng, pool.main.length)]!.id),
    evolve: Array.from({ length: 10 }, () => pool.evolve[randomInt(rng, pool.evolve.length)]!.id),
  };
}
