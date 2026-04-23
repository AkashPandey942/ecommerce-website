/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — MASTER PROMPT ENGINE v5.0
 *  End-to-End · Every Screen · Full App Flow
 *  Apparel · Jewellery · Accessories · Products
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
  outputViews?: string[]; // Screen 7: Front, Left, Right, Close-up, Detail, Custom
  videoStyle?: string;   // Screen 9: Straight Walk, Slow Turn, Elegant Reveal, etc.
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
No deviation. No mixing. No substitution. No AI-assumed additions.
`.trim();

const IDENTITY_LOCK = `
IDENTITY LOCK — ABSOLUTE. NON-NEGOTIABLE.
Face geometry · pores · freckles · moles · micro-details → 100% preserved.
Skin tone + undertone → exact match to MODEL_REF. No shift.
Body shape · limb volume · proportions · posture → unchanged.
Hair colour · length · texture · style → unchanged.
Eye colour · shape · position → unchanged.
Expression → unchanged unless explicitly stated in AI_NOTES.
No slimming · no reshaping · no enhancement · no beautification.
Identity must be pixel-consistent across all views and all video frames.
`.trim();

const QUALITY_GATES = `
QUALITY GATES — ALL MUST PASS:
✓ Output matches selected category/type exactly
✓ No cross-category elements present
✓ Only items visible in PRODUCT_IMAGE are rendered
✓ Item colour exact match to source — zero drift
✓ All surface detail reproduced — zero AI averaging
✓ Model identity 100% preserved from MODEL_REF
✓ Fabric physics correct for identified type
✓ Background and subject lighting consistent
✓ Correct composition for OUTPUT_STYLE
✓ Single image — no collage · no watermark · no text overlay
✓ Resolution minimum 1024×1024 · target 2048×2048
✓ Marketplace-safe: Meesho · Myntra · Amazon · Ajio · Nykaa ready
REJECT AND REGENERATE if any gate fails.
`.trim();

const NEGATIVE_PROMPT = `
--no category mixing, no hybrid/fusion unless in PRODUCT_IMAGE,
no AI-added extra items, no assumption-based styling,
no replacement of product type, no face change, no skin tone shift,
no body distortion, no slimming, no reshaping, no body enhancement,
no blur, no low resolution, no waxy skin, no plastic skin,
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
    "LIGHTING RULE: Light direction · colour temperature · intensity on subject " +
    "MUST match background exactly.";

  const map: Record<string, string> = {
    "white studio":
      "White Studio   → Pure white seamless sweep · soft-box front light + fill · faint natural floor shadow.",
    "premium studio":
      "Premium Studio → Dark charcoal textured wall · Rembrandt or split lighting · warm gold or cool silver rim light · rich deep shadow.",
    "saree festival":
      "Saree Festival → Decorated mandap or temple corridor · marigold garlands · diyas · warm amber light.",
    outdoor:
      "Outdoor        → Garden or heritage monument · natural directional sunlight · soft fill · accurate cast shadows.",
    "modern office":
      "Modern Office  → Contemporary interior · large windows · diffused daylight · neutral clean tones.",
  };

  const matched = Object.entries(map).find(([key]) => b.includes(key));
  const scene = matched ? matched[1] : `${bg} — professional studio environment.`;
  return `${scene}\n${rule}`;
}

function outputStyle(style: string): string {
  const s = style.toLowerCase();
  const map: Record<string, string> = {
    catalog:
      "Catalog      → Full body portrait 3:4 · centred · neutral expression · hands relaxed · no props. Marketplace-standard.",
    premium:
      "Premium      → Editorial · off-centre · 3/4 body · dramatic lighting · confident gaze · rich colour grade. Luxury feel.",
    "social media":
      "Social Media → Vertical 9:16 · waist-up · vibrant · high energy. Optimised for Instagram / Reels.",
    lifestyle:
      "Lifestyle    → Environmental portrait 3:4 or 4:5 · candid feel · warm atmospheric light · airy edit.",
  };
  const matched = Object.entries(map).find(([key]) => s.includes(key));
  return matched ? matched[1] : style;
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
      "SAREE:\n  Nivi drape (default unless source shows otherwise).\n  Petticoat neatly tucked at waist.\n  5–7 uniform front pleats, centred, sharp folds.\n  Pallu over left shoulder, natural diagonal fall, full design visible.\n  Blouse fitted front and back — no pull, no gap, no stretch.",
    lehenga:
      "LEHENGA:\n  Full circular flare · even ankle-length hem all around.\n  Choli fitted bodice, neckline exactly from source.\n  Dupatta over both shoulders or one shoulder as in source.",
    "kurta set":
      "KURTA SET / SALWAR SUIT:\n  Kurta straight or A-line per source.\n  Churidar gathers at ankle or palazzo wide and even.\n  Dupatta diagonal chest drape or over both shoulders.",
    salwar:
      "KURTA SET / SALWAR SUIT:\n  Kurta straight or A-line per source.\n  Churidar gathers at ankle or palazzo wide and even.\n  Dupatta diagonal chest drape or over both shoulders.",
    kurti:
      "KURTI:\n  Show with neutral bottom (white or black)\n  unless source shows specific paired bottom.",
    "dupatta set":
      "DUPATTA SET:\n  Draped naturally over both shoulders or one shoulder.\n  Full length visible. Print/embroidery unobstructed.",
    blouse:
      "BLOUSE:\n  Neckline · sleeve · back design all visible.\n  Show with plain petticoat unless source shows full saree.",
    sherwani:
      "SHERWANI:\n  All buttons fastened · straight placket.\n  Even knee-length hem · Churidar fitted through leg, clean ankle gathers.",
    gown:
      "GOWN / PARTYWEAR:\n  Train fully visible and in frame if present.\n  Silhouette A-line / mermaid / ball gown exactly per source.\n  Maximum garment drama — no flattening of volume or structure.",
  };

  for (const [key, rule] of Object.entries(rules)) {
    if (pt.includes(key)) return rule;
  }

  return (
    "WESTERN FIT:\n  Structured or relaxed per source fabric weight.\n  Natural body-conforming silhouette.\n  Seams and construction lines from source reproduced exactly."
  );
}

function apparelIsolation(productType: string): string {
  const pt = productType.toLowerCase();
  if (pt.includes("saree")) return "  Saree       → Output ONLY Saree (blouse + petticoat support)\n                ❌ No lehenga / kurti / gown / fusion";
  if (pt.includes("lehenga")) return "  Lehenga     → ONLY Lehenga set (lehenga + choli + dupatta)\n                ❌ No saree drape / gown mix";
  if (pt.includes("kurti")) return "  Kurti       → ONLY Kurti (neutral bottom if needed)\n                ❌ No saree / lehenga styling";
  if (pt.includes("kurta set") || pt.includes("salwar suit")) return "  Kurta Set   → ONLY full set (kurta + bottom + dupatta if present)\n                ❌ No unrelated garment mix";
  if (pt.includes("blouse")) return "  Blouse      → ONLY blouse-focused output\n                ❌ No full saree/lehenga unless in PRODUCT_IMAGE";
  if (pt.includes("sherwani")) return "  Sherwani    → ONLY that ethnic menswear structure\n                ❌ No casual/western merge";
  if (pt.includes("dupatta")) return "  Dupatta Set → ONLY dupatta with neutral base garment\n                ❌ No full bridal styling unless in source";
  if (pt.includes("kids")) return "  Kids        → ONLY selected kids category · age-appropriate\n                ❌ No adult styling";
  return "  Western     → ONLY selected western type\n                ❌ No ethnic blending";
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
    outputViews,
  } = inputs;

  const isKids = /kids/i.test(segment);

  const header = `[HUB: APPAREL] [SEGMENT: ${segment}] [WEAR TYPE: ${wearType}] [PRODUCT TYPE: ${productType}]`;
  const isolation = `${UNIVERSAL_ISOLATION}\n${apparelIsolation(productType)}`;

  const extract = `
── GARMENT EXTRACTION ──────────────────────────────────────────────────────

SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation permitted.

COLOUR       Exact hex-level match. No brightening · darkening · saturation shift.
             Render faithfully under output lighting — never recolour.
PRINT        All-over · block · digital · woven patterns at full fidelity.
             Scale correctly to body. No tiling errors · no distortion.
EMBROIDERY   Zari · resham · mirror · cutdana · sequin · gota patti.
             Render every element individually. No averaging. No blur.
BORDERS      Exact width · motif · colour as in source. Pallu and hem borders match.
FABRIC ID    Silk→high sheen·stiff | Chiffon→translucent·floaty | Cotton→matte·soft |
             Georgette→medium flow | Net/Organza→sheer·stiff | Velvet→deep pile·heavy |
             Crepe→matte·heavy·structured | Tissue→metallic sheen·semi-stiff
CUT          Neckline · sleeve length · hem length · silhouette exactly from source.
  `.trim();

  const modelDirective = modelRefUrl
    ? `
── MODEL DIRECTIVE ──────────────────────────────────────────────────────────

${mode === "Virtual Try-On" ? "TASK: Virtual Try-On. Redress subject in MODEL_REF with clothing from PRODUCT_IMAGE.\nReplace ONLY the clothing. Strictly preserve subject identity." : "Apply garment to MODEL_REF only. No other model."}

${IDENTITY_LOCK}

Correct draping physics for identified fabric weight.
No gaps · no pulls · no warping · no misalignment.

${isKids ? "IF SEGMENT = Kids:\n  Scale all proportions to child body.\n  Age-appropriate styling only. No adult proportions." : ""}
    `.trim()
    : "Show garment on appropriate figure or flat-lay with correct draping.";

  const physics = `
── CLOTH PHYSICS ───────────────────────────────────────────────────────────

Gravity-driven drape · correct tension at shoulder, waist, and hip.
Seams and stitching reproduced from source.
Sheer fabrics → correct opacity · background visible only where physically accurate.
Opaque fabrics → zero background bleed-through.
No floating · no clipping · no misalignment at any seam.
Multi-layer contact shadows and ambient occlusion applied throughout.
`.trim();

  const basePrompt = [
    header,
    "\n── PRODUCT TYPE ISOLATION ──────────────────────────────────────────────────\n",
    isolation,
    extract,
    "\n── DRAPING RULES ───────────────────────────────────────────────────────────\n",
    drapingRules(productType),
    physics,
    modelDirective,
    "\n── BACKGROUND ───────────────────────────────────────────────────────────────\n",
    background(bg),
    "\n── OUTPUT STYLE ─────────────────────────────────────────────────────────────\n",
    outputStyle(style),
    aiNotes(notes),
    QUALITY_GATES,
    "\n── NEGATIVE PROMPT ──────────────────────────────────────────────────────────\n",
    NEGATIVE_PROMPT,
  ].filter(Boolean).join("\n");

  if (outputViews && outputViews.length > 0) {
    return buildMultiViewPrompt(basePrompt, outputViews);
  }

  return basePrompt;
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
      "Bridal     → Full set · necklace layered · maang tikka centred · earrings symmetrical · bangles stacked · rich warm lighting · mandap or deep jewel tone background.",
    fashion:
      "Fashion    → Clean isolated or styled on model · minimalist background · highlight design.",
    traditional:
      "Traditional→ Warm amber tones · Temple/Kundan → deep red, green, or ivory backdrop.",
    "daily wear":
      "Daily Wear → White or soft pastel background · lightweight pieces · natural light.",
  };
  const matched = Object.entries(map).find(([key]) => g.includes(key));
  return matched ? matched[1] : "Professional jewellery photography.";
}

function jewelleryIsolation(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes("bridal")) return "Bridal → Full set only\n❌ No minimal output";
  return "→ ONLY that specific item\n❌ No full set unless in source";
}

function buildJewelleryPrompt(inputs: JewelleryInputs): string {
  const {
    jewelleryGenre = "Fashion",
    jewelleryStyle = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    modelRefUrl,
    aiNotes: notes,
    outputViews,
  } = inputs;

  const header = `[HUB: JEWELLERY] [GENRE: ${jewelleryGenre}] [STYLE: ${jewelleryStyle}]`;
  const isolation = `${UNIVERSAL_ISOLATION}\n${jewelleryIsolation(jewelleryGenre)}`;

  const extract = `
JEWELLERY EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
METAL FINISH  Exact tone — Gold · Silver · Rose Gold · Oxidised · Antique.
STONE COLOUR  Every gemstone exact. Emerald ≠ jade. Ruby ≠ garnet.
STONE SETTING Kundan · Prong · Bezel · Pavé · Polki — preserved exactly.
TEXTURE       Filigree · engraving · polished · matte · hammered.
SCALE         Correct size relative to body. Not oversized.
COMPONENTS    Every chain · pendant · earring back · clasp · tassel present.
  `.trim();

  const basePrompt = [
    header,
    "\n── PRODUCT TYPE ISOLATION ──────────────────────────────────────────────────\n",
    isolation,
    extract,
    jewelleryGenreDirective(jewelleryGenre),
    modelRefUrl ? "SHOT: Worn on body. Anatomical placement. Scale." : "SHOT: Isolated product shot.",
    jewelleryLighting(jewelleryGenre, jewelleryStyle),
    "\n── OUTPUT STYLE ─────────────────────────────────────────────────────────────\n",
    outputStyle(style),
    "\n── BACKGROUND ───────────────────────────────────────────────────────────────\n",
    background(bg),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ].filter(Boolean).join("\n");

  if (outputViews && outputViews.length > 0) {
    return buildMultiViewPrompt(basePrompt, outputViews);
  }

  return basePrompt;
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
  if (t.includes("bag")) return "  Bags     → ONLY bag ❌ No cross-accessory";
  if (t.includes("footwear") || t.includes("shoe") || t.includes("boot")) return "  Footwear → ONLY footwear pair/single ❌ No cross-accessory";
  if (t.includes("watch")) return "  Watches  → ONLY watch ❌ No cross-accessory";
  if (t.includes("eyewear") || t.includes("glass")) return "  Eyewear  → ONLY eyewear ❌ No cross-accessory";
  if (t.includes("belt")) return "  Belts    → ONLY belt ❌ No cross-accessory";
  if (t.includes("scarf") || t.includes("stole") || t.includes("muffler")) return "  Scarves  → ONLY scarf ❌ No cross-accessory";
  return "❌ No cross-accessory generation";
}

function buildAccessoriesPrompt(inputs: AccessoriesInputs): string {
  const {
    accessoryType = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    aiNotes: notes,
    outputViews,
  } = inputs;

  const header = `[HUB: ACCESSORIES] [TYPE: ${accessoryType}]`;
  const isolation = `${UNIVERSAL_ISOLATION}\n${accessoryIsolation(accessoryType)}`;

  const basePrompt = [
    header,
    "\n── PRODUCT TYPE ISOLATION ──────────────────────────────────────────────────\n",
    isolation,
    `ACCESSORY EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
MATERIAL  Leather grain · canvas weave · metal finish · rubber — exact physics.
COLOUR    Exact. Black leather ≠ dark brown. Navy ≠ black.
HARDWARE  Buckles · zips · clasps · logos · rivets — all reproduced precisely.
STITCHING Visible stitching lines · thread colour from source.
SHAPE     Silhouette and proportions exactly as source.`,
    accessoryTypeRules(accessoryType),
    "\n── OUTPUT STYLE ─────────────────────────────────────────────────────────────\n",
    outputStyle(style),
    "\n── BACKGROUND ───────────────────────────────────────────────────────────────\n",
    background(bg),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ].filter(Boolean).join("\n");

  if (outputViews && outputViews.length > 0) {
    return buildMultiViewPrompt(basePrompt, outputViews);
  }

  return basePrompt;
}

// ─── Multi-View & Video Builders ──────────────────────────────────

function buildMultiViewPrompt(basePrompt: string, views: string[]): string {
  const viewDirectives: Record<string, string> = {
    "Front View": "Front View → Model facing camera directly · full body 3:4 · garment front fully visible · centred composition.",
    "Left View":  "Left View → Model turned 45–90° to the left · left side of garment fully visible · natural shoulder posture.",
    "Right View": "Right View → Model turned 45–90° to the right · right side of garment fully visible · natural shoulder posture.",
    "Close-up":   "Close-up → Waist-up or bust-up frame · face and upper garment in sharp focus · background softly blurred.",
    "Detail Shot": "Detail Shot → Extreme macro on hero detail (embroidery/border/stone/hardware/label/texture). No full body. Sharp focus throughout.",
    "Custom":     "Custom → Apply exactly as specified in AI_NOTES. Maintain identity lock and extraction lock.",
  };

  const selectedDirectives = views
    .map(v => viewDirectives[v] || viewDirectives[Object.keys(viewDirectives).find(k => v.includes(k)) || ""] || "")
    .filter(Boolean);

  return `
${basePrompt}

── MULTI-VIEW GENERATION ───────────────────────────────────────────────────
VIEWS REQUESTED: ${views.join(", ")}

Each view must be independently generated. No reuse across views.

${selectedDirectives.join("\n")}
  `.trim();
}

function buildVideoPrompt(inputs: PromptInputs): string {
  const { videoStyle, hub, aiNotes: notes } = inputs;

  const styleDirectives: Record<string, string> = {
    "Straight Walk": "STRAIGHT WALK:\n  Model walks directly toward camera in a straight line.\n  Natural confident stride. Garment movement and drape captured in full.\n  Fabric dynamics visible throughout. 3–5 second clip.\n  Camera remains static at eye level. No zoom.",
    "Slow Turn":     "SLOW TURN:\n  Model performs a slow 180° or 360° turn on axis.\n  All sides of garment revealed — front · left · back · right.\n  Movement graceful and unhurried. Fabric flow and drape captured.\n  Consistent studio lighting throughout rotation. Seamless loop preferred.",
    "Elegant Reveal": "ELEGANT REVEAL:\n  Model enters frame from one side. Comes to a graceful stop at centre.\n  Subtle pose adjustment to reveal garment hero details.\n  Slow push-in on face and upper body at end.\n  Cinematic and aspirational tone.",
    "Fabric Flow":   "FABRIC FLOW:\n  Camera focuses on fabric movement.\n  Model performs a slow spin or gentle sway.\n  Dupatta · pallu · lehenga flare · or fabric hem in fluid motion.\n  Extreme slow motion on fabric dynamics.\n  Warm atmospheric lighting — golden hour or soft studio.",
    "Cinematic":     "CINEMATIC:\n  Slow dolly push-in. Shallow depth of field. Film grain overlay.\n  Warm colour grade. 24fps feel.\n  Dramatic reveal from environment wide shot to garment/product close detail.",
    "Reel":          "REEL:\n  Dynamic 9:16 vertical. Fast cuts every 1–2 seconds.\n  Upbeat energy. Vibrant colour. Motion blur on transitions.\n  Optimised for Instagram Reels / TikTok.",
    "Slow Motion":   "SLOW MOTION:\n  120fps playback at 24fps output.\n  Fabric movement · hair flow · jewellery glint captured in detail.\n  Smooth, graceful. No judder.",
    "360 Turntable": "360 TURNTABLE:\n  Product or model rotates full 360° on axis.\n  Consistent studio lighting throughout rotation.\n  Seamless loop. No background change. No lighting shift.",
    "Zoom Focus":    "ZOOM FOCUS:\n  Start wide (full body / full product).\n  Slow zoom to hero detail — embroidery · stone · hardware · label.\n  Sharp focus maintained throughout.",
  };

  const styleRule = styleDirectives[videoStyle!] || styleDirectives[Object.keys(styleDirectives).find(k => videoStyle!.includes(k)) || ""] || "Generic cinematic product motion.";

  return `
[HUB: ${hub}] [MODE: VIDEO GENERATION] [VIDEO_STYLE: ${videoStyle}]

SOURCE IMAGES (APPROVED — LOCKED):
  Use ONLY the approved images from APPROVE_AND_CONTINUE.
  No regeneration of product, model, background, or identity.

── VIDEO MOTION DIRECTIVE ───────────────────────────────────────────────────
${styleRule}

── IDENTITY IN VIDEO ────────────────────────────────────────────────────────
${IDENTITY_LOCK}
Identity must be pixel-consistent across every frame of the video.

── TEMPORAL STABILITY ───────────────────────────────────────────────────────
Every frame must be visually consistent with the previous.
No flicker · no pop · no identity drift · no lighting change · no colour shift.
Fabric physics must be continuous and physically plausible in motion.
Motion must feel natural for the subject type and garment weight.

── VIDEO QUALITY GATES ──────────────────────────────────────────────────────
ALL MUST PASS:
✓ Motion style matches selected VIDEO_STYLE exactly
✓ Model identity consistent across every frame
✓ No temporal flicker · no frame instability · no ghosting
✓ No identity drift between frames
✓ Lighting and colour grade consistent throughout
✓ Fabric/material physics maintained in motion
✓ No artifacts · no frame drops · no morphing
✓ Single AI-generated video — no static demo or placeholder
✓ MP4 · 4K · correct aspect ratio
REJECT AND REGENERATE if any gate fails.

${aiNotes(notes)}

── VIDEO NEGATIVE PROMPT ────────────────────────────────────────────────────
--no flickering, no frame instability, no temporal artifacts,
no identity drift across frames, no ghosting, no morphing,
no static demo video, no slideshow, no cached content,
no watermark, no text overlay, no UI elements,
no lighting changes between frames, no colour shift across frames,
no fabric texture loss in motion, no background pop or change
  `.trim();
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
  if (f.includes("home decor")) return "  Home Decor  → ONLY decor item in context ❌ No unrelated product";
  if (f.includes("beauty") || f.includes("cosmetic")) return "  Beauty      → ONLY that product (label visible) ❌ No unrelated product";
  if (f.includes("handicraft")) return "  Handicraft  → ONLY craft item ❌ No unrelated product";
  if (f.includes("packaged")) return "  Packaged    → ONLY packaging SKU(s) ❌ No unrelated product";
  if (f.includes("gift") || f.includes("lifestyle")) return "  Gifts       → ONLY relevant product arrangement ❌ No unrelated product";
  return "❌ No unrelated product addition";
}

function buildProductsPrompt(inputs: ProductsInputs): string {
  const {
    productFamily = "",
    outputStyle: style = "Catalog",
    background: bg = "White Studio",
    aiNotes: notes,
    outputViews,
  } = inputs;

  const header = `[HUB: PRODUCTS] [FAMILY: ${productFamily}]`;
  const isolation = `${UNIVERSAL_ISOLATION}\n${productIsolation(productFamily)}`;

  const extract = `
PRODUCT EXTRACTION: SHAPE (Exact) · COLOUR (Critical for cosmetics) · LABEL/TEXT (Legible) · FINISH (Matte/Gloss).
Relative scale must feel physically correct. Label text must be fully legible.
  `.trim();

  const basePrompt = [
    header,
    "\n── PRODUCT TYPE ISOLATION ──────────────────────────────────────────────────\n",
    isolation,
    `PRODUCT EXTRACTION — SOURCE OF TRUTH: PRODUCT_IMAGE. Zero deviation.
SHAPE      Exact form. No rounding or smoothing.
COLOUR     Exact — critical for cosmetics and packaging. No drift.
LABEL/TEXT All text · logos · graphics legible at full resolution.
FINISH     Matte · Gloss · Frosted · Metallic · Textured — correct light response.
SIZE       Relative scale physically correct in final image.
Label and logo text must be fully legible at full resolution.`,
    productFamilyRules(productFamily),
    "\n── OUTPUT STYLE ─────────────────────────────────────────────────────────────\n",
    outputStyle(style),
    "\n── BACKGROUND ───────────────────────────────────────────────────────────────\n",
    background(bg),
    QUALITY_GATES,
    aiNotes(notes),
    NEGATIVE_PROMPT,
  ].filter(Boolean).join("\n");

  if (outputViews && outputViews.length > 0) {
    return buildMultiViewPrompt(basePrompt, outputViews);
  }

  return basePrompt;
}

// ─── Master Router ────────────────────────────────────────────────

/**
 * buildMasterPrompt
 * Accepts structured pipeline inputs.
 * Routes to correct hub builder.
 * Returns a single production-ready prompt string.
 */
export function buildMasterPrompt(inputs: PromptInputs): string {
  if (inputs.videoStyle) {
    return buildVideoPrompt(inputs);
  }

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