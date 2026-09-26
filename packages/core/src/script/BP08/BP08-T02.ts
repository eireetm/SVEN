// BP08-T02 Victoria — Forestcraft token follower, 0, 4/1. 人形・キラー.
// Its name is also Puppet while on the field. Rush. Assail. Fanfare: draw a card. CR 2.13, 5.10.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  alsoNames: ["Puppet"],
  abilities: [fanfare({ *resolve(fx) { yield* fx.draw(1); } })],
});
