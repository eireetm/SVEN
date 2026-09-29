import type { CSSProperties, PointerEvent, ReactNode } from "react";
import type { CardView, HiddenCardView, PlayerSideView } from "@sve/core";
import { cardName } from "../../app/catalog";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { CardInfo } from "../../engine/protocol";
import { useT } from "../../i18n";
import { counterName } from "../../i18n/counters";
import { showCard, useFocusSelect, type FocusCard } from "../focus";
import { CardArt } from "./CardArt";
import { displayOf } from "./display";

/**
 * How the pending decision uses a card: it can act ("action"), may be chosen ("candidate") or is chosen ("selected"), is a
 * target of the attack being dragged ("target", "target-over"), or its menu is open ("active").
 */
export type CardMark = "action" | "candidate" | "selected" | "target" | "target-over" | "active" | null;

interface Props {
  /** A card of the game (a hidden one is drawn face down). */
  card?: CardView | HiddenCardView | null;
  /** A card known only by definition (a decision's candidate in a hidden zone, a deck list). */
  info?: CardInfo | null;
  /** The side the card is on (to show an evolved follower's evolve card). */
  side?: PlayerSideView;
  size?: "small" | "normal" | "large";
  mark?: CardMark;
  onClick?: () => void;
  /** For dragging (the table): takes over the click when given. */
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  className?: string;
  style?: CSSProperties;
  /** Linked cards (race / drive / equipment zones) or other notes under the card. */
  children?: ReactNode;
  /** A face-down card of the evolve deck: the evolve deck's back. */
  evolveBack?: boolean;
}

const MAX_KEYWORDS = 3;

export function CardTile({ card, info, side, size = "normal", mark = null, onClick, onPointerDown, className, style, children, evolveBack = false }: Props) {
  const catalog = useApp((s) => s.catalog);
  const { cardLang, uiLang } = useSettings();
  const t = useT();
  const id = card && !card.hidden ? card.id : null;
  const highlighted = useFocusSelect((f) => (id !== null ? f.highlight.includes(id) : false));
  if (!catalog || (!card && !info)) return null;
  const classes = ["sve-card", `sve-card-${size}`];
  if (className) classes.push(className);
  if (card?.hidden) {
    classes.push("sve-card-hidden");
    return (
      <div className={classes.join(" ")} data-hidden="true" data-card={card.id} style={style}>
        <div className="sve-card-frame">
          <div className={`sve-card-face sve-card-back${evolveBack ? " sve-card-back-evolve" : ""}`} />
        </div>
      </div>
    );
  }
  const view = card ?? undefined;
  const shown = view
    ? displayOf(view, side, catalog)
    : { def: info!.def, printing: info!.printing ?? catalog.def(info!.def)?.printings[0] ?? null, back: false };
  const def = catalog.def(shown.def);
  const name = cardName(def, cardLang, view?.name ?? shown.def);
  const focus: FocusCard = { ...(view ? { id: view.id, view } : {}), def: shown.def, printing: shown.printing, back: shown.back };
  if (view?.engaged) classes.push("sve-card-engaged");
  if (view?.evolvedWith) classes.push(view.superEvolved ? "sve-card-superevolved" : "sve-card-evolved");
  if (view?.boxed) classes.push("sve-card-boxed");
  if (mark) classes.push(`sve-card-${mark}`);
  if (highlighted) classes.push("sve-card-highlight");
  if (onClick) classes.push("sve-card-clickable");
  const cost = view ? view.cost : (def?.cost ?? null);
  const attack = view ? view.attack : (def?.attack ?? null);
  const defense = view ? view.defense : (def?.defense ?? null);
  const compare = (now: number | null, printed: number | null | undefined) =>
    now === null || printed === null || printed === undefined ? "" : now > printed ? " sve-up" : now < printed ? " sve-down" : "";
  const keywords = view?.keywords ?? [];
  const counters = Object.entries(view?.counters ?? {}).filter(([, n]) => n > 0);
  return (
    <div
      className={classes.join(" ")}
      data-card={view?.id}
      data-def={shown.def}
      title={name}
      style={style}
      onMouseEnter={() => showCard(focus)}
      onPointerDown={onPointerDown}
      onClick={onPointerDown ? undefined : onClick}
    >
      <div className="sve-card-frame">
        <div className="sve-card-face">
          <CardArt printing={shown.printing} def={shown.def} back={shown.back} name={name} subtitle={def ? t(`type.${def.type}` as const) : undefined} />
        </div>
        {/* Numbers and keywords stay upright when an engaged card lies sideways. */}
        <div className="sve-card-overlay">
          {cost !== null && def?.type !== "leader" ? (
            <span className="sve-stat sve-stat-cost" data-class={def?.class}>
              {cost}
            </span>
          ) : null}
          {attack !== null ? <span className={`sve-stat sve-stat-atk${compare(attack, def?.attack)}`}>{attack}</span> : null}
          {defense !== null ? <span className={`sve-stat sve-stat-def${compare(defense, def?.defense)}`}>{defense}</span> : null}
          {keywords.length > 0 && size !== "small" ? (
            <div className="sve-card-keywords">
              {keywords.slice(0, MAX_KEYWORDS).map((k) => (
                <span key={k} className={`sve-kw sve-kw-${k}`}>
                  {t(`keyword.${k}` as const)}
                </span>
              ))}
              {keywords.length > MAX_KEYWORDS ? <span className="sve-kw">+{keywords.length - MAX_KEYWORDS}</span> : null}
            </div>
          ) : null}
          {counters.length > 0 ? (
            <div className="sve-card-counters">
              {counters.map(([counter, n]) => (
                <span key={counter} className="sve-counter" title={counterName(counter, uiLang)}>
                  {counterName(counter, uiLang)} {n}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
