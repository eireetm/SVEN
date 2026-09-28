import { useState } from "react";
import { useApp } from "../app/store";
import { useT } from "../i18n";
import { AnimationLayer } from "./animation/AnimationLayer";
import { Table } from "./board/Table";
import { ZoneBrowser } from "./board/ZoneBrowser";
import { CardDetails } from "./card/CardDetails";
import { DebugPanel } from "./debug/DebugPanel";
import { DecisionPanel } from "./decisions/DecisionPanel";
import { LogPanel } from "./log/LogPanel";

/**
 * The game: the card under the pointer on the left, the table in the middle, and on the right the decision (every option
 * as a button, also what the table offers) with the log and debug tabs.
 */
export function GameScreen({ onMenu, onNewGame }: { onMenu: () => void; onNewGame: () => void }) {
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
      <aside className="sve-game-left">
        <div className="sve-game-left-top">
          <button type="button" onClick={onMenu} data-testid="game-menu">
            {t("game.menu")}
          </button>
        </div>
        <section className="sve-sidebar-card">
          <CardDetails />
        </section>
      </aside>
      <Table update={update} onNewGame={onNewGame} onMenu={onMenu} />
      <aside className="sve-game-right">
        <DecisionPanel key={update.inputCount} update={update} onNewGame={onNewGame} />
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
      <AnimationLayer update={update} />
    </div>
  );
}
