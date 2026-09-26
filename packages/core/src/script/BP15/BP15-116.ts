// BP15-116 Arael (Evolved) — Neutral follower, 1/2. 天使.
// Ward.
// On Evolve - Select a follower on your field and give {[attack]}+1/{[defense]}+1.
import { defineCard } from "../helpers";
import { araelBlessing } from "./shared-neutral";

export default defineCard({
  keywords: ["ward"],
  abilities: [araelBlessing("onEvolve")],
});
