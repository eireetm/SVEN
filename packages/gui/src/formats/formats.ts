// Formats: how decks are built. The engine checks the Comprehensive Rules' deck construction (Engine.validateDeck, CR 6.1:
// sizes, copies, the leader's class, universes, the cards' own deck-building abilities); on top of it the GUI checks
//  - standard: a restriction list (restrictions/, lists.ts);
//  - Cross Craft (CR Appendix B-2): two leaders of different classes (6.1.1.1), every card of their classes or Neutral
//    (6.1.1.5.1), the main deck with at least one card of each leader's class (6.1.1.5.2; the English site asks 9, its list
//    says so), no universe rules (6.1.1.5) — these replace the engine's class and universe checks — and a Cross Craft list;
//  - unlimited: only what the engine can't play (unknown cards, cards in the wrong deck).
// Pure: the engine's problems come in as its words (decks/problems.ts reads them).
import { cardName, type Catalog } from "../app/catalog";
import type { CardLang } from "../app/settings";
import type { DeckFile } from "../decks/format";
import { deckProblemText, problemKind } from "../decks/problems";
import type { CatalogCard, FormatId } from "../engine/protocol";
import type { MessageKey, Translate } from "../i18n";
import type { RestrictionList } from "./lists";

export const FORMATS: readonly FormatId[] = ["standard", "crossCraft", "unlimited"];

/** Something that keeps a deck out of a format: one of the engine's problems, or the format's own. */
export type FormatProblem =
  | { kind: "engine"; text: string }
  | { kind: "twoLeaders" }
  | { kind: "leaderClasses"; classes: string[] }
  | { kind: "cardClass"; card: string; cardClass: string; classes: string[] }
  | { kind: "perClass"; cardClass: string; have: number; need: number; list: string | null }
  | { kind: "banned"; card: string; list: string }
  | { kind: "limited"; card: string; copies: number; list: string };

/**
 * The leader the engine plays with, and a second one shown beside it (Cross Craft). A Cross Craft deck isn't based on a
 * universe (CR Appendix B-2 6.1.1.5), but the engine bases a deck on its leader's universe when all its cards share it
 * (CR 6.1.1.5.2): so the engine gets a leader without a universe when one of the two has none.
 */
export function leadersFor(deck: DeckFile, format: FormatId, catalog: Catalog): { leader: string | undefined; second: string | null } {
  if (format !== "crossCraft" || !deck.leader2) return { leader: deck.leader, second: null };
  if (!deck.leader) return { leader: deck.leader2, second: null };
  const universe = (printing: string) => catalog.printing(printing)?.universe;
  if (universe(deck.leader) && !universe(deck.leader2)) return { leader: deck.leader2, second: deck.leader };
  return { leader: deck.leader, second: deck.leader2 };
}

/** The deck's cards by definition (every printing of a card together, CR 2.1.1), with their copies in both decks. */
function copiesByCard(deck: DeckFile, catalog: Catalog): Map<CatalogCard, number> {
  const copies = new Map<CatalogCard, number>();
  for (const [printing, n] of [...Object.entries(deck.main), ...Object.entries(deck.evolve)]) {
    const card = catalog.printing(printing);
    if (card) copies.set(card, (copies.get(card) ?? 0) + n);
  }
  return copies;
}

/** The engine's problems a Cross Craft deck doesn't have: its class and universe rules are Cross Craft's (B-2 6.1.1.5). */
const REPLACED_IN_CROSS_CRAFT = new Set<MessageKey | null>(["deckProblem.wrongClass", "deckProblem.triggerClass", "deckProblem.vanguardAmulet", "deckProblem.noLeader"]);

/** CR Appendix B-2: two leaders of different classes, the cards of their classes or Neutral, each class in the main deck. */
function crossCraftProblems(deck: DeckFile, list: RestrictionList | null, catalog: Catalog): FormatProblem[] {
  const leaders = [deck.leader, deck.leader2].map((p) => (p ? catalog.printing(p) : undefined)).filter((card): card is CatalogCard => card?.type === "leader");
  if (leaders.length < 2) return [{ kind: "twoLeaders" }];
  const classes = leaders.map((leader) => leader.class);
  const out: FormatProblem[] = [];
  if (classes[0] === classes[1] || classes.includes("Neutral")) out.push({ kind: "leaderClasses", classes });
  const allowed = new Set([...classes, "Neutral"]);
  for (const card of copiesByCard(deck, catalog).keys()) {
    if (!allowed.has(card.class)) out.push({ kind: "cardClass", card: card.id, cardClass: card.class, classes });
  }
  const need = list?.minimumPerLeaderClass ?? 1;
  for (const cardClass of new Set(classes)) {
    if (cardClass === "Neutral") continue;
    let have = 0;
    for (const [printing, n] of Object.entries(deck.main)) if (catalog.printing(printing)?.class === cardClass) have += n;
    if (have < need) out.push({ kind: "perClass", cardClass, have, need, list: list?.minimumPerLeaderClass ? list.id : null });
  }
  return out;
}

/** A restriction list: its banned cards not at all, its limited ones once (every printing of the card, both decks). */
function listProblems(deck: DeckFile, list: RestrictionList, catalog: Catalog): FormatProblem[] {
  const copies = new Map([...copiesByCard(deck, catalog)].map(([card, n]) => [card.id, n]));
  const idOf = (number: string) => catalog.printing(number)?.id ?? number;
  return [
    ...list.banned.flatMap((e): FormatProblem[] => ((copies.get(idOf(e.card)) ?? 0) > 0 ? [{ kind: "banned", card: idOf(e.card), list: list.id }] : [])),
    ...list.limited.flatMap((e): FormatProblem[] => {
      const n = copies.get(idOf(e.card)) ?? 0;
      return n > 1 ? [{ kind: "limited", card: idOf(e.card), copies: n, list: list.id }] : [];
    }),
  ];
}

/**
 * What keeps `deck` out of `format` with `list`, given the engine's problems for it: checked with deck restrictions and
 * the leader `leadersFor` gives, except in unlimited (the engine's structural checks only).
 */
export function formatProblems(deck: DeckFile, format: FormatId, list: RestrictionList | null, catalog: Catalog, engineProblems: readonly string[]): FormatProblem[] {
  // The engine words a card's problem once per copy: each is said once.
  const engine = (problems: readonly string[]): FormatProblem[] => [...new Set(problems)].map((text) => ({ kind: "engine", text }));
  if (format === "unlimited") return engine(engineProblems);
  if (format === "standard") return [...engine(engineProblems), ...(list ? listProblems(deck, list, catalog) : [])];
  return [
    ...engine(engineProblems.filter((p) => !REPLACED_IN_CROSS_CRAFT.has(problemKind(p)))),
    ...crossCraftProblems(deck, list, catalog),
    ...(list ? listProblems(deck, list, catalog) : []),
  ];
}

export interface FormatContext {
  catalog: Catalog;
  lang: CardLang;
  t: Translate;
}

/** A problem in the interface language, the cards' names in the card text's language. */
export function formatProblemText(problem: FormatProblem, ctx: FormatContext): string {
  const { catalog, lang, t } = ctx;
  const card = (id: string) => t("deckProblem.card", { name: cardName(catalog.def(id), lang, id), id });
  const classes = (list: readonly string[]) => list.map((c) => t(`class.${c}` as MessageKey)).join(" / ");
  switch (problem.kind) {
    case "engine":
      return deckProblemText(problem.text, ctx);
    case "twoLeaders":
      return t("formatProblem.twoLeaders");
    case "leaderClasses":
      return t("formatProblem.leaderClasses", { classes: classes(problem.classes) });
    case "cardClass":
      return t("formatProblem.cardClass", { card: card(problem.card), cardClass: classes([problem.cardClass]), classes: classes(problem.classes) });
    case "perClass":
      return t("formatProblem.perClass", { need: problem.need, have: problem.have, class: classes([problem.cardClass]), basis: problem.list ?? "CR B-2 6.1.1.5.2" });
    case "banned":
      return t("formatProblem.banned", { card: card(problem.card), list: problem.list });
    case "limited":
      return t("formatProblem.limited", { card: card(problem.card), n: problem.copies, list: problem.list });
  }
}
