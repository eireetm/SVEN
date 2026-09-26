// BP20-056 Galmieux, Ardor Manifest — Dragoncraft follower, 3, 3/3. 絶傑・竜族.
// This has Storm while Overflow is active for you. (A passive — ruling.)
// Once during each of your turns, whenever this takes ability damage, select an enemy follower on the field and deal it 2
// damage. (Also when the damage destroys it; it then resolves after the destruction — ruling.)
// {[fanfare]} Put a Crest: Galmieux, Ardor Manifest token into your EX area.
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  field: { keywordsFor: (g, self, card) => (card === self && g.overflow(g.card(self)!.controller) ? ["storm"] : []) },
  abilities: [
    {
      ...whenThisTakesDamage(
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        { onlyYourTurn: true, ability: true },
      ),
      oncePerTurn: true,
    },
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Galmieux, Ardor Manifest"]);
      },
    }),
  ],
});
