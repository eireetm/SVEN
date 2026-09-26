// BP18-035 Monika, Cloudhall Admiral (Evolved) — 5/5.
// On Evolve/Strike - Select an enemy follower on the field and deal it damage equal to the number of followers on your
// field. (Two abilities — ruling.)
import { defineCard, onEvolve, strike } from "../helpers";
import { monikaVolley } from "./shared-sword";

export default defineCard({
  abilities: [onEvolve(monikaVolley), strike(monikaVolley)],
});
