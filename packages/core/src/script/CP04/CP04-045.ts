// CP04-045 Kyoka — Runecraft follower, 2, 2/2. プリコネ・リトルリリカル.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select a PriConne spell in your cemetery. Put it into your EX area and give it "At the start of your end phase, if this
// is in your EX area, bury it." (The card's own ability: it stays if Kyoka leaves the field — ruling. It is had until the card
// leaves the EX area, so it acts once, at its controller's next end phase: a delayed trigger watching that card, CR 10.7.5.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { priconneSpell } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: priconneSpell })],
      *resolve(fx) {
        const [moved] = yield* fx.putIntoEx(fx.targets[0]!);
        if (moved !== undefined) yield* fx.delay(2, undefined, { card: moved });
      },
    }),
    {
      kind: "automatic",
      timing: "other",
      delayed: true,
      trigger: (e, me) =>
        e.type === "phaseStarted" && e.phase === "end" && e.player === me.controller && me.delayedData?.card !== undefined
          ? [{ card: me.delayedData.card }]
          : false,
      *resolve(fx) {
        const card = fx.data?.card;
        if (card !== undefined && fx.game.card(card)?.zone === "ex") yield* fx.bury([card]);
      },
    },
  ],
});
