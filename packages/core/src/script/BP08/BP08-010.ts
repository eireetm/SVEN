// BP08-010 Liam, Master of Puppets — Forestcraft follower, 2, 2/2. 人形・キラー.
// {[fanfare]} Put 2 Puppet tokens into your EX area.
// Activate {[engage]}: Look at the top 3 cards of your deck. You may reveal a Puppetry card from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order.
// Activate only if there are at least 3 Puppetry cards in your cemetery.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait } from "../targets";
import { puppetryInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet", "Puppet"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => puppetryInCemetery(g, p) >= 3,
        *resolve(fx) {
          yield* lookAtTopCards(fx, 3, { filter: hasTrait("人形"), to: "hand" });
        },
      },
    ),
  ],
});
