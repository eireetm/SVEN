// BP07-029 Swift Tigress — Swordcraft follower, 3, 4/3. 自然・兵士・獣.
// {[fanfare]} {[engage]} a Naterran Great Tree on your field: Give this follower Storm. (CR 10.4.7.4)
import { engageYourCards } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isTree } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: engageYourCards(isTree, 1),
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
