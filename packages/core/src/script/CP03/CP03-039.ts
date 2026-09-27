// CP03-039 Starlight Unicorn — Swordcraft follower, 2, 2/2. ヴァンガード・ロイヤルパラディン.
// Whenever a follower on your field performs a drive check, give it {[attack]}+1. (After the drive check, Trigger included; twice
// for Twin Drive — rulings.)
import { defineCard, whenYourFollowerDriveChecks } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerDriveChecks({
      *resolve(fx) {
        const follower = fx.data?.card;
        if (typeof follower === "string") yield* fx.giveStats(follower, 1, 0);
      },
    }),
  ],
});
