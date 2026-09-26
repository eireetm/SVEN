// BP17-035 Countersolari Survivor — Swordcraft follower, 3, 3/3. 暗殺者.
// Intimidate.
// {[fanfare]} Select an Assassin card in your cemetery not named Countersolari Survivor and put it into your EX area.
import { defineCard, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";
import { assassin } from "./shared";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => assassin(g, id) && !named("Countersolari Survivor")(g, id) })],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
