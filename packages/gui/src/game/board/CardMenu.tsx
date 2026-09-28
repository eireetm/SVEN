// The menu of a card clicked on the table: everything the pending decision lets it do (play; each way to evolve; its
// activated abilities; attack each target). Choosing an item answers the decision; a click elsewhere or Escape closes it.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { useT } from "../../i18n";
import { setHighlight } from "../focus";
import { actionsFor, answerFor, openMenu, sendAnswer, useInteraction } from "../interaction";
import { actionLabel, cardLabel } from "../labels";

export function CardMenu({ update }: { update: GameUpdate }) {
  const menu = useInteraction((s) => s.menu);
  const catalog = useApp((s) => s.catalog);
  const { cardLang } = useSettings();
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") openMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const info = update.decision;
  if (!menu || !info || !catalog) return null;
  const decision = info.decision;
  const actions = actionsFor(decision, menu.card);
  if (actions.length === 0) return null;
  const { anchor } = menu;
  // Above the card in the lower half of the window (your hand and field), below it otherwise.
  const above = anchor.top > window.innerHeight / 2;
  const center = Math.min(Math.max((anchor.left + anchor.right) / 2, 140), window.innerWidth - 140);
  const style = above ? { left: center, bottom: window.innerHeight - anchor.top + 8 } : { left: center, top: anchor.bottom + 8 };
  return createPortal(
    <>
      <div className="sve-card-menu-backdrop" onPointerDown={() => openMenu(null)} />
      <div className="sve-card-menu" style={style} role="menu" data-testid="card-menu">
        <div className="sve-card-menu-title">{cardLabel(menu.card, update, catalog, cardLang, t)}</div>
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            role="menuitem"
            onClick={() => sendAnswer(update, answerFor(decision, action))}
            onMouseEnter={() => setHighlight(action.type === "attack" ? [action.attacker, action.target] : [menu.card])}
            onMouseLeave={() => setHighlight([])}
          >
            {actionLabel(action, info, update, catalog, cardLang, t)}
          </button>
        ))}
      </div>
    </>,
    document.body,
  );
}
