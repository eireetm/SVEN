// BP16-003 Orchis, Newfound Heart — Forestcraft follower, 2, 1/2. 人形.
// {[fanfare]} Banish 2 cards named Puppet from your EX area: Put a Lloyd token into your EX area. (CR 10.4.7.4.)
// Activate {[engage]} this: Select a Puppet on your field and give it {[attack]}+1/{[defense]}+1, Storm, and Bane.
// Activate only if there are at least 3 Puppetry cards in your cemetery. (Lloyd is a Puppet on the field too.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named, yourFollower } from "../targets";
import { countIn, LLOYD, PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx(named(PUPPET), 2),
      *resolve(fx) {
        yield* fx.tokensToEx([LLOYD]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => countIn(g, p, "cemetery", puppetry) >= 3,
        targets: [yourFollower({ filter: named(PUPPET) })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveStats(target, 1, 1);
          yield* fx.giveKeyword(target, "storm");
          yield* fx.giveKeyword(target, "bane");
        },
      },
    ),
  ],
});
