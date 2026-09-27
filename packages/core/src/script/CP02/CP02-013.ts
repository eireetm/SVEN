// CP02-013 Azuki Momoi — Forestcraft follower, 4, 3/5. デレマス・キュート.
// This card costs 3 less to play if there are at least 3 iM@S CG followers on your field.
// ----------
// Ward.
import { defineCard } from "../helpers";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  keywords: ["ward"],
  playCost: (g, _self, c) => (followersOnYourField(g, c, imas) >= 3 ? -3 : 0),
});
