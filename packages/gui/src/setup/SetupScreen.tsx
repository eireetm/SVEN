import { useEffect, useState } from "react";
import { errorText } from "../app/errors";
import { updateSettings, useSettings } from "../app/settings";
import { engine, reportError, useApp } from "../app/store";
import { cardCount, toDeckList, type DeckFile } from "../decks/format";
import type { SeatController, TurnOrder } from "../engine/protocol";
import { checkDeck, useFormat } from "../formats/check";
import { formatProblemText, leadersFor, type FormatProblem } from "../formats/formats";
import { FormatPicker } from "../formats/FormatPicker";
import { readReplayFile } from "../game/replay-files";
import { hostApi, type DeckFileEntry } from "../host/api";
import { useT } from "../i18n";

const CONTROLLERS: readonly SeatController[] = ["human", "greedy", "random"];
/** The opponent: an AI, or a second person at the same screen (hot seat). */
const OPPONENTS: readonly SeatController[] = ["greedy", "random", "human"];
/** Who goes first: as the rules say (a random player decides, CR 6.2.1.6) first, then the testing choices. */
const TURN_ORDERS: readonly TurnOrder[] = ["choose", "random", "player1", "player2"];

interface DeckStatus {
  deck: DeckFile;
  /** What keeps it out of the chosen format (none: it can be played). */
  problems: FormatProblem[];
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
 * play each other), the seed, the format and its restriction list (a deck that doesn't meet them can't start a game), the
 * bots' pace, and loading a replay.
 */
export function SetupScreen({ onStarted, onBack, onEditDecks }: Props) {
  const t = useT();
  const settings = useSettings();
  const hasGame = useApp((s) => s.update !== null && s.update.result === null);
  const catalog = useApp((s) => s.catalog);
  const [decks, setDecks] = useState<DeckFileEntry[] | null>(null);
  const [seed, setSeed] = useState(newSeed);
  const [status, setStatus] = useState<[DeckStatus | null, DeckStatus | null]>([null, null]);
  const files = settings.setupDecks;
  const controllers = settings.setupControllers;
  const { format, list } = useFormat();

  useEffect(() => {
    hostApi.listDecks().then(setDecks, (err: unknown) => reportError(String(err)));
  }, []);

  // Check the chosen decks in the format (the engine's CR 6.1 and the format's own rules, formats.ts).
  useEffect(() => {
    let live = true;
    setStatus([null, null]);
    if (!catalog) return;
    files.forEach((file, seat) => {
      if (!file) return;
      hostApi
        .loadDeck(file)
        .then(async (deck) => {
          const problems = await checkDeck(deck, format, list, catalog);
          if (live) setStatus((s) => (seat === 0 ? [{ deck, problems }, s[1]] : [s[0], { deck, problems }]));
        })
        .catch((err: unknown) => reportError(`${file}: ${errorText(err, t)}`));
    });
    return () => {
      live = false;
    };
  }, [files, format, list, catalog]);

  const setSeat = (seat: 0 | 1, change: { deck?: string; controller?: SeatController }) => {
    const nextDecks: [string, string] = [...files];
    const nextControllers: [SeatController, SeatController] = [...controllers];
    if (change.deck !== undefined) nextDecks[seat] = change.deck;
    if (change.controller !== undefined) nextControllers[seat] = change.controller;
    updateSettings({ setupDecks: nextDecks, setupControllers: nextControllers });
  };

  const ready = status[0] !== null && status[1] !== null && status[0].problems.length === 0 && status[1].problems.length === 0;

  const start = () => {
    if (!status[0] || !status[1] || !catalog) return;
    const [a, b] = [status[0].deck, status[1].deck];
    // Cross Craft: the engine plays with one leader, the other is shown beside it (GameOptions.secondLeaders).
    const [la, lb] = [leadersFor(a, format, catalog), leadersFor(b, format, catalog)];
    engine.send({
      kind: "settings",
      settings: { botDelayMs: settings.botDelayMs, paused: false, manualDebug: settings.manualDebug, announceQuick: settings.announceQuick },
    });
    engine.send({
      kind: "start",
      options: {
        seed,
        decks: [toDeckList(a, la.leader), toDeckList(b, lb.leader)],
        deckNames: [a.name, b.name],
        controllers,
        deckRestrictions: format === "standard",
        format,
        restrictionList: list?.id ?? null,
        secondLeaders: [la.second, lb.second],
        showEveryMainPhase: true,
        askEveryQuickWindow: true,
        manualActions: true,
        turnOrder: settings.setupTurnOrder,
      },
    });
    setSeed(newSeed());
    onStarted();
  };

  const loadReplay = async (file: File | undefined) => {
    if (!file) return;
    try {
      const replay = await readReplayFile(file);
      engine.send({ kind: "settings", settings: { paused: false, manualDebug: settings.manualDebug, announceQuick: settings.announceQuick } });
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
              {s.problems.length === 0 ? <span className="sve-ok">{t("setup.deckOk")}</span> : null}
              {s.problems.length > 0 && catalog ? (
                <div className="sve-problems" data-testid={`setup-problems-${seat}`}>
                  {t("setup.deckProblems", { format: t(`format.${format}`) })}
                  <ul>
                    {s.problems.map((problem, i) => (
                      <li key={i}>{formatProblemText(problem, { catalog, lang: settings.cardLang, t })}</li>
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
    <div className="sve-menu">
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
          <span className="sve-note" data-testid="setup-format">
            {t("setup.formatSummary", { format: t(`format.${format}`), list: list ? ` · ${list.id}` : "" })}
          </span>
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
            <label className="sve-field">
              <span>{t("setup.turnOrder")}</span>
              <select value={settings.setupTurnOrder} onChange={(e) => updateSettings({ setupTurnOrder: e.target.value as TurnOrder })} data-testid="setup-turn-order">
                {TURN_ORDERS.map((order) => (
                  <option key={order} value={order}>
                    {t(`turnOrder.${order}`)}
                  </option>
                ))}
              </select>
            </label>
            <FormatPicker />
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
    </div>
  );
}
