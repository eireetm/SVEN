// BP19-100 Agent of the Commandments — Havencraft follower, 2, 2/2. 八獄・信仰.
// When playing this, engage an Erralde, Troth Convict on your field: This costs 0 to play.
// {[evolve]} {[cost01]}: Evolve this.
// At the start of your end phase, give your leader {[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { agentEndPhase, erraldeOption } from "./shared-haven";

export default defineCard({
  playOptions: [erraldeOption],
  abilities: [evolveAbility(1), agentEndPhase],
});
