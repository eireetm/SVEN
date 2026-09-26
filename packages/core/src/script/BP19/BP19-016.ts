// BP19-016 Rogue Puppeteer — Forestcraft follower, 2, 2/3. 人形.
// {[fanfare]} Discard a Puppetry card: Draw a card. Put 2 Puppet tokens into your EX area. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(puppetry),
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.tokensToEx([PUPPET, PUPPET]);
      },
    }),
  ],
});
