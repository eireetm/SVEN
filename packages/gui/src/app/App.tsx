import { useEffect, useState } from "react";
import { DeckEditor } from "../decks/DeckEditor";
import { GameScreen } from "../game/GameScreen";
import { useT } from "../i18n";
import { loadResources } from "../resources/resources";
import { SetupScreen } from "../setup/SetupScreen";
import { updateSettings, useSettings, type CardLang, type UiLang } from "./settings";
import { dismissError, useApp } from "./store";

type Screen = "setup" | "game" | "decks";

export function App() {
  const t = useT();
  const settings = useSettings();
  const ready = useApp((s) => s.ready);
  const startError = useApp((s) => s.startError);
  const hasGame = useApp((s) => s.update !== null);
  const [screen, setScreen] = useState<Screen>("setup");

  useEffect(() => {
    void loadResources();
  }, []);
  useEffect(() => {
    document.documentElement.lang = settings.uiLang === "zh" ? "zh-CN" : "en";
  }, [settings.uiLang]);

  let body;
  if (startError && !ready) {
    body = (
      <div className="sve-fatal">
        <h2>{t("app.engineFailed")}</h2>
        <pre>{startError}</pre>
      </div>
    );
  } else if (!ready) {
    body = (
      <div className="sve-loading">
        <p>{t("app.loading")}</p>
        <small>{t("app.loadingNote")}</small>
      </div>
    );
  } else if (screen === "setup") {
    body = <SetupScreen onStarted={() => setScreen("game")} />;
  } else if (screen === "decks") {
    body = <DeckEditor />;
  } else {
    body = <GameScreen onNewGame={() => setScreen("setup")} />;
  }

  return (
    <div className="sve-app">
      <header className="sve-topbar">
        <span className="sve-logo">SVE</span>
        <nav className="sve-nav">
          <button type="button" className={screen === "setup" ? "sve-tab-active" : undefined} onClick={() => setScreen("setup")}>
            {t("nav.setup")}
          </button>
          <button type="button" className={screen === "game" ? "sve-tab-active" : undefined} disabled={!hasGame} onClick={() => setScreen("game")}>
            {t("nav.game")}
          </button>
          <button type="button" className={screen === "decks" ? "sve-tab-active" : undefined} onClick={() => setScreen("decks")}>
            {t("nav.decks")}
          </button>
        </nav>
        <div className="sve-topbar-settings">
          <label>
            {t("nav.uiLang")}{" "}
            <select value={settings.uiLang} onChange={(e) => updateSettings({ uiLang: e.target.value as UiLang })}>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <label>
            {t("nav.cardLang")}{" "}
            <select value={settings.cardLang} onChange={(e) => updateSettings({ cardLang: e.target.value as CardLang })}>
              <option value="en">English</option>
              <option value="cn">中文</option>
              <option value="ja">日本語</option>
            </select>
          </label>
        </div>
      </header>
      <main className="sve-screen">{body}</main>
      <ErrorToasts />
    </div>
  );
}

function ErrorToasts() {
  const errors = useApp((s) => s.errors);
  const t = useT();
  if (errors.length === 0) return null;
  return (
    <div className="sve-toasts" role="alert">
      {errors.map((e) => (
        <div key={e.id} className="sve-toast">
          <span>{e.message}</span>
          <button type="button" onClick={() => dismissError(e.id)}>
            {t("app.dismiss")}
          </button>
        </div>
      ))}
    </div>
  );
}
