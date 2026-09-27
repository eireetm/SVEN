// CP03-095 Blaster Javelin — Abysscraft follower, 2, 3/2. ヴァンガード・シャドウパラディン.
// Rush.
// {[fanfare]} Discard a Vanguard card: Search your deck for a Phantom Blaster Dragon or Blaster Dark, reveal it, add it to your
// hand, then shuffle.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { vanguard } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      cost: discardA(vanguard),
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => named("Phantom Blaster Dragon")(g, id) || named("Blaster Dark")(g, id));
      },
    }),
  ],
});
