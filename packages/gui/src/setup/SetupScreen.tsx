import { useEffect, useState } from "react";
import { updateSettings, useSettings } from "../app/settings";
import { engine, reportError, useApp } from "../app/store";
import { cardCount, toDeckList, type DeckFile } from "../decks/format";
import type { SeatController } from "../engine/protocol";
import { readReplayFile } from "../game/replay-files";
import { hostApi, type DeckFileEntry } from "../host/api";
import { useT } from "../i18n";

const CONTROLLERS: readonly SeatController[] = ["human", "greedy", "random"];
/** The opponent: an AI, or a second person at the same screen (hot seat). */
const OPPONENTS: readonly SeatController[] = ["greedy", "random", "human"];

interface DeckStatus {
  deck: DeckFile;
  errors: string[] | null;
}

function newSeed(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0]!.toString(36);
}

interface Props {
  onStarted: () => void;
  onBack: () => void;
  onEditDecks: () => void;
}

/**
 * Play against the AI: your deck, the opponent's deck and AI. Under "Advanced" (testing): who plays your seat (bots can
 * play each other), the seed, deck restrictions, the bots' pace, and loading a replay.
 */
export function SetupScreen({ onStarted, onBack, onEditDecks }: Props) {
  const t = useT();
  const settings = useSettings();
  const hasGame = useApp((s) => s.update !== null && s.update.result === null);
  const [decks, setDecks] = useState<DeckFileEntry[] | null>(null);
  const [seed, setSeed] = useState(newSeed);
  const [status, setStatus] = useState<[DeckStatus | null, DeckStatus | null]>([null, null]);
  const files = settings.setupDecks;
  const controllers = settings.setupControllers;
  const restrictions = settings.setupRestrictions;

  useEffect(() => {
    hostApi.listDecks().then(setDecks, (err: unknown) => reportError(String(err)));
  }, []);

  // Check the chosen decks with the engine (CR 6.1).
  useEffect(() => {
    let live = true;
    setStatus([null, null]);
    files.forEach((file, seat) => {
      if (!file) return;
      hostApi
        .loadDeck(file)
        .then(async (deck) => {
          const errors = await engine.validateDeck(toDeckList(deck), true);
          if (live) setStatus((s) => (seat === 0 ? [{ deck, errors }, s[1]] : [s[0], { deck, errors }]));
        })
        .catch((err: unknown) => reportError(`${file}: ${err instanceof Error ? err.message : String(err)}`));
    });
    return () => {
      live = false;
    };
  }, [files]);

  const setSeat = (seat: 0 | 1, change: { deck?: string; controller?: SeatController }) => {
    const nextDecks: [string, string] = [...files];
    const nextControllers: [SeatController, SeatController] = [...controllers];
    if (change.deck !== undefined) nextDecks[seat] = change.deck;
    if (change.controller !== undefined) nextControllers[seat] = change.controller;
    updateSettings({ setupDecks: nextDecks, setupControllers: nextControllers });
  };

  const ready = status[0] !== null && status[1] !== null && (!restrictions || (status[0].errors?.length === 0 && status[1].errors?.length === 0));

  const start = () => {
    if (!status[0] || !status[1]) return;
    const [a, b] = [status[0].deck, status[1].deck];
    engine.send({ kind: "settings", settings: { botDelayMs: settings.botDelayMs, paused: false } });
    engine.send({
      kind: "start",
      options: { seed, decks: [toDeckList(a), toDeckList(b)], deckNames: [a.name, b.name], controllers, deckRestrictions: restrictions },
    });
    setSeed(newSeed());
    onStarted();
  };

  const loadReplay = async (file: File | undefined) => {
    if (!file) return;
    try {
      const replay = await readReplayFile(file);
      engine.send({ kind: "settings", settings: { paused: false } });
      engine.send({ kind: "loadReplay", replay });
      onStarted();
    } catch (err) {
      reportError(t("setup.badReplay", { error: err instanceof Error ? err.message : String(err) }));
    }
  };

  const deckField = (seat: 0 | 1) => {
    const s = status[seat];
    return (
      <>
        <label className="sve-field">
          <span>{t("setup.deck")}</span>
          <select value={files[seat]} onChange={(e) => setSeat(seat, { deck: e.target.value })} data-testid={`setup-deck-${seat}`}>
            {!decks?.some((d) => d.file === files[seat]) ? <option value={files[seat]}>{files[seat]}</option> : null}
            {(decks ?? []).map((d) => (
              <option key={d.file} value={d.file}>
                {d.name} ({d.file})
              </option>
            ))}
          </select>
        </label>
        <div className="sve-deck-status">
          {s === null ? (
            <span className="sve-note">{t("setup.loadingDeck")}</span>
          ) : (
            <>
              <span>{t("setup.deckSummary", { main: cardCount(s.deck.main), evolve: cardCount(s.deck.evolve) })}</span>
              {s.errors && s.errors.length === 0 ? <span className="sve-ok">{t("setup.deckOk")}</span> : null}
              {s.errors && s.errors.length > 0 ? (
                <div className="sve-problems">
                  {t("setup.deckProblems")}
                  <ul>
                    {s.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </>
    );
  };

  const controllerField = (seat: 0 | 1, label: string, options: readonly SeatController[]) => (
    <label className="sve-field">
      <span>{label}</span>
      <select value={controllers[seat]} onChange={(e) => setSeat(seat, { controller: e.target.value as SeatController })} data-testid={`setup-controller-${seat}`}>
        {options.map((c) => (
          <option key={c} value={c}>
            {t(`controller.${c}` as const)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="sve-setup">
      <header className="sve-screen-header">
        <button type="button" onClick={onBack}>
          {t("common.back")}
        </button>
        <h2>{t("setup.title")}</h2>
      </header>
      {decks !== null && decks.length === 0 ? <p className="sve-note">{t("setup.noDecks")}</p> : null}
      <div className="sve-seats">
        <section className="sve-seat" data-seat={0}>
          <h3>{t("setup.you")}</h3>
          {deckField(0)}
          <button type="button" className="sve-link-button" onClick={onEditDecks}>
            {t("setup.editDecks")}
          </button>
        </section>
        <section className="sve-seat" data-seat={1}>
          <h3>{t("setup.opponent")}</h3>
          {deckField(1)}
          {controllerField(1, t("setup.aiType"), OPPONENTS)}
        </section>
      </div>
      <div className="sve-setup-actions">
        <button type="button" className="sve-primary sve-big-button" disabled={!ready} onClick={start} data-testid="start-game">
          {t("setup.start")}
        </button>
        {hasGame ? (
          <button type="button" onClick={onStarted}>
            {t("setup.continue")}
          </button>
        ) : null}
      </div>
      <details className="sve-advanced">
        <summary>{t("setup.advanced")}</summary>
        <div className="sve-advanced-body">
          {controllerField(0, t("setup.youPlayedBy"), CONTROLLERS)}
          <label className="sve-field">
            <span>{t("setup.seed")}</span>
            <input value={seed} onChange={(e) => setSeed(e.target.value)} data-testid="setup-seed" />
            <button type="button" onClick={() => setSeed(newSeed())}>
              {t("setup.randomSeed")}
            </button>
          </label>
          <label className="sve-check">
            <input type="checkbox" checked={restrictions} onChange={(e) => updateSettings({ setupRestrictions: e.target.checked })} />
            {t("setup.restrictions")}
          </label>
          <label className="sve-range">
            {t("setup.botDelay")}: {settings.botDelayMs} ms
            <input type="range" min={0} max={3000} step={100} value={settings.botDelayMs} onChange={(e) => updateSettings({ botDelayMs: Number(e.target.value) })} />
          </label>
          <label className="sve-file-button">
            {t("setup.loadReplay")}
            <input type="file" accept=".json,application/json" hidden onChange={(e) => void loadReplay(e.target.files?.[0])} />
          </label>
        </div>
      </details>
    </div>
  );
}
