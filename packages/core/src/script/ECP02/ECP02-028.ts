// ECP02-028 Yuuki Otokura [Together with Me] — Runecraft follower, 3, 3/3. デレマス・キュート.
// {[fanfare]} Select an enemy follower on the field and give it {[attack]}-3/{[defense]}-3. If there's another Cute follower on your
// field, give it {[attack]}-5/{[defense]}-5 instead. (Attack may go below 0: it then deals no damage — ruling.)
// {[act]} {[cost00]}: Give this Storm. Put a Magical Item token into your EX area. Activate only if there are at least 10 Cute
// cards in your cemetery, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, followerThat, inYourCemetery, magicalItems } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const n = g.followers(fx.controller).some((id) => id !== fx.self && followerThat(cute)(g, id)) ? 5 : 3;
        yield* fx.giveStats(fx.targets[0]![0]!, -n, -n);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: (g, c) => inYourCemetery(g, c, cute) >= 10,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          yield* magicalItems(fx);
        },
      },
    ),
  ],
});
