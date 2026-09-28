// The end of the game over the table: who won and why, then a new game, the main menu, or a last look at the board.
import { useState } from "react";
import type { GameUpdate } from "../../engine/protocol";
import { useT } from "../../i18n";
import { playerLabel } from "../labels";

export function ResultOverlay({ update, onNewGame, onMenu }: { update: GameUpdate; onNewGame: () => void; onMenu: () => void }) {
  const t = useT();
  const [closedAt, setClosedAt] = useState<number | null>(null);
  const result = update.result;
  if (!result || closedAt === update.inputCount) return null;
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
        <div className="sve-result-buttons">
          <button type="button" className="sve-primary" onClick={onNewGame}>
            {t("game.newGame")}
          </button>
          <button type="button" onClick={onMenu}>
            {t("game.backToMenu")}
          </button>
          <button type="button" onClick={() => setClosedAt(update.inputCount)} data-testid="result-view-board">
            {t("result.viewBoard")}
          </button>
        </div>
      </div>
    </div>
  );
}
