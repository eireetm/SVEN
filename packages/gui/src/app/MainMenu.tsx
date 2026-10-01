import { useT } from "../i18n";
import { useOnline } from "../net/state";
import { useApp } from "./store";

interface Props {
  onPlayAi: () => void;
  onDeckBuilder: () => void;
  /** The saved replays, to watch. */
  onReplays: () => void;
  /** Online play with another person. */
  onOnline: () => void;
  onSettings: () => void;
  /** Back to the game in progress, or to the replay being watched (shown only while there is one). */
  onContinue?: () => void;
}

/**
 * The first screen, in the middle of the window: play against the AI or online, build decks, watch replays, or the settings.
 * An online game in progress stays until it ends or its player leaves it: no other game starts meanwhile.
 */
export function MainMenu({ onPlayAi, onDeckBuilder, onReplays, onOnline, onSettings, onContinue }: Props) {
  const t = useT();
  const ready = useApp((s) => s.ready);
  const watching = useApp((s) => s.update?.watch != null);
  const startError = useApp((s) => s.startError);
  // A game played online, or a room watched (its next games come to this engine): no other game meanwhile.
  const played = useApp((s) => s.update?.online != null && !s.update.online.spectating && !s.update.result);
  const online = useOnline();
  const spectator = online.room?.role === "spectator";
  const onlineGame = played || spectator;
  const connected = online.phase.kind === "connected";
  return (
    <div className="sve-menu">
      <div className="sve-menu-panel">
        <h1 className="sve-menu-title">{t("menu.title")}</h1>
        <p className="sve-menu-subtitle">{t("menu.subtitle")}</p>
        <nav className="sve-menu-buttons">
          {onContinue ? (
            <button type="button" className="sve-menu-button" onClick={onContinue} data-testid="menu-continue">
              {t(watching ? "menu.continueWatching" : "menu.continue")}
            </button>
          ) : null}
          <button type="button" className="sve-menu-button sve-menu-primary" disabled={!ready || onlineGame} onClick={onPlayAi} data-testid="menu-play">
            {t("menu.playAi")}
          </button>
          <button type="button" className="sve-menu-button" disabled={!ready} onClick={onOnline} data-testid="menu-online">
            {t(connected ? "menu.onlineConnected" : "menu.online")}
          </button>
          <button type="button" className="sve-menu-button" disabled={!ready} onClick={onDeckBuilder} data-testid="menu-decks">
            {t("menu.deckBuilder")}
          </button>
          <button type="button" className="sve-menu-button" disabled={onlineGame} onClick={onReplays} data-testid="menu-replays">
            {t("menu.replays")}
          </button>
          <button type="button" className="sve-menu-button" onClick={onSettings} data-testid="menu-settings">
            {t("menu.settings")}
          </button>
        </nav>
        {onlineGame ? <p className="sve-hint sve-menu-hint">{t(spectator ? "menu.watchingHint" : "menu.onlineGameHint")}</p> : null}
        {startError ? (
          <div className="sve-menu-status sve-problem">
            {t("app.engineFailed")}: {startError}
          </div>
        ) : !ready ? (
          <div className="sve-menu-status">{t("app.loading")}</div>
        ) : null}
      </div>
    </div>
  );
}
