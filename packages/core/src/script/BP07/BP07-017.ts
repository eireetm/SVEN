// BP07-017 Fertile Aether — Forestcraft spell, 1. 自然.
// Put a Naterran Great Tree token into your EX area. Combo (3) - Put 2 instead and give your leader
// {[defense]}+2. (With a full EX area the leader still gets +2 — ruling.)
import { defineCard, spell } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (!fx.game.combo(fx.controller, 3)) {
          yield* fx.tokensToEx([TREE]);
          return;
        }
        yield* fx.tokensToEx([TREE, TREE]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
