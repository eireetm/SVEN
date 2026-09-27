// CP03-035 Future Knight, Llew — Swordcraft follower, 2, 2/3. ヴァンガード・ロイヤルパラディン. Critical Trigger.
// {[fanfare]} Discard a Vanguard card: Search your deck for a Blaster Blade, reveal it, add it to your hand, then shuffle.
// (Blaster Blade is CSD03a-003.)
// ----------
// (If this card is revealed by a drive check, give a follower on your field {[attack]}+2.) (Resolved by the engine.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { vanguard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(vanguard),
      *resolve(fx) {
        yield* fx.search((id) => named("Blaster Blade")(fx.game, id));
      },
    }),
  ],
});
