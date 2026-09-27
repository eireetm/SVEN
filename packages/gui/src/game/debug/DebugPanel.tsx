import { useEffect, useState } from "react";
import { updateSettings } from "../../app/settings";
import { engine, reportError } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { hostApi, type HostInfo } from "../../host/api";
import { useT } from "../../i18n";
import { downloadJson, readReplayFile } from "../replay-files";

/** Tools for testing by hand: undo, rewind, replays (a bug report), hidden cards, bot pace. */
export function DebugPanel({ update }: { update: GameUpdate }) {
  const t = useT();
  const [host, setHost] = useState<HostInfo | null>(null);
  const [rewindTo, setRewindTo] = useState(update.inputCount);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    hostApi.info().then(setHost, () => setHost(null));
  }, []);
  useEffect(() => {
    setRewindTo(update.inputCount);
  }, [update.inputCount]);
  const lastHuman = update.humanInputs[update.humanInputs.length - 1];
  const settings = update.settings;
  const saveReplay = async () => {
    const replay = await engine.exportReplay();
    if (replay) downloadJson(`sve-replay-${replay.options.seed}-${replay.inputs.length}.json`, replay);
  };
  const loadReplay = async (file: File | undefined) => {
    if (!file) return;
    try {
      engine.send({ kind: "loadReplay", replay: await readReplayFile(file) });
    } catch (err) {
      reportError(t("setup.badReplay", { error: err instanceof Error ? err.message : String(err) }));
    }
  };
  return (
    <div className="sve-debug">
      <dl className="sve-debug-facts">
        <dt>{t("debug.seed")}</dt>
        <dd>{update.seed}</dd>
        <dt>{t("debug.inputs")}</dt>
        <dd>{update.inputCount}</dd>
      </dl>
      <div className="sve-debug-row">
        <button type="button" disabled={lastHuman === undefined} onClick={() => engine.send({ kind: "rewind", inputs: lastHuman! })}>
          {t("debug.undo")}
        </button>
      </div>
      <div className="sve-debug-row">
        <span>{t("debug.rewindTo")}</span>
        <input type="number" min={0} max={update.inputCount} value={rewindTo} onChange={(e) => setRewindTo(Number(e.target.value))} />
        <button type="button" onClick={() => engine.send({ kind: "rewind", inputs: Math.max(0, Math.min(rewindTo, update.inputCount)) })}>
          {t("debug.rewind")}
        </button>
      </div>
      <div className="sve-debug-row">
        <button type="button" onClick={() => void saveReplay()}>
          {t("debug.export")}
        </button>
        <label className="sve-file-button">
          {t("debug.import")}
          <input type="file" accept=".json,application/json" hidden onChange={(e) => void loadReplay(e.target.files?.[0])} />
        </label>
      </div>
      <p className="sve-hint">{t("debug.replayNote")}</p>
      <label className="sve-check">
        <input type="checkbox" checked={settings.revealAll} onChange={(e) => engine.send({ kind: "settings", settings: { revealAll: e.target.checked } })} />
        {t("debug.revealAll")}
      </label>
      <label className="sve-check">
        <input type="checkbox" checked={settings.paused} onChange={(e) => engine.send({ kind: "settings", settings: { paused: e.target.checked } })} />
        {t("debug.pauseBots")}
      </label>
      <div className="sve-debug-row">
        <button type="button" disabled={!settings.paused} onClick={() => engine.send({ kind: "step" })}>
          {t("debug.step")}
        </button>
      </div>
      <label className="sve-range">
        {t("debug.botDelay", { ms: settings.botDelayMs })}
        <input
          type="range"
          min={0}
          max={3000}
          step={100}
          value={settings.botDelayMs}
          onChange={(e) => {
            const botDelayMs = Number(e.target.value);
            updateSettings({ botDelayMs });
            engine.send({ kind: "settings", settings: { botDelayMs } });
          }}
        />
      </label>
      <details>
        <summary>{t("debug.decision")}</summary>
        <pre className="sve-json">{JSON.stringify(update.decision?.decision ?? null, null, 2)}</pre>
      </details>
      <div className="sve-debug-row">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(JSON.stringify(update.view, null, 2)).then(() => setCopied(true));
          }}
        >
          {t("debug.copyView")}
        </button>
        {copied ? <span className="sve-note">{t("debug.copied")}</span> : null}
      </div>
      {host ? <p className="sve-hint">{host.assetsFound ? t("debug.host", { dir: host.assetsDir }) : t("debug.hostMissing", { dir: host.assetsDir })}</p> : null}
    </div>
  );
}
