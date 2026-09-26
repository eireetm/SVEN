// BP20-005 Windbloom Sylph — Forestcraft follower, 2, 2/2. 精霊.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever you play a Fae-Touched card, give your leader {[defense]}+1. (Not for this card itself — ruling.)
import { defineCard, evolveAbility, whenYouPlay } from "../helpers";
import { fae } from "./shared";
import { sylphLeader } from "./shared-forest";

export default defineCard({
  abilities: [evolveAbility(1), whenYouPlay(sylphLeader, fae)],
});
