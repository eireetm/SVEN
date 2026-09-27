// CP02-012 Honoka Ayase — Forestcraft follower, 1, 2/1. デレマス・クール.
// {[fanfare]} Select another iM@S CG follower on your field and give it Rush.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: imas })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "rush");
      },
    }),
  ],
});
