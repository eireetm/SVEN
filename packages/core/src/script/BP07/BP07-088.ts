// BP07-088 Lapis, Glorious Seraph — Havencraft follower, 5, 3/7. 信仰・先導・光輝.
// Ward.
// When this card leaves your field, draw a card for every prayer counter on it. (Look-back, CR
// 10.7.4.1.)
// At the start of your end phase, select a card on your field. Place a prayer counter on it and give
// your leader {[defense]}+2.
import { atStartOfYourEndPhase, defineCard, whenThisLeavesField } from "../helpers";
import { yourCardOnField } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenThisLeavesField({
      *resolve(fx) {
        const e = fx.event;
        const m = e?.type === "cardsMoved" ? e.moves.find((x) => x.newCard === fx.self || x.card === fx.self) : undefined;
        const prayers = m?.before?.counters.prayer ?? 0;
        if (prayers > 0) yield* fx.draw(prayers);
      },
    }),
    atStartOfYourEndPhase({
      targets: [yourCardOnField()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone === "field") yield* fx.addCounters(target, "prayer", 1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
