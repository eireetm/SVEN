// Beside the line where the two mats meet: on the left the turn, the phase and what the game waits for; on the right the
// buttons that finish the pending decision (end the main phase, pass, confirm a selection, keep the hand ...). Everything
// else about a decision is on the table (lit cards) or in the decision panel.
import type { Answer } from "@sve/core";
import type { ReactNode } from "react";
import type { GameUpdate } from "../../engine/protocol";
import { useT, type MessageKey } from "../../i18n";
import { rangeLabel, SELECT_KEYS } from "../decisions/DecisionPanel";
import { sendAnswer, useInteraction } from "../interaction";
import { playerLabel } from "../labels";

const PHASE_KEYS: Record<string, MessageKey> = {
  setup: "game.phase.setup",
  start: "game.phase.start",
  main: "game.phase.main",
  end: "game.phase.end",
  over: "game.phase.over",
};

export function CenterLine({ update }: { update: GameUpdate }) {
  const t = useT();
  const view = update.view;
  const decision = update.decision?.decision;
  const sent = useInteraction((s) => s.sent);
  const chosen = useInteraction((s) => s.chosen);
  const answer = (a: Answer) => sendAnswer(update, a);
  const buttons: ReactNode[] = [];
  const button = (key: string, label: string, onClick: () => void, primary = false, disabled = false) =>
    buttons.push(
      <button key={key} type="button" className={primary ? "sve-primary" : undefined} disabled={sent || disabled} onClick={onClick} data-testid={`table-${key}`}>
        {label}
      </button>,
    );
  let prompt: string | null = null;
  if (decision) {
    switch (decision.type) {
      case "mainPhase":
        prompt = t("table.mainPhase");
        button("end", t("decision.endMain"), () => answer({ type: "mainPhase", action: { type: "endMainPhase" } }), true);
        break;
      case "quick":
        prompt = t(decision.timing === "attack" ? "decision.quick.attack" : "decision.quick.endPhase");
        button("pass", t("decision.pass"), () => answer({ type: "quick", action: { type: "pass" } }), true);
        break;
      case "selectCards":
        prompt = `${t(SELECT_KEYS[decision.reason])} — ${t("decision.selectCards", { range: rangeLabel(decision.min, decision.max, t) })}`;
        if (decision.min !== 1 || decision.max !== 1) {
          if (decision.min === 0) button("none", t("decision.none"), () => answer({ type: "selectCards", cards: [] }));
          button("confirm", `${t("decision.confirm")} (${chosen.length})`, () => answer({ type: "selectCards", cards: chosen }), true, chosen.length < decision.min || chosen.length > decision.max);
        }
        break;
      case "mulligan":
        prompt = t("decision.mulligan");
        button("keep", t("decision.keep"), () => answer({ type: "mulligan", redraw: false }), true);
        button("redraw", t("decision.redraw"), () => answer({ type: "mulligan", redraw: true }));
        break;
      case "chooseTurnOrder":
        prompt = t("decision.chooseTurnOrder");
        button("first", t("decision.goFirst"), () => answer({ type: "chooseTurnOrder", goFirst: true }), true);
        button("second", t("decision.goSecond"), () => answer({ type: "chooseTurnOrder", goFirst: false }));
        break;
      default:
        prompt = t("table.answerInPanel");
    }
  } else if (update.waitingFor !== null && !update.result) {
    prompt = update.thinking ? t("game.thinking", { player: playerLabel(update.waitingFor, update, t) }) : null;
    if (update.settings.paused && update.controllers[update.waitingFor] !== "human") prompt = t("game.paused");
  }
  return (
    <>
      <div className="sve-center-status">
        <div className="sve-center-turn">
          <strong>{t("game.turn", { n: view.turn })}</strong> · {t(PHASE_KEYS[view.phase] ?? "game.phase.main")}
        </div>
        {view.phase !== "over" ? <div>{t("game.activePlayer", { player: playerLabel(view.activePlayer, update, t) })}</div> : null}
        {prompt ? <div className={`sve-center-prompt${decision ? " sve-your-move" : ""}`}>{prompt}</div> : null}
      </div>
      <div className="sve-center-actions">{buttons}</div>
    </>
  );
}
