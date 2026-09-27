// The pending decision of a person, one small form per decision type (the core's protocol, model/decision.ts). Every
// option comes from the decision itself: the GUI never works out what is legal (the decision protocol in
// docs/architecture.md).
import { useEffect, useState, type ReactNode } from "react";
import type { Answer, CardId, Decision, MainAction, QuickAction } from "@sve/core";
import { cardName } from "../../app/catalog";
import { useSettings } from "../../app/settings";
import { engine, useApp } from "../../app/store";
import type { DecisionInfo, GameUpdate } from "../../engine/protocol";
import { findCard } from "../../engine/view-utils";
import { useT, type MessageKey, type Translate } from "../../i18n";
import { CardTile } from "../card/CardTile";
import { setHighlight } from "../focus";
import { abilityLabel, cardLabel, playerLabel } from "../labels";

type Of<T extends Decision["type"]> = Extract<Decision, { type: T }>;

interface PanelProps<T extends Decision["type"]> {
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

function rangeLabel(min: number, max: number, t: Translate): string {
  if (min === max) return t("decision.range.exact", { n: min });
  if (min === 0) return t("decision.range.upTo", { max });
  return t("decision.range.between", { min, max });
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

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="sve-action-group">
      <span className="sve-action-group-title">{title}</span>
      <div className="sve-action-group-buttons">{children}</div>
    </div>
  );
}

function MainPhase({ d, info, update, answer, busy }: PanelProps<"mainPhase">) {
  const t = useT();
  const label = useLabel(update);
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const act = (action: MainAction) => answer({ type: "mainPhase", action });
  const evolveName = (id: CardId, back: boolean) => {
    const def = catalog.def(info.cards[id]?.def ?? "");
    const shown = back && def?.backFace ? catalog.def(def.backFace) : def;
    return cardName(shown, cardLang);
  };
  const plays = d.actions.filter((a) => a.type === "play");
  const evolves = d.actions.filter((a) => a.type === "evolve");
  const activates = d.actions.filter((a) => a.type === "activate");
  const attacks = d.actions.filter((a) => a.type === "attack");
  return (
    <>
      <Prompt text={t("decision.mainPhase")} update={update} />
      <div className="sve-actions">
        {plays.length > 0 ? (
          <Group title={t("decision.play")}>
            {plays.map((a, i) => (
              <ActionButton key={i} ids={[a.card]} disabled={busy} onClick={() => act(a)}>
                {label(a.card)}
              </ActionButton>
            ))}
          </Group>
        ) : null}
        {evolves.length > 0 ? (
          <Group title={t("decision.evolve")}>
            {evolves.map((a, i) => (
              <ActionButton key={i} ids={[a.card]} disabled={busy} onClick={() => act(a)}>
                {label(a.card)} → {evolveName(a.evolveCard, a.backFace === true)}
                {a.useEvolutionPoint ? ` · ${t("decision.withEp")}` : ""}
                {a.superEvolve ? ` · ${t("decision.superEvolve")}` : ""}
                {a.backFace ? ` · ${t("decision.backFace")}` : ""}
              </ActionButton>
            ))}
          </Group>
        ) : null}
        {activates.length > 0 ? (
          <Group title={t("decision.activate")}>
            {activates.map((a, i) => (
              <ActionButton key={i} ids={[a.card]} disabled={busy} onClick={() => act(a)}>
                {label(a.card)}: {abilityLabel(info.abilities[`${a.card}:${a.ability}`], t)}
                {a.useEvolutionPoint ? ` · ${t("decision.withEp")}` : ""}
              </ActionButton>
            ))}
          </Group>
        ) : null}
        {attacks.length > 0 ? (
          <Group title={t("decision.attack")}>
            {attacks.map((a, i) => (
              <ActionButton key={i} ids={[a.attacker, a.target]} disabled={busy} onClick={() => act(a)}>
                {label(a.attacker)} → {label(a.target)}
              </ActionButton>
            ))}
          </Group>
        ) : null}
      </div>
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => act({ type: "endMainPhase" })}>
          {t("decision.endMain")}
        </ActionButton>
      </div>
    </>
  );
}

function Quick({ d, info, update, answer, busy }: PanelProps<"quick">) {
  const t = useT();
  const label = useLabel(update);
  const act = (action: QuickAction) => answer({ type: "quick", action });
  return (
    <>
      <Prompt text={t(d.timing === "attack" ? "decision.quick.attack" : "decision.quick.endPhase")} update={update} />
      <div className="sve-actions">
        {d.actions.map((a, i) =>
          a.type === "pass" ? null : (
            <ActionButton key={i} ids={[a.card]} disabled={busy} onClick={() => act(a)}>
              {a.type === "play" ? `${t("decision.play")} ${label(a.card)}` : `${label(a.card)}: ${abilityLabel(info.abilities[`${a.card}:${a.ability}`], t)}`}
            </ActionButton>
          ),
        )}
      </div>
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => act({ type: "pass" })}>
          {t("decision.pass")}
        </ActionButton>
      </div>
    </>
  );
}

function SelectPending({ d, info, update, answer, busy }: PanelProps<"selectPending">) {
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

const SELECT_KEYS: Record<Of<"selectCards">["reason"], MessageKey> = {
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

function SelectCards({ d, info, update, answer, busy }: PanelProps<"selectCards">) {
  const t = useT();
  const label = useLabel(update);
  const [chosen, setChosen] = useState<CardId[]>([]);
  const single = d.min === 1 && d.max === 1;
  const toggle = (id: CardId) => {
    if (busy) return;
    if (single) return answer({ type: "selectCards", cards: [id] });
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : d.max === 1 ? [id] : c.length < d.max ? [...c, id] : c));
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

function Choose({ d, update, answer, busy }: PanelProps<"choose">) {
  const t = useT();
  const label = useLabel(update);
  const [chosen, setChosen] = useState<string[]>([]);
  const single = d.max === 1;
  const subject = d.subject ? label(d.subject.id) : "";
  const text = t(CHOOSE_KEYS[d.reason], { card: subject }) + (single ? "" : ` — ${t("decision.choose", { range: rangeLabel(d.min, d.max, t) })}`);
  return (
    <>
      <Prompt text={text} source={d.source} update={update} />
      <div className="sve-actions">
        {d.options.map((o) =>
          single ? (
            <ActionButton key={o.id} ids={d.subject ? [d.subject.id] : []} disabled={busy} onClick={() => answer({ type: "choose", ids: [o.id] })}>
              {o.label}
            </ActionButton>
          ) : (
            <label key={o.id} className="sve-check">
              <input
                type="checkbox"
                checked={chosen.includes(o.id)}
                disabled={busy || (!chosen.includes(o.id) && chosen.length >= d.max)}
                onChange={() => setChosen((c) => (c.includes(o.id) ? c.filter((x) => x !== o.id) : [...c, o.id]))}
              />
              {o.label}
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

function Confirm({ d, update, answer, busy }: PanelProps<"confirm">) {
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

function OrderCards({ d, info, update, answer, busy }: PanelProps<"orderCards">) {
  const t = useT();
  const [order, setOrder] = useState<CardId[]>(d.cards.map((c) => c.id));
  const move = (i: number, by: number) =>
    setOrder((o) => {
      const next = [...o];
      const [card] = next.splice(i, 1);
      next.splice(i + by, 0, card!);
      return next;
    });
  return (
    <>
      <Prompt text={t(d.reason === "deckTop" ? "decision.orderCards.deckTop" : "decision.orderCards.deckBottom")} source={d.source} update={update} />
      <div className="sve-order">
        {order.map((id, i) => {
          const ref = d.cards.find((c) => c.id === id)!;
          return (
            <div key={id} className="sve-order-item">
              <CardTile info={info.cards[id] ?? { def: ref.def, printing: null }} size="small" />
              <div className="sve-order-buttons">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                  {t("decision.up")}
                </button>
                <button type="button" disabled={busy || i === order.length - 1} onClick={() => move(i, 1)}>
                  {t("decision.down")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => answer({ type: "orderCards", order })}>
          {t("decision.confirm")}
        </ActionButton>
      </div>
    </>
  );
}

function Mulligan({ d, info, update, answer, busy }: PanelProps<"mulligan">) {
  const t = useT();
  return (
    <>
      <Prompt text={t("decision.mulligan")} update={update} />
      <div className="sve-choice-cards">
        {d.hand.map((id) => {
          const view = findCard(update.view, id);
          return <CardTile key={id} card={view ?? undefined} info={view ? undefined : info.cards[id]} side={update.view.players[d.player]} />;
        })}
      </div>
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => answer({ type: "mulligan", redraw: false })}>
          {t("decision.keep")}
        </ActionButton>
        <ActionButton ids={[]} disabled={busy} onClick={() => answer({ type: "mulligan", redraw: true })}>
          {t("decision.redraw")}
        </ActionButton>
      </div>
    </>
  );
}

function TurnOrder({ update, answer, busy }: PanelProps<"chooseTurnOrder">) {
  const t = useT();
  return (
    <>
      <Prompt text={t("decision.chooseTurnOrder")} update={update} />
      <div className="sve-actions-end">
        <ActionButton ids={[]} primary disabled={busy} onClick={() => answer({ type: "chooseTurnOrder", goFirst: true })}>
          {t("decision.goFirst")}
        </ActionButton>
        <ActionButton ids={[]} disabled={busy} onClick={() => answer({ type: "chooseTurnOrder", goFirst: false })}>
          {t("decision.goSecond")}
        </ActionButton>
      </div>
    </>
  );
}

function DecisionBody({ info, update, answer, busy }: { info: DecisionInfo; update: GameUpdate; answer: (a: Answer) => void; busy: boolean }) {
  const d = info.decision;
  const common = { info, update, answer, busy };
  switch (d.type) {
    case "chooseTurnOrder":
      return <TurnOrder d={d} {...common} />;
    case "mulligan":
      return <Mulligan d={d} {...common} />;
    case "mainPhase":
      return <MainPhase d={d} {...common} />;
    case "quick":
      return <Quick d={d} {...common} />;
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
  }
}

/** The bottom bar: the person's decision, else who the game waits for, else the result. */
export function DecisionPanel({ update, onNewGame }: { update: GameUpdate; onNewGame: () => void }) {
  const t = useT();
  const [sent, setSent] = useState(false);
  const lastError = useApp((s) => s.errors[s.errors.length - 1]?.id ?? 0);
  // A refused answer brings an error, not an update: the buttons work again.
  useEffect(() => {
    setSent(false);
  }, [lastError]);
  const info = update.decision;
  const answer = (a: Answer) => {
    if (!info || sent) return;
    setSent(true);
    setHighlight([]);
    engine.send({ kind: "answer", seat: info.decision.player, answer: a });
  };
  const seat = update.controllers[update.perspective] === "human" ? update.perspective : null;
  const concede = () => {
    if (seat !== null && window.confirm(t("game.concedeConfirm"))) engine.send({ kind: "concede", seat });
  };
  let body: ReactNode;
  if (update.result) {
    body = (
      <div className="sve-actions-end">
        <span className="sve-result-text">
          {update.result.winner === null ? t("game.draw") : t("game.win", { player: playerLabel(update.result.winner, update, t) })}
        </span>
        <button type="button" className="sve-primary" onClick={onNewGame}>
          {t("game.newGame")}
        </button>
      </div>
    );
  } else if (info) {
    body = <DecisionBody info={info} update={update} answer={answer} busy={sent} />;
  } else if (update.waitingFor !== null) {
    const controller = update.controllers[update.waitingFor];
    body = (
      <div className="sve-prompt">
        {update.settings.paused && controller !== "human"
          ? t("game.paused")
          : t("game.waiting", { player: playerLabel(update.waitingFor, update, t), controller: t(`controller.${controller}` as const) })}
      </div>
    );
  }
  return (
    <div
      className={`sve-decision${sent ? " sve-busy" : ""}`}
      data-decision={info?.decision.type ?? (update.result ? "over" : "waiting")}
      data-inputs={update.inputCount}
    >
      <div className="sve-decision-body">{body}</div>
      {seat !== null && !update.result ? (
        <button type="button" className="sve-concede" onClick={concede}>
          {t("game.concede")}
        </button>
      ) : null}
    </div>
  );
}
