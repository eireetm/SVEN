// Names for players, cards and abilities in buttons and the log.
import type { CardId, PlayerId } from "@sve/core";
import { cardName, type Catalog } from "../app/catalog";
import type { CardLang } from "../app/settings";
import type { AbilitySummary, GameUpdate } from "../engine/protocol";
import { findCard } from "../engine/view-utils";
import type { MessageKey, Translate } from "../i18n";
import { displayOf } from "./card/display";

export function playerLabel(p: PlayerId, update: Pick<GameUpdate, "controllers">, t: Translate): string {
  const name = t("game.playerN", { n: p + 1 });
  const controller = update.controllers[p];
  return controller === "human" ? name : `${name} (${t(`controller.${controller}` as const)})`;
}

/** A card's name as its viewer knows it: from the board, or from what the decision told them; "a card" otherwise. */
export function cardLabel(id: CardId, update: GameUpdate, catalog: Catalog, lang: CardLang, t: Translate): string {
  const view = findCard(update.view, id);
  if (view) {
    if (view.type === "leader") return t("decision.leaderTarget", { player: playerLabel(view.controller, update, t) });
    const shown = displayOf(view, update.view.players[view.controller], catalog);
    return cardName(catalog.def(shown.def), lang, view.name);
  }
  const info = update.decision?.cards[id];
  return info ? cardName(catalog.def(info.def), lang) : t("log.aCard");
}

const TIMINGS = ["fanfare", "lastWords", "onEvolve", "onSuperEvolve", "strike", "onRace", "onDrive", "other"] as const;

export function timingLabel(timing: string | undefined, t: Translate): string {
  const known = TIMINGS.find((x) => x === timing);
  return t(`timing.${known ?? "other"}` as MessageKey);
}

/** "Act (2) engage", "Fanfare", ... */
export function abilityLabel(summary: AbilitySummary | undefined, t: Translate): string {
  if (!summary) return t("ability.unknown");
  const granted = summary.granted ? ` (${t("ability.granted")})` : "";
  if (summary.kind === "automatic") return timingLabel(summary.timing, t) + granted;
  if (summary.kind === "spell") return t("ability.spell") + granted;
  if (summary.kind === "unknown") return t("ability.unknown") + granted;
  const parts = [
    summary.quick ? t("ability.quick") : null,
    t("ability.act"),
    summary.pp ? t("ability.cost", { n: summary.pp }) : null,
    summary.engage ? t("ability.engage") : null,
    summary.bury ? t("ability.bury") : null,
    summary.leaderDefense ? t("ability.leaderDefense", { n: summary.leaderDefense }) : null,
    summary.custom ? t("ability.custom") : null,
    summary.advanced ? t("ability.advanced") : null,
  ];
  return parts.filter((p): p is string => p !== null).join(" ") + granted;
}
