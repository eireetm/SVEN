// CP04-076 Violet — Abysscraft follower, 4, 3/4. プリコネ・〈ジオ・ニヴルヘル〉.
// {[ub]}{[fanfare]} Select a PriConne follower in your cemetery that costs 3 or less and summon it. (元のコスト. Without one it
// isn't executed — ruling.)
// Activate Discard 2 cards: Put this card from your cemetery into your EX area. (Valid in the cemetery — ruling, CR 10.3.5.)
import { discardCardsCost } from "../costs";
import { activated, defineCard, fanfare, ub } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { priconneFollower } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [inYourZone("cemetery", { filter: (g, id) => priconneFollower(g, id) && costAtMost(3)(g, id) })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      }),
    ),
    activated(
      { custom: discardCardsCost(2) },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
        },
      },
    ),
  ],
});
