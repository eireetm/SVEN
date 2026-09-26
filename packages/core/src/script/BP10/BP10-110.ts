// BP10-110 XXI. Zelgenea, O Great World — Neutral advanced follower, 10, 10/10. アルカナ・大神.
// At the start of your end phase, if this card is in your EX area, deal 4 damage to each enemy leader
// and enemy follower on the field. (Valid in the EX area — ruling, CR 10.3.5.)
// ----------
// {[fanfare]} Deal 10 damage to each enemy leader and enemy follower on the field.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "ex") return;
          const opponent = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 4);
        },
      }),
      validIn: ["ex"],
    },
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 10);
      },
    }),
  ],
});
