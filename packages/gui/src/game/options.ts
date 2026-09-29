// How the options of a "choose" decision read. The Core labels every option in English (for the bots, the tests and the
// debug view); the GUI shows them in the card text's language (the settings' "card text"):
//  - options the engine itself makes are worded here: playing a card normally, keeping or rerolling a die (CR 5.20.2), the
//    order of damage changes (CR 10.10.2), a Union Burst ability (CR 14.5.1.4), "another card name";
//  - a card's name (a token to create, a name to declare) is the card's own name in that language;
//  - the options card scripts write come from OPTION_TEXT (i18n/option-text.ts), quoted from the official card texts;
//    labels with a number or a name in them ("X = 3", "Put a Guardform Golem into your EX area") match its patterns.
// A label found nowhere stays English (test/i18n.test.ts checks every label of the scripts is found).
import type { Decision } from "@sve/core";
import { cardName, type Catalog } from "../app/catalog";
import type { CardLang } from "../app/settings";
import type { Translate } from "../i18n";
import { OPTION_TEXT, type OptionText } from "../i18n/option-text";
import { withTokenLabels } from "./card/tokens";
import { timingLabel } from "./labels";

type Choose = Extract<Decision, { type: "choose" }>;

export interface OptionContext {
  catalog: Catalog;
  lang: CardLang;
  t: Translate;
}

/** The label of the Core's "another name" option when a card name is declared. */
const ANOTHER_NAME = "Another card name";

/** A pattern key ("Put a {0} into your EX area") as a regular expression capturing its parts. */
interface Pattern {
  key: string;
  re: RegExp;
  text: OptionText;
}

let patterns: Pattern[] | null = null;

function patternList(): Pattern[] {
  if (!patterns) {
    patterns = Object.entries(OPTION_TEXT)
      .filter(([key]) => /\{\d+\}/.test(key))
      .map(([key, text]) => ({
        key,
        re: new RegExp(`^${key.split(/(\{\d+\})/).map((part) => (/^\{\d+\}$/.test(part) ? "(.+)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join("")}$`),
        text,
      }))
      // The most literal text first: "X = {0} (pay {1})" before "X = {0}".
      .sort((a, b) => b.key.replace(/\{\d+\}/g, "").length - a.key.replace(/\{\d+\}/g, "").length);
  }
  return patterns;
}

/** A card script's label (or a part of one) in `lang`: a card's name, a quoted text, a matching pattern; else as it is. */
export function scriptLabel(label: string, ctx: Pick<OptionContext, "catalog" | "lang">): string {
  const { catalog, lang } = ctx;
  if (lang === "en") return withTokenLabels(label, "en");
  const card = catalog.named(label);
  if (card) return cardName(card, lang);
  const quoted = OPTION_TEXT[label];
  if (quoted) return quoted[lang];
  for (const pattern of patternList()) {
    const match = pattern.re.exec(label);
    if (!match) continue;
    const parts = match.slice(1);
    return pattern.text[lang].replace(/\{(\d+)\}/g, (all, i: string) => {
      const part = parts[Number(i)];
      return part === undefined ? all : scriptLabel(part, ctx);
    });
  }
  return label;
}

/** One option of a "choose" decision, in the card text's language (the engine's own words in the interface's). */
export function optionText(option: Choose["options"][number], decision: Choose, ctx: OptionContext): string {
  const { catalog, lang, t } = ctx;
  const number = (): string => /(\d+)/.exec(option.label)?.[1] ?? "";
  switch (decision.reason) {
    case "playOption":
      return option.id === "normal" ? t("option.playNormally") : scriptLabel(option.label, ctx);
    case "dieReroll":
      return t(option.id === "reroll" ? "option.rerollDie" : "option.keepDie", { n: number() });
    case "damageOrder": {
      const taken = /^Take (\d+) damage/.exec(option.label);
      const text = taken ? t("option.takeDamage", { n: taken[1]! }) : t("option.takeNoDamage");
      return option.label.endsWith("(uses up a prevention)") ? t("option.usesUpPrevention", { option: text }) : text;
    }
    case "unionBurst": {
      // "<definition> ability <n> (<activated | timing>)"
      const ub = /^(\S+) ability (\d+) \((\w+)\)$/.exec(option.label);
      if (!ub) return option.label;
      const kind = ub[3] === "activated" ? t("ability.act") : timingLabel(ub[3], t);
      return t("option.unionBurst", { card: cardName(catalog.def(ub[1]!), lang, ub[1]), n: ub[2]!, kind });
    }
    case "divideDamage":
      return option.label;
    default:
      return option.label === ANOTHER_NAME ? t("option.anotherName") : scriptLabel(option.label, ctx);
  }
}
