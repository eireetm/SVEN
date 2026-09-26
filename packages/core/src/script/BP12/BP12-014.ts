// BP12-014 Springleaf Sprite — Forestcraft follower, 1, 1/2. 自然・精霊.
// {[fanfare]} Put a Naterran Great Tree token into your EX area.
// When this card leaves the field, put a Naterran Great Tree token into your EX area.
import { defineCard, fanfare, whenThisLeavesField } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
  ],
});
