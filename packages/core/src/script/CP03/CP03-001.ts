// CP03-001 Blue Storm Dragon, Maelstrom — Forestcraft follower, 3, 3/3. ヴァンガード・アクアフォース.
// {[evolve]} {[cost04]}: Evolve this follower into a Blue Storm Supreme Dragon, Glory Maelstrom.
// Storm. Twin Drive.
// Strike - If it's the 4th time an Aqua Force follower on your field has attacked this turn, evolve this follower into a Blue
// Storm Supreme Dragon, Glory Maelstrom. (Exactly the 4th, this attack included; that evolution isn't the turn's evolve
// ability — rulings; CR 5.16.1.1.1.)
import { defineCard, evolveAbility, strike } from "../helpers";
import { aquaForceAttacks } from "./shared";

const GLORY = "Blue Storm Supreme Dragon, Glory Maelstrom";

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [
    evolveAbility(4, { into: [GLORY] }),
    strike({
      condition: (g, c) => aquaForceAttacks(g, c) === 4,
      *resolve(fx) {
        yield* fx.evolve(fx.self, { into: [GLORY] });
      },
    }),
  ],
});
