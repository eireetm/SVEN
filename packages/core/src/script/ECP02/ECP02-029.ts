// ECP02-029 Glitz & Glam☆Parade — Runecraft spell, 3. デレマス・パッション.
// Select up to one 2-cost Passion follower and up to one 1-cost Passion follower in your cemetery and summon them. Give your leader
// {[defense]}+2. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { inYourZone } from "../targets";
import { followerThat, passion } from "./shared";

const passionCosting = (n: number) => inYourZone("cemetery", { upTo: true, filter: (g, id) => followerThat(passion)(g, id) && g.info(id).cost === n });

export default defineCard({
  abilities: [
    spell({
      targets: [passionCosting(2), passionCosting(1)],
      *resolve(fx) {
        yield* fx.putOntoField([...(fx.targets[0] ?? []), ...(fx.targets[1] ?? [])]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
