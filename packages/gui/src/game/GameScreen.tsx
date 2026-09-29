import { useState } from "react";
import { engine, useApp } from "../app/store";
import { useT } from "../i18n";
import { AnimationLayer } from "./animation/AnimationLayer";
import { Table } from "./board/Table";
import { ZoneBrowser } from "./board/ZoneBrowser";
import { CardDetails } from "./card/CardDetails";
import { DebugPanel } from "./debug/DebugPanel";
import { LogPanel } from "./log/LogPanel";
import { WatchBar } from "./watch/WatchBar";

/**
 * The game: the card under the pointer on the left, the table taking the rest. Every decision is answered on the table
 * (lit cards, their menus, the buttons beside the mats) or in the decision window over it. The log and debug tabs are a
 * sidebar, hidden unless shown: it then covers the right of the table, which keeps its size. A replay being watched has its
 * playback bar under the card on the left (nobody answers anything).
 */
export function GameScreen({ onMenu, onNewGame, onReplays }: { onMenu: () => void; onNewGame: () => void; onReplays: () => void }) {
  const update = useApp((s) => s.update);
  const t = useT();
  const [tab, setTab] = useState<"log" | "debug">("log");
  const [sidebar, setSidebar] = useState(false);
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
  const seat = update.controllers[update.perspective] === "human" && !update.watch ? update.perspective : null;
  const concede = () => {
    if (seat !== null && window.confirm(t("game.concedeConfirm"))) engine.send({ kind: "concede", seat });
  };
  return (
    <div className="sve-game">
      <aside className="sve-game-left">
        <div className="sve-game-left-top">
          <button type="button" onClick={onMenu} data-testid="game-menu">
            {t("game.menu")}
          </button>
          {seat !== null && !update.result ? (
            <button type="button" className="sve-concede" onClick={concede} data-testid="game-concede">
              {t("game.concede")}
            </button>
          ) : null}
        </div>
        <section className="sve-sidebar-card">
          <CardDetails />
        </section>
        {update.watch ? <WatchBar update={update} onExit={onReplays} /> : null}
      </aside>
      <Table update={update} onNewGame={onNewGame} onMenu={onMenu} onReplays={onReplays} />
      {sidebar ? (
        <aside className="sve-game-right" data-testid="game-sidebar">
          <nav className="sve-tabs">
            {(["log", "debug"] as const).map((key) => (
              <button key={key} type="button" className={tab === key ? "sve-tab-active" : undefined} onClick={() => setTab(key)}>
                {t(`tab.${key}` as const)}
              </button>
            ))}
            <button type="button" className="sve-sidebar-hide" onClick={() => setSidebar(false)} data-testid="sidebar-hide">
              {t("game.hideSidebar")}
            </button>
          </nav>
          <section className="sve-tab-body">{tab === "log" ? <LogPanel update={update} /> : <DebugPanel update={update} />}</section>
        </aside>
      ) : (
        <button type="button" className="sve-sidebar-show" onClick={() => setSidebar(true)} data-testid="sidebar-show">
          {t("game.showSidebar")}
        </button>
      )}
      <ZoneBrowser update={update} />
      <AnimationLayer update={update} />
    </div>
  );
}
