import { useEffect, useState } from "react";
import { updateSettings, useSettings } from "../../app/settings";
import { engine, reportError } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { hostApi, type HostInfo } from "../../host/api";
import { useT } from "../../i18n";
import { readReplayFile } from "../replay-files";

/**
 * Tools for testing by hand: manual debugging, undo, rewind, replays (a bug report), hidden cards, bot pace. Online, both
 * programs play one game: only what changes nothing in it is here (saving a bug report, the look of the table).
 */
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
  const online = update.online !== null;
  const { animations, manualSlots, manualDebug } = useSettings();
  const setManual = (on: boolean) => {
    updateSettings({ manualDebug: on });
    engine.send({ kind: "settings", settings: { manualDebug: on } });
  };
  const saveReplay = async () => {
    const replay = await engine.exportReplay();
    if (replay) await hostApi.saveExport(`sve-replay-${replay.options.seed}-${replay.inputs.length}.json`, replay);
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
      {!online ? (
        <>
          <label className="sve-check sve-debug-manual" title={t("debug.manualHelp")}>
            <input type="checkbox" checked={manualDebug} onChange={(e) => setManual(e.target.checked)} data-testid="debug-manual" />
            {t("debug.manual")}
          </label>
          {manualDebug ? <p className="sve-hint">{t("debug.manualHelp")}</p> : null}
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
        </>
      ) : null}
      <div className="sve-debug-row">
        <button type="button" onClick={() => void saveReplay()} data-testid="debug-export">
          {t("debug.export")}
        </button>
        {!online ? (
          <label className="sve-file-button">
            {t("debug.import")}
            <input type="file" accept=".json,application/json" hidden onChange={(e) => void loadReplay(e.target.files?.[0])} />
          </label>
        ) : null}
      </div>
      <p className="sve-hint">{t("debug.replayNote")}</p>
      {!online ? (
        <>
          <label className="sve-check">
            <input type="checkbox" checked={settings.revealAll} onChange={(e) => engine.send({ kind: "settings", settings: { revealAll: e.target.checked } })} />
            {t("debug.revealAll")}
          </label>
          <label className="sve-check">
            <input type="checkbox" checked={settings.paused} onChange={(e) => engine.send({ kind: "settings", settings: { paused: e.target.checked } })} />
            {t("debug.pauseBots")}
          </label>
        </>
      ) : null}
      <label className="sve-check">
        <input type="checkbox" checked={animations} onChange={(e) => updateSettings({ animations: e.target.checked })} />
        {t("debug.animations")}
      </label>
      <label className="sve-check" title={t("debug.manualSlotsHelp")}>
        <input type="checkbox" checked={manualSlots} onChange={(e) => updateSettings({ manualSlots: e.target.checked })} data-testid="debug-manual-slots" />
        {t("debug.manualSlots")}
      </label>
      {!online ? (
        <>
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
                engine.send({ kind: "settings", settings: { botDelayMs, attackPauseMs: Math.min(botDelayMs, 500) } });
              }}
            />
          </label>
        </>
      ) : null}
      <details>
        <summary>{t("debug.decision")}</summary>
        <pre className="sve-json">{JSON.stringify(update.decision?.decision ?? null, null, 2)}</pre>
      </details>
      <div className="sve-debug-row">
        <button
          type="button"
          onClick={() => {
            void hostApi.copyText(JSON.stringify(update.view, null, 2)).then(() => setCopied(true));
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
