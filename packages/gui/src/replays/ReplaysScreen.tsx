// The saved replays (packages/gui/replays/): newest first, with their decks, players and result. Watch
// one, delete one, or open a replay file from elsewhere (a friend's, a bug report). Watching hands the replay to the engine
// worker, which plays it back input by input (engine/game-host.ts), and shows the game screen with its playback bar.
import { useEffect, useState } from "react";
import { errorText } from "../app/errors";
import { engine, reportError, useApp } from "../app/store";
import type { Replay } from "../engine/protocol";
import { readReplayFile } from "../game/replay-files";
import { hostApi, type ReplayFileEntry } from "../host/api";
import { htmlLang, useT } from "../i18n";
import { useSettings } from "../app/settings";

interface Props {
  /** The playback has started: show the game screen. */
  onWatch: () => void;
  onBack: () => void;
}

export function ReplaysScreen({ onWatch, onBack }: Props) {
  const t = useT();
  const ready = useApp((s) => s.ready);
  // A game being played (not watched, not over) ends when a replay is watched: ask first.
  const playing = useApp((s) => s.update !== null && s.update.watch === null && s.update.result === null);
  const [entries, setEntries] = useState<ReplayFileEntry[] | null>(null);
  const [folder, setFolder] = useState<string | null>(null);
  const reload = () =>
    hostApi.listReplays().then(setEntries, (err: unknown) => {
      reportError(errorText(err, t));
      setEntries([]);
    });
  useEffect(() => {
    void reload();
    void hostApi.info().then(
      (info) => setFolder(info.replaysDir),
      () => setFolder(null),
    );
  }, []);

  const watch = (replay: Replay) => {
    if (playing && !window.confirm(t("replays.endsGame"))) return;
    // Both players' cards are shown at first (the playback bar hides them again).
    engine.send({ kind: "settings", settings: { paused: false, revealAll: true } });
    engine.send({ kind: "watch", replay });
    onWatch();
  };
  const watchSaved = async (file: string) => {
    try {
      watch(await hostApi.loadReplay(file));
    } catch (err) {
      reportError(errorText(err, t));
    }
  };
  const watchFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      watch(await readReplayFile(file));
    } catch (err) {
      reportError(t("setup.badReplay", { error: err instanceof Error ? err.message : String(err) }));
    }
  };
  const remove = async (file: string) => {
    if (!window.confirm(t("replays.deleteConfirm", { file }))) return;
    try {
      await hostApi.deleteReplay(file);
    } catch (err) {
      reportError(errorText(err, t));
    }
    await reload();
  };

  return (
    <div className="sve-menu">
      <div className="sve-menu-panel sve-replays">
        <h2>{t("replays.title")}</h2>
        {entries === null ? null : entries.length === 0 ? (
          <p className="sve-hint" data-testid="replays-empty">
            {t("replays.empty")}
          </p>
        ) : (
          <ul className="sve-replay-list" data-testid="replay-list">
            {entries.map((entry) => (
              <ReplayRow key={entry.file} entry={entry} ready={ready} onWatch={() => void watchSaved(entry.file)} onDelete={() => void remove(entry.file)} />
            ))}
          </ul>
        )}
        <div className="sve-replays-actions">
          <label className={`sve-file-button${ready ? "" : " sve-disabled"}`}>
            {t("replays.openFile")}
            <input type="file" accept=".json,application/json" hidden disabled={!ready} onChange={(e) => void watchFile(e.target.files?.[0])} data-testid="replay-open-file" />
          </label>
          <button type="button" onClick={onBack}>
            {t("common.back")}
          </button>
        </div>
        {folder ? <p className="sve-hint sve-replays-folder">{t("replays.folder", { dir: folder })}</p> : null}
      </div>
    </div>
  );
}

/** One replay: when, who played what, how it ended; watch it or delete it. */
function ReplayRow({ entry, ready, onWatch, onDelete }: { entry: ReplayFileEntry; ready: boolean; onWatch: () => void; onDelete: () => void }) {
  const t = useT();
  const { uiLang } = useSettings();
  const when = new Date(entry.info?.savedAt ?? entry.modified).toLocaleString(htmlLang(uiLang), { dateStyle: "medium", timeStyle: "short" });
  const side = (i: 0 | 1) => {
    const deck = entry.deckNames?.[i] ?? "?";
    const controller = entry.controllers?.[i];
    return controller ? t("replays.side", { deck, controller: t(`controller.${controller}` as const) }) : deck;
  };
  const result = entry.info?.result as { winner: 0 | 1 | null } | null | undefined;
  const outcome = !entry.info
    ? null
    : result
      ? result.winner === null
        ? t("game.draw")
        : t("game.win", { player: t("game.playerN", { n: result.winner + 1 }) })
      : t("replays.unfinished");
  return (
    <li className="sve-replay-row" data-testid="replay-row" data-file={entry.file}>
      <div className="sve-replay-text">
        <strong>{entry.deckNames ? t("replays.vs", { a: side(0), b: side(1) }) : entry.file}</strong>
        <span className="sve-hint">
          {when}
          {entry.deckNames ? null : ` ${t("replays.unreadable")}`}
          {outcome ? ` · ${outcome}` : ""}
          {entry.info ? ` · ${t("replays.turn", { n: entry.info.turn })}` : ""}
          {entry.inputs > 0 ? ` · ${t("replays.steps", { n: entry.inputs })}` : ""}
        </span>
      </div>
      <div className="sve-replay-buttons">
        <button type="button" className="sve-primary" disabled={!ready || !entry.deckNames} onClick={onWatch} data-testid="replay-watch">
          {t("replays.watch")}
        </button>
        <button type="button" onClick={onDelete} data-testid="replay-delete">
          {t("replays.delete")}
        </button>
      </div>
    </li>
  );
}
