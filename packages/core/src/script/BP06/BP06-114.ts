// BP06-114 Chaht, Ringside Announcer — Neutral follower, 3, 3/3. 挑戦者.
// This card costs 3 less to play if there's a Colosseum on High on your field.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, controller) => (onYourField(g, controller, "Colosseum on High") ? -3 : 0),
  abilities: [evolveAbility(1)],
});
