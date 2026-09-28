// The table: the opponent's hand, the two playmats facing each other, your hand. Cards the pending decision lets you use
// are lit; click one for its menu, drag a card from your hand onto your mat to play it, drag a follower onto an enemy to
// attack, click the cards a selection asks for. Every option comes from the decision (the GUI works out no rules).
import { opponentOf, type CardId, type CardView, type HiddenCardView, type PlayerSideView } from "@sve/core";
import { useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import type { GameUpdate } from "../../engine/protocol";
import { useT } from "../../i18n";
import { CardTile, type CardMark } from "../card/CardTile";
import { actionsFor, answerFor, attackTargets, dragKind, openMenu, sendAnswer, toggleChosen, useInteraction } from "../interaction";
import { playerLabel } from "../labels";
import { AttackArrow } from "./AttackArrow";
import { CardMenu } from "./CardMenu";
import { CenterLine } from "./CenterLine";
import { DragLayer } from "./DragLayer";
import { rectStyle, zoneRect, type MatZone, type TableLayout } from "./layout";
import { pressCard } from "./pointer";
import { ResultOverlay } from "./ResultOverlay";
import { useTableLayout } from "./useTableLayout";
import { openZone } from "./zone-browser";

/** How the pending decision (and what the person is doing) marks each card. */
function useMarks(update: GameUpdate): Map<CardId, CardMark> {
  const chosen = useInteraction((s) => s.chosen);
  const menu = useInteraction((s) => s.menu);
  // Only what the marks need, so moving the pointer during a drag doesn't redraw the table.
  const dragKey = useInteraction((s) => (s.drag?.kind === "attack" ? `${s.drag.card}\n${s.drag.over ?? ""}` : ""));
  const drag = useMemo(() => {
    if (!dragKey) return null;
    const [card, over] = dragKey.split("\n") as [string, string];
    return { kind: "attack" as const, card, over: over || null };
  }, [dragKey]);
  return useMemo(() => {
    const marks = new Map<CardId, CardMark>();
    const decision = update.decision?.decision;
    if (!decision) return marks;
    if (decision.type === "mainPhase" || decision.type === "quick") {
      for (const action of decision.actions) {
        if (action.type === "attack") marks.set(action.attacker, "action");
        else if (action.type !== "endMainPhase" && action.type !== "pass") marks.set(action.card, "action");
      }
    } else if (decision.type === "selectCards") {
      for (const id of decision.candidates) marks.set(id, chosen.includes(id) ? "selected" : "candidate");
    }
    if (drag?.kind === "attack") {
      for (const target of attackTargets(decision, drag.card)) marks.set(target, drag.over === target ? "target-over" : "target");
    }
    if (menu) marks.set(menu.card, "active");
    return marks;
  }, [update, chosen, menu, drag]);
}

interface TableCardProps {
  update: GameUpdate;
  card: CardView | HiddenCardView;
  side: PlayerSideView;
  marks: Map<CardId, CardMark>;
  size?: "small" | "normal" | "large";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** A card on the table that answers the decision: click for its menu (or to choose it), drag to play or attack. */
function TableCard({ update, card, side, marks, size, className, style, children }: TableCardProps) {
  const dragging = useInteraction((s) => s.drag?.card === card.id);
  if (card.hidden) return <CardTile card={card} side={side} size={size} className={className} style={style} />;
  const decision = update.decision?.decision;
  const id = card.id;
  const actions = actionsFor(decision, id);
  const plays = actions.filter((a) => a.type === "play");
  const attacks = actions.filter((a) => a.type === "attack");
  const candidate = decision?.type === "selectCards" && decision.candidates.includes(id);
  const press =
    actions.length > 0 || candidate
      ? (e: React.PointerEvent<HTMLDivElement>) =>
          pressCard(e, {
            card: id,
            drag: candidate ? null : dragKind(actions),
            isTarget: (target) => attacks.some((a) => a.type === "attack" && a.target === target),
            onClick: (box) => {
              if (decision?.type === "selectCards") {
                if (decision.min === 1 && decision.max === 1) sendAnswer(update, { type: "selectCards", cards: [id] });
                else toggleChosen(id, decision.max);
              } else {
                openMenu({ card: id, anchor: { left: box.left, top: box.top, right: box.right, bottom: box.bottom } });
              }
            },
            onDrop: (over) => {
              if (!decision) return;
              const action = over === "field" ? plays[0] : attacks.find((a) => a.type === "attack" && a.target === over);
              if (action) sendAnswer(update, answerFor(decision, action));
            },
          })
      : undefined;
  return (
    <CardTile
      card={card}
      side={side}
      size={size}
      mark={marks.get(id) ?? null}
      className={`${className ?? ""}${dragging ? " sve-card-dragged" : ""}`}
      style={style}
      onPointerDown={press}
    >
      {children}
    </CardTile>
  );
}

/** A pile's spot on the mat: its top card (face up) or a card back, and how many cards there are. */
function Pile({ side, zone, count, top, back, note }: { side: PlayerSideView; zone: "deck" | "cemetery" | "banished" | "evolveDeck"; count: number; top?: CardView | null; back?: boolean; note?: string }) {
  const t = useT();
  const browsable = zone !== "deck" && count > 0;
  return (
    <div
      className={`sve-pile${browsable ? " sve-pile-browsable" : ""}`}
      data-zone={`${side.id}:${zone}`}
      role={browsable ? "button" : undefined}
      title={t(PILE_LABELS[zone])}
      onClick={browsable ? () => openZone({ player: side.id, zone }) : undefined}
    >
      {count > 0 && top ? <CardTile card={top} side={side} className="sve-slot-card" /> : null}
      {count > 0 && !top && back ? <div className="sve-slot-back sve-card-back" /> : null}
      {count > 0 ? <span className="sve-pile-count">{count}</span> : null}
      {note ? <span className="sve-pile-note">{note}</span> : null}
    </div>
  );
}

const PILE_LABELS = { deck: "game.deck", cemetery: "game.cemetery", banished: "game.banished", evolveDeck: "game.evolveDeck" } as const;

/** One player's playmat: the leader and the piles at their spots, the field above the line, the EX area below. */
function Mat({ update, side, opponent, marks }: { update: GameUpdate; side: PlayerSideView; opponent: boolean; marks: Map<CardId, CardMark> }) {
  const t = useT();
  const linked = [...side.raceZone, ...side.driveZone, ...side.equipmentZone];
  const at = (zone: MatZone, content: ReactNode) => (
    <div className={`sve-mat-zone sve-mat-${zone}`} style={rectStyle(zoneRect(zone, opponent))}>
      {content}
    </div>
  );
  const lastVisible = (cards: readonly (CardView | HiddenCardView)[]): CardView | null => {
    const top = cards[cards.length - 1];
    return top && !top.hidden ? top : null;
  };
  const faceDown = side.evolveDeck.filter((c) => c.hidden || !c.faceUp).length;
  const faceUp = side.evolveDeck.length - faceDown;
  return (
    <div className={`sve-mat ${opponent ? "sve-mat-opponent" : "sve-mat-own"}`} data-drop={opponent ? undefined : "play"} data-player={side.id}>
      <div className="sve-mat-picture" />
      {at(
        "leader",
        side.leader ? (
          <TableCard update={update} card={side.leader} side={side} marks={marks} className="sve-slot-card sve-leader-card">
            <span className="sve-leader-defense" title={t("game.defense")}>
              {side.leaderDefense}
            </span>
          </TableCard>
        ) : null,
      )}
      {at("deck", <Pile side={side} zone="deck" count={side.deckCount} back />)}
      {at("cemetery", <Pile side={side} zone="cemetery" count={side.cemetery.length} top={lastVisible(side.cemetery)} />)}
      {at("banished", <Pile side={side} zone="banished" count={side.banished.length} top={lastVisible(side.banished)} back />)}
      {at(
        "evolveDeck",
        <Pile
          side={side}
          zone="evolveDeck"
          count={side.evolveDeck.length}
          back={faceDown > 0}
          top={faceDown === 0 ? lastVisible(side.evolveDeck) : null}
          note={faceUp > 0 ? t("game.evolveDeckFaceUp", { n: faceUp }) : undefined}
        />,
      )}
      {at(
        "field",
        <div className="sve-mat-row sve-field-row" data-zone={`${side.id}:field`}>
          {side.field.map((card) => {
            const attached = card.hidden ? [] : linked.filter((l) => l.linkedTo === card.id);
            return (
              <TableCard key={card.id} update={update} card={card} side={side} marks={marks}>
                {attached.length > 0 ? (
                  <div className="sve-attached">
                    {attached.map((a) => (
                      <CardTile key={a.id} card={a} side={side} size="small" />
                    ))}
                  </div>
                ) : null}
              </TableCard>
            );
          })}
        </div>,
      )}
      {at(
        "ex",
        <div className="sve-mat-row sve-ex-row" data-zone={`${side.id}:ex`}>
          {side.ex.map((card) => (
            <TableCard key={card.id} update={update} card={card} side={side} marks={marks} className="sve-ex-card" />
          ))}
        </div>,
      )}
    </div>
  );
}

/** A hand outside the mat: yours fanned (a card rises under the pointer), the opponent's backs turned around. */
function HandStrip({ update, side, opponent, marks, layout }: { update: GameUpdate; side: PlayerSideView; opponent: boolean; marks: Map<CardId, CardMark>; layout: TableLayout }) {
  const cards = side.hand;
  const n = cards.length;
  const cardWidth = opponent ? layout.opponentHandCardWidth : layout.handCardWidth;
  const gap = cardWidth * 0.06;
  const natural = n * cardWidth + Math.max(0, n - 1) * gap;
  const step = n > 1 && natural > layout.handWidth ? (layout.handWidth - cardWidth) / (n - 1) : cardWidth + gap;
  const mid = (n - 1) / 2;
  return (
    <div className={`sve-hand-strip ${opponent ? "sve-hand-opponent" : "sve-hand-own"}`} data-zone={`${side.id}:hand`}>
      <div className="sve-hand-cards" style={{ width: n > 0 ? step * (n - 1) + cardWidth : 0 }}>
        {cards.map((card, i) => {
          const tilt = opponent ? 0 : (i - mid) * Math.min(2.5, 20 / Math.max(n, 1));
          const sink = opponent ? 0 : (i - mid) ** 2 * Math.min(1.2, 10 / Math.max(n, 1));
          return (
            <TableCard
              key={card.id}
              update={update}
              card={card}
              side={side}
              marks={marks}
              className={opponent ? "sve-hand-card sve-card-opponent" : "sve-hand-card"}
              style={{ left: i * step, zIndex: i + 1, "--fan-tilt": `${tilt}deg`, "--fan-sink": `${sink}px` } as CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Beside a mat: who plays it, leader defense, play points, evolution points, hand and deck sizes. */
function PlayerPanel({ update, side, opponent }: { update: GameUpdate; side: PlayerSideView; opponent: boolean }) {
  const t = useT();
  const active = update.view.activePlayer === side.id && update.view.phase !== "over";
  const deciding = update.waitingFor === side.id;
  const you = side.id === update.perspective && update.controllers[side.id] === "human";
  return (
    <div className={`sve-player-panel ${opponent ? "sve-player-opponent" : "sve-player-own"}${active ? " sve-active" : ""}${deciding ? " sve-deciding" : ""}`}>
      <div className="sve-player-name">
        {playerLabel(side.id, update, t)}
        {you ? ` · ${t("game.you")}` : ""}
      </div>
      <div className="sve-player-defense" title={t("game.defense")}>
        {side.leaderDefense}
      </div>
      <div className="sve-player-pp" title={t("game.pp")}>
        <span className="sve-player-label">{t("game.pp")}</span>
        <strong>{side.playPoints}</strong>
        <span>/{side.maxPlayPoints}</span>
      </div>
      <div className="sve-player-points">
        <span title={t("game.ep")}>
          {t("game.ep")} <strong>{side.evolutionPoints}</strong>
        </span>
        <span title={t("game.sep")}>
          {t("game.sep")} <strong>{side.superEvolutionPoints}</strong>
        </span>
      </div>
      <div className="sve-player-counts">
        {t("game.hand")} {side.hand.length} · {t("game.deck")} {side.deckCount}
      </div>
      {side.universe ? <div className="sve-universe">{t(`universe.${side.universe}` as const)}</div> : null}
      {side.triggerZone.length > 0 ? (
        <div className="sve-trigger" data-zone={`${side.id}:triggerZone`}>
          <span className="sve-zone-label">{t("game.trigger")}</span>
          {side.triggerZone.map((c) => (
            <CardTile key={c.id} card={c} side={side} size="small" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Table({ update, onNewGame, onMenu }: { update: GameUpdate; onNewGame: () => void; onMenu: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const layout = useTableLayout(ref);
  const marks = useMarks(update);
  const t = useT();
  const me = update.perspective;
  const opponent = opponentOf(me);
  const view = update.view;
  const vars = {
    "--mat-width": `${layout.matWidth}px`,
    "--mat-height": `${layout.matHeight}px`,
    "--sve-card-base": `${layout.cardWidth}px`,
    "--hand-height": `${layout.handHeight}px`,
    "--opponent-hand-height": `${layout.opponentHandHeight}px`,
    "--hand-card-width": `${layout.handCardWidth}px`,
    "--opponent-hand-card-width": `${layout.opponentHandCardWidth}px`,
    "--side-width": `${layout.sideWidth}px`,
  } as CSSProperties;
  return (
    <div className="sve-table" ref={ref} style={vars}>
      <HandStrip update={update} side={view.players[opponent]} opponent marks={marks} layout={layout} />
      <div className="sve-mats">
        <Mat update={update} side={view.players[opponent]} opponent marks={marks} />
        <Mat update={update} side={view.players[me]} opponent={false} marks={marks} />
        <PlayerPanel update={update} side={view.players[opponent]} opponent />
        <PlayerPanel update={update} side={view.players[me]} opponent={false} />
        <CenterLine update={update} />
        {view.resolution.length > 0 ? (
          <div className="sve-resolution-zone" data-zone="resolution" title={t("game.resolution")}>
            {view.resolution.map((c) => (
              <CardTile key={c.id} card={c} side={view.players[c.controller]} size="large" mark={marks.get(c.id) ?? null} />
            ))}
          </div>
        ) : null}
      </div>
      <HandStrip update={update} side={view.players[me]} opponent={false} marks={marks} layout={layout} />
      <AttackArrow update={update} />
      <DragLayer update={update} />
      <CardMenu update={update} />
      <ResultOverlay update={update} onNewGame={onNewGame} onMenu={onMenu} />
    </div>
  );
}
