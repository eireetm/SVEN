// BP14-011 Craftsman's Pride — Forestcraft spell, 1. 人形.
// As an additional cost to play this, banish a card from your EX area. (Not playable without paying it.)
// ----------
// Put 3 Puppet tokens into your EX area.
import { banishFromYourEx } from "../costs";
import { defineCard, spell } from "../helpers";
import { PUPPET } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "banish", label: "Banish a card from your EX area", ...banishFromYourEx(() => true, 1) }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.tokensToEx([PUPPET, PUPPET, PUPPET]);
      },
    }),
  ],
});
