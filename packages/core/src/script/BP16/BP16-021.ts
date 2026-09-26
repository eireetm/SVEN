// BP16-021 Albert, Levin Stormsaber — Swordcraft follower, 4, 4/5. 指揮官・レヴィオン.
// Storm.
// {[fanfare]} Select another Levin follower on your field and give it {[attack]}+1.
// {[act]} {[cost03]}: Refresh this. Activate only if there are at least 10 {[swordcraft]} followers in your
// cemetery, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { and, anotherYourFollower, isClass, isFollower } from "../targets";
import { countIn, levin } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: levin })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
    activated(
      { playPoints: 3 },
      {
        oncePerTurn: true,
        condition: (g, p) => countIn(g, p, "cemetery", and(isFollower, isClass("Swordcraft"))) >= 10,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        },
      },
    ),
  ],
});
