// CP04-022 Labyrista — Swordcraft follower, 1, 2/2. プリコネ・ラビリンス・七冠.
// {[ub]} Activate {[engage]} this: Give this {[attack]}+1.
// {[fanfare]} If there are at least 4 followers on your field, equip this with a Queen's Console token. (This one included.)
// At the start of your end phase, if the total attack of 1-cost followers on your field is at least 10, deal 2 damage to each
// enemy follower on the field. (元のコスト; checked when it resolves: another end-phase ability may raise it first — ruling.)
import { activated, atStartOfYourEndPhase, defineCard, equipFanfare, ub } from "../helpers";
import { costs } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
          },
        },
      ),
    ),
    equipFanfare("Queen's Console", 0, (fx) => fx.game.followers(fx.controller).length >= 4),
    atStartOfYourEndPhase({
      condition: (g, c) =>
        g
          .followers(c)
          .filter((id) => costs(1)(g, id))
          .reduce((sum, id) => sum + (g.info(id).attack ?? 0), 0) >= 10,
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
