// BP03-060 Draconir, Knuckle Dragon — Dragoncraft follower, 3, 3/3. 竜族・武装.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Summon a Draconic Weapon.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({ *resolve(fx) { yield* fx.summon(["Draconic Weapon"]); } }),
  ],
});
