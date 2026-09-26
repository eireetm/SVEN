// BP21-T04 Emergency Summoning — Runecraft amulet token, 0. 錬金術師・土の印.
// Stack.
// {[fanfare]} Summon a Guardform Golem token. If there's an Alchemist follower that costs at least 3 on your field, put a
// Guardian Golem token into your EX area.
import { defineCard, fanfare } from "../helpers";
import { bigAlchemistOnYourField } from "./shared";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Guardform Golem"]);
        if (bigAlchemistOnYourField(fx.game, fx.controller)) yield* fx.tokensToEx(["Guardian Golem"]);
      },
    }),
  ],
});
