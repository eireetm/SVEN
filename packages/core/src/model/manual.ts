import type { DefId } from "./card";
import type { CardId, PlayerId } from "./ids";
import type { Keyword } from "./keyword";

/**
 * Manual operations: what a person testing the engine may do outside the rules (the GUI's manual debugging).
 *
 * They are not rules: no clause allows them. A game accepts them only when it was set up with
 * `GameConfig.manualActions`, only as an answer to a main phase decision (at its checkpoint, when no
 * procedure is half done), and they are never listed among a decision's actions, so bots never
 * use them. Each is an input like any other: replays, undo and rewinding repeat it exactly.
 *
 * They are carried out with the engine's own procedures, so the rules go on around them: a card
 * destroyed by hand triggers its Last Words, a card played by hand its Fanfare, an evolution its
 * On Evolve, and Confirmation Timing follows every operation (CR 7.3.4). What they skip is only
 * what makes them illegal: costs, timing, and the checks of who may do what.
 */
export type ManualOp =
  // A player's things.
  /** Draw from the top of the deck (CR 5.10; an empty deck makes the player lose, 5.10.1.1). */
  | { kind: "draw"; player: PlayerId; count: number }
  /** Put the top cards of the deck into the cemetery. */
  | { kind: "mill"; player: PlayerId; count: number }
  /** CR 5.9 */
  | { kind: "shuffle"; player: PlayerId }
  /** Take a card of this definition from the deck into the hand (its order stays hidden: it is found by definition). */
  | { kind: "search"; player: PlayerId; def: DefId }
  /** Set play points, maximum play points, evolution points, super-evolution points (the ones given). */
  | {
      kind: "points";
      player: PlayerId;
      playPoints?: number;
      maxPlayPoints?: number;
      evolutionPoints?: number;
      superEvolutionPoints?: number;
    }
  /** Set the leader's defense (a change of defense, CR 5.27.2, not damage). */
  | { kind: "leaderDefense"; player: PlayerId; value: number }
  /** Create a token (CR 5.5.2) on the player's field or in their EX area. */
  | { kind: "token"; player: PlayerId; token: DefId; to: "field" | "ex" }
  // A card's.
  /** Move a card: into its owner's hand, cemetery, banished zone, EX area, onto the top or bottom of the deck, or onto its controller's field. */
  | { kind: "move"; card: CardId; to: ManualDestination }
  /** Destroy a card on the field (CR 5.6), also one that "can't be destroyed by abilities". */
  | { kind: "destroy"; card: CardId }
  /** CR 5.4 engage (true) or refresh (false). */
  | { kind: "engage"; card: CardId; engaged: boolean }
  /** Damage to a follower on the field (CR 5.14, ability damage without a source). */
  | { kind: "damage"; card: CardId; amount: number }
  /** Remove damage from a follower on the field (none of the rules does this; the card simply has less). */
  | { kind: "heal"; card: CardId; amount: number }
  /** Give +X/+Y (negative too), a persistent effect (CR 5.27, 10.9.1.4). */
  | { kind: "stats"; card: CardId; attack: number; defense: number }
  /** Give a keyword ability (a persistent effect, CR 10.9.1.2). */
  | { kind: "keyword"; card: CardId; keyword: Keyword }
  /** Put counters on a card (CR 15.1.3), or remove them with a negative amount (15.1.4). */
  | { kind: "counters"; card: CardId; counter: string; amount: number }
  /**
   * Evolve (or super-evolve) a follower on the field with a card of its controller's evolve deck that corresponds to it
   * (CR 5.16.1.1): no cost, any turn, any number of times a turn. On Evolve / On Super-Evolve trigger (CR 5.16).
   */
  | { kind: "evolve"; card: CardId; evolveCard: CardId; superEvolve: boolean; backFace?: boolean }
  /**
   * The active player's follower attacks (CR 8.4.4–8.4.11) whatever stops it: summoning sickness, being engaged, having
   * attacked, "can't attack", Ward. The target: an enemy follower on the field or the enemy leader.
   */
  | { kind: "attack"; attacker: CardId; target: CardId }
  /** Play a card for 0 play points from wherever it is (as by an effect: CR 10.6.2, no timing). Its targets are still chosen. */
  | { kind: "play"; card: CardId }
  /** Play an activated ability without paying its cost and whatever limits it (once per turn, timing). */
  | { kind: "activate"; card: CardId; ability: number };

export type ManualDestination = "hand" | "field" | "ex" | "cemetery" | "banished" | "deckTop" | "deckBottom";
