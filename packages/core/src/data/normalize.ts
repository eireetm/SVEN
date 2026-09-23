import { CARD_CLASSES, type CardClass, type CardDefinition, type CardType } from "../model/card";
import type { RawCardJson } from "./raw";

/**
 * Raw scraped JSON -> CardDefinition.
 *
 * Pure functions: no file system access (the build tool reads files and calls these).
 * Every data anomaly is either fixed by an explicit, documented table or reported as an
 * error — never silently guessed.
 */

export class CardDataError extends Error {
  override name = "CardDataError";
}

const EVOLVED_SUFFIX = " (Evolved)";

/** One printing after normalization, before alternate-art grouping. */
export interface NormalizedPrinting {
  printing: string;
  set: string;
  def: Omit<CardDefinition, "id" | "printings">;
}

/** CR 2.3 — `card_type` array -> primary type + special types. */
export function parseCardType(cardNo: string, raw: readonly string[]): {
  type: CardType;
  evolved: boolean;
  token: boolean;
} {
  const primaries: CardType[] = [];
  let evolved = false;
  let token = false;
  for (const t of raw) {
    switch (t) {
      case "Follower":
        primaries.push("follower");
        break;
      case "Spell":
        primaries.push("spell");
        break;
      case "Amulet":
        primaries.push("amulet");
        break;
      case "Leader":
        primaries.push("leader");
        break;
      case "Evolved":
        evolved = true;
        break;
      case "Token":
        token = true;
        break;
      default:
        throw new CardDataError(`${cardNo}: unsupported card_type entry "${t}"`);
    }
  }
  const [type, ...rest] = primaries;
  if (type === undefined || rest.length > 0) {
    throw new CardDataError(`${cardNo}: expected exactly one primary card type, got ${JSON.stringify(raw)}`);
  }
  if (evolved && type !== "follower") {
    throw new CardDataError(`${cardNo}: evolved card must be a follower in the supported sets`);
  }
  return { type, evolved, token };
}

function parseClass(cardNo: string, raw: string): CardClass {
  if ((CARD_CLASSES as readonly string[]).includes(raw)) return raw as CardClass;
  throw new CardDataError(`${cardNo}: unknown class "${raw}"`);
}

/**
 * CR 2.4 — traits, taken from the Japanese data only (`traits_ja`, e.g. "妖精・獣").
 * Japanese is the original printing; the English `traits` field is a translation with
 * inconsistencies (untranslated entries, swapped names), so it is ignored on purpose
 * (decided by the project owner, see docs/data-notes.md).
 *
 * Several traits are joined with "・". A trait may itself contain "・" inside 〈〉 brackets
 * (e.g. "プリコネ・〈ジオ・ゲヘナ〉"), so separators inside brackets do not split.
 */
export function parseTraits(cardNo: string, raw: string | null): string[] {
  if (raw === null) throw new CardDataError(`${cardNo}: missing Japanese traits (traits_ja)`);
  const text = raw.trim();
  if (text === "-" || text === "") return []; // "-" means "no trait" (e.g. leaders)
  // Japanese card data never uses U+00B7; it shows up when a source filled in Chinese traits.
  if (text.includes("\u00b7")) throw new CardDataError(`${cardNo}: traits_ja "${text}" uses U+00B7 (not Japanese data?)`);
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "〈") depth += 1;
    else if (ch === "〉") depth -= 1;
    if (ch === "・" && depth === 0) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  if (depth !== 0 || out.some((t) => t === "")) throw new CardDataError(`${cardNo}: malformed traits_ja "${text}"`);
  return out;
}

function checkStats(
  cardNo: string,
  type: CardType,
  evolved: boolean,
  cost: number | null,
  atk: number | null,
  def: number | null,
): void {
  const fail = (msg: string) => {
    throw new CardDataError(`${cardNo}: ${msg} (cost=${cost}, atk=${atk}, def=${def})`);
  };
  if (type === "leader") {
    if (cost !== null || atk !== null || def !== null) fail("leader must not have cost/atk/def");
    return;
  }
  if (type === "follower") {
    if (atk === null || def === null) fail("follower needs attack and defense");
    if (evolved ? cost !== null : cost === null) fail(evolved ? "evolved card must not have a cost" : "follower needs a cost");
    return;
  }
  if (cost === null) fail(`${type} needs a cost`);
}

export function normalizePrinting(raw: RawCardJson): NormalizedPrinting {
  const cardNo = raw.card_no;
  const { type, evolved, token } = parseCardType(cardNo, raw.card_type);
  checkStats(cardNo, type, evolved, raw.cost, raw.atk, raw.def);

  let name = raw.name_en.trim();
  if (evolved) {
    if (!name.endsWith(EVOLVED_SUFFIX)) {
      throw new CardDataError(`${cardNo}: evolved card name "${name}" lacks the "${EVOLVED_SUFFIX}" suffix`);
    }
    // CR 5.16.1.1.1: an evolved card corresponds to the card with the *same* name.
    name = name.slice(0, -EVOLVED_SUFFIX.length);
  }
  if (name === "") throw new CardDataError(`${cardNo}: empty English name`);

  const textEn = raw.effect_en_official ?? raw.effect_en ?? "";
  return {
    printing: cardNo,
    set: raw.set,
    def: {
      name,
      names: { en: name, cn: raw.name_cn, ja: raw.name_ja },
      class: parseClass(cardNo, raw.class),
      type,
      evolved,
      token,
      traits: parseTraits(cardNo, raw.traits_ja),
      cost: raw.cost,
      attack: raw.atk,
      defense: raw.def,
      text: {
        en: textEn.trim(),
        cn: raw.effect_cn?.trim() ?? null,
        ja: (raw.effect_ja_sve ?? raw.effect_ja)?.trim() ?? null,
      },
    },
  };
}

/** Identity key for alternate-art grouping (CR 2.1.1: card names are unique). */
export function identityKey(d: NormalizedPrinting["def"]): string {
  return `${d.type}|${d.evolved ? "evolved" : "base"}|${d.token ? "token" : "card"}|${d.name}`;
}

/**
 * Game-relevant fields that must agree exactly between printings of the same card.
 * Card text is deliberately excluded: reprints may carry wording updates (e.g. BP01-P16
 * says "Piercing Attack", the pre-rename wording of Assail, CR 12.11). Text differences are
 * reported as variants and the canonical printing's text is used.
 */
function functionalSignature(d: NormalizedPrinting["def"]): string {
  return JSON.stringify([d.class, d.traits, d.cost, d.attack, d.defense]);
}

export interface TextVariant {
  canonical: string;
  variant: string;
  canonicalText: string;
  variantText: string;
}

export interface GroupResult {
  cards: CardDefinition[];
  /** Printings whose English text differs from their canonical printing. */
  textVariants: TextVariant[];
}

const PRINTING_KIND_ORDER: readonly RegExp[] = [
  /^[A-Za-z0-9]+-\d+$/, // regular collector number, e.g. BP01-006
  /^[A-Za-z0-9]+-T\d+$/, // token
  /^[A-Za-z0-9]+-LD\d+$/, // leader
];

function printingRank(p: string): number {
  const i = PRINTING_KIND_ORDER.findIndex((re) => re.test(p));
  return i === -1 ? PRINTING_KIND_ORDER.length : i;
}

/**
 * Merge printings that are the same card into definitions.
 * The canonical printing (definition id) is chosen by: earlier set in `setOrder`, then
 * regular > token > leader > promo/alt-art numbering, then lexical order.
 */
export function groupPrintings(
  printings: readonly NormalizedPrinting[],
  setOrder: readonly string[],
): GroupResult {
  const groups = new Map<string, NormalizedPrinting[]>();
  for (const p of printings) {
    const key = identityKey(p.def);
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }
  const setRank = (s: string) => {
    const i = setOrder.indexOf(s);
    return i === -1 ? setOrder.length : i;
  };
  const defs: CardDefinition[] = [];
  const textVariants: TextVariant[] = [];
  for (const list of groups.values()) {
    list.sort(
      (a, b) =>
        setRank(a.set) - setRank(b.set) ||
        printingRank(a.printing) - printingRank(b.printing) ||
        (a.printing < b.printing ? -1 : a.printing > b.printing ? 1 : 0),
    );
    const canonical = list[0]!;
    const sig = functionalSignature(canonical.def);
    for (const other of list.slice(1)) {
      if (functionalSignature(other.def) !== sig) {
        throw new CardDataError(
          `${other.printing} has the same name as ${canonical.printing} ("${canonical.def.name}") but different game information`,
        );
      }
      if (other.def.text.en !== canonical.def.text.en) {
        textVariants.push({
          canonical: canonical.printing,
          variant: other.printing,
          canonicalText: canonical.def.text.en,
          variantText: other.def.text.en,
        });
      }
    }
    defs.push({ id: canonical.printing, printings: list.map((p) => p.printing), ...canonical.def });
  }
  defs.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { cards: defs, textVariants };
}
