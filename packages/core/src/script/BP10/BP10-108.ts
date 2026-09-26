// BP10-108 Holybright Altar — Havencraft amulet, 2. 信仰・偶像.
// {[fanfare]} Summon a Holy Tiger token. Give it "At the start of your end phase, destroy this card."
// {[act]} {[cost03]}, {[engage]}, bury this card: Select a follower on your field and give your leader
// {[defense]} equal to its cost. (元のコスト: an evolved follower's is its base card's.)
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const tiger of yield* fx.summon(["Holy Tiger"])) yield* fx.grant(tiger, "destroyAtEnd");
      },
    }),
    activated(
      { playPoints: 3, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, fx.game.info(fx.targets[0]![0]!).cost ?? 0);
        },
      },
    ),
  ],
});
