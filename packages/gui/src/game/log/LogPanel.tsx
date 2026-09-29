import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { useT } from "../../i18n";
import { setHighlight } from "../focus";
import { describeEntry } from "./format";

/** The game so far, newest at the bottom; pointing at a line lights up its cards on the board. */
export function LogPanel({ update }: { update: GameUpdate }) {
  const t = useT();
  const log = useApp((s) => s.log);
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang, uiLang } = useSettings();
  const [showAll, setShowAll] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const lines = useMemo(
    () =>
      log.flatMap((entry) => {
        const line = describeEntry(entry, { t, catalog, lang: cardLang, uiLang, update }, showAll);
        return line ? [{ entry, line }] : [];
      }),
    [log, t, catalog, cardLang, uiLang, update, showAll],
  );
  // (Braces: scrollIntoView returns a promise in newer browsers, and an effect may only return a clean-up function.)
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [lines.length]);
  return (
    <div className="sve-log">
      <label className="sve-check">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
        {t("log.showAll")}
      </label>
      <div className="sve-log-lines">
        {lines.length === 0 ? <p className="sve-hint">{t("log.empty")}</p> : null}
        {lines.map(({ entry, line }) => (
          <div
            key={entry.seq}
            className={`sve-log-line sve-log-${line.kind}`}
            onMouseEnter={() => setHighlight(Object.keys(entry.cards))}
            onMouseLeave={() => setHighlight([])}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottom} />
      </div>
    </div>
  );
}
