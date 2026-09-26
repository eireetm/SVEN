// BP18-001 Rolo Roné, Verdant Purifier — Forestcraft follower, 4, 3/3. 透京・植物族.
// {[evolve]} {[cost01]}: Evolve this.
// You may play any number of Evolve per turn. (CR 8.3.2.2; each evolve may use an evolution point; not an advanced ability
// after an evolve — rulings.)
// {[fanfare]} Select a Togh Keyoh card in your cemetery and put it into your EX area. It costs 2 less to play this turn.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: toghKeyoh })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
