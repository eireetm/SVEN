// SD03-016 Conjure Golem — Runecraft spell, 1. 錬金術師. {[quick]}
// Put a Guardform Golem or a Strikeform Golem token into your EX area. (Nothing with a full EX area — ruling.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const [golem] = yield* fx.choose([
          { id: "Guardform Golem", label: "Put a Guardform Golem into your EX area" },
          { id: "Strikeform Golem", label: "Put a Strikeform Golem into your EX area" },
        ]);
        yield* fx.tokensToEx([golem!]);
      },
    }),
  ],
});
