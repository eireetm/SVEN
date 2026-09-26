// BP17-017 Threadsnipper Puppet — Forestcraft follower, 1, 1/1. 人形.
// Activate {[engage]} this: Put a Puppet token into your EX area.
// Activate {[engage]} this, banish a Puppet in your EX area: Draw a card.
import { banishFromYourEx } from "../costs";
import { activated, defineCard } from "../helpers";
import { named } from "../targets";
import { PUPPET } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.tokensToEx([PUPPET]);
        },
      },
    ),
    activated(
      { engageSelf: true, custom: banishFromYourEx(named(PUPPET)) },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
