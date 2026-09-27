// CP02-034 Angelic Maid — Swordcraft spell, 2. デレマス・キュート.
// {[quick]}
// Select a follower on your field. Give it {[attack]}+1/{[defense]}+3 and your leader {[defense]}+3. (Without a follower to
// select it can't be played — ruling, CR 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
