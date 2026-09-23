import type { CardDefinition, DefId, PrintingId } from "../model/card";
import { CardDataError } from "./normalize";

/**
 * Placeholder leader used when a deck list names no leader card (CR 6.1.1.1 requires one;
 * with deck restrictions off we still need a leader object to target / attack, CR 4.3).
 */
export const DEFAULT_LEADER: CardDefinition = {
  id: "SYS-LEADER",
  printings: ["SYS-LEADER"],
  name: "Leader",
  names: { en: "Leader", cn: "主战者", ja: "リーダー" },
  class: "Neutral",
  type: "leader",
  evolved: false,
  token: false,
  traits: [],
  cost: null,
  attack: null,
  defense: null,
  text: { en: "", cn: "", ja: "" },
};

/** Read-only, indexed card pool. Immutable after creation; shared by all games of an engine. */
export class CardDatabase {
  private readonly byId = new Map<DefId, CardDefinition>();
  private readonly byPrinting = new Map<PrintingId, CardDefinition>();
  private readonly byName = new Map<string, CardDefinition[]>();
  private readonly tokensByName = new Map<string, CardDefinition>();

  constructor(defs: readonly CardDefinition[]) {
    const all = defs.some((d) => d.id === DEFAULT_LEADER.id) ? defs : [...defs, DEFAULT_LEADER];
    for (const d of all) {
      if (this.byId.has(d.id)) throw new CardDataError(`duplicate definition id ${d.id}`);
      this.byId.set(d.id, d);
      for (const p of d.printings) {
        if (this.byPrinting.has(p)) throw new CardDataError(`printing ${p} belongs to two definitions`);
        this.byPrinting.set(p, d);
      }
      const named = this.byName.get(d.name);
      if (named) named.push(d);
      else this.byName.set(d.name, [d]);
      if (d.token) {
        // CR 9.1.2.3: a token's information is determined by its name, so names must be unique.
        if (this.tokensByName.has(d.name)) throw new CardDataError(`two tokens named "${d.name}"`);
        this.tokensByName.set(d.name, d);
      }
    }
  }

  /** All definitions, in id order. */
  all(): CardDefinition[] {
    return [...this.byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }

  has(id: DefId): boolean {
    return this.byId.has(id);
  }

  get(id: DefId): CardDefinition {
    const d = this.byId.get(id);
    if (!d) throw new CardDataError(`unknown card definition ${id}`);
    return d;
  }

  hasPrinting(printing: PrintingId): boolean {
    return this.byPrinting.has(printing);
  }

  /** Printing card number (e.g. "BP01-SL01") -> its definition. */
  ofPrinting(printing: PrintingId): CardDefinition {
    const d = this.byPrinting.get(printing);
    if (!d) throw new CardDataError(`unknown card number ${printing}`);
    return d;
  }

  /** Definitions with this canonical name (a base card and its evolved card share a name). */
  named(name: string): readonly CardDefinition[] {
    return this.byName.get(name) ?? [];
  }

  /** CR 9.1.2.3 — token information is looked up by token name. */
  tokenNamed(name: string): CardDefinition | undefined {
    return this.tokensByName.get(name);
  }
}
