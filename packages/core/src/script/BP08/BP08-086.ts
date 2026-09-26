// BP08-086 Holylord Eachtar — Havencraft follower, 7, 5/6. 信仰・先導・光輝.
// Ward.
// {[fanfare]} Select up to 2 {[havencraft]} followers that cost 2 or less in your cemetery and summon
// them. (元のコスト.)
// While this card is on your field, each {[havencraft]} follower on your field has Rush. (This card
// too, and a stolen Havencraft follower — rulings.)
// Activate Banish 3 {[havencraft]} followers from your cemetery: Give each other follower on your
// field {[attack]}+1/{[defense]}+1. Activate only once per turn.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

const havenFollower = and(isFollower, isClass("Havencraft"));

export default defineCard({
  keywords: ["ward"],
  field: {
    keywordsFor: (g, self, card) =>
      g.controller(card) === g.controller(self) &&
      g.typeAndTraits(card).type === "follower" &&
      g.db.get(g.card(card)!.def).class === "Havencraft"
        ? ["rush"]
        : [],
  },
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: and(havenFollower, costAtMost(2)) })],
      *resolve(fx) { yield* fx.putOntoField(fx.targets[0] ?? []); },
    }),
    activated(
      { custom: banishFromYour(["cemetery"], havenFollower, 3) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller)) if (id !== fx.self) yield* fx.giveStats(id, 1, 1);
        },
      },
    ),
  ],
});
