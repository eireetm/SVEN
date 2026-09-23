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
}
