// BP04-079 Venomfang Medusa — Abysscraft follower, 3, 3/3. 魔界・ゴルゴーン.
// {[act]} {[cost00]}: Summon a Serpent token. This ability can be activated once per turn.
// {[q]}Activate {[engage]}, put 2 cards named Serpent from your field into their owners' cemeteries:
// Select an enemy follower on the field and destroy it. (The cost does not bury this card — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { buryTwoNamed } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.summon(["Serpent"]);
        },
      },
    ),
    activated(
      { engageSelf: true, custom: buryTwoNamed("Serpent") },
      {
        quick: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
