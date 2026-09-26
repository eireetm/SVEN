// BP12-024 Stroke of Conviction — Swordcraft spell, 2. 自然・指揮官・兵士・獣・プリンセス.
// As an additional cost to play this card, engage 2 cards named Naterran Great Tree on your field.
// ----------
// Select an enemy follower on the field and up to 1 Natura follower on your field. Deal 5 damage to the
// first follower and 2 damage to its leader. Give the second {[attack]} +1/{[defense]} +1.
// (Not playable without an enemy follower; playable without a Natura follower — rulings.)
import { defineCard, spell } from "../helpers";
import { engageYourCards } from "../costs";
import { enemyFollower, yourFollower } from "../targets";
import { isTree, natura } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "trees", label: "Engage 2 Naterran Great Trees on your field", ...engageYourCards(isTree, 2) }],
  abilities: [
    spell({
      targets: [enemyFollower(), yourFollower({ count: 1, upTo: true, filter: natura })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        yield* fx.dealDamage(leader, 2);
        for (const id of fx.targets[1] ?? []) {
          if (fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
