// BP11-010 Stringmaster — Forestcraft follower, 1, 1/1. 人形.
// Once on each of your turns, when a Puppet is put onto your field, put 2 Puppet tokens into your EX
// area. (Each Stringmaster once — ruling.)
// {[act]} {[cost04]}: Give this follower {[attack]}+2/{[defense]}+2. Summon a Puppet token. (Also more
// than once a turn — ruling.)
import { activated, defineCard, whenCardEntersYourField } from "../helpers";
import { named } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    whenCardEntersYourField(
      {
        oncePerTurn: true,
        triggerIf: yourTurn,
        *resolve(fx) {
          yield* fx.tokensToEx(["Puppet", "Puppet"]);
        },
      },
      { filter: named("Puppet") },
    ),
    activated(
      { playPoints: 4 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
          yield* fx.summon(["Puppet"]);
        },
      },
    ),
  ],
});
