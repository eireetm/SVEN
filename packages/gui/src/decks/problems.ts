// The engine's deck problems (Engine.validateDeck, CR 6.1) in the interface language. The Core words each problem in
// English; the GUI recognizes the kind by its wording and says it again, with the cards' names in the card text's language
// and the classes in the interface's. A problem not recognized stays English (test/i18n.test.ts makes every kind of problem
// the engine reports and checks each is recognized).
import { cardName, type Catalog } from "../app/catalog";
import type { CardLang } from "../app/settings";
import type { MessageKey, Translate } from "../i18n";

export interface ProblemContext {
  catalog: Catalog;
  lang: CardLang;
  t: Translate;
}

type Part = (text: string, ctx: ProblemContext) => string;

const WHERE: Record<string, MessageKey> = {
  leader: "deckProblem.where.leader",
  "main deck": "deckProblem.where.main",
  "evolve deck": "deckProblem.where.evolve",
};

const where: Part = (text, { t }) => (WHERE[text] ? t(WHERE[text]) : text);
const same: Part = (text) => text;
/** A card by its number: "name (number)". */
const card: Part = (id, { catalog, lang, t }) => {
  const def = catalog.printing(id);
  return def ? t("deckProblem.card", { name: cardName(def, lang), id }) : id;
};
/** A card by its English name. */
const named: Part = (name, { catalog, lang }) => {
  const def = catalog.named(name);
  return def ? cardName(def, lang) : name;
};
/** English card names joined by ", " (a name may have a comma of its own: the longest known name is taken first). */
const names: Part = (text, ctx) => {
  const parts = text.split(", ");
  const out: string[] = [];
  for (let i = 0; i < parts.length; ) {
    let j = parts.length;
    while (j > i + 1 && !ctx.catalog.named(parts.slice(i, j).join(", "))) j--;
    out.push(named(parts.slice(i, j).join(", "), ctx));
    i = j;
  }
  return out.join(ctx.lang === "en" ? ", " : "、");
};
const className: Part = (text, { t }) => t(`class.${text}` as MessageKey);

/** Each kind of problem: its English wording (deck.ts validateDeck), the message and what each captured part is. */
const KINDS: readonly { re: RegExp; key: MessageKey; parts: readonly [string, Part][] }[] = [
  { re: /^(leader|main deck|evolve deck): unknown card number (\S+)$/, key: "deckProblem.unknownCard", parts: [["where", where], ["card", same]] },
  { re: /^leader: (\S+) is not a leader card \(6\.1\.1\.1\)$/, key: "deckProblem.notLeader", parts: [["card", card]] },
  { re: /^main deck: (\S+) .+ cannot be in the main deck \(6\.1\.1\.2, 9\.1\.4\)$/, key: "deckProblem.notMainDeck", parts: [["card", card]] },
  { re: /^evolve deck: (\S+) .+ is not an evolved or advanced card \(6\.1\.1\.3\)$/, key: "deckProblem.notEvolveDeck", parts: [["card", card]] },
  { re: /^card effect not implemented yet: (\S+) .+$/, key: "deckProblem.notImplemented", parts: [["card", card]] },
  { re: /^a leader card is required \(6\.1\.1\.1\)$/, key: "deckProblem.noLeader", parts: [] },
  { re: /^main deck has (\d+) cards, needs (\d+)–(\d+) \(6\.1\.1\.2\)$/, key: "deckProblem.mainSize", parts: [["n", same], ["min", same], ["max", same]] },
  { re: /^evolve deck has (\d+) cards, at most (\d+) \(6\.1\.1\.3\)$/, key: "deckProblem.evolveSize", parts: [["n", same], ["max", same]] },
  {
    re: /^(main deck|evolve deck): (\d+) copies of "(.+)", at most (\d+) \(6\.1\.1\.4\)$/,
    key: "deckProblem.copies",
    parts: [["where", where], ["n", same], ["name", named], ["limit", same]],
  },
  { re: /^Starting Amulet cards with different names: (.+) \(14\.4\.4\.1\.1\)$/, key: "deckProblem.startingAmulets", parts: [["names", names]] },
  { re: /^a Cardfight!! Vanguard deck needs a Starting Amulet card \(14\.4\.2\.1\.1\)$/, key: "deckProblem.vanguardAmulet", parts: [] },
  {
    re: /^(\S+) .+ has a Trigger and is not of the leader's class (\w+) \(14\.4\.2\.1\.2\)$/,
    key: "deckProblem.triggerClass",
    parts: [["card", card], ["class", className]],
  },
  {
    re: /^(\S+) .+ \((\w+)\) does not match the leader class (\w+) \(6\.1\.1\.5\.1\)$/,
    key: "deckProblem.wrongClass",
    parts: [["card", card], ["cardClass", className], ["class", className]],
  },
];

/** The kind of a problem (its message), or null when the GUI doesn't know it (the tests check every kind the engine reports). */
export const problemKind = (problem: string): MessageKey | null => KINDS.find((k) => k.re.test(problem))?.key ?? null;

/** A problem of Engine.validateDeck in the interface language. */
export function deckProblemText(problem: string, ctx: ProblemContext): string {
  for (const kind of KINDS) {
    const match = kind.re.exec(problem);
    if (!match) continue;
    const params: Record<string, string> = {};
    kind.parts.forEach(([name, part], i) => (params[name] = part(match[i + 1]!, ctx)));
    return ctx.t(kind.key, params);
  }
  return problem;
}
