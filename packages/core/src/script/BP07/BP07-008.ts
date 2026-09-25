// BP07-008 Blossom Spirit — Forestcraft follower, 3, 2/3. 自然・精霊.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Naterran Great Tree or Fairy token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "tree", label: "Put a Naterran Great Tree into your EX area" },
          { id: "fairy", label: "Put a Fairy into your EX area" },
        ]);
        yield* fx.tokensToEx([pick === "tree" ? TREE : "Fairy"]);
      },
    }),
  ],
});
