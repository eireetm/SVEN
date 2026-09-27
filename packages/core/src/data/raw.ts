/**
 * Shape of one scraped card file: `assets/<card_no>/<card_no>.json`.
 * Field names mirror the scraper output exactly; only the data layer may touch this type.
 */
export interface RawRuling {
  q: string;
  a: string;
}

export interface RawCardJson {
  card_no: string;
  name_en: string;
  name_ja: string;
  name_cn: string | null;
  set: string;
  rarity: string;
  class: string;
  card_type: string[];
  /** English trait translations — not used (see parseTraits in data/normalize.ts). */
  traits: string[] | null;
  /** Japanese traits joined with "・" — the source of CardDefinition.traits. */
  traits_ja: string | null;
  cost: number | null;
  atk: number | null;
  def: number | null;
  effect_en: string | null;
  effect_en_official: string | null;
  effect_ja: string | null;
  effect_ja_sve: string | null;
  effect_cn: string | null;
  flavor_text_ja: string | null;
  flavor_text_en: string | null;
  illustrator: string | null;
  rulings: RawRuling[] | null;
  image: string;
  /** CR 2.14 — the back face of a double-faced card. */
  back?: RawCardBack;
  /**
   * Set only by data/fixes.ts: the card name of a printing whose big printed name is an alternate name (CR 2.13), e.g.
   * CP02's unit printings (the card name is the small type above the unit name).
   */
  treated_as?: string;
}

/**
 * The back face as scraped: English data only. The source has no Japanese traits or Chinese
 * name for it, and its `effect_ja` repeats the front's text; data/fixes.ts adds / corrects these
 * from the printed card.
 */
export interface RawCardBack {
  name_en: string;
  name_ja: string;
  name_cn?: string | null;
  class: string;
  card_type: string[];
  /** English trait translations — not used. */
  traits: string[] | null;
  /** Japanese traits (from data/fixes.ts). */
  traits_ja?: string | null;
  cost: number | null;
  atk: number | null;
  def: number | null;
  effect_en: string | null;
  effect_ja: string | null;
  effect_cn?: string | null;
  image: string;
}
