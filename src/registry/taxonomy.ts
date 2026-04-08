export interface TaxonomyNode {
  title: string;
  image: string;
  leafNodes?: string[];
  fullWidth?: boolean;
}

export const TAXONOMY: Record<string, any> = {
  apparel: {
    segments: ["Ladies", "Gents", "Kids"],
    styles: {
      Ladies: [
        { title: "Ethnic Wear", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", leafNodes: ["Saree", "Kurti", "Kurta Set", "Salwar Suit", "Lehenga", "Dupatta Set", "Blouse", "Other"] },
        { title: "Western Wear", image: "/assets/ladies/western-wear/elegant-woman-wearing-modern-western-wear.jpg", leafNodes: ["Dress", "Top", "Shirt", "Blouse", "Skirt", "Co-ord Set", "Gown / Partywear", "Other"] },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ],
      Gents: [
        { title: "Ethnic Wear", image: "/assets/men/ethnic-wear/men-ethnic-wear-portrait.jpg", leafNodes: ["Kurta", "Sherwani", "Nehru Jacket", "Ethnic Set", "Other"] },
        { title: "Western Wear", image: "/assets/men/western-wear/men-formal-wear-portrait.jpg", leafNodes: ["Shirt", "T-shirt", "Blazer", "Jacket", "Trousers", "Casual Set", "Other"] },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ],
      Kids: [
        { title: "Ethnic Wear", image: "/hero_image.png", leafNodes: ["Kids Kurta Set", "Kids Lehenga", "Festive Set", "Other"] },
        { title: "Western Wear", image: "/hero_image.png", leafNodes: ["Frock", "Shirt", "Top", "Bottomwear", "Partywear Set", "Other"] },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ]
    }
  },
  jewellery: {
    segments: ["Bridal", "Fashion", "Traditional", "Daily Wear"],
    styles: {
      leafNodes: {
        Bridal: ["Full Set", "Choker Set", "Necklace Set", "Earrings", "Bangles", "Maang Tikka", "Other"],
        Fashion: ["Earrings", "Rings", "Bracelets", "Necklaces", "Office-wear Sets", "Other"],
        Traditional: ["Temple", "Kundan", "Antique Finish", "Polki-style", "Festive Sets", "Other"],
        Daily: ["Studs", "Thin Chains", "Light Bracelets", "Minimal Rings", "Other"]
      }
    }
  },
  accessories: {
    styles: [
      { title: "Bags", image: "/assets/categories/handbag.png", leafNodes: ["Handbag", "Backpack", "Clutch", "Tote", "Sling Bag", "Briefcase", "Duffel", "Other"] },
      { title: "Footwear", image: "/assets/categories/footwear.png", leafNodes: ["Sneakers", "Heels", "Boots", "Formal Shoes", "Loafers", "Sandals", "Flip Flops", "Other"] },
      { title: "Watches", image: "/assets/categories/watch.png", leafNodes: ["Luxury", "Sports", "Smartwatch", "Vintage", "Minimalist", "Chronograph", "Other"] },
      { title: "Eyewear", image: "/assets/categories/eyewear.png", leafNodes: ["Sunglasses", "Optical Frames", "Sport Glasses", "Reading Glasses", "Blue Light", "Other"] },
      { title: "Belts", image: "/assets/categories/belts.png", leafNodes: ["Leather", "Fabric", "Formal", "Casual", "Braided", "Other"] },
      { title: "Scarves / Small Accessories", image: "/assets/categories/scarves.png", leafNodes: ["Silk Scarf", "Woolen Muffler", "Bandana", "Stole", "Shawl", "Pins", "Gloves", "Other"] },
      { title: "Custom / Other", image: "/assets/categories/custom_accessory.png", fullWidth: true, leafNodes: ["Custom Item", "Other"] }
    ]
  },
  products: {
    families: [
      { title: "Home Decor", image: "/assets/categories/home_decor.png", leafNodes: ["Vase", "Lamp", "Wall Art", "Cushion", "Rug", "Ornament", "Other"] },
      { title: "Beauty / Cosmetics", image: "/assets/categories/beauty.png", leafNodes: ["Serum", "Cream", "Lipstick", "Perfume", "Facewash", "Oil", "Other"] },
      { title: "Handicrafts", image: "/assets/categories/handicrafts.png", leafNodes: ["Woodwork", "Pottery", "Metalwork", "Textiles", "Bamboo", "Other"] },
      { title: "Packaged Products", image: "/assets/categories/packaged_products.png", leafNodes: ["Box", "Bottle", "Jar", "Pouch", "Tube", "Other"] },
      { title: "Gifts / Lifestyle", image: "/assets/categories/gifts.png", fullWidth: true, leafNodes: ["Gift Set", "Hamper", "Journal", "Accessory", "Other"] },
      { title: "Custom / Other", image: "/assets/categories/custom_product.png", fullWidth: true, leafNodes: ["Custom Product", "Other"] }
    ]
  }
};
