// The table moves with the game, in an order that reads without the log (docs/gui.md 3, "动画"). Each update's events
// (already hidden for the viewer) say what happened; the snapshot says where things were:
//  1. cards fly from their old places to their new ones; a card that is hit waits where it was until it has been hit;
//  2. an attack nothing stopped before its combat shows its red arrow first (one still going on has its own, AttackArrow);
//     at the combat the attacker lunges at its target and the damage shows as it strikes;
//  3. a played card (spell, follower, amulet) shows in its player's corner once it has landed on the field or in the
//     cemetery — the opponent's at the top right, one's own at the bottom left — wiping in and out (a Quick one played at
//     quick timing is shown by its announcement instead);
//  4. the cards an effect selected get a blue arrow from its source (a played card: from its corner), then their damage;
//  5. numbers rise for damage and healing, evolving followers turn over.
// All of it is short and purely cosmetic: the table itself always shows the engine's latest view.
import type { CardId } from "@sve/core";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../../app/settings";
import { onBeforeUpdate } from "../../app/store";
import type { CardInfo, GameUpdate } from "../../engine/protocol";
import { Arrow, type Point } from "../board/Arrow";
import { CardTile } from "../card/CardTile";
import { flip, floatText, flyIn, flyOut, lunge, popIn, shake } from "./effects";
import { attacksIn, planFlights, playedCards, selectionsIn } from "./plan";
import { captureTable, takeSnapshot, type Snapshot } from "./snapshot";

onBeforeUpdate(captureTable);

/** When things happen in an update's animation (ms after it is shown). */
const LANDED = 320; // the flights (380 ms) have about landed: a played card shows in its corner
const SHOWCASE = 900; // a played card's wipe in, its stay and its wipe out
const FROM_CORNER = LANDED + 170; // the arrows of a played card, once it has wiped in
const FROM_TABLE = 120; // the arrows of a card on the table
const ARROW = 700; // how long an arrow is shown
const LUNGE = 220; // an attack whose arrow is drawn now lunges after it
const STRIKE = 170; // the damage of an attack shows as the lunge strikes; an effect's, this long after its arrow
const LEAVE = 330; // a card that was hit and has gone waits this long before it flies away

const cardElement = (id: CardId): HTMLElement | null => document.querySelector<HTMLElement>(`.sve-table [data-card="${CSS.escape(id)}"]`);

const zoneBox = (key: string | null): DOMRect | undefined =>
  key ? document.querySelector<HTMLElement>(`.sve-table [data-zone="${CSS.escape(key)}"]`)?.getBoundingClientRect() : undefined;

const center = (box: DOMRect | undefined): Point | null => (box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null);

interface Showcase {
  key: string;
  card: CardInfo;
  own: boolean;
  delay: number;
}

interface Flash {
  key: string;
  from: Point;
  to: Point;
  variant: "attack" | "target";
}

interface Effects {
  /** Run `fn` after `ms` (cancelled if the table goes away). */
  later(ms: number, fn: () => void): void;
  show(showcase: Showcase): void;
  /** An arrow shown at `ms`, between the points found then. */
  flash(ms: number, variant: Flash["variant"], from: () => Point | null, to: () => Point | null): void;
}

/** Start the animations of one update. */
function animate(update: GameUpdate, snapshot: Snapshot, fx: Effects): void {
  // Where a card is now, or was just before the update (it has left).
  const position = (id: CardId): Point | null => center(cardElement(id)?.getBoundingClientRect() ?? snapshot.cards.get(id)?.rect);
  const skip = update.announcement?.source ?? null;
  const hitAt = new Map<CardId, number>();
  const hit = (id: CardId, at: number) => hitAt.set(id, Math.min(hitAt.get(id) ?? Infinity, at));

  // 3. Played cards, one after another in their corners.
  const played = playedCards(update.log, skip);
  const corner = new Map<CardId, { key: string; at: number }>();
  played.forEach((p, i) => {
    const key = `${update.inputCount}:${p.id}`;
    corner.set(p.id, { key, at: LANDED + i * SHOWCASE });
    fx.show({ key, card: p.card, own: p.player === update.perspective, delay: LANDED + i * SHOWCASE });
  });

  // 2. Attacks nothing stopped before their combat: the arrow, then the lunge. Others lunge as their combat comes.
  const lunges = new Map<CardId, { target: CardId; at: number }>();
  for (const attack of attacksIn(update.log)) {
    fx.flash(0, "attack", () => position(attack.attacker), () => position(attack.target));
    lunges.set(attack.attacker, { target: attack.target, at: LUNGE });
  }
  for (const { event } of update.log) {
    if (event.type !== "damageDealt") continue;
    // CR 8.4.9: the attack damage, and the combat damage back to the attacker, as the attacker strikes.
    if (event.kind === "attack" && event.source !== null) {
      if (!lunges.has(event.source)) lunges.set(event.source, { target: event.target, at: 0 });
      hit(event.target, lunges.get(event.source)!.at + STRIKE);
    } else if (event.kind === "combat") hit(event.target, (lunges.get(event.target)?.at ?? 0) + STRIKE);
  }
  for (const [attacker, { target, at }] of lunges) {
    fx.later(at, () => {
      const a = cardElement(attacker);
      const b = cardElement(target);
      if (a && b) lunge(a, b);
    });
  }

  // 4. Cards an effect selected: an arrow from its source, then they are hit.
  for (const selection of selectionsIn(update.log, skip)) {
    const shown = corner.get(selection.source);
    const at = shown ? shown.at + (FROM_CORNER - LANDED) : FROM_TABLE;
    const from = shown
      ? () => center(document.querySelector(`[data-showcase="${CSS.escape(shown.key)}"] .sve-card`)?.getBoundingClientRect()) ?? position(selection.source)
      : () => position(selection.source);
    for (const target of selection.targets) {
      if (target === selection.source) continue;
      fx.flash(at, "target", from, () => position(target));
      hit(target, at + STRIKE);
    }
  }

  // 1. The flights; a card hit on its way out waits where it was until it has been hit.
  for (const flight of planFlights(update.log)) {
    const { origin } = flight;
    const struck = origin.card !== null ? hitAt.get(origin.card) : undefined;
    const delay = struck !== undefined ? struck + LEAVE : 0;
    const from = (origin.card ? snapshot.cards.get(origin.card)?.rect : undefined) ?? (origin.zone ? snapshot.zones.get(origin.zone) : undefined);
    const element = flight.card ? cardElement(flight.card) : null;
    if (element) {
      if (from) flyIn(element, from, 380, delay);
      else popIn(element);
      continue;
    }
    // Not shown where it went (a deck, a face-down pile, the evolve zone): its old picture goes there.
    const source = origin.card ? snapshot.cards.get(origin.card) : undefined;
    const to = zoneBox(flight.to);
    if (source && to) flyOut(source, to, 420, delay);
  }

  // 5. Numbers and turns.
  for (const entry of update.log) {
    const event = entry.event;
    switch (event.type) {
      case "damageDealt": {
        if (event.amount <= 0) break;
        const at = position(event.target);
        fx.later(hitAt.get(event.target) ?? 0, () => {
          if (at) floatText(at.x, at.y, `-${event.amount}`, "damage");
          const element = cardElement(event.target);
          if (element) shake(element);
        });
        break;
      }
      case "leaderDefenseChanged": {
        // Damage shows with damageDealt; this is for healing and "+X" (CR 5.27).
        const leader = update.view.players[event.player].leader;
        const at = leader ? position(leader.id) : null;
        if (at && event.delta > 0) floatText(at.x, at.y, `+${event.delta}`, "heal");
        break;
      }
      case "evolved": {
        const element = cardElement(event.card);
        if (element) flip(element);
        break;
      }
      default:
        break;
    }
  }
}

export function AnimationLayer({ update }: { update: GameUpdate }) {
  const { animations } = useSettings();
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const timers = useRef(new Set<number>());
  const seq = useRef(0);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
    };
  }, []);
  useLayoutEffect(() => {
    const snapshot = takeSnapshot();
    if (!animations || !snapshot || update.logReset) return;
    const later = (ms: number, fn: () => void) => {
      if (ms <= 0) return fn();
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        fn();
      }, ms);
      timers.current.add(timer);
    };
    animate(update, snapshot, {
      later,
      show: (showcase) => {
        setShowcases((all) => [...all, showcase]);
        later(showcase.delay + SHOWCASE, () => setShowcases((all) => all.filter((s) => s.key !== showcase.key)));
      },
      flash: (ms, variant, from, to) =>
        later(ms, () => {
          const [a, b] = [from(), to()];
          if (!a || !b) return;
          const key = `flash-${++seq.current}`;
          setFlashes((all) => [...all, { key, from: a, to: b, variant }]);
          later(ARROW, () => setFlashes((all) => all.filter((f) => f.key !== key)));
        }),
    });
  }, [update, animations]);
  const table = document.querySelector(".sve-table");
  return (
    <>
      {table
        ? createPortal(
            showcases.map((s) => (
              <div
                key={s.key}
                className={`sve-showcase ${s.own ? "sve-showcase-own" : "sve-showcase-opponent"}`}
                style={{ animationDelay: `${s.delay}ms` }}
                data-showcase={s.key}
                data-testid="showcase"
              >
                <div className="sve-showcase-card">
                  <CardTile info={s.card} />
                </div>
              </div>
            )),
            table,
          )
        : null}
      {flashes.map((f) => (
        <Arrow key={f.key} from={f.from} to={f.to} variant={f.variant} flash={ARROW} />
      ))}
    </>
  );
}
