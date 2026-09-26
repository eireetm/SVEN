// Shared pieces of BP19 Runecraft card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { TimingSpec } from "../helpers";
import { fuse, removeCountersFromThis } from "../costs";
import { activated } from "../helpers";
import { isFollower, isToken, named } from "../targets";
import { condemnedInCemetery, MULTI_HEADED, VOLUNTEER } from "./shared";

export const FUSION = "fusion";

/** "a non-token follower" (the Fuse cards of BP19). */
const nonTokenFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && !isToken(g, id);

/**
 * BP19-038 / 042 / 046 "Activate, Fusion 1 non-token follower: Put a fusion counter on this." (CR 12.18; valid in the hand —
 * rulings.) `more`: what else the text does, after the counter.
 */
export const fuseForCounter = (more?: TimingSpec["resolve"]) =>
  activated(
    { custom: fuse(nonTokenFollower) },
    {
      validIn: ["hand"],
      *resolve(fx) {
        const self = fx.memory.fusion;
        if (typeof self === "string" && fx.game.card(self)?.zone === "ex") yield* fx.addCounters(self, FUSION, 1);
        if (more) yield* more(fx);
      },
    },
  );

/** BP19-038 / 042 / 046 "{[fanfare]} Remove a fusion counter from this: Summon a Multi-Headed Test Subject token." */
export const fusionFanfare: TimingSpec = {
  cost: removeCountersFromThis(FUSION, 1),
  *resolve(fx) {
    yield* fx.summon([MULTI_HEADED]);
  },
};

/** "a Volunteer Test Subject or Multi-Headed Test Subject" (BP19-039, 043, 047). */
export const testSubject = (g: GameReader, id: CardId): boolean => named(VOLUNTEER)(g, id) || named(MULTI_HEADED)(g, id);

/**
 * BP19-048 / T02 "{[fanfare]} If there are at least 5 Condemned followers in your cemetery, give this
 * {[attack]}+2/{[defense]}+2 and Rush. If there are at least 10, give this Assail and Bane."
 */
export const subjectFanfare: TimingSpec = {
  *resolve(fx) {
    const n = condemnedInCemetery(fx.game, fx.controller);
    if (fx.game.card(fx.self)?.zone !== "field") return;
    if (n >= 5) {
      yield* fx.giveStats(fx.self, 2, 2);
      yield* fx.giveKeyword(fx.self, "rush");
    }
    if (n >= 10) {
      yield* fx.giveKeyword(fx.self, "assail");
      yield* fx.giveKeyword(fx.self, "bane");
    }
  },
};
