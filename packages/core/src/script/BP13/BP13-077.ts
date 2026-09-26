// BP13-077 Chris, Beyond the Patch — Abysscraft follower, 4, 4/4. 死者・キラー.
// {[fanfare]} Select an {[abysscraft]} follower not named Chris, Beyond the Patch that costs 5 or less in
// your cemetery. Necrocharge (10) - Summon it and give it Ward. (元のコスト; the selected card still counts
// for Necrocharge — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower, named } from "../targets";

const notChris = (g: Parameters<ReturnType<typeof named>>[0], id: string) => !named("Chris, Beyond the Patch")(g, id);

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Abysscraft"), costAtMost(5), notChris) })],
      *resolve(fx) {
        if (!fx.game.necrocharge(fx.controller, 10)) return; // CR 13.5.1.2
        for (const id of yield* fx.putOntoField(fx.targets[0]!)) yield* fx.giveKeyword(id, "ward");
      },
    }),
  ],
});
