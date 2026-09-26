// BP18-034 Monika, Cloudhall Admiral — Swordcraft follower, 5, 4/4. 指揮官.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon 2 Knight tokens.
// Strike - Select an enemy follower on the field and deal it damage equal to the number of followers on your field.
import { defineCard, evolveAbility, fanfare, strike } from "../helpers";
import { monikaVolley } from "./shared-sword";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Knight", "Knight"]);
      },
    }),
    strike(monikaVolley),
  ],
});
