// BP19-004 Zwei, Symphonic Heart — Forestcraft follower, 2, 2/1. 人形・キラー.
// {[fanfare]} Banish 2 cards named Puppet from your EX area: Put a Victoria token into your EX area. (CR 10.4.7.4.)
// Activate {[engage]} this: Select up to 2 cards named Puppet on your field and give them {[attack]}+1/{[defense]}+1.
// Activate only if there are at least 3 Puppetry cards in your cemetery. (Victoria is also a Puppet on the field.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named, yourCardOnField } from "../targets";
import { PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx(named(PUPPET), 2),
      *resolve(fx) {
        yield* fx.tokensToEx(["Victoria"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").filter((id) => puppetry(g, id)).length >= 3,
        targets: [yourCardOnField({ count: 2, upTo: true, filter: named(PUPPET) })],
        *resolve(fx) {
          for (const id of fx.targets[0]!) yield* fx.giveStats(id, 1, 1);
        },
      },
    ),
  ],
});
