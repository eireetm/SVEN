// BP20-071 Militant Mermaid — Dragoncraft follower, 5, 1/5. 海洋.
// Ward.
// {[fanfare]} Put a Marine card from your hand into your EX area: Recover 3 play points. (CR 10.4.7.4.)
import { defineCard, fanfare } from "../helpers";
import { marine } from "./shared";
import { putFromHandIntoEx } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: putFromHandIntoEx(marine),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
