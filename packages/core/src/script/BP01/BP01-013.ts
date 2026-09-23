// BP01-013 Fairy Beast — Forestcraft follower, 5, 5/5.
// {[act]} Banish a Pixie follower in your EX area: Give your leader +3 defense and draw a card.
// This ability can be activated once per turn (per card — ruling).
import { activated, defineCard } from "../helpers";
import { banishFromYourEx } from "../costs";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { custom: banishFromYourEx(and(isFollower, hasTrait("妖精"))) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
