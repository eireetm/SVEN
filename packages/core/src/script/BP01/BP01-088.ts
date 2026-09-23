// BP01-088 Imprisoned Dragon — Dragoncraft follower, 3, 4/4.
// Ward. // This follower can't attack enemies. (Neither leaders nor followers — ruling;
// CR 8.4.3.2.1.)
import { defineCard } from "../helpers";

export default defineCard({ keywords: ["ward"], cannotAttack: true });
