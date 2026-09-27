// CSD03a-005 Wingal — Swordcraft follower, 1, 2/2. ヴァンガード・ロイヤルパラディン.
// {[act]} {[cost03]}, {[engage]}: Select a Blaster Blade in your cemetery and summon it. (Blaster Blade's Fanfare then evolves it —
// CSD03a-003 ruling.)
import { activated, defineCard } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 3, engageSelf: true },
      {
        targets: [inYourZone("cemetery", { filter: named("Blaster Blade") })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      },
    ),
  ],
});
