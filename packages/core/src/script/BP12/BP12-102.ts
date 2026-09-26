// BP12-102 Fiery Paean — Havencraft amulet, 2. 信仰・獣.
// {[fanfare]} Put a Holy Tiger token into your EX area.
// Activate {[engage]}: Select a Holy Tiger on your field and give it Storm.
import { activated, defineCard, fanfare } from "../helpers";
import { named, yourCardOnField } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Holy Tiger"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourCardOnField({ filter: named("Holy Tiger") })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
        },
      },
    ),
  ],
});
