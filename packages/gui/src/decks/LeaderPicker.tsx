// The deck builder's leader choice: every leader card in a window (the card panel on the left stays lit). The chosen
// leader is saved in the deck file (CR 6.1.1.1); the builder's main view only names it.
import { useEffect, useMemo, useState } from "react";
import { cardName } from "../app/catalog";
import { useSettings } from "../app/settings";
import { useApp } from "../app/store";
import { CardTile } from "../game/card/CardTile";
import { useT } from "../i18n";

interface Props {
  /** The deck's leader printing, or null. */
  current: string | null;
  /** A leader printing, or null for none. */
  onPick: (printing: string | null) => void;
  onClose: () => void;
}

export function LeaderPicker({ current, onPick, onClose }: Props) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const [query, setQuery] = useState("");
  const currentDef = current ? catalog.printing(current)?.id : undefined;
  const leaders = useMemo(() => catalog.cards.filter((c) => c.type === "leader"), [catalog]);
  const q = query.trim().toLowerCase();
  const shown = leaders.filter((c) => q === "" || c.printings.some((p) => p.toLowerCase().startsWith(q)) || [c.name, c.names.cn, c.names.ja].some((n) => !!n && n.toLowerCase().includes(q)) || t(`class.${c.class}` as const).toLowerCase().includes(q));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sve-modal-backdrop" onClick={onClose}>
      <div className="sve-modal sve-leader-picker" onClick={(e) => e.stopPropagation()} data-testid="leader-picker">
        <header className="sve-modal-header">
          <span>{t("builder.leaderTitle")}</span>
          <input placeholder={t("builder.leaderSearch")} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <button type="button" onClick={onClose}>
            {t("game.close")}
          </button>
        </header>
        <div className="sve-leader-grid">
          <button type="button" className={`sve-leader-option sve-leader-none${current === null ? " sve-leader-current" : ""}`} onClick={() => onPick(null)}>
            {t("builder.noLeader")}
          </button>
          {shown.map((leader) => (
            <div
              key={leader.id}
              className={`sve-leader-option${leader.id === currentDef ? " sve-leader-current" : ""}`}
              role="button"
              onClick={() => onPick(leader.printings[0] ?? leader.id)}
              data-leader={leader.id}
            >
              <CardTile info={{ def: leader.id, printing: leader.printings[0] ?? leader.id }} />
              <span className="sve-leader-name">{cardName(leader, cardLang)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
