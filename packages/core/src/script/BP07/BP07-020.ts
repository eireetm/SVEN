// BP07-020 Mistolina, Forest Princess — Swordcraft follower, 6, 4/6. 自然・指揮官・プリンセス.
// Storm.
// {[fanfare]} Select a Princess's Strike in your cemetery and play it for 0 play points.
// Rulings: it must be selected if there is one; without an enemy follower to select for it, it
// can't be played and nothing happens; afterwards it goes to the cemetery.
// Activate {[engage]} 2 cards named Naterran Great Tree on your field: Give this follower
// {[attack]}+3. Give your leader {[defense]}+2. (Any number of times per turn — ruling.)
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { isTree, playSelectedForZero, spellInYourCemetery } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [spellInYourCemetery(named("Princess's Strike"))],
      *resolve(fx) {
        yield* playSelectedForZero(fx, fx.targets[0]![0]);
      },
    }),
    activated(
      { custom: engageYourCards(isTree, 2) },
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 3, 0);
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
