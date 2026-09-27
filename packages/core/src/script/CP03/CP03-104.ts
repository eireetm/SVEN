// CP03-104 Goddess of the Full Moon, Tsukuyomi — Havencraft follower, 5, 4/4. ヴァンガード・オラクルシンクタンク.
// Ward. Twin Drive.
// While there's a Goddess of the Half Moon, Tsukuyomi and Goddess of the Crescent Moon, Tsukuyomi in your cemetery, this follower
// has Storm. (A passive ability — ruling.)
// {[fanfare]} You may summon an Oracle Think Tank follower that costs 4 or less from your hand. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, maySummonFromHand, oracleThinkTank } from "./shared";

const MOONS = ["Goddess of the Half Moon, Tsukuyomi", "Goddess of the Crescent Moon, Tsukuyomi"];

export default defineCard({
  keywords: ["ward", "twinDrive"],
  field: {
    // Names from the definitions, not info: this is read while keywords are being computed.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const names = g.cards(g.controller(self), "cemetery").map((id) => g.db.get(g.card(id)!.def).name);
      return MOONS.every((m) => names.includes(m)) ? ["storm"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* maySummonFromHand(fx, (g, id) => followerThat(oracleThinkTank)(g, id) && costAtMost(4)(g, id));
      },
    }),
  ],
});
