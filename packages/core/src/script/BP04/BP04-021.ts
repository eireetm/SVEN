// BP04-021 Mars, Silent Flame General (Evolved) — Swordcraft, 4/3.
// On Evolve, {[costX]}: Search your deck for an Officer follower that costs X play points or less
// and put it onto your field. X equals a number of your choice.
// Rulings: X is chosen when the ability is played, 0 allowed; the cost is optional and not
// paying it skips the effect (no shuffle); evolution points cannot pay it.
// Whenever an Officer follower is put onto your field, give it +1 attack.
import { defineCard, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: {
        canPay: () => true,
        *pay(fx) {
          const pp = fx.game.state.players[fx.controller].playPoints;
          const options = Array.from({ length: pp + 1 }, (_, n) => ({ id: String(n), label: `X = ${n}` }));
          const [pick] = yield* fx.choose(options);
          const x = Number(pick ?? 0);
          fx.memory.x = x;
          yield* fx.payPlayPoints(x);
        },
      },
      *resolve(fx) {
        const x = Number(fx.memory.x ?? 0);
        yield* fx.search(
          (id) => isFollower(fx.game, id) && hasTrait("兵士")(fx.game, id) && (fx.game.info(id).cost ?? 99) <= x,
          { to: "field" },
        );
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const id = fx.data?.card;
          if (id && fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 0);
        },
      },
      { filter: hasTrait("兵士") },
    ),
  ],
});
