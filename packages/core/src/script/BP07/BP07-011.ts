// BP07-011 Divine Smithing — Forestcraft spell, 1. エルフ族.
// Select up to 2 Pixie followers on your field or in your EX area and give them {[attack]}+1.
// Combo (3) - Draw a card.
// Rulings: 0 can be selected (Combo still draws); one on the field and one in the EX area is fine;
// a card in the EX area keeps the +1 when it is put or played onto the field (CR 4.8.3.3).
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isFollower, yourFieldOrEx } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFieldOrEx({ count: 2, upTo: true, filter: and(isFollower, hasTrait("妖精")) })],
      *resolve(fx) {
        for (const id of fx.targets[0]!) if (fx.game.card(id)) yield* fx.giveStats(id, 1, 0);
        if (fx.game.combo(fx.controller, 3)) yield* fx.draw(1);
      },
    }),
  ],
});
