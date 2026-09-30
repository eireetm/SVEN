// Manual debugging (docs/gui.md "手动调试"): at a main phase decision, a click on a card, a deck, a leader or a player's panel
// opens this window. It lists the legal actions of the decision for a card (marked legal) and everything that can be done by
// hand (marked illegal: model/manual.ts in the core, which carries them out with its own procedures, so abilities trigger).
// The core says which of them the rules' checks allow (update.manual: free plays, evolutions, abilities); the rest only
// needs the card to be where it is.
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IMPLEMENTED_KEYWORDS, opponentOf, type CardId, type CardView, type Keyword, type ManualDestination, type ManualOp, type PlayerId } from "@sve/core";
import { cardName } from "../../app/catalog";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { findCard, zoneOf } from "../../engine/view-utils";
import { useT } from "../../i18n";
import { COUNTER_NAMES, counterName } from "../../i18n/counters";
import { actionsFor, answerFor, attackTargets, openManual, sendAnswer, sendManual, useInteraction } from "../interaction";
import { abilityLabel, actionLabel, cardLabel, playerLabel } from "../labels";
import { useBack } from "../../app/back";

const DESTINATIONS: readonly ManualDestination[] = ["hand", "field", "ex", "cemetery", "banished", "deckTop", "deckBottom"];

/** A section of the window: legal (from the decision) or illegal (by hand). */
function Section({ title, legal = false, children }: { title: string; legal?: boolean; children: ReactNode }) {
  const t = useT();
  return (
    <section className={`sve-manual-section ${legal ? "sve-manual-legal" : "sve-manual-illegal"}`}>
      <h4>
        {title}
        <span className="sve-manual-tag">{t(legal ? "manual.legal" : "manual.illegal")}</span>
      </h4>
      <div className="sve-manual-buttons">{children}</div>
    </section>
  );
}

/** A number and a button: "Deal damage [2] →". */
function Amount({ label, initial = 1, min = 1, max = 99, onApply, testId }: { label: string; initial?: number; min?: number; max?: number; onApply: (n: number) => void; testId?: string }) {
  const [value, setValue] = useState(initial);
  const n = Math.max(min, Math.min(max, Math.trunc(value) || 0));
  return (
    <span className="sve-manual-amount">
      <input type="number" min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))} data-testid={testId ? `${testId}-value` : undefined} />
      <button type="button" onClick={() => onApply(n)} data-testid={testId}>
        {label}
      </button>
    </span>
  );
}

export function ManualDialog({ update }: { update: GameUpdate }) {
  const target = useInteraction((s) => s.manual);
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") openManual(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useBack(target !== null, () => openManual(null));
  // A card that moved is a new card (CR 4.1.4): the window closes.
  const gone = target?.kind === "card" && !findCard(update.view, target.card);
  useEffect(() => {
    if (gone) openManual(null);
  }, [gone]);
  if (!target || !update.manual || gone) return null;
  const player = (p: PlayerId) => playerLabel(p, update, t);
  const title =
    target.kind === "card" ? null : t(target.kind === "deck" ? "manual.title.deck" : target.kind === "leader" ? "manual.title.leader" : "manual.title.player", { player: player(target.player) });
  return createPortal(
    <div className="sve-modal-backdrop" onClick={() => openManual(null)}>
      <div className="sve-modal sve-manual" onClick={(e) => e.stopPropagation()} role="dialog" data-testid="manual-dialog">
        <header className="sve-modal-header">
          <span>{title ?? <CardTitle update={update} card={target.kind === "card" ? target.card : ""} />}</span>
          <button type="button" onClick={() => openManual(null)}>
            {t("game.close")}
          </button>
        </header>
        {target.kind === "card" ? <CardOps update={update} card={target.card} /> : null}
        {target.kind === "deck" ? <DeckOps update={update} player={target.player} /> : null}
        {target.kind === "leader" ? <LeaderOps update={update} player={target.player} /> : null}
        {target.kind === "player" ? <PlayerOps update={update} player={target.player} /> : null}
      </div>
    </div>,
    document.body,
  );
}

function CardTitle({ update, card }: { update: GameUpdate; card: CardId }) {
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const t = useT();
  return <>{cardLabel(card, update, catalog, cardLang, t)}</>;
}

/** A card's actions: the decision's (legal), then by hand: attack, evolve, play, abilities; its state; where it goes. */
function CardOps({ update, card }: { update: GameUpdate; card: CardId }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang, uiLang } = useSettings();
  const view = findCard(update.view, card)!;
  const where = zoneOf(update.view, card);
  const info = update.decision!;
  const decision = info.decision;
  const manual = update.manual!;
  const name = (id: CardId) => cardLabel(id, update, catalog, cardLang, t);
  // Operations that move the card or start something close the window; the others keep it for the next one.
  const run = (op: ManualOp, close = false) => {
    sendManual(update, op);
    if (close) openManual(null);
  };
  const legal = actionsFor(decision, card);
  const onField = where?.zone === "field";
  const follower = view.type === "follower";
  const fieldCard = view.type === "follower" || view.type === "amulet";
  // Attack whatever the rules forbid: every enemy follower on the field and the enemy leader, but the legal targets.
  const enemy = update.view.players[opponentOf(view.controller)];
  const legalTargets = new Set(attackTargets(decision, card));
  const targets =
    onField && follower && view.controller === update.view.activePlayer
      ? [...enemy.field.filter((c): c is CardView => !c.hidden && c.type === "follower").map((c) => c.id), ...(enemy.leader ? [enemy.leader.id] : [])].filter(
          (id) => !legalTargets.has(id),
        )
      : [];
  // Evolve cards with the same definition evolve it the same way: one button each.
  const evolveWith = (manual.evolveWith[card] ?? []).filter(
    (o, i, all) => all.findIndex((x) => x.backFace === o.backFace && (findCard(update.view, x.card)?.def ?? x.card) === (findCard(update.view, o.card)?.def ?? o.card)) === i,
  );
  const abilities = manual.activatable.filter((key) => key.startsWith(`${card}:`));
  const evolvedName = (id: CardId, backFace: boolean) => {
    const def = catalog.def(findCard(update.view, id)?.def ?? "");
    return cardName(backFace && def?.backFace ? catalog.def(def.backFace) : def, cardLang, name(id));
  };
  const destinations = DESTINATIONS.filter((d) => d !== where?.zone && (d !== "field" || fieldCard));
  const canMove = where !== null && ["hand", "field", "ex", "cemetery", "banished"].includes(where.zone) && view.type !== "leader" && view.type !== "crest";
  return (
    <>
      {legal.length > 0 ? (
        <Section title={t("manual.legalActions")} legal>
          {legal.map((action, i) => (
            <button key={i} type="button" className="sve-primary" onClick={() => (openManual(null), sendAnswer(update, answerFor(decision, action)))}>
              {actionLabel(action, info, update, catalog, cardLang, t)}
            </button>
          ))}
        </Section>
      ) : null}
      {targets.length + evolveWith.length + abilities.length > 0 || manual.playable.includes(card) ? (
        <Section title={t("manual.actions")}>
          {targets.map((target) => (
            <button key={target} type="button" onClick={() => run({ kind: "attack", attacker: card, target }, true)} data-testid="manual-attack">
              {t("manual.attack", { target: name(target) })}
            </button>
          ))}
          {evolveWith.flatMap((o) => [
            <button key={`e${o.card}`} type="button" onClick={() => run({ kind: "evolve", card, evolveCard: o.card, superEvolve: false, ...(o.backFace ? { backFace: true } : {}) }, true)}>
              {t("manual.evolve", { card: evolvedName(o.card, o.backFace) })}
            </button>,
            <button key={`s${o.card}`} type="button" onClick={() => run({ kind: "evolve", card, evolveCard: o.card, superEvolve: true, ...(o.backFace ? { backFace: true } : {}) }, true)}>
              {t("manual.superEvolve", { card: evolvedName(o.card, o.backFace) })}
            </button>,
          ])}
          {manual.playable.includes(card) ? (
            <button type="button" onClick={() => run({ kind: "play", card }, true)} data-testid="manual-play">
              {t("manual.play")}
            </button>
          ) : null}
          {abilities.map((key) => (
            <button key={key} type="button" onClick={() => run({ kind: "activate", card, ability: Number(key.split(":")[1]) }, true)}>
              {t("manual.activate", { ability: abilityLabel(manual.abilities[key], t) })}
            </button>
          ))}
        </Section>
      ) : null}
      {onField ? (
        <Section title={t("manual.state")}>
          <button type="button" onClick={() => run({ kind: "engage", card, engaged: !view.engaged })} data-testid="manual-engage">
            {t(view.engaged ? "manual.stand" : "manual.engage")}
          </button>
          {follower ? <Amount label={t("manual.damage")} onApply={(amount) => run({ kind: "damage", card, amount })} testId="manual-damage" /> : null}
          {follower && view.damage > 0 ? <Amount label={t("manual.heal")} initial={view.damage} onApply={(amount) => run({ kind: "heal", card, amount })} /> : null}
          <StatsInput onApply={(attack, defense) => run({ kind: "stats", card, attack, defense })} />
          <KeywordInput onApply={(keyword) => run({ kind: "keyword", card, keyword })} />
        </Section>
      ) : null}
      {onField || where?.zone === "ex" ? (
        <Section title={t("manual.counters")}>
          <CounterInput view={view} lang={uiLang} onApply={(counter, amount) => run({ kind: "counters", card, counter, amount })} />
        </Section>
      ) : null}
      {canMove ? (
        <Section title={t("manual.move")}>
          {destinations.map((to) => (
            <button key={to} type="button" onClick={() => run({ kind: "move", card, to }, true)} data-testid={`manual-move-${to}`}>
              {t(`manual.to.${to}`)}
            </button>
          ))}
          {onField ? (
            <button type="button" onClick={() => run({ kind: "destroy", card }, true)} data-testid="manual-destroy">
              {t("manual.destroy")}
            </button>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}

function StatsInput({ onApply }: { onApply: (attack: number, defense: number) => void }) {
  const t = useT();
  const [attack, setAttack] = useState(1);
  const [defense, setDefense] = useState(1);
  const clamp = (n: number) => Math.max(-99, Math.min(99, Math.trunc(n) || 0));
  return (
    <span className="sve-manual-amount">
      <input type="number" min={-99} max={99} value={attack} onChange={(e) => setAttack(Number(e.target.value))} aria-label={t("card.attack")} />
      <input type="number" min={-99} max={99} value={defense} onChange={(e) => setDefense(Number(e.target.value))} aria-label={t("card.defense")} />
      <button type="button" disabled={clamp(attack) === 0 && clamp(defense) === 0} onClick={() => onApply(clamp(attack), clamp(defense))}>
        {t("manual.stats")}
      </button>
    </span>
  );
}

function KeywordInput({ onApply }: { onApply: (keyword: Keyword) => void }) {
  const t = useT();
  const [keyword, setKeyword] = useState<Keyword>("ward");
  return (
    <span className="sve-manual-amount">
      <select value={keyword} onChange={(e) => setKeyword(e.target.value as Keyword)}>
        {IMPLEMENTED_KEYWORDS.map((k) => (
          <option key={k} value={k}>
            {t(`keyword.${k}`)}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => onApply(keyword)}>
        {t("manual.keyword")}
      </button>
    </span>
  );
}

/** A counter kind (the card's own first, then every kind the GUI names) and how many to put or remove. */
function CounterInput({ view, lang, onApply }: { view: CardView; lang: "en" | "zh" | "ja"; onApply: (counter: string, amount: number) => void }) {
  const t = useT();
  const kinds = [...new Set([...Object.keys(view.counters), ...Object.keys(COUNTER_NAMES)])];
  const [counter, setCounter] = useState(kinds[0] ?? "stack");
  const [n, setN] = useState(1);
  const amount = Math.max(1, Math.min(99, Math.trunc(n) || 1));
  return (
    <span className="sve-manual-amount">
      <select value={counter} onChange={(e) => setCounter(e.target.value)}>
        {kinds.map((k) => (
          <option key={k} value={k}>
            {counterName(k, lang)}
            {view.counters[k] ? ` (${view.counters[k]})` : ""}
          </option>
        ))}
      </select>
      <input type="number" min={1} max={99} value={n} onChange={(e) => setN(Number(e.target.value))} />
      <button type="button" onClick={() => onApply(counter, amount)}>
        {t("manual.add")}
      </button>
      <button type="button" disabled={!view.counters[counter]} onClick={() => onApply(counter, -amount)}>
        {t("manual.remove")}
      </button>
    </span>
  );
}

/** A deck: draw, top cards to the cemetery, shuffle, and any card of it into the hand (by definition: the order stays hidden). */
function DeckOps({ update, player }: { update: GameUpdate; player: PlayerId }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const deck = Object.entries(update.manual!.decks[player])
    .map(([def, n]) => ({ def, n, name: cardName(catalog.def(def), cardLang, def) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const size = update.view.players[player].deckCount;
  return (
    <>
      <Section title={t("manual.actions")}>
        <Amount label={t("manual.draw")} max={Math.max(1, Math.min(60, size + 1))} onApply={(count) => sendManual(update, { kind: "draw", player, count })} testId="manual-draw" />
        <Amount label={t("manual.mill")} max={Math.max(1, Math.min(60, size))} onApply={(count) => sendManual(update, { kind: "mill", player, count })} />
        <button type="button" onClick={() => sendManual(update, { kind: "shuffle", player })}>
          {t("manual.shuffle")}
        </button>
      </Section>
      <Section title={t("manual.search")}>
        <p className="sve-hint">{t("manual.searchHint")}</p>
        <div className="sve-manual-list">
          {deck.map((entry) => (
            <button key={entry.def} type="button" onClick={() => sendManual(update, { kind: "search", player, def: entry.def })} data-testid="manual-search">
              {entry.name} ×{entry.n}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

/** A leader's defense: up and down by 1 or 5, or set. */
function LeaderOps({ update, player }: { update: GameUpdate; player: PlayerId }) {
  const t = useT();
  const defense = update.view.players[player].leaderDefense;
  const set = (value: number) => sendManual(update, { kind: "leaderDefense", player, value: Math.max(-99, Math.min(999, value)) });
  return (
    <Section title={`${t("manual.defense")} ${defense}`}>
      {[-5, -1, 1, 5].map((d) => (
        <button key={d} type="button" onClick={() => set(defense + d)} data-testid={`manual-defense-${d}`}>
          {d > 0 ? `+${d}` : d}
        </button>
      ))}
      <Amount key={defense} label={t("manual.set")} initial={defense} min={-99} max={999} onApply={set} />
    </Section>
  );
}

/** A player's play points, maximum, evolution and super-evolution points; tokens to create. */
function PlayerOps({ update, player }: { update: GameUpdate; player: PlayerId }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const side = update.view.players[player];
  const [points, setPoints] = useState({ playPoints: side.playPoints, maxPlayPoints: side.maxPlayPoints, evolutionPoints: side.evolutionPoints, superEvolutionPoints: side.superEvolutionPoints });
  const [query, setQuery] = useState("");
  const fields = [
    ["playPoints", t("game.pp")],
    ["maxPlayPoints", t("manual.maxPlayPoints")],
    ["evolutionPoints", t("game.ep")],
    ["superEvolutionPoints", t("game.sep")],
  ] as const;
  const clamp = (n: number) => Math.max(0, Math.min(99, Math.trunc(n) || 0));
  const q = query.trim().toLowerCase();
  const tokens = catalog.cards
    .filter((c) => c.token && c.type !== "leader")
    .map((c) => ({ card: c, name: cardName(c, cardLang) }))
    .filter(({ card, name }) => q === "" || name.toLowerCase().includes(q) || card.name.toLowerCase().includes(q) || card.id.toLowerCase().startsWith(q))
    .slice(0, 40);
  return (
    <>
      <Section title={t("manual.set")}>
        {fields.map(([key, label]) => (
          <label key={key} className="sve-manual-amount">
            <span>{label}</span>
            <input type="number" min={0} max={99} value={points[key]} onChange={(e) => setPoints((p) => ({ ...p, [key]: Number(e.target.value) }))} data-testid={`manual-${key}`} />
          </label>
        ))}
        <button
          type="button"
          className="sve-primary"
          onClick={() =>
            sendManual(update, {
              kind: "points",
              player,
              playPoints: clamp(points.playPoints),
              maxPlayPoints: clamp(points.maxPlayPoints),
              evolutionPoints: clamp(points.evolutionPoints),
              superEvolutionPoints: clamp(points.superEvolutionPoints),
            })
          }
          data-testid="manual-points"
        >
          {t("manual.set")}
        </button>
      </Section>
      <Section title={t("manual.token")}>
        <input className="sve-manual-search" placeholder={t("manual.tokenSearch")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="sve-manual-list">
          {tokens.map(({ card, name }) => (
            <span key={card.id} className="sve-manual-token">
              <span>{name}</span>
              {card.type !== "crest" ? (
                <button type="button" onClick={() => sendManual(update, { kind: "token", player, token: card.id, to: "field" })}>
                  {t("manual.onField")}
                </button>
              ) : null}
              <button type="button" onClick={() => sendManual(update, { kind: "token", player, token: card.id, to: "ex" })}>
                {t("manual.inEx")}
              </button>
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}
