import { opponentOf, type CardId, type CardView, type HiddenCardView, type PlayerSideView } from "@sve/core";
import { useMemo } from "react";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import type { SideZone } from "../../engine/view-utils";
import { useT, type MessageKey } from "../../i18n";
import { CardTile, type CardMark } from "../card/CardTile";
import { cardLabel, playerLabel } from "../labels";
import { openZone } from "./zone-browser";

/** Cards the pending decision lets a person act with (main phase and quick actions), and its candidates. */
function useMarks(update: GameUpdate): Map<CardId, CardMark> {
  return useMemo(() => {
    const marks = new Map<CardId, CardMark>();
    const decision = update.decision?.decision;
    if (!decision) return marks;
    if (decision.type === "mainPhase" || decision.type === "quick") {
      for (const action of decision.actions) {
        if (action.type === "play" || action.type === "activate" || action.type === "evolve") marks.set(action.card, "action");
        else if (action.type === "attack") marks.set(action.attacker, "action");
      }
    } else if (decision.type === "selectCards") {
      for (const id of decision.candidates) marks.set(id, "candidate");
    }
    return marks;
  }, [update]);
}

export function Board({ update }: { update: GameUpdate }) {
  const me = update.perspective;
  const marks = useMarks(update);
  return (
    <div className="sve-board">
      <PlayerArea update={update} side={update.view.players[opponentOf(me)]} position="top" marks={marks} />
      <CenterStrip update={update} marks={marks} />
      <PlayerArea update={update} side={update.view.players[me]} position="bottom" marks={marks} />
    </div>
  );
}

function CardRow({ cards, side, marks, className }: { cards: readonly (CardView | HiddenCardView)[]; side: PlayerSideView; marks: Map<CardId, CardMark>; className: string }) {
  const t = useT();
  const linked = [...side.raceZone, ...side.driveZone, ...side.equipmentZone];
  return (
    <div className={`sve-row ${className}`}>
      {cards.length === 0 ? <span className="sve-row-empty">{t("game.empty")}</span> : null}
      {cards.map((card) => {
        const attached = card.hidden ? [] : linked.filter((l) => l.linkedTo === card.id);
        return (
          <CardTile key={card.id} card={card} side={side} mark={card.hidden ? null : (marks.get(card.id) ?? null)}>
            {attached.length > 0 ? (
              <div className="sve-attached">
                {attached.map((a) => (
                  <CardTile key={a.id} card={a} side={side} size="small" />
                ))}
              </div>
            ) : null}
          </CardTile>
        );
      })}
    </div>
  );
}

function Pile({ side, zone, label, count, note }: { side: PlayerSideView; zone: SideZone | null; label: string; count: number; note?: string }) {
  const clickable = zone !== null && count > 0;
  return (
    <button type="button" className="sve-pile" disabled={!clickable} onClick={() => zone && openZone({ player: side.id, zone })}>
      <span className="sve-pile-label">{label}</span>
      <span className="sve-pile-count">{count}</span>
      {note ? <span className="sve-pile-note">{note}</span> : null}
    </button>
  );
}

function PlayerArea({ update, side, position, marks }: { update: GameUpdate; side: PlayerSideView; position: "top" | "bottom"; marks: Map<CardId, CardMark> }) {
  const t = useT();
  const active = update.view.activePlayer === side.id && update.view.phase !== "over";
  const deciding = update.waitingFor === side.id;
  const faceUpEvolve = side.evolveDeck.filter((c) => !c.hidden && c.faceUp).length;
  // A hand the viewer cannot see is drawn small: it only shows how many cards there are.
  const handHidden = side.hand.length > 0 && side.hand.every((c) => c.hidden);
  // The row by the center line: leader, field (and a Vanguard's trigger zone), the piles.
  const fieldRow = (
    <div key="field" className="sve-side-row sve-field-row">
      <div className={`sve-leader-panel${active ? " sve-active" : ""}${deciding ? " sve-deciding" : ""}`}>
        {side.leader ? <CardTile card={side.leader} side={side} size="small" mark={marks.get(side.leader.id) ?? null} /> : null}
        <div className="sve-leader-info">
          <div className="sve-player-name">
            {playerLabel(side.id, update, t)}
            {side.id === update.perspective && update.controllers[side.id] === "human" ? ` · ${t("game.you")}` : ""}
          </div>
          <div className="sve-leader-defense" title={t("game.defense")}>
            {side.leaderDefense}
          </div>
          <div className="sve-resources">
            <span title={t("game.pp")}>
              {t("game.pp")} {side.playPoints}/{side.maxPlayPoints}
            </span>
            <span title={t("game.ep")}>
              {t("game.ep")} {side.evolutionPoints}
            </span>
            <span title={t("game.sep")}>
              {t("game.sep")} {side.superEvolutionPoints}
            </span>
          </div>
          {side.universe ? <div className="sve-universe">{t(`universe.${side.universe}` as const)}</div> : null}
        </div>
      </div>
      <CardRow className="sve-field" cards={side.field} side={side} marks={marks} />
      {side.triggerZone.length > 0 ? (
        <div className="sve-trigger">
          <span className="sve-zone-label">{t("game.trigger")}</span>
          {side.triggerZone.map((c) => (
            <CardTile key={c.id} card={c} side={side} size="small" />
          ))}
        </div>
      ) : null}
      <div className="sve-piles">
        <Pile side={side} zone={null} label={t("game.deck")} count={side.deckCount} />
        <Pile side={side} zone="cemetery" label={t("game.cemetery")} count={side.cemetery.length} />
        <Pile side={side} zone="banished" label={t("game.banished")} count={side.banished.length} />
        <Pile
          side={side}
          zone="evolveDeck"
          label={t("game.evolveDeck")}
          count={side.evolveDeck.length}
          note={faceUpEvolve > 0 ? t("game.evolveDeckFaceUp", { n: faceUpEvolve }) : undefined}
        />
      </div>
    </div>
  );
  // The outer row: the hand and the EX area (cards there are played like cards in the hand, CR 8.2).
  const outerRow = (
    <div key="outer" className="sve-side-row sve-outer-row">
      <CardRow className={`sve-hand${handHidden ? " sve-hand-hidden" : ""}`} cards={side.hand} side={side} marks={marks} />
      <div className="sve-ex">
        <span className="sve-zone-label">{t("game.ex")}</span>
        <CardRow className="sve-ex-row" cards={side.ex} side={side} marks={marks} />
      </div>
    </div>
  );
  const rows = position === "top" ? [outerRow, fieldRow] : [fieldRow, outerRow];
  return <section className={`sve-side sve-side-${position}`}>{rows}</section>;
}

const PHASE_KEYS: Record<string, MessageKey> = {
  setup: "game.phase.setup",
  start: "game.phase.start",
  main: "game.phase.main",
  end: "game.phase.end",
  over: "game.phase.over",
};

function CenterStrip({ update, marks }: { update: GameUpdate; marks: Map<CardId, CardMark> }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const view = update.view;
  const attack = view.attack;
  const result = update.result;
  return (
    <div className="sve-center">
      <div className="sve-status">
        <span>{t("game.turn", { n: view.turn })}</span>
        <span>{t(PHASE_KEYS[view.phase] ?? "game.phase.main")}</span>
        {view.phase !== "over" ? <span>{t("game.activePlayer", { player: playerLabel(view.activePlayer, update, t) })}</span> : null}
        {update.thinking && update.waitingFor !== null ? (
          <span className="sve-thinking">{t("game.thinking", { player: playerLabel(update.waitingFor, update, t) })}</span>
        ) : null}
        {update.settings.paused && update.waitingFor !== null && update.controllers[update.waitingFor] !== "human" ? (
          <span className="sve-thinking">{t("game.paused")}</span>
        ) : null}
      </div>
      {attack ? (
        <div className="sve-attack-line">
          {t("game.attack", {
            attacker: cardLabel(attack.attacker, update, catalog, cardLang, t),
            target: cardLabel(attack.target, update, catalog, cardLang, t),
          })}
        </div>
      ) : null}
      {view.resolution.length > 0 ? (
        <div className="sve-resolution">
          <span className="sve-zone-label">{t("game.resolution")}</span>
          {view.resolution.map((c) => (
            <CardTile key={c.id} card={c} side={view.players[c.controller]} size="small" mark={marks.get(c.id) ?? null} />
          ))}
        </div>
      ) : null}
      {result ? (
        <div className="sve-result">
          {result.winner === null ? t("game.draw") : t("game.win", { player: playerLabel(result.winner, update, t) })}
          {" — "}
          {result.losses.map((l) => `${playerLabel(l.player, update, t)}: ${t(`game.reason.${l.reason}` as const)}`).join("; ")}
        </div>
      ) : null}
    </div>
  );
}
