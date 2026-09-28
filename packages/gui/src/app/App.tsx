import { useEffect, useState } from "react";
import { DeckEditor } from "../decks/DeckEditor";
import { GameScreen } from "../game/GameScreen";
import { useT } from "../i18n";
import { loadResources } from "../resources/resources";
import { SetupScreen } from "../setup/SetupScreen";
import { MainMenu } from "./MainMenu";
import { SettingsScreen } from "./SettingsScreen";
import { useSettings } from "./settings";
import { dismissError, useApp } from "./store";

type Screen = "menu" | "settings" | "setup" | "decks" | "game";

/**
 * The screens: the main menu first (play against the AI, settings); the game setup, from which the deck editor opens; the
 * game. The engine starts in the background while the menu shows.
 */
export function App() {
  const settings = useSettings();
  const hasGame = useApp((s) => s.update !== null);
  const [screen, setScreen] = useState<Screen>("menu");

  useEffect(() => {
    void loadResources();
  }, []);
  useEffect(() => {
    document.documentElement.lang = settings.uiLang === "zh" ? "zh-CN" : "en";
  }, [settings.uiLang]);

  let body;
  switch (screen) {
    case "menu":
      body = <MainMenu onPlayAi={() => setScreen("setup")} onSettings={() => setScreen("settings")} onContinue={hasGame ? () => setScreen("game") : undefined} />;
      break;
    case "settings":
      body = <SettingsScreen onBack={() => setScreen("menu")} />;
      break;
    case "setup":
      body = <SetupScreen onStarted={() => setScreen("game")} onBack={() => setScreen("menu")} onEditDecks={() => setScreen("decks")} />;
      break;
    case "decks":
      body = <DeckEditor onBack={() => setScreen("setup")} />;
      break;
    case "game":
      body = <GameScreen onMenu={() => setScreen("menu")} onNewGame={() => setScreen("setup")} />;
      break;
  }

  return (
    <div className="sve-app">
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
