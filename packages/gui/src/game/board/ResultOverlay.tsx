// The end of the game over the table: who won and why, then save its replay (docs/gui.md "录像"), a new game, the main
// menu, or a last look at the board. The end of a replay being watched: watch it again, or back to the replays.
import { useState } from "react";
import { errorText } from "../../app/errors";
import { engine } from "../../app/store";
import type { GameUpdate } from "../../engine/protocol";
import { hostApi } from "../../host/api";
import { useT } from "../../i18n";
import { playerLabel } from "../labels";
import { replayFileName } from "../replay-files";

interface Props {
  update: GameUpdate;
  onNewGame: () => void;
  onMenu: () => void;
  onReplays: () => void;
}

export function ResultOverlay({ update, onNewGame, onMenu, onReplays }: Props) {
  const t = useT();
  const [closedAt, setClosedAt] = useState<number | null>(null);
  // The replay saved from this game (its file), or why it could not be.
  const [saved, setSaved] = useState<{ seed: string; file?: string; error?: string } | null>(null);
  const result = update.result;
  if (!result || closedAt === update.inputCount) return null;
  const save = async () => {
    const replay = await engine.exportReplay();
    if (!replay) return;
    const now = new Date();
    replay.info = { ...(replay.info ?? { result, turn: update.view.turn }), savedAt: now.toISOString() };
    const file = replayFileName(replay, now);
    try {
      await hostApi.saveReplay(file, replay);
      setSaved({ seed: update.seed, file });
    } catch (err) {
      setSaved({ seed: update.seed, error: errorText(err, t) });
    }
  };
  const done = saved !== null && saved.seed === update.seed ? saved : null;
  const person = update.controllers[update.perspective] === "human";
  const title =
    result.winner === null
      ? t("game.draw")
      : person && update.controllers[result.winner === 0 ? 1 : 0] !== "human"
        ? t(result.winner === update.perspective ? "result.victory" : "result.defeat")
        : t("game.win", { player: playerLabel(result.winner, update, t) });
  return (
    <div className="sve-result-overlay" data-testid="result-overlay">
      <div className="sve-result-panel">
        <h2>{title}</h2>
        <p>{result.losses.map((l) => `${playerLabel(l.player, update, t)}: ${t(`game.reason.${l.reason}` as const)}`).join("; ")}</p>
        {update.watch ? (
          <div className="sve-result-buttons">
            <button type="button" className="sve-primary" onClick={() => engine.send({ kind: "watchControl", seek: 0, playing: true })} data-testid="result-watch-again">
              {t("result.watchAgain")}
            </button>
            <button type="button" onClick={onReplays} data-testid="result-replays">
              {t("result.backToReplays")}
            </button>
            <button type="button" onClick={() => setClosedAt(update.inputCount)} data-testid="result-view-board">
              {t("result.viewBoard")}
            </button>
          </div>
        ) : (
          <>
            <div className="sve-result-buttons">
              <button type="button" className="sve-primary" onClick={onNewGame}>
                {t("game.newGame")}
              </button>
              <button type="button" disabled={done?.file !== undefined} onClick={() => void save()} data-testid="result-save-replay">
                {t("result.saveReplay")}
              </button>
              <button type="button" onClick={onMenu}>
                {t("game.backToMenu")}
              </button>
              <button type="button" onClick={() => setClosedAt(update.inputCount)} data-testid="result-view-board">
                {t("result.viewBoard")}
              </button>
            </div>
            {done ? (
              <p className={done.error ? "sve-problem" : "sve-hint"} data-testid="result-saved">
                {done.error ? t("result.saveFailed", { error: done.error }) : t("result.saved", { file: done.file! })}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
