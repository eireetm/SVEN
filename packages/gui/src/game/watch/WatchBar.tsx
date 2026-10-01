// Watching a replay: its playback bar, under the card panel on the left (the table stays whole). The
// engine worker plays the replay's inputs back one by one (engine/game-host.ts); this only sends what the watcher chooses:
// play or pause, a step forward or back, the speed, a place on the progress bar (its marks are the turns), whose view, and
// whether both players' hidden cards show.
import { useEffect, useRef, useState } from "react";
import type { PlayerId } from "@sve/core";
import { engine } from "../../app/store";
import type { GameUpdate, ToWorker } from "../../engine/protocol";
import { useT } from "../../i18n";

const SPEEDS = [0.5, 1, 2, 4];

type Control = Omit<Extract<ToWorker, { kind: "watchControl" }>, "kind">;

export function WatchBar({ update, onExit }: { update: GameUpdate; onExit: () => void }) {
  const t = useT();
  const watch = update.watch!;
  const send = (control: Control) => engine.send({ kind: "watchControl", ...control });
  // The progress bar follows the playback, except while it is being dragged (a place is sent once it rests).
  const [dragged, setDragged] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current !== null && window.clearTimeout(timer.current)), []);
  const seek = (position: number) => {
    setDragged(position);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      send({ seek: position });
      setDragged(null);
    }, 180);
  };
  const position = dragged ?? watch.position;
  const turn = Math.max(1, watch.turns.filter((p) => p <= position).length);
  const exit = () => {
    if (watch.playing) send({ playing: false });
    onExit();
  };
  return (
    <section className="sve-watch" data-testid="watch-bar">
      <div className="sve-watch-title">
        <strong>{t("watch.title")}</strong>
        <span>{t("watch.turnN", { n: turn })}</span>
        <span className="sve-hint" data-testid="watch-position">
          {t("watch.position", { position, total: watch.total })}
        </span>
      </div>
      <div className="sve-watch-progress">
        <input
          type="range"
          min={0}
          max={watch.total}
          step={1}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={t("watch.position", { position, total: watch.total })}
          data-testid="watch-seek"
        />
        <div className="sve-watch-turns" aria-hidden="true">
          {watch.turns.map((at, i) => (
            <span key={i} style={{ left: `${watch.total > 0 ? (at / watch.total) * 100 : 0}%` }} title={t("watch.turnN", { n: i + 1 })} />
          ))}
        </div>
      </div>
      <div className="sve-watch-buttons">
        <button type="button" onClick={() => send({ step: -1 })} disabled={watch.position === 0} data-testid="watch-back">
          {t("watch.back")}
        </button>
        <button type="button" className="sve-primary" onClick={() => send({ playing: !watch.playing })} data-testid="watch-play">
          {t(watch.playing ? "watch.pause" : "watch.play")}
        </button>
        <button type="button" onClick={() => send({ step: 1 })} disabled={watch.position >= watch.total} data-testid="watch-forward">
          {t("watch.forward")}
        </button>
      </div>
      <div className="sve-watch-options">
        <label>
          <span>{t("watch.speed")}</span>
          <select value={watch.speed} onChange={(e) => send({ speed: Number(e.target.value) })} data-testid="watch-speed">
            {SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t("watch.view")}</span>
          <select value={update.perspective} onChange={(e) => send({ perspective: Number(e.target.value) as PlayerId })} data-testid="watch-view">
            {([0, 1] as const).map((p) => (
              <option key={p} value={p}>
                {t("watch.viewPlayer", { n: p + 1 })}
              </option>
            ))}
          </select>
        </label>
        <label className="sve-check">
          <input
            type="checkbox"
            checked={update.settings.revealAll}
            onChange={(e) => engine.send({ kind: "settings", settings: { revealAll: e.target.checked } })}
            data-testid="watch-hands"
          />
          {t("watch.showHands")}
        </label>
      </div>
      {watch.stopped ? (
        <p className="sve-problem" data-testid="watch-stopped">
          {t("watch.stopped", { detail: watch.stopped })}
        </p>
      ) : null}
      <button type="button" onClick={exit} data-testid="watch-exit">
        {t("watch.exit")}
      </button>
    </section>
  );
}
