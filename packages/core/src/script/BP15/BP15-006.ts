// BP15-006 Inauspicious Puppeteer — Forestcraft follower, 2, 1/2. 人形.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Puppet token into your EX area.
// During your turn, whenever a token follower is put from your field into the cemetery, select an enemy follower
// on the field and give it {[attack]}-1/{[defense]}-1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { PUPPET } from "./shared";
import { puppeteerCurse } from "./shared-forest";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PUPPET]);
      },
    }),
    puppeteerCurse,
  ],
});
