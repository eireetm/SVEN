// BP01-001 Rose Queen — Forestcraft follower, 8, 7/7.
// {[fanfare]} Select any number of Pixie followers in your EX area and transform them into
// Thorn Burst tokens.
// {[act]}{[engage]}: Recover X play points. X equals the number of Thorn Burst tokens in your EX area.
import { activated, defineCard, fanfare } from "../helpers";
import { and, hasTrait, inYourZone, isFollower, isToken, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      // "any number" (CR 10.6.2.3.2)
      targets: [inYourZone("ex", { count: 99, upTo: true, filter: and(isFollower, hasTrait("妖精")) })],
      *resolve(fx) {
        yield* fx.transform(fx.targets[0]!, "Thorn Burst"); // CR 5.17
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const thorns = fx.game.cards(fx.controller, "ex").filter((id) => and(isToken, named("Thorn Burst"))(fx.game, id));
          yield* fx.recoverPlayPoints(thorns.length); // CR 5.15 (not above the maximum, ruling)
        },
      },
    ),
  ],
});
