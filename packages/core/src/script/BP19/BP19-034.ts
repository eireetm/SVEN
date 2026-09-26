// BP19-034 Knightly Thief — Swordcraft follower, 1, 1/2. 兵士・盗賊.
// Rush.
// {[lastwords]} Put a Gilded Blade token into your EX area.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx(["Gilded Blade"]);
      },
    }),
  ],
});
