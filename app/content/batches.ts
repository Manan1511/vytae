// Batch Passport records. The seed writes them to Shopify as batch_passport metaobjects, and the fallback reads them here.

export type Check = { p: string; s: string; v: string };
export type Stat = { v: string; l: string; green?: boolean };
export type Batch = {
  key: string;
  product: string;
  sub: string;
  rmid: string;
  fields: [string, string][];
  stage1: { stats: Stat[]; rows: Check[] };
  stage3: { stats: Stat[]; rows: Check[] };
  certs: { k: string; t: string; d: string }[];
};

export const BATCHES: Record<string, Batch> = {
  MBGNL102606A: {
    key: "rest-well",
    product: "Rest Well",
    sub: "Magnesium Bisglycinate · VYT-MGB-001",
    rmid: "MBGNL10",
    fields: [
      ["BATCH", "MBGNL102606A"],
      ["MFD", "Jun 2026"],
      ["BEST BEFORE", "May 2029"],
      ["ELEMENTAL MG", "11.7% chelated"],
    ],
    stage1: {
      stats: [
        { v: "11.7%", l: "elemental magnesium · needs ≥ 10%" },
        { v: "96.4%", l: "chelation · needs ≥ 95%" },
        { v: "4/4", l: "tests passed", green: true },
      ],
      rows: [
        { p: "Elemental assay", s: "≥ 10.0% elemental magnesium", v: "11.7%" },
        { p: "Quality specs", s: "≥ 95% chelation confirmed by FTIR / XRD identity", v: "96.4% chelation confirmed" },
        { p: "Heavy metals", s: "Pb, As, Cd, Hg within USP / FCC limits", v: "Within limits" },
        { p: "Microbial", s: "TAM, yeast & mould, pathogens within IP / USP limits", v: "Within limits, pathogens absent" },
      ],
    },
    stage3: {
      stats: [
        { v: "200 mg", l: "elemental Mg · meets label claim" },
        { v: "NABL", l: "accredited lab" },
        { v: "5/5", l: "tests passed", green: true },
      ],
      rows: [
        { p: "Elemental magnesium", s: "95–105% of label claim (200 mg elemental / serving)", v: "Meets label claim" },
        { p: "Chelation / identity", s: "Fully chelated structure confirmed by FTIR", v: "Confirmed" },
        { p: "Heavy metals", s: "Pb, As, Cd, Hg within USP / FCC limits", v: "Within limits" },
        { p: "Microbial load", s: "TAM, yeast & mould, pathogens within IP / USP limits", v: "Within limits, pathogens absent" },
        { p: "Fill uniformity", s: "Capsule fill weight within ±5% of claim", v: "Within tolerance" },
      ],
    },
    certs: [
      { k: "GMP", t: "GMP", d: "Good Manufacturing Practice" },
      { k: "WHO", t: "WHO-GMP", d: "World Health Organization" },
      { k: "FSSAI", t: "FSSAI", d: "Licensed facility" },
      { k: "FDA", t: "FDA registered", d: "US Food & Drug Administration" },
    ],
  },
};
