/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — MASTER PROMPT ENGINE v3.0
 *  Hub-routed · Photorealistic · Marketplace-ready
 *  Covers: Apparel · Jewellery · Accessories · Products
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Types ───────────────────────────────────────────────────────

export type Hub = "Apparel" | "Jewellery" | "Accessories" | "Products";

export type OutputStyle = "Catalog" | "Premium" | "Social Media" | "Lifestyle";

export type Background =
  | "White Studio"
  | "Premium Studio"
  | "Saree Festival"
  | "Outdoor"
  | "Modern Office";

export interface SharedInputs {
  hub: Hub;
  mode?: "Virtual Try-On" | "AI Studio" | string;
  productImageUrl: string;
  modelRefUrl?: string | null;
  outputStyle?: OutputStyle;
  background?: Background;
  aiNotes?: string | null;
}

export interface ApparelInputs extends SharedInputs {
  hub: "Apparel";
  segment?: "Ladies" | "Gents" | "Kids";
  wearType?: "Ethnic Wear" | "Western Wear" | "Custom";
  productType?: string;
}

export interface JewelleryInputs extends SharedInputs {
  hub: "Jewellery";
  jewelleryGenre?:
    | "Bridal"
    | "Fashion"
    | "Traditional / Vintage"
    | "Daily Wear / Minimal"
    | "Custom";
  jewelleryStyle?: string;
}

export interface AccessoriesInputs extends SharedInputs {
  hub: "Accessories";
  accessoryType?:
    | "Bags"
    | "Footwear"
    | "Watches"
    | "Eyewear"
    | "Belts"
    | "Scarves / Small Accessories"
    | "Custom";
}

export interface ProductsInputs extends SharedInputs {
  hub: "Products";
  productFamily?:
    | "Home Decor"
    | "Beauty / Cosmetics"
    | "Handicrafts"
    | "Packaged Products"
    | "Gifts / Lifestyle"
    | "Custom";
}

export type PromptInputs =
  | ApparelInputs
  | JewelleryInputs
  | AccessoriesInputs
  | ProductsInputs;

// ─── Constants ───────────────────────────────────────────────────

const UNIVERSAL_ISOLATION = `
UNIVERSAL PRODUCT-TYPE OUTPUT ISOLATION (MANDATORY)
Final output MUST strictly match the selected input category/type.
No deviation. No mixing. No substitution.
`.trim();

const IDENTITY_LOCK = `
IDENTITY LOCK — ABSOLUTE. NON-NEGOTIABLE.
Face geometry · pores · freckles · moles · micro-details → 100% preserved.
Skin tone + undertone → exact match to MODEL_REF.
Body shape · limb volume · proportions · posture → unchanged.
Hair colour · length · texture · style → unchanged.
Eye colour · shape · position → unchanged.
Expression → unchanged unless explicitly stated in AI_NOTES.
No slimming · no reshaping · no enhancement · no beautification.
Identity must be pixel-consistent across all regenerations.
`.trim();

const QUALITY_GATES = `
QUALITY GATES — ALL MUST PASS:
✓ Output strictly matches selected category/type (Apparel/Jewellery/Accessories/Products)
✓ No cross-category or cross-type elements present
✓ Only items visible in PRODUCT_IMAGE are rendered
✓ Item colour exact match to source image
✓ All surface detail reproduced — zero AI averaging or simplification
✓ Model identity 100% preserved from MODEL_REF
✓ Fabric / material physics correct for identified type
✓ Background and model lighting consistent — direction · temperature · intensity
✓ Correct composition and framing for OUTPUT_STYLE
✓ Single image — no collage · no watermark · no text overlay
✓ Resolution minimum 1024×1024 · target 2048×2048
✓ Marketplace-safe: Meesho · Myntra · Amazon · Ajio · Nykaa ready
REJECT AND REGENERATE if any gate fails.
`.trim();

const NEGATIVE_PROMPT = `
--no category mixing, no hybrid/fusion unless in PRODUCT_IMAGE,
no AI-added extra items, no assumption-based styling,
no replacement of product type,
no face change, no skin tone shift, no body distortion,
no slimming, no reshaping, no body enhancement, no blur,
no low resolution, no waxy skin, no plastic skin,
no broken anatomy, no extra limbs, no missing limbs,
no fabric warping, no texture stretching, no pattern scale error,
no tile distortion, no embroidery averaging, no garment colour drift,
no generic AI garment, no floating fabric, no clipping, no blouse gap,
no lighting mismatch, no background bleed through opaque fabric,
no watermark, no collage, no text overlay, no UI elements,
no identity drift, no over-smoothing, no HDR artefacts,
no chromatic aberration, no label text distortion
`.trim();

// ─── Shared Builders ─────────────────────────────────────────────

function background(bg: string): string {
  const b = bg.toLowerCase();
  const rule =
    "LIGHTING RULE: Light direction · colour temperature · intensity " +
    "on subject MUST match background exactly. No flat-lit subject on " +
    "dramatic background. No bright subject on dark background without rim light.";

  const map: Record<string, string> = {
    "white studio":
      "Pure white seamless sweep · soft-box front light + fill · faint natural floor shadow.",
    "premium studio":
      "Dark charcoal textured wall · Rembrandt or split lighting · " +
      "warm gold or cool silver rim light · rich deep shadow.",
    "saree festival":
      "Decorated mandap or temple corridor · marigold garlands · diyas · warm amber light.",
    outdoor:
      "Garden or heritage monument · natural directional sunlight · soft fill · accurate shadows.",
    "modern office":
      "Contemporary interior · large windows · diffused indoor daylight · neutral clean tones.",
  };

  const matched = Object.entries(map).find(([key]) => b.includes(key));
  const scene = matched ? matched[1] : `${bg} — professional studio environment.`;
  return `BACKGROUND: ${scene} ${rule}`;
}

function outputStyle(style: string): string {
  const s = style.toLowerCase();
  const map: Record<string, string> = {
    catalog:
      "Full body portrait 3:4 · centred · neutral or soft expression · " +
      "hands relaxed · no props · minimal post-processing. " +
      "Marketplace-standard composition.",
    premium:
      "Editorial · off-centre · 3/4 body · dramatic lighting · " +
      "confident gaze · rich deep colour grade. Luxury feel.",
    "social media":
      "Vertical 9:16 · waist-up or above-knee crop · " +
      "vibrant · high energy · expressive. Optimised for Instagram / Reels.",
    lifestyle:
      "Environmental portrait 3:4 or 4:5 · candid feel · " +
      "warm atmospheric light · airy edit. Natural lifestyle context.",
  };
  const matched = Object.entries(map).find(([key]) => s.includes(key));
  return `OUTPUT STYLE [${style.toUpperCase()}]: ${matched ? matched[1] : style}`;
}

function aiNotes(notes: string | null | undefined): string {
  if (!notes || notes.trim() === "") return "";
  return `
AI DIRECTOR NOTES — Apply precisely. Never override identity lock or garment extraction lock.
${notes.trim()}
  `.trim();
}

// ─── Apparel Builder ─────────────────────────────────────────────

function drapingRules(productType: string): string {
  const pt = productType.toLowerCase();

  const rules: Record<string, string> = {
    saree:
      "SAREE: Nivi drape (default unless source shows otherwise) · " +
      "Petticoat neatly tucked at waist · " +
      "5–7 uniform front pleats, centred, sharp folds · " +
      "Pallu over left shoulder, natural diagonal fall, full design visible · " +
      "Blouse fitted front and back, no pull, no gap, no stretch.",
    lehenga:
      "LEHENGA: Full circular flare · even ankle-length hem all around · " +
      "Choli fitted bodice, neckline exactly from source · " +
      "Dupatta over both shoulders or one shoulder as in source.",
    "kurta set":
      "KURTA SET / SALWAR SUIT: Kurta straight or A-line per source · " +
      "Churidar gathers at ankle or palazzo wide and even · " +
      "Dupatta diagonal chest drape or over both shoulders.",
    "salwar suit":
      "SALWAR SUIT: Kurta straight or A-line per source · " +
      "Churidar gathers at ankle or palazzo wide and even · " +
      "Dupatta diagonal chest drape or over both shoulders.",
    kurti:
      "KURTI: Show with neutral bottom (white or black) " +
      "unless source shows specific paired bottom.",
    sherwani:
      "SHERWANI: All buttons fastened · straight placket · " +
      "even knee-length hem all around · " +
      "Churidar fitted through leg, clean ankle gathers.",
    gown:
      "GOWN / PARTYWEAR: Train fully visible and in frame if present in source · " +
      "Silhouette A-line / mermaid / ball gown exactly per source.",
    partywear:
      "PARTYWEAR GOWN: Train fully visible · silhouette per source. " +
      "Maximum garment drama — no flattening of volume or structure.",
  };

  for (const [key, rule] of Object.entries(rules)) {
    if (pt.includes(key)) return rule;
  }

  // Western / default
  if (/dress|top|co-?ord|blazer|shirt|t-shirt|jacket|trousers|skirt/.test(pt)) {
    return (
      "WESTERN FIT: Structured or relaxed per source fabric weight · " +
      "natural body-conforming silhouette · " +
      "seams and construction lines from source reproduced exactly."
    );
  }

  return "Apply garment with natural draping physics appropriate to identified style.";
}

function apparelIsolation(productType: string, segment: string): string {
  const pt = productType.toLowerCase();
  const s = segment.toLowerCase();
  if (pt.includes("saree")) return "→ Output ONLY Saree (with blouse + petticoat support)\n→ ❌ No lehenga / kurti / gown / fusion";
  if (pt.includes("lehenga")) return "→ ONLY Lehenga set (lehenga + choli + dupatta)\n→ ❌ No saree drape / gown mix";
  if (pt.includes("kurti")) return "→ ONLY Kurti (with neutral bottom if needed)\n→ ❌ No saree / lehenga styling";
  if (pt.includes("kurta set") || pt.includes("salwar suit")) return "→ ONLY full set (kurta + bottom + dupatta if present)\n→ ❌ No unrelated garment mix";
  if (pt.includes("blouse")) return "→ ONLY blouse-focused output\n→ ❌ No full saree/lehenga unless in PRODUCT_IMAGE";
  if (pt.includes("sherwani") || pt.includes("menswear") || pt.includes("ethnic menswear")) return "→ ONLY that exact structure\n→ ❌ No casual/western merge";
  if (s.includes("kids")) return "→ ONLY selected kids category\n→ Must be age-appropriate\n→ ❌ No adult styling";
  return "→ ONLY selected western type\n→ ❌ No ethnic blending";
}

function buildApparelPrompt(inputs: ApparelInputs): string {
  const {
    segment = "Ladies",
    wearType = "Ethnic Wear",
    productType = "",
    background: bg = "White Studio",
    outputStyle: style = "Catalog",
    modelRefUrl,
    mode,
    aiNotes: notes,
  } = inputs;

  const isKids = /kids/i.test(segment);

  const header =
    `[HUB: APPAREL] [SEGMENT: ${segment}] ` +
    `[WEAR TYPE: ${wearType}]` +
    (productType ? ` [PRODUCT TYPE: ${productType}]` : "");

  const isolation = `${UNIVERSAL_ISOLATION}\n${apparelIsolation(productType, segment)}`;

  const extract = `
GARMENT EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
COLOUR       Exact hex-level match. No brightening · darkening · saturation shift.
             Render faithfully under output lighting — never recolour.
PRINT        All-over · block · digital · woven patterns at full fidelity.
             Scale correctly to body. No tiling errors · no distortion.
EMBROIDERY   Zari · resham · mirror · cutdana · sequin · gota patti.
             Render every element individually. No averaging. No blur.
BORDERS      Exact width · motif · colour as in source. Pallu and hem borders match.
FABRIC ID    Identify material from visual cues. Apply correct physics:
             Silk        → high sheen · structured · stiff drape
             Chiffon     → translucent · floaty · light soft folds
             Cotton      → matte · soft · relaxed natural fall
             Georgette   → medium flow · subtle surface texture
             Net/Organza → sheer · stiff · visible mesh structure
             Velvet      → deep pile · directional sheen · heavy fall
             Crepe       → matte · heavy · clean structured fall
             Tissue      → metallic sheen · semi-stiff · crisp folds
CUT          Neckline · sleeve length · hem length · silhouette exactly from source.
  `.trim();

  const physics = `
CLOTH PHYSICS:
Gravity-driven drape · correct tension at shoulder, waist, and hip.
Seams and stitching reproduced from source.
Sheer fabrics → correct opacity · background visible only where physically accurate.
Opaque fabrics → zero background bleed-through.
No floating · no clipping · no misalignment at any seam.
Multi-layer contact shadows and ambient occlusion applied throughout.
  `.trim();

  const modelDirective = modelRefUrl
    ? `
DRESS MODEL:
${mode === "Virtual Try-On" ? "TASK: Virtual Try-On. Redress the subject in the MODEL_REF image with the clothing from the PRODUCT_IMAGE.\nReplace ONLY the clothing while strictly preserving the subject." : "Apply garment to MODEL_REF only."}
${IDENTITY_LOCK}
Correct draping physics for identified fabric weight.
No gaps · no pulls · no warping · no misalignment.
${isKids ? "KIDS: Scale all proportions to child body. No adult proportions. Age-appropriate styling only." : ""}
    `.trim()
    : "Show garment on appropriate figure or flat-lay with correct draping.";

  return [
    header,
    isolation,
    extract,
    drapingRules(productType),
    physics,
    modelDirective,
    background(bg),
    outputStyle(style),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─── Jewellery Builder ───────────────────────────────────────────

function jewelleryLighting(genre: string, style: string): string {
  const combined = `${genre} ${style}`.toLowerCase();
  const rules: string[] = [];

  if (/gold/.test(combined))    rules.push("Gold → Warm key light 3200K. Avoid cold blue tones.");
  if (/silver/.test(combined))  rules.push("Silver → Cool diffused 5500K. Soft box.");
  if (/kundan/.test(combined))  rules.push("Kundan → Side lighting to reveal stone depth and setting detail.");
  if (/pearl/.test(combined))   rules.push("Pearls → Soft diffused front light. No harsh specular.");
  if (/diamond/.test(combined)) rules.push("Diamonds → Point source or ring light for maximum sparkle.");
  if (/antique/.test(combined)) rules.push("Antique → Warm raking light to emphasise texture and patina.");

  return rules.length
    ? `JEWELLERY LIGHTING: ${rules.join(" ")}`
    : "JEWELLERY LIGHTING: Soft diffused key + rim accent. Reveal material depth and surface detail.";
}

function jewelleryGenreDirective(genre: string): string {
  const g = genre.toLowerCase();
  const map: Record<string, string> = {
    bridal:
      "BRIDAL: Full set visible — necklace layered correctly · maang tikka centred · " +
      "earrings symmetrical · bangles stacked. Rich warm lighting. " +
      "Background: mandap, floral drape, or deep jewel tone.",
    fashion:
      "FASHION: Clean isolated product shot or styled on model. " +
      "Minimalist background. Highlight shine, form, and design intent.",
    traditional:
      "TRADITIONAL / VINTAGE: Warm amber or candlelight tones. " +
      "Temple / Kundan — deep red, green, or ivory backdrop. " +
      "Antique pieces: matte warm lighting, no harsh flash.",
    "daily wear":
      "DAILY WEAR / MINIMAL: Clean white or soft pastel background. " +
      "Lightweight pieces — thin chains, small studs. " +
      "Natural light feel. No drama. No heavy styling.",
  };

  const matched = Object.entries(map).find(([key]) => g.includes(key));
  return matched
    ? matched[1]
    : "Render jewellery with professional studio lighting and clean background.";
}

function jewelleryIsolation(genre: string, style: string): string {
  const g = genre.toLowerCase();
  if (g.includes("bridal")) return "→ Full set only (necklace, earrings, maang tikka, etc.)\n→ ❌ No minimal/studs-only output";
  if (g.includes("traditional") || g.includes("temple") || g.includes("kundan") || g.includes("polki")) return "→ ONLY that heritage style\n→ ❌ No modern/minimal conversion";
  if (g.includes("daily") || g.includes("minimal")) return "→ ONLY lightweight/simple pieces\n→ ❌ No bridal heaviness";
  return "→ ONLY that specific item\n→ ❌ No full set unless source shows";
}

function buildJewelleryPrompt(inputs: JewelleryInputs): string {
  const {
    jewelleryGenre = "Fashion",
    jewelleryStyle = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    modelRefUrl,
    aiNotes: notes,
  } = inputs;

  const header =
    `[HUB: JEWELLERY] [GENRE: ${jewelleryGenre}]` +
    (jewelleryStyle ? ` [STYLE: ${jewelleryStyle}]` : "");

  const isolation = `${UNIVERSAL_ISOLATION}\n${jewelleryIsolation(jewelleryGenre, jewelleryStyle)}`;

  const extract = `
JEWELLERY EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
METAL FINISH  Gold · Silver · Rose Gold · Oxidised · Antique — exact tone. No colour drift.
STONE COLOUR  Every gemstone reproduced exactly. Emerald ≠ jade. Ruby ≠ garnet.
STONE SETTING Kundan · Prong · Bezel · Pavé — preserve setting type exactly.
TEXTURE       Filigree · engraving · polished · matte · hammered — full resolution.
SCALE         Piece must appear correct size relative to body. Not oversized. Not miniaturised.
COMPONENTS    Every chain · pendant · earring back · clasp · tassel from source present in output.
  `.trim();

  const shotType = modelRefUrl
    ? "SHOT: Show worn on body. Correct anatomical placement. Correct scale."
    : "SHOT: Isolated product — flat lay or prop stand · macro detail · " +
      "45° or overhead angle · human hand or body part for scale reference.";

  return [
    header,
    isolation,
    extract,
    jewelleryGenreDirective(jewelleryGenre),
    shotType,
    jewelleryLighting(jewelleryGenre, jewelleryStyle),
    outputStyle(style),
    background(bg),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─── Accessories Builder ──────────────────────────────────────────

function accessoryTypeRules(type: string): string {
  const t = type.toLowerCase();
  const map: [RegExp, string][] = [
    [/bag/,              "BAGS: Structured shape retained · no sagging unless source shows soft bag · handles correctly positioned · shadow beneath for grounding · interior visible only if source shows open bag."],
    [/footwear|shoe|sneaker|heel|boot/, "FOOTWEAR: Pair shown from 3/4 angle unless source is single · correct toe shape · heel height · sole thickness · clean soles unless lifestyle shot."],
    [/watch/,            "WATCHES: Crown at 3 o'clock · dial readable and in focus · crystal reflection if sapphire/mineral glass · bracelet/strap correctly proportioned · time set to 10:10 unless source differs."],
    [/eyewear|glass|sunglass/, "EYEWEAR: Lens colour and tint exact from source · frame silhouette precise · temple arms correct length · no reflections obscuring lens unless artistic."],
    [/belt/,             "BELTS: Buckle centred · leather grain direction consistent along full length · holes visible if in source."],
    [/scarf|stole|shawl|muffler/, "SCARVES: Flat lay · folded · or worn. Print/pattern tiles correctly with no distortion. Fringe reproduced if present."],
  ];

  const matched = map.find(([regex]) => regex.test(t));
  return matched
    ? matched[1]
    : "Render accessory with precise material physics · correct proportions · grounding shadow.";
}

function accessoryIsolation(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("bag")) return "Bags → ONLY bag (correct structure)\n❌ No cross-accessory generation";
  if (t.includes("footwear") || t.includes("shoe") || t.includes("boot")) return "Footwear → ONLY footwear pair/single as per source\n❌ No cross-accessory generation";
  if (t.includes("watch")) return "Watches → ONLY watch (correct dial + strap)\n❌ No cross-accessory generation";
  if (t.includes("eyewear") || t.includes("glass")) return "Eyewear → ONLY eyewear (frame + lens exact)\n❌ No cross-accessory generation";
  if (t.includes("belt")) return "Belts → ONLY belt\n❌ No cross-accessory generation";
  if (t.includes("scarf") || t.includes("stole") || t.includes("muffler")) return "Scarves → ONLY scarf\n❌ No cross-accessory generation";
  return "❌ No cross-accessory generation (e.g., bag + shoes combo NOT allowed unless source shows)";
}

function buildAccessoriesPrompt(inputs: AccessoriesInputs): string {
  const {
    accessoryType = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    aiNotes: notes,
  } = inputs;

  const header =
    "[HUB: ACCESSORIES]" +
    (accessoryType ? ` [TYPE: ${accessoryType}]` : "");

  const isolation = `${UNIVERSAL_ISOLATION}\n${accessoryIsolation(accessoryType)}`;

  const extract = `
ACCESSORY EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
MATERIAL  Leather grain · canvas weave · metal finish · rubber · fabric — exact material physics.
COLOUR    Exact. No shift. Black leather is not dark brown.
HARDWARE  Buckles · zips · clasps · logos — all reproduced precisely.
STITCHING Visible stitching lines · thread colour from source.
SHAPE     Silhouette and proportions exactly as source.
  `.trim();

  const shotStyle = (() => {
    const s = style.toLowerCase();
    if (s.includes("catalog"))   return "SHOT: White/grey seamless · product centred · 45° angle · soft shadow · no props.";
    if (s.includes("premium"))   return "SHOT: Dark surface · dramatic side light · deep shadows · luxury feel · optional lifestyle props.";
    if (s.includes("lifestyle")) return "SHOT: Worn or in context — bag on arm · watch on wrist · shoes on feet · natural setting.";
    return "SHOT: Professional product photography · clean and well-lit.";
  })();

  return [
    header,
    isolation,
    extract,
    accessoryTypeRules(accessoryType),
    shotStyle,
    background(bg),
    outputStyle(style),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─── Products Builder ─────────────────────────────────────────────

function productFamilyRules(family: string): string {
  const f = family.toLowerCase();
  const map: [RegExp, string][] = [
    [/home.?decor/,    "HOME DECOR: Styled in room setting · props complement, do not compete · warm ambient light · show in use context (vase with flowers, cushion on sofa, lamp on)."],
    [/beauty|cosmetic/, "BEAUTY/COSMETICS: White marble or soft pastel surface · macro detail of texture/formula if relevant · label fully legible and in focus · no fingerprints on packaging."],
    [/handicraft/,     "HANDICRAFTS: Warm artisanal setting · jute, wood, or terracotta surface · natural or warm window light · craft origin context."],
    [/packaged/,       "PACKAGED PRODUCTS: Clean white or gradient background · package upright · label facing camera · fully lit · no shadows obscuring label text · group shot if multiple SKUs."],
    [/gift|lifestyle/, "GIFTS/LIFESTYLE: Styled flat lay or gift arrangement · ribbon/tissue/box context if relevant · warm festive or lifestyle mood."],
  ];

  const matched = map.find(([regex]) => regex.test(f));
  return matched
    ? matched[1]
    : "Professional product photography with clean background and correct lighting.";
}

function productIsolation(family: string): string {
  const f = family.toLowerCase();
  if (f.includes("home decor")) return "Home Decor → ONLY decor item (in context)\n❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
  if (f.includes("beauty") || f.includes("cosmetic")) return "Beauty / Cosmetics → ONLY that product (label visible)\n❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
  if (f.includes("handicraft")) return "Handicrafts → ONLY craft item\n❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
  if (f.includes("packaged")) return "Packaged Products → ONLY packaging SKU(s)\n❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
  if (f.includes("gift") || f.includes("lifestyle")) return "Gifts / Lifestyle → ONLY relevant product arrangement\n❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
  return "❌ No unrelated product addition\n❌ No bundle unless present in PRODUCT_IMAGE";
}

function buildProductsPrompt(inputs: ProductsInputs): string {
  const {
    productFamily = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    aiNotes: notes,
  } = inputs;

  const header =
    "[HUB: PRODUCTS]" +
    (productFamily ? ` [FAMILY: ${productFamily}]` : "");

  const isolation = `${UNIVERSAL_ISOLATION}\n${productIsolation(productFamily)}`;

  const extract = `
PRODUCT EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
SHAPE       Exact form. No rounding or smoothing of edges.
COLOUR      Exact — critical for cosmetics and packaging. No drift.
LABEL/TEXT  All text · logos · label graphics reproduced legibly at full resolution.
FINISH      Matte · Gloss · Frosted · Metallic · Textured — correct material response to light.
SIZE        Relative scale must feel physically correct in final image.
  `.trim();

  const shotStyle = (() => {
    const s = style.toLowerCase();
    if (s.includes("catalog"))   return "SHOT: White seamless · centred · product fills 70% of frame · soft shadow · no props · label fully readable.";
    if (s.includes("premium"))   return "SHOT: Dark or textured surface · dramatic lighting · editorial props · rich depth.";
    if (s.includes("lifestyle")) return "SHOT: Product in real-world context · ambient styling · natural light or warm interior.";
    return "SHOT: Professional product photography.";
  })();

  return [
    header,
    isolation,
    extract,
    productFamilyRules(productFamily),
    shotStyle,
    background(bg),
    outputStyle(style),
    QUALITY_GATES,
    "Label and logo text must be fully legible.",
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─── Master Router ────────────────────────────────────────────────

/**
 * buildMasterPrompt
 * Accepts structured pipeline inputs.
 * Routes to correct hub builder.
 * Returns a single production-ready prompt string.
 */
export function buildMasterPrompt(inputs: PromptInputs): string {
  switch (inputs.hub) {
    case "Apparel":     return buildApparelPrompt(inputs);
    case "Jewellery":   return buildJewelleryPrompt(inputs);
    case "Accessories": return buildAccessoriesPrompt(inputs);
    case "Products":    return buildProductsPrompt(inputs);
  }
}

// ─── Usage Example ────────────────────────────────────────────────

/*
const prompt = buildMasterPrompt({
  hub:            "Apparel",
  segment:        "Ladies",
  wearType:       "Ethnic Wear",
  productType:    "Saree",
  productImageUrl:"https://cdn.digitalatelier.in/products/saree-001.jpg",
  modelRefUrl:    "https://cdn.digitalatelier.in/models/model-04.jpg",
  background:     "Premium Studio",
  outputStyle:    "Catalog",
  aiNotes:        "Focus on pallu details. Add subtle gold jewellery.",
});

console.log(prompt);
// → Full structured prompt, ready for image generation API
*/