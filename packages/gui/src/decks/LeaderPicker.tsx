// The deck builder's leader choice: every leader card in a window, each of its printings (alternate arts: the same card,
// CR 2.1.1), and the card panel on the left stays lit. The chosen printing is saved in the deck file (CR 6.1.1.1); the
// builder's main view only names it.
import { useEffect, useMemo, useState } from "react";
import { cardName } from "../app/catalog";
import { useSettings } from "../app/settings";
import { useApp } from "../app/store";
import { CardTile } from "../game/card/CardTile";
import { useT } from "../i18n";
import { useBack } from "../app/back";

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
  const leaders = useMemo(() => catalog.cards.filter((c) => c.type === "leader").flatMap((leader) => leader.printings.map((printing) => ({ leader, printing }))), [catalog]);
  const q = query.trim().toLowerCase();
  const shown = leaders.filter(
    ({ leader, printing }) =>
      q === "" ||
      printing.toLowerCase().startsWith(q) ||
      [leader.name, leader.names.cn, leader.names.ja].some((n) => !!n && n.toLowerCase().includes(q)) ||
      t(`class.${leader.class}` as const).toLowerCase().includes(q),
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useBack(true, onClose);
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
          {shown.map(({ leader, printing }) => (
            <div key={printing} className={`sve-leader-option${printing === current ? " sve-leader-current" : ""}`} role="button" onClick={() => onPick(printing)} data-leader={printing}>
              <CardTile info={{ def: leader.id, printing }} />
              <span className="sve-leader-name">{cardName(leader, cardLang)}</span>
              {leader.printings.length > 1 ? <span className={`sve-printing-label${printing !== leader.printings[0] ? " sve-alt" : ""}`}>{printing}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
