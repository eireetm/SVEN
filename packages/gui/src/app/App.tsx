import { lazy, Suspense, useEffect, useState } from "react";
import { DeckBuilder } from "../decks/DeckBuilder";
import { DeckEditor } from "../decks/DeckEditor";
import { GameScreen } from "../game/GameScreen";
import { htmlLang, useT } from "../i18n";
import { onGameStart } from "../net/state";
import { applyUiTransparency, loadResources, useResourcesVersion } from "../resources/resources";
import { installClickSound, playBgm } from "../resources/sound";
import type { BgmName } from "../resources/sound-plan";
import { ReplaysScreen } from "../replays/ReplaysScreen";
import { SetupScreen } from "../setup/SetupScreen";
import { MainMenu } from "./MainMenu";
import { SettingsScreen } from "./SettingsScreen";
import { useSettings } from "./settings";
import { dismissError, useApp } from "./store";

type Screen = "menu" | "settings" | "setup" | "builder" | "text" | "replays" | "online" | "game";

/** Online play loads when first opened: its connection libraries stay out of the start. */
const OnlineScreen = lazy(() => import("../online/OnlineScreen").then((m) => ({ default: m.OnlineScreen })));

/** Each screen's background music (public/audio/bgm, docs/resources.md): the menus', the deck builder's, a game's. */
const MUSIC: Record<Screen, BgmName> = { menu: "menu", settings: "menu", setup: "menu", builder: "deck", text: "deck", replays: "menu", online: "menu", game: "battle" };

/**
 * The screens: the main menu first (play against the AI, build decks, settings); the game setup; the deck builder (from
 * the menu or the setup; its text editor from it); the game. The engine starts in the background while the menu shows.
 */
export function App() {
  const settings = useSettings();
  const hasGame = useApp((s) => s.update !== null);
  const [screen, setScreen] = useState<Screen>("menu");
  // Where the deck builder returns to, and the deck it opens / the text editor opens.
  const [builderFrom, setBuilderFrom] = useState<"menu" | "setup" | "online">("menu");
  const [deckFile, setDeckFile] = useState<string | null>(null);
  const openBuilder = (from: "menu" | "setup" | "online", file: string | null) => {
    setBuilderFrom(from);
    setDeckFile(file);
    setScreen("builder");
  };

  useEffect(() => {
    void loadResources();
  }, []);
  useEffect(() => {
    document.documentElement.lang = htmlLang(settings.uiLang);
  }, [settings.uiLang]);
  useEffect(() => applyUiTransparency(settings.uiTransparency), [settings.uiTransparency]);
  // The music of the screen, once the list of the player's files is known; the click sound of the interface.
  const resources = useResourcesVersion();
  useEffect(() => {
    if (resources > 0) playBgm(MUSIC[screen]);
  }, [screen, resources]);
  useEffect(() => installClickSound(), []);
  // A game over the connection starts when both players are ready, wherever this one is (docs/online.md).
  useEffect(() => onGameStart(() => setScreen("game")), []);

  let body;
  switch (screen) {
    case "menu":
      body = (
        <MainMenu
          onPlayAi={() => setScreen("setup")}
          onDeckBuilder={() => openBuilder("menu", null)}
          onReplays={() => setScreen("replays")}
          onOnline={() => setScreen("online")}
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
    case "replays":
      body = <ReplaysScreen onWatch={() => setScreen("game")} onBack={() => setScreen("menu")} />;
      break;
    case "online":
      body = (
        <Suspense fallback={null}>
          <OnlineScreen onBack={() => setScreen("menu")} onGame={() => setScreen("game")} onEditDecks={() => openBuilder("online", settings.setupDecks[0])} />
        </Suspense>
      );
      break;
    case "game":
      body = <GameScreen onMenu={() => setScreen("menu")} onNewGame={() => setScreen("setup")} onReplays={() => setScreen("replays")} onOnline={() => setScreen("online")} />;
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
