// BP01-129 Arch Priestess Laelia — Havencraft follower, 4, 0/6.
// {[evolve]}{[cost01]}: Evolve this follower.
// While this card is on your field, your followers deal damage equal to their defense.
// (Only damage from attacks / combat, not from abilities — ruling.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  field: { combatDamageFromDefense: true },
  abilities: [evolveAbility(1)],
});
