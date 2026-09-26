// BP20-119 Apostle of Voracity (Evolved) — 4/4.
// On Evolve - Select another follower on the field and give it {[attack]}+2/{[defense]}-2.
import { defineCard, onEvolve } from "../helpers";
import { apostleBoost } from "./shared-neutral";

export default defineCard({
  abilities: [onEvolve(apostleBoost)],
});
