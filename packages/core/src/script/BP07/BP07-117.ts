// BP07-117 Extreme Carrot — Neutral follower, 2, 2/2. 自然・傭兵.
// Rush.
// {[lastwords]} {[cost01]}, banish a Naterran Great Tree from your field or EX area: Search your deck
// for an Extreme Carrot, summon it, then shuffle your deck. Give your leader {[defense]}+1.
// Rulings: a Tree banished from the field for the cost has its "leaves the field" ability resolve
// after this one; the leader gets +1 even if no Carrot is found.
import { allCosts, banishFromYour, playPointsCost } from "../costs";
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";
import { isTree } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      cost: allCosts(playPointsCost(1), banishFromYour(["field", "ex"], isTree)),
      *resolve(fx) {
        yield* fx.search((id) => named("Extreme Carrot")(fx.game, id), { to: "field" });
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
