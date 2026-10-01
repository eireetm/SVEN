/**
 * Static card information (CR 2 "Card Information").
 *
 * A CardDefinition describes one *card* in the rules sense: all printings that share a
 * card name (CR 2.1.1: the name is unique) and identical game information are merged into
 * one definition. Alternate-art printings therefore share a definition and a script.
 */

/** Canonical definition id: the card number of the canonical printing, e.g. "BP01-001". */
export type DefId = string;

/** A physical printing's card number, e.g. "BP01-SL01" (only matters for art / GUI). */
export type PrintingId = string;

/** CR 2.2.2 — classes. Collaboration cards have a class and a universe (Universe below). */
export const CARD_CLASSES = [
  "Neutral",
  "Forestcraft",
  "Swordcraft",
  "Runecraft",
  "Dragoncraft",
  "Abysscraft",
  "Havencraft",
] as const;
export type CardClass = (typeof CARD_CLASSES)[number];

/**
 * CR 2.12 / 14 — universes of collaboration cards (CR 14.2–14.5): Umamusume: Pretty Derby, THE IDOLM@STER
 * CINDERELLA GIRLS, Cardfight!! Vanguard, Princess Connect! Re: Dive. A deck is based on a universe when its
 * leader and all its cards share it (6.1.1.5.2); its rules (Magical Items, drive checks, Union Burst …) then apply.
 */
/** CR 14.4.1.1 — the Trigger icons of Cardfight!! Vanguard cards (their abilities: 14.4.5.1.3). */
export const TRIGGER_ICONS = ["critical", "draw", "stand", "heal"] as const;
export type TriggerIcon = (typeof TRIGGER_ICONS)[number];

export const UNIVERSES = ["umamusume", "cinderellaGirls", "vanguard", "princessConnect"] as const;
export type Universe = (typeof UNIVERSES)[number];

/**
 * CR 2.3.2 primary card types. Crests (BP20) are tokens that exist only in the EX area (9.1.4.2), one
 * per name there (9.1.5), whose abilities work in the EX area (10.3.6); they can't be played. Equipment
 * (CP04, Princess Connect! Re: Dive) are tokens that exist only in the equipment zone, linked to the
 * follower that equips them, and whose abilities work only there (14.5.2.1).
 */
export type CardType = "leader" | "follower" | "amulet" | "spell" | "crest" | "equipment";

export interface LocalizedText {
  /** English — authoritative for implementation (official EN text). */
  en: string;
  /** Chinese — secondary display language. */
  cn: string | null;
  /** Japanese original — reference for ambiguity checks. */
  ja: string | null;
}

export interface CardDefinition {
  id: DefId;
  /** Every printing that uses this definition, canonical one first. */
  printings: PrintingId[];
  /** Canonical English card name (CR 2.1). The database's "(Evolved)" suffix is stripped. */
  name: string;
  names: LocalizedText;
  class: CardClass;
  type: CardType;
  /** Special type "evolved" (CR 2.3.3.1). */
  evolved: boolean;
  /**
   * Special type "advanced" (CR 2.3.3.1, 9.2; BP10): built into the evolve deck (6.1.1.3), put onto
   * the field or into the EX area by effects, and back to the evolve deck faceup when it would go
   * anywhere else (9.2.2). Present only when true.
   */
  advanced?: true;
  /** Token (CR 9.1). */
  token: boolean;
  /**
   * CR 2.12.2.1 — the card's universe (collaboration cards, CR 14), printed with the collector number; the data
   * build takes it from the set (data/universes.ts). Absent for class-only cards.
   */
  universe?: Universe;
  /**
   * A pre-release card (data/preview.ts, e.g. BP22): implemented from its Japanese text; its English name and text are a
   * placeholder until the English data is out. Present only when true.
   */
  preview?: true;
  /** CR 14.4.1 — the Trigger icon of a Cardfight!! Vanguard card (the data build reads it from its reminder text). */
  trigger?: TriggerIcon;
  /**
   * Traits (CR 2.4) in Japanese, exactly as printed on the Japanese card (e.g. "妖精").
   * The only trait identity: English trait names are translations and are not used.
   */
  traits: string[];
  /** CR 2.5. null for evolved cards and leaders (evolved cards use their base cost, CR 5.16.1.2). */
  cost: number | null;
  /** CR 2.7. null when the card has no attack value. */
  attack: number | null;
  /** CR 2.8. null when the card has no defense value. */
  defense: number | null;
  text: LocalizedText;
  /**
   * CR 2.13 — printings that show another name (an alternate name), e.g. BP02-070 "La+ Darkness,
   * Laplace's Demon" is a printing of Vania, Vampire Princess. Display only: rules and effects
   * use the card name (2.13.2), and alternate names cannot be declared (5.33.1.1).
   */
  alternateNames?: Readonly<Record<PrintingId, LocalizedText>>;
  /**
   * CR 2.14 — this is the front face of a double-faced card; the back face's information is the
   * definition with this id (`<id>_back`). The physical card is always the front definition: in
   * decks and outside the field / evolve zone it has the front face's information (2.14.2.1).
   */
  backFace?: DefId;
  /**
   * The back face of a double-faced card (CR 2.14.2): information only, never a card by itself.
   * It has no printings (its art is the front printing's "_back" image) and cannot be in a deck.
   */
  frontFace?: DefId;
}

/** Id of the back-face definition of a double-faced card (CR 2.14). */
export function backFaceId(front: DefId): DefId {
  return `${front}_back`;
}
