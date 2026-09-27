// A line of text for each log event. The worker already hid what the log's viewer may not see (CR 4.1.2): a card it
// can't name is "a card".
import type { CardId, CardMove, GameEvent } from "@sve/core";
import { cardName, type Catalog } from "../../app/catalog";
import type { CardLang } from "../../app/settings";
import type { GameUpdate, LogEntry } from "../../engine/protocol";
import type { MessageKey, Translate } from "../../i18n";
import { playerLabel } from "../labels";

export interface LogContext {
  t: Translate;
  catalog: Catalog;
  lang: CardLang;
  update: GameUpdate;
}

export interface LogLine {
  kind: "turn" | "event" | "minor";
  text: string;
}

/** Events that only matter while debugging (shown with "show all"). */
const MINOR = new Set<GameEvent["type"]>([
  "phaseStarted",
  "placementChanged",
  "playPointsChanged",
  "evolutionPointsChanged",
  "countersChanged",
  "cardsSelected",
  "abilityTriggered",
  "attackEnded",
  "fought",
  "tokensEliminated",
  "statsGained",
]);

const zoneKey = (zone: string | undefined): MessageKey => (zone ? (`log.zone.${zone}` as MessageKey) : "log.zone.none");

export function describeEntry(entry: LogEntry, ctx: LogContext, showAll: boolean): LogLine | null {
  const { t, update } = ctx;
  const event = entry.event;
  const name = (id: CardId | null | undefined): string => {
    const info = id ? entry.cards[id] : undefined;
    return info ? cardName(ctx.catalog.def(info.def), ctx.lang) : t("log.aCard");
  };
  const player = (p: 0 | 1) => playerLabel(p, update, t);
  const line = (text: string, kind: LogLine["kind"] = "event"): LogLine => ({ kind, text });
  switch (event.type) {
    case "turnStarted":
      return line(t("log.turn", { n: event.turn, player: player(event.player) }), "turn");
    case "gameStarted":
      return line(t("log.gameStarted", { player: player(event.firstPlayer) }));
    case "mulligan":
      return line(t(event.redraw ? "log.mulligan.redraw" : "log.mulligan.keep", { player: player(event.player) }));
    case "cardsMoved":
      return describeMoves(event.moves, ctx, name, showAll);
    case "cardPlayed":
      return line(t("log.played", { player: player(event.player), card: name(event.card) }));
    case "abilityPlayed":
      return line(t("log.ability", { player: player(event.player), card: name(event.source) }));
    case "attackDeclared":
      return line(t("log.attack", { attacker: name(event.attacker), target: name(event.target) }));
    case "damageDealt":
      return line(
        event.source
          ? t("log.damage", { source: name(event.source), target: name(event.target), n: event.amount })
          : t("log.damageNoSource", { target: name(event.target), n: event.amount }),
      );
    case "leaderDefenseChanged":
      return line(t("log.leaderDefense", { player: player(event.player), delta: event.delta > 0 ? `+${event.delta}` : String(event.delta), defense: event.defense }));
    case "evolved":
      return line(t(event.superEvolved ? "log.superEvolved" : "log.evolved", { card: name(event.card) }));
    case "cardsRevealed":
      return line(t("log.revealed", { player: player(event.player), cards: event.cards.map((c) => name(c.id)).join(", ") }));
    case "cardsLookedAt":
      return line(t("log.lookedAt", { player: player(event.player), cards: event.cards.map((c) => name(c.id)).join(", ") }));
    case "deckShuffled":
      return showAll ? line(t("log.shuffled", { player: player(event.player) }), "minor") : null;
    case "dieRolled":
      return line(t("log.die", { player: player(event.player), n: event.result }));
    case "abilityTriggered":
      return showAll ? line(t("log.triggered", { card: name(event.source) }), "minor") : null;
    case "gameEnded": {
      const result = event.result.winner === null ? t("game.draw") : t("game.win", { player: player(event.result.winner) });
      return line(t("log.gameEnded", { result }));
    }
    default:
      if (!showAll && MINOR.has(event.type)) return null;
      return showAll ? line(JSON.stringify(event), "minor") : null;
  }
}

function describeMoves(moves: readonly CardMove[], ctx: LogContext, name: (id: CardId | null | undefined) => string, showAll: boolean): LogLine | null {
  const { t, update } = ctx;
  // Setup, playing (the "plays" line says it) and mulligans (their own line) are not repeated.
  const shown = moves.filter((m) => showAll || (m.reason !== "setup" && m.reason !== "play" && m.reason !== "mulligan"));
  if (shown.length === 0) return null;
  const draws = shown.filter((m) => m.reason === "draw");
  if (draws.length === shown.length) {
    const p = draws[0]!.to.player;
    const known = draws.filter((m) => m.def !== "");
    return known.length === draws.length
      ? { kind: "event", text: t("log.draw", { player: playerLabel(p, update, t), cards: draws.map((m) => name(m.newCard ?? m.card)).join(", ") }) }
      : { kind: "event", text: t("log.drawHidden", { player: playerLabel(p, update, t), n: draws.length }) };
  }
  const groups = new Map<string, CardMove[]>();
  for (const m of shown) {
    const key = `${m.from?.zone ?? ""}>${m.to.zone}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  const parts = [...groups.values()].map((group) => {
    const first = group[0]!;
    const cards = group.every((m) => m.def === "") ? t("log.cardsN", { n: group.length }) : group.map((m) => name(m.newCard ?? m.card)).join(", ");
    return t("log.move", { cards, from: t(zoneKey(first.from?.zone)), to: t(zoneKey(first.to.zone)) });
  });
  return { kind: "event", text: parts.join(" · ") };
}
