// CP03-020 Battle Siren, Cynthia — Forestcraft spell, 1. ヴァンガード・アクアフォース.
// Select a 1-cost Aqua Force follower in your cemetery and summon it. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { inYourZone } from "../targets";
import { aquaForce, followerThat } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: (g, id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1 })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
