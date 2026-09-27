// ECP02-058 Koume Shirasaka [Haunted Gown] — Abysscraft follower, 3, 2/2. デレマス・クール.
// {[fanfare]} Select a Cool follower in your cemetery not named Koume Shirasaka [Haunted Gown] that costs 3 or less and, if there are
// at least 3 Cool followers on your field, summon it. (元のコスト; this follower counts.)
// {[act]} {[cost01]}, Lesson (1), {[engage]}: Search your deck for a Last Daylight, put it into your EX area, then shuffle. It costs
// 2 less to play this turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, inYourZone, named } from "../targets";
import { cool, followerThat, followersOnYourField, searchIntoExCheaper } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [
        inYourZone("cemetery", {
          filter: (g, id) => followerThat(cool)(g, id) && costAtMost(3)(g, id) && !named("Koume Shirasaka [Haunted Gown]")(g, id),
        }),
      ],
      *resolve(fx) {
        if (followersOnYourField(fx.game, fx.controller, cool) >= 3) yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, custom: lesson(1) },
      {
        *resolve(fx) {
          yield* searchIntoExCheaper(fx, named("Last Daylight"), 2);
        },
      },
    ),
  ],
});
