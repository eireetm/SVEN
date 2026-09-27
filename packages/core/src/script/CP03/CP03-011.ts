// CP03-011 Tear Knight, Theo — Forestcraft follower, 1, 2/1. ヴァンガード・アクアフォース.
// {[fanfare]} If there's another Aqua Force follower on your field, give this follower Rush and Assail. (Two Theos put onto the
// field together see each other — ruling.)
import { defineCard, fanfare } from "../helpers";
import { aquaForce, followerThat } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c, self) => g.followers(c).some((id) => id !== self && followerThat(aquaForce)(g, id)),
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "rush");
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
