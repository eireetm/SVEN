// BP12-060 Assault Dragoon (Evolved) — Dragoncraft follower, 3/3. 竜使い.
// On Evolve - Select a {[dragoncraft]} follower that costs 2 or less in your cemetery and summon it.
// Activate {[engage]}: Select a {[dragoncraft]} follower that costs 2 or less on your field. Give it
// {[attack]} +1/{[defense]}+1 and Storm. (元のコスト: this card itself too.)
import { defineCard, onEvolve } from "../helpers";
import { inYourZone } from "../targets";
import { dragoonBoost, smallDragoncraftFollower } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: smallDragoncraftFollower })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    dragoonBoost,
  ],
});
