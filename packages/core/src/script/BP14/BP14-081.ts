// BP14-081 Undying Resolve — Abysscraft spell, 2. 宴楽・死者.
// When this is discarded or banished from your hand, select an {[abysscraft]} follower on your field and give it
// Bane. (Also a discard to the hand limit — ruling.)
// ----------
// Select a Festive follower in your cemetery that costs 2 or less. Summon it and, if it's an Anisage, Lost
// Forsaken, give it {[attack]}+1 and Storm. (元のコスト.)
import { defineCard, spell, whenDiscardedOrBanishedFromHand } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower, named, yourFollower } from "../targets";
import { festive } from "./shared";
import { ANISAGE } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenDiscardedOrBanishedFromHand({
      targets: [yourFollower({ filter: isClass("Abysscraft") })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
      },
    }),
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, festive, costAtMost(2)) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0]!)) {
          if (!named(ANISAGE)(fx.game, id)) continue;
          yield* fx.giveStats(id, 1, 0);
          yield* fx.giveKeyword(id, "storm");
        }
      },
    }),
  ],
});
