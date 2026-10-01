// A person's decision that the table can't answer, in a window over the table: the order of pending abilities, choices
// (CR 5.18 "choose" and others), confirmations (an optional cost ...), the order of cards, and a selection of cards that are
// not all on the table (a search, a pile, cards looked at). Everything else is answered on the table (actions.ts
// inDialog). Every option comes from the decision itself: the GUI never works out what is legal.
import { useState, type ReactNode } from "react";
import { useBack } from "../../app/back";
import type { Answer, CardId, Decision } from "@sve/core";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { CardInfo, DecisionInfo, GameUpdate } from "../../engine/protocol";
import { findCard, isOnTable } from "../../engine/view-utils";
import { useT, type MessageKey, type Translate } from "../../i18n";
import { inDialog } from "../actions";
import { CardTile } from "../card/CardTile";
import { setHighlight } from "../focus";
import { sendAnswer, setRedrawing, toggleChosen, useInteraction } from "../interaction";
import { abilityLabel, cardLabel } from "../labels";
import { optionText } from "../options";

type Of<T extends Decision["type"]> = Extract<Decision, { type: T }>;

interface FormProps<T extends Decision["type"]> {
  d: Of<T>;
  info: DecisionInfo;
  update: GameUpdate;
  answer: (a: Answer) => void;
  busy: boolean;
}

function useLabel(update: GameUpdate): (id: CardId) => string {
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const t = useT();
  return (id) => cardLabel(id, update, catalog, cardLang, t);
}

/** "2", "up to 3", "1 to 2" (cards, or the options of a choice). */
export function rangeLabel(min: number, max: number, t: Translate, of: "cards" | "options" = "cards"): string {
  const key = of === "cards" ? "decision.range" : "decision.optionRange";
  if (min === max) return t(`${key}.exact`, { n: min });
  if (min === 0) return t(`${key}.upTo`, { max });
  return t(`${key}.between`, { min, max });
}

/** A button that lights up its cards on the board while pointed at. */
function ActionButton({ ids, onClick, disabled, primary, children }: { ids: CardId[]; onClick: () => void; disabled: boolean; primary?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={primary ? "sve-primary" : undefined}
      disabled={disabled}
      onMouseEnter={() => setHighlight(ids)}
      onMouseLeave={() => setHighlight([])}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Prompt({ text, source, update }: { text: string; source?: CardId | null; update: GameUpdate }) {
  const t = useT();
  const label = useLabel(update);
  return (
    <div className="sve-prompt">
      <span>{text}</span>
      {source ? (
        <span className="sve-prompt-source" onMouseEnter={() => setHighlight([source])} onMouseLeave={() => setHighlight([])}>
          {t("decision.source", { card: label(source) })}
        </span>
      ) : null}
    </div>
  );
}

function SelectPending({ d, info, update, answer, busy }: FormProps<"selectPending">) {
  const t = useT();
  const label = useLabel(update);
  return (
    <>
      <Prompt text={t("decision.selectPending")} update={update} />
      <div className="sve-actions">
        {d.options.map((id) => {
          const summary = info.abilities[id];
          const source = summary?.source;
          return (
            <ActionButton key={id} ids={source ? [source] : []} disabled={busy} onClick={() => answer({ type: "selectPending", id })}>
              {source ? `${label(source)} — ` : ""}
              {abilityLabel(summary, t)}
            </ActionButton>
          );
        })}
      </div>
    </>
  );
}

export const SELECT_KEYS: Record<Of<"selectCards">["reason"], MessageKey> = {
  target: "decision.select.target",
  cost: "decision.select.cost",
  wardEngage: "decision.select.wardEngage",
  wardEnterEngaged: "decision.select.wardEnterEngaged",
  handLimitDiscard: "decision.select.handLimitDiscard",
  discard: "decision.select.discard",
  search: "decision.select.search",
  fieldLimitKeep: "decision.select.fieldLimitKeep",
  exLimitKeep: "decision.select.exLimitKeep",
  zoneEntry: "decision.select.zoneEntry",
  effect: "decision.select.effect",
  pick: "decision.select.pick",
};

function SelectCards({ d, info, update, answer, busy }: FormProps<"selectCards">) {
  const t = useT();
  const label = useLabel(update);
  // Shared with the table, where the cards that are on it can be clicked too.
  const chosen = useInteraction((s) => s.chosen);
  const single = d.min === 1 && d.max === 1;
  const toggle = (id: CardId) => {
    if (busy) return;
    if (single) return answer({ type: "selectCards", cards: [id] });
    toggleChosen(id, d.max);
  };
  const peekOnly = (d.peek ?? []).filter((p) => !d.candidates.includes(p.id));
  return (
    <>
      <Prompt text={`${t(SELECT_KEYS[d.reason])} — ${t("decision.selectCards", { range: rangeLabel(d.min, d.max, t) })}`} source={d.source} update={update} />
      <div className="sve-choice-cards">
        {d.candidates.map((id, i) => {
          const view = findCard(update.view, id);
          return (
            <CardTile
              key={id}
              card={view ?? undefined}
              info={view ? undefined : (info.cards[id] ?? { def: d.candidateDefs[i]!, printing: null })}
              side={view ? update.view.players[view.controller] : undefined}
              mark={chosen.includes(id) ? "selected" : "candidate"}
              onClick={() => toggle(id)}
            />
          );
        })}
      </div>
      {peekOnly.length > 0 ? (
        <div className="sve-peek">
          <span className="sve-zone-label">{t("decision.lookingAt")}</span>
          {peekOnly.map((p) => (
            <CardTile key={p.id} info={info.cards[p.id] ?? { def: p.def, printing: null }} size="small" />
          ))}
        </div>
      ) : null}
      {d.mandatory && d.mandatory.length > 0 ? <div className="sve-note">{t("decision.mandatory", { cards: d.mandatory.map(label).join(", ") })}</div> : null}
      {!single ? (
        <div className="sve-actions-end">
          <span className="sve-note">{t("decision.selected", { n: chosen.length })}</span>
          {d.min === 0 ? (
            <ActionButton ids={[]} disabled={busy} onClick={() => answer({ type: "selectCards", cards: [] })}>
              {t("decision.none")}
            </ActionButton>
          ) : null}
          <ActionButton ids={chosen} primary disabled={busy || chosen.length < d.min || chosen.length > d.max} onClick={() => answer({ type: "selectCards", cards: chosen })}>
            {t("decision.confirm")}
          </ActionButton>
        </div>
      ) : null}
    </>
  );
}

const CHOOSE_KEYS: Record<Of<"choose">["reason"], MessageKey> = {
  mode: "decision.choose.mode",
  playOption: "decision.choose.playOption",
  token: "decision.choose.token",
  deckPosition: "decision.choose.deckPosition",
  divideDamage: "decision.choose.divideDamage",
  damageOrder: "decision.choose.damageOrder",
  unionBurst: "decision.choose.unionBurst",
  dieReroll: "decision.choose.dieReroll",
  effect: "decision.choose.effect",
};

function Choose({ d, update, answer, busy }: FormProps<"choose">) {
  const t = useT();
  const label = useLabel(update);
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const [chosen, setChosen] = useState<string[]>([]);
  const single = d.max === 1;
  const subject = d.subject ? label(d.subject.id) : "";
  const text = t(CHOOSE_KEYS[d.reason], { card: subject }) + (single ? "" : ` — ${t("decision.choose", { range: rangeLabel(d.min, d.max, t, "options") })}`);
  const option = (o: (typeof d.options)[number]) => optionText(o, d, { catalog, lang: cardLang, t });
  return (
    <>
      <Prompt text={text} source={d.source} update={update} />
      <div className="sve-actions sve-actions-column">
        {d.options.map((o) =>
          single ? (
            <ActionButton key={o.id} ids={d.subject ? [d.subject.id] : []} disabled={busy} onClick={() => answer({ type: "choose", ids: [o.id] })}>
              {option(o)}
            </ActionButton>
          ) : (
            <label key={o.id} className="sve-check">
              <input
                type="checkbox"
                checked={chosen.includes(o.id)}
                disabled={busy || (!chosen.includes(o.id) && chosen.length >= d.max)}
                onChange={() => setChosen((c) => (c.includes(o.id) ? c.filter((x) => x !== o.id) : [...c, o.id]))}
              />
              {option(o)}
            </label>
          ),
        )}
      </div>
      <div className="sve-actions-end">
        {single && d.min === 0 ? (
          <ActionButton ids={[]} disabled={busy} onClick={() => answer({ type: "choose", ids: [] })}>
            {t("decision.none")}
          </ActionButton>
        ) : null}
        {!single ? (
          <ActionButton ids={[]} primary disabled={busy || chosen.length < d.min || chosen.length > d.max} onClick={() => answer({ type: "choose", ids: chosen })}>
            {t("decision.confirm")}
          </ActionButton>
        ) : null}
      </div>
    </>
  );
}

const CONFIRM_KEYS: Record<Of<"confirm">["reason"], MessageKey> = {
  optionalCost: "decision.confirm.optionalCost",
  earthRite: "decision.confirm.earthRite",
  effect: "decision.confirm.effect",
  driveTrigger: "decision.confirm.driveTrigger",
};

function Confirm({ d, update, answer, busy }: FormProps<"confirm">) {
  const t = useT();
  const label = useLabel(update);
  const ids = [d.source, d.subject?.id].filter((x): x is CardId => !!x);
  return (
    <>
      <Prompt text={t(CONFIRM_KEYS[d.reason], { card: d.subject ? label(d.subject.id) : "" })} source={d.source} update={update} />
      {d.subject && !findCard(update.view, d.subject.id) ? (
        <div className="sve-choice-cards">
          <CardTile info={{ def: d.subject.def, printing: null }} size="small" />
        </div>
      ) : null}
      <div className="sve-actions-end">
        <ActionButton ids={ids} primary disabled={busy} onClick={() => answer({ type: "confirm", yes: true })}>
          {t("decision.yes")}
        </ActionButton>
        <ActionButton ids={ids} disabled={busy} onClick={() => answer({ type: "confirm", yes: false })}>
          {t("decision.no")}
        </ActionButton>
      </div>
    </>
  );
}

/**
 * Cards put on the deck in an order the person sets, shown as a pile: the top of the list is the card that ends up
 * highest. "Up" and "down" move a card there in the list at once.
 */
function CardOrder({ order, setOrder, card, label, busy }: { order: CardId[]; setOrder: (order: CardId[]) => void; card: (id: CardId) => CardInfo; label: (id: CardId) => string; busy: boolean }) {
  const t = useT();
  const move = (i: number, by: number) => {
    const next = [...order];
    const [moved] = next.splice(i, 1);
    next.splice(i + by, 0, moved!);
    setOrder(next);
  };
  return (
    <ol className="sve-order" data-testid="card-order">
      {order.map((id, i) => (
        <li key={id} className="sve-order-item" data-card-order={id}>
          <span className="sve-order-position">{i + 1}</span>
          <CardTile info={card(id)} size="small" />
          <span className="sve-order-name">{label(id)}</span>
          <span className="sve-order-buttons">
            <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} data-testid="order-up">
              {t("decision.up")}
            </button>
            <button type="button" disabled={busy || i === order.length - 1} onClick={() => move(i, 1)} data-testid="order-down">
              {t("decision.down")}
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrderCards({ d, info, update, answer, busy }: FormProps<"orderCards">) {
  const t = useT();
  const label = useLabel(update);
  const [order, setOrder] = useState<CardId[]>(d.cards.map((c) => c.id));
  const card = (id: CardId): CardInfo => info.cards[id] ?? { def: d.cards.find((c) => c.id === id)!.def, printing: null };
  return (
    <>
      <Prompt text={t(d.reason === "deckTop" ? "decision.orderCards.deckTop" : "decision.orderCards.deckBottom")} source={d.source} update={update} />
      <CardOrder order={order} setOrder={setOrder} card={card} label={label} busy={busy} />
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => answer({ type: "orderCards", order })}>
          {t("decision.confirm")}
        </ActionButton>
      </div>
    </>
  );
}

/**
 * CR 6.2.1.8: redrawing puts the hand on the bottom of the deck in any order (the answer's bottomOrder, top first), then
 * the player draws again. Opened by the table's "Redraw"; "Cancel" goes back to keeping or redrawing.
 */
function MulliganOrder({ d, info, update, answer, busy }: FormProps<"mulligan">) {
  const t = useT();
  const label = useLabel(update);
  const [order, setOrder] = useState<CardId[]>(d.hand);
  useBack(true, () => setRedrawing(false));
  return (
    <>
      <p className="sve-prompt">{t("decision.mulliganOrder")}</p>
      <CardOrder order={order} setOrder={setOrder} card={(id) => info.cards[id]!} label={label} busy={busy} />
      <div className="sve-actions-end">
        <button type="button" disabled={busy} onClick={() => setRedrawing(false)} data-testid="mulligan-cancel">
          {t("builder.cancel")}
        </button>
        <button type="button" className="sve-primary" disabled={busy} onClick={() => answer({ type: "mulligan", redraw: true, bottomOrder: order })} data-testid="mulligan-redraw">
          {t("decision.redraw")}
        </button>
      </div>
    </>
  );
}

function DecisionForm({ info, update, answer, busy }: { info: DecisionInfo; update: GameUpdate; answer: (a: Answer) => void; busy: boolean }) {
  const d = info.decision;
  const common = { info, update, answer, busy };
  switch (d.type) {
    case "selectPending":
      return <SelectPending d={d} {...common} />;
    case "selectCards":
      return <SelectCards d={d} {...common} />;
    case "choose":
      return <Choose d={d} {...common} />;
    case "confirm":
      return <Confirm d={d} {...common} />;
    case "orderCards":
      return <OrderCards d={d} {...common} />;
    case "mulligan":
      return <MulliganOrder d={d} {...common} />;
    default:
      return null;
  }
}

/**
 * The decision window, over the table (the card panel on the left stays in view). "Look at the table" folds it into a
 * button at the bottom, to see the board before answering. Its root always carries the pending decision's type and the
 * number of answers so far (for the tests); the table remounts it for each decision.
 */
export function DecisionDialog({ update }: { update: GameUpdate }) {
  const t = useT();
  const sent = useInteraction((s) => s.sent);
  const [folded, setFolded] = useState(false);
  const info = update.decision;
  // A quick play being announced comes first (QuickAnnouncement): the decision waits until it has been seen.
  const announcing = update.announcement !== null;
  const redrawing = useInteraction((s) => s.redrawing);
  const open = !announcing && !update.watch && !!info && (inDialog(info.decision, (id) => isOnTable(update.view, id)) || (info.decision.type === "mulligan" && redrawing));
  const answer = (a: Answer) => sendAnswer(update, a);
  return (
    <div
      className={`sve-decision${sent ? " sve-busy" : ""}${open && !folded ? " sve-decision-open" : ""}`}
      data-decision={announcing && !update.watch ? "announcement" : (info?.decision.type ?? (update.result ? "over" : update.watch ? "watching" : "waiting"))}
      data-announcement={update.announcement?.seq}
      data-inputs={update.inputCount}
    >
      {open && folded ? (
        <button type="button" className="sve-primary sve-decision-unfold" onClick={() => setFolded(false)} data-testid="decision-unfold">
          {t("decision.backToChoice")}
        </button>
      ) : null}
      {open && !folded && info ? (
        <div className="sve-decision-dialog" role="dialog" data-testid="decision-dialog">
          <div className="sve-decision-body">
            <DecisionForm info={info} update={update} answer={answer} busy={sent} />
          </div>
          <div className="sve-decision-tools">
            <button type="button" onClick={() => setFolded(true)} data-testid="decision-fold">
              {t("decision.lookAtTable")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
