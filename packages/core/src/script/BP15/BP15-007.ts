// BP15-007 Inauspicious Puppeteer (Evolved) — Forestcraft follower, 2/3. 人形.
// On Evolve - Summon a Puppet token. Put a Puppet token into your EX area.
// During your turn, whenever a token follower is put from your field into the cemetery, select an enemy follower
// on the field and give it {[attack]}-1/{[defense]}-1.
import { defineCard, onEvolve } from "../helpers";
import { PUPPET } from "./shared";
import { puppeteerCurse } from "./shared-forest";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([PUPPET]);
        yield* fx.tokensToEx([PUPPET]);
      },
    }),
    puppeteerCurse,
  ],
});
