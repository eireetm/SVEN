// Shared pieces of BP16 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { AbilityDef } from "../types";
import { onEvolve, onSuperEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";
import { departed } from "./shared";

/**
 * BP16-080 "On Evolve - Select a Departed follower in your cemetery that costs 3 or less and summon it." and "On
 * Super-Evolve - ... Summon it and give it Assail." (元のコスト.)
 */
export const mukanRaise = (timing: "onEvolve" | "onSuperEvolve"): AbilityDef =>
  (timing === "onEvolve" ? onEvolve : onSuperEvolve)({
    targets: [inYourZone("cemetery", { filter: and(isFollower, departed, costAtMost(3)) })],
    *resolve(fx) {
      for (const id of yield* fx.putOntoField(fx.targets[0]!)) {
        if (timing === "onSuperEvolve" && fx.game.card(id)?.zone === "field") yield* fx.giveKeyword(id, "assail");
      }
    },
  });
