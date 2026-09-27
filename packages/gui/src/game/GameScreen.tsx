import { useState } from "react";
import { useApp } from "../app/store";
import { useT } from "../i18n";
import { Board } from "./board/Board";
import { ZoneBrowser } from "./board/ZoneBrowser";
import { CardDetails } from "./card/CardDetails";
import { DebugPanel } from "./debug/DebugPanel";
import { DecisionPanel } from "./decisions/DecisionPanel";
import { LogPanel } from "./log/LogPanel";

/** The game: the board and the decision bar; on the right the card panel and the log / debug tabs. */
export function GameScreen({ onNewGame }: { onNewGame: () => void }) {
  const update = useApp((s) => s.update);
  const t = useT();
  const [tab, setTab] = useState<"log" | "debug">("log");
  if (!update) {
    return (
      <div className="sve-empty-screen">
        <p>{t("game.noGame")}</p>
        <button type="button" className="sve-primary" onClick={onNewGame}>
          {t("game.newGame")}
        </button>
      </div>
    );
  }
  return (
    <div className="sve-game">
      <div className="sve-game-main">
        <Board update={update} />
        <DecisionPanel key={update.inputCount} update={update} onNewGame={onNewGame} />
      </div>
      <aside className="sve-sidebar">
        <section className="sve-sidebar-card">
          <CardDetails />
        </section>
        <nav className="sve-tabs">
          {(["log", "debug"] as const).map((key) => (
            <button key={key} type="button" className={tab === key ? "sve-tab-active" : undefined} onClick={() => setTab(key)}>
              {t(`tab.${key}` as const)}
            </button>
          ))}
        </nav>
        <section className="sve-tab-body">{tab === "log" ? <LogPanel update={update} /> : <DebugPanel update={update} />}</section>
      </aside>
      <ZoneBrowser update={update} />
    </div>
  );
}
