import { useEffect, useState } from "react";
import { engine, useApp } from "../app/store";
import type { GameUpdate } from "../engine/protocol";
import { useT } from "../i18n";
import { useOnline } from "../net/state";
import { Chat } from "../online/Chat";
import { AnimationLayer } from "./animation/AnimationLayer";
import { Table } from "./board/Table";
import { ZoneBrowser } from "./board/ZoneBrowser";
import { CardDetails } from "./card/CardDetails";
import { DebugPanel } from "./debug/DebugPanel";
import { LogPanel } from "./log/LogPanel";
import { downloadJson } from "./replay-files";
import { WatchBar } from "./watch/WatchBar";

type Tab = "log" | "debug" | "chat";

interface Props {
  onMenu: () => void;
  onNewGame: () => void;
  onReplays: () => void;
  /** Online play's screen: the next game with the same player, or connecting again. */
  onOnline: () => void;
}

/**
 * The game: the card under the pointer on the left, the table taking the rest. Every decision is answered on the table
 * (lit cards, their menus, the buttons beside the mats) or in the decision window over it. The log and debug tabs are a
 * sidebar, hidden unless shown: it then covers the right of the table, which keeps its size. A replay being watched has its
 * playback bar under the card on the left (nobody answers anything). Online, the connection's state is under the menu
 * button, and the chat is a tab of the sidebar.
 */
export function GameScreen({ onMenu, onNewGame, onReplays, onOnline }: Props) {
  const update = useApp((s) => s.update);
  const t = useT();
  const [tab, setTab] = useState<Tab>("log");
  const [sidebar, setSidebar] = useState(false);
  const online = update?.online ?? null;
  const openChat = () => {
    setSidebar(true);
    setTab("chat");
  };
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
  const tabs: Tab[] = online ? ["log", "chat", "debug"] : ["log", "debug"];
  const shown = tabs.includes(tab) ? tab : "log";
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
        {online ? <OnlineStatus update={update} chatOpen={sidebar && shown === "chat"} onChat={openChat} onOnline={onOnline} /> : null}
        <section className="sve-sidebar-card">
          <CardDetails />
        </section>
        {update.watch ? <WatchBar update={update} onExit={onReplays} /> : null}
      </aside>
      <Table update={update} onNewGame={online ? onOnline : onNewGame} onMenu={onMenu} onReplays={onReplays} />
      {sidebar ? (
        <aside className="sve-game-right" data-testid="game-sidebar">
          <nav className="sve-tabs">
            {tabs.map((key) => (
              <button key={key} type="button" className={shown === key ? "sve-tab-active" : undefined} onClick={() => setTab(key)} data-testid={`tab-${key}`}>
                {t(`tab.${key}` as const)}
              </button>
            ))}
            <button type="button" className="sve-sidebar-hide" onClick={() => setSidebar(false)} data-testid="sidebar-hide">
              {t("game.hideSidebar")}
            </button>
          </nav>
          <section className="sve-tab-body">
            {shown === "log" ? <LogPanel update={update} /> : shown === "chat" ? <Chat /> : <DebugPanel update={update} />}
          </section>
        </aside>
      ) : (
        <button type="button" className="sve-sidebar-show" onClick={() => setSidebar(true)} data-testid="sidebar-show">
          {t("game.showSidebar")}
        </button>
      )}
      {online?.desync ? <Desync at={online.desync} /> : null}
      <ZoneBrowser update={update} />
      <AnimationLayer update={update} />
    </div>
  );
}

/**
 * Online: connected (and the round trip) or not (the game waits; the online screen connects again), and the other player's
 * messages not yet seen.
 */
function OnlineStatus({ update, chatOpen, onChat, onOnline }: { update: GameUpdate; chatOpen: boolean; onChat: () => void; onOnline: () => void }) {
  const t = useT();
  const { phase, chat } = useOnline();
  const [seen, setSeen] = useState(chat.length);
  useEffect(() => {
    if (chatOpen) setSeen(chat.length);
  }, [chatOpen, chat.length]);
  const unread = chat.slice(seen).filter((line) => line.from === "peer").length;
  const connected = phase.kind === "connected";
  return (
    <div className={`sve-game-online${connected ? "" : " sve-game-online-lost"}`} data-testid="game-online" data-connected={connected ? "yes" : "no"}>
      <span>{connected ? t("game.online.connected", { rtt: phase.rtt === null ? "…" : `${phase.rtt} ms` }) : t("game.online.lost")}</span>
      {!connected && !update.result ? (
        <button type="button" onClick={onOnline} data-testid="game-reconnect">
          {t("game.online.reconnect")}
        </button>
      ) : null}
      {unread > 0 ? (
        <button type="button" className="sve-primary" onClick={onChat} data-testid="game-unread">
          {t("game.online.unread", { n: unread })}
        </button>
      ) : null}
    </div>
  );
}

/** The two programs' games differ: this one can't go on. A bug report file tells where (docs/online.md). */
function Desync({ at }: { at: string }) {
  const t = useT();
  const save = async () => {
    const replay = await engine.exportReplay();
    if (replay) downloadJson(`sve-replay-${replay.options.seed}-${replay.inputs.length}.json`, replay);
  };
  return (
    <div className="sve-desync" role="alert" data-testid="game-desync">
      <p>{t("game.online.desync", { n: at })}</p>
      <button type="button" onClick={() => void save()}>
        {t("debug.export")}
      </button>
    </div>
  );
}
