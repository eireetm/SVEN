// CP03-022 Majesty Lord Blaster — Swordcraft follower, 6, 4/4. ヴァンガード・ロイヤルパラディン.
// Storm. Twin Drive.
// {[fanfare]} Select up to 1 enemy follower on the field for every pair of Blaster Blade and Blaster Dark in your cemetery and
// destroy the selected followers. (One of each is a pair: two of each, up to 2 — ruling.)
// Strike - If there's a Blaster Blade and Blaster Dark in your cemetery, give this follower {[attack]}+2/{[defense]}+2.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower, named } from "../targets";

const inCemetery = (g: GameReader, p: PlayerId, name: string) => g.cards(p, "cemetery").filter((id) => named(name)(g, id)).length;
const pairs = (g: GameReader, p: PlayerId) => Math.min(inCemetery(g, p, "Blaster Blade"), inCemetery(g, p, "Blaster Dark"));

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 5, upTo: true, max: (g, c) => pairs(g, c) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
    strike({
      condition: (g, c) => pairs(g, c) > 0,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
