/**
 * sve-server's three AIs, imitated over our engine as benchmark opponents (docs/bot.md section 10): `npm run bot:arena`
 * plays our bots against them (sve-fool 笨AI, sve-good 聪明AI, sve-planner 创造性AI). Not part of the game.
 */
import type { Answer, Engine, GameSession } from "../../packages/core/src";
import { foolAnswer } from "./fool";
import { SveGoodAI } from "./good";
import { SvePlannerAI } from "./planner";

export const SVE_SERVER_AIS = ["sve-fool", "sve-good", "sve-planner"] as const;
export type SveServerAI = (typeof SVE_SERVER_AIS)[number];

export function createSveServerBot(engine: Engine, kind: SveServerAI): { decide(session: GameSession): Answer } {
  if (kind === "sve-good") return new SveGoodAI(engine);
  if (kind === "sve-planner") return new SvePlannerAI(engine);
  return { decide: (session) => foolAnswer(engine, session) };
}
