// CP04-083 Akari — Abysscraft follower, 3, 2/2. プリコネ・ディアボロス.
// {[ub]} Activate {[cost00]}: Select another Diabolos follower on your field and give it {[attack]}+1. Activate only once per turn.
// {[fanfare]} Select a Diabolos follower in your cemetery not named Akari and put it into your EX area. It costs 2 less to play this
// turn.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { anotherYourFollower, inYourZone, named } from "../targets";
import { cheaperThisTurn, diabolos, followerThat } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { playPoints: 0 },
        {
          oncePerTurn: true,
          targets: [anotherYourFollower({ filter: diabolos })],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
          },
        },
      ),
    ),
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => followerThat(diabolos)(g, id) && !named("Akari")(g, id) })],
      *resolve(fx) {
        yield* cheaperThisTurn(fx, yield* fx.putIntoEx(fx.targets[0]!), 2);
      },
    }),
  ],
});
