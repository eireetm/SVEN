import { useT } from "../i18n";
import { useApp } from "./store";

interface Props {
  onPlayAi: () => void;
  onDeckBuilder: () => void;
  /** The saved replays, to watch (docs/gui.md "录像"). */
  onReplays: () => void;
  /** Online play with another person (docs/online.md). */
  onOnline: () => void;
  onSettings: () => void;
  /** Back to the game in progress, or to the replay being watched (shown only while there is one). */
  onContinue?: () => void;
}

/** The first screen, in the middle of the window: play against the AI, build decks, watch replays, or the settings. */
export function MainMenu({ onPlayAi, onDeckBuilder, onReplays, onOnline, onSettings, onContinue }: Props) {
  const t = useT();
  const ready = useApp((s) => s.ready);
  const watching = useApp((s) => s.update?.watch != null);
  const startError = useApp((s) => s.startError);
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
          <button type="button" className="sve-menu-button sve-menu-primary" disabled={!ready} onClick={onPlayAi} data-testid="menu-play">
            {t("menu.playAi")}
          </button>
          <button type="button" className="sve-menu-button" disabled={!ready} onClick={onOnline} data-testid="menu-online">
            {t("menu.online")}
          </button>
          <button type="button" className="sve-menu-button" disabled={!ready} onClick={onDeckBuilder} data-testid="menu-decks">
            {t("menu.deckBuilder")}
          </button>
          <button type="button" className="sve-menu-button" onClick={onReplays} data-testid="menu-replays">
            {t("menu.replays")}
          </button>
          <button type="button" className="sve-menu-button" onClick={onSettings} data-testid="menu-settings">
            {t("menu.settings")}
          </button>
        </nav>
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
