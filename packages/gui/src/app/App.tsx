import { useEffect, useState } from "react";
import { DeckBuilder } from "../decks/DeckBuilder";
import { DeckEditor } from "../decks/DeckEditor";
import { GameScreen } from "../game/GameScreen";
import { useT } from "../i18n";
import { applyUiTransparency, loadResources } from "../resources/resources";
import { SetupScreen } from "../setup/SetupScreen";
import { MainMenu } from "./MainMenu";
import { SettingsScreen } from "./SettingsScreen";
import { useSettings } from "./settings";
import { dismissError, useApp } from "./store";

type Screen = "menu" | "settings" | "setup" | "builder" | "text" | "game";

/**
 * The screens: the main menu first (play against the AI, build decks, settings); the game setup; the deck builder (from
 * the menu or the setup; its text editor from it); the game. The engine starts in the background while the menu shows.
 */
export function App() {
  const settings = useSettings();
  const hasGame = useApp((s) => s.update !== null);
  const [screen, setScreen] = useState<Screen>("menu");
  // Where the deck builder returns to, and the deck it opens / the text editor opens.
  const [builderFrom, setBuilderFrom] = useState<"menu" | "setup">("menu");
  const [deckFile, setDeckFile] = useState<string | null>(null);
  const openBuilder = (from: "menu" | "setup", file: string | null) => {
    setBuilderFrom(from);
    setDeckFile(file);
    setScreen("builder");
  };

  useEffect(() => {
    void loadResources();
  }, []);
  useEffect(() => {
    document.documentElement.lang = settings.uiLang === "zh" ? "zh-CN" : "en";
  }, [settings.uiLang]);
  useEffect(() => applyUiTransparency(settings.uiTransparency), [settings.uiTransparency]);

  let body;
  switch (screen) {
    case "menu":
      body = (
        <MainMenu
          onPlayAi={() => setScreen("setup")}
          onDeckBuilder={() => openBuilder("menu", null)}
          onSettings={() => setScreen("settings")}
          onContinue={hasGame ? () => setScreen("game") : undefined}
        />
      );
      break;
    case "settings":
      body = <SettingsScreen onBack={() => setScreen("menu")} />;
      break;
    case "setup":
      body = <SetupScreen onStarted={() => setScreen("game")} onBack={() => setScreen("menu")} onEditDecks={() => openBuilder("setup", settings.setupDecks[0])} />;
      break;
    case "builder":
      body = (
        <DeckBuilder
          initialFile={deckFile}
          onBack={() => setScreen(builderFrom)}
          onTextEditor={(file) => {
            setDeckFile(file);
            setScreen("text");
          }}
        />
      );
      break;
    case "text":
      body = <DeckEditor initialFile={deckFile} onBack={() => setScreen("builder")} />;
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
