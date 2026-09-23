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

/** CR 2.2.2 — classes. Universe cards (CR 14) are not supported yet. */
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
 * CR 2.3.2 primary card types. "crest" exists in the rules but no BP01 card uses it;
 * add it here (and to the loader) when a set that needs it is imported.
 */
export type CardType = "leader" | "follower" | "amulet" | "spell";

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
  /** Token (CR 9.1). */
  token: boolean;
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
}
