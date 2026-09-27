// Every card definition (from the engine worker at start), for showing cards and searching them. Read only.
import type { CardLang } from "./settings";
import type { CatalogCard } from "../engine/protocol";

export class Catalog {
  private readonly byDef = new Map<string, CatalogCard>();
  private readonly byPrinting = new Map<string, CatalogCard>();

  constructor(readonly cards: readonly CatalogCard[]) {
    for (const card of cards) {
      this.byDef.set(card.id, card);
      for (const printing of card.printings) this.byPrinting.set(printing, card);
    }
  }

  def(id: string): CatalogCard | undefined {
    return this.byDef.get(id);
  }

  /** The definition of a printing (or of a definition id). */
  printing(id: string): CatalogCard | undefined {
    return this.byPrinting.get(id) ?? this.byDef.get(id);
  }

  /** Cards whose number starts with, or whose name contains, the query (any language). */
  search(query: string, limit = 80): CatalogCard[] {
    const q = query.trim().toLowerCase();
    if (q === "") return [];
    const out: CatalogCard[] = [];
    for (const card of this.cards) {
      const names = [card.name, card.names.en, card.names.cn, card.names.ja].filter((n): n is string => !!n).map((n) => n.toLowerCase());
      const numbers = [card.id, ...card.printings].map((p) => p.toLowerCase());
      if (numbers.some((p) => p.startsWith(q)) || names.some((n) => n.includes(q))) out.push(card);
      if (out.length >= limit) break;
    }
    return out;
  }
}

/** A card's name in the chosen card language (English when missing). */
export function cardName(card: CatalogCard | undefined, lang: CardLang, fallback = "?"): string {
  if (!card) return fallback;
  return (lang === "en" ? card.name : card.names[lang]) || card.name;
}

/** A card's text in the chosen language (English when missing, then the others). */
export function cardText(card: CatalogCard, lang: CardLang): string {
  return card.text[lang] || card.text.en || card.text.ja || card.text.cn || "";
}
