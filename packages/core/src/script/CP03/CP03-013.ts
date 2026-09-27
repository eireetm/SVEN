// CP03-013 Tear Knight, Cyprus — Forestcraft follower, 1, 0/1. ヴァンガード・アクアフォース.
// Storm.
// {[lastwords]} Search your deck for a Tear Knight, Cyprus, reveal it, add it to your hand, then shuffle.
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Tear Knight, Cyprus")(fx.game, id));
      },
    }),
  ],
});
