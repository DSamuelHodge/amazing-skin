import { Product } from '@/src/types';

export const mockData = {
  nav: {
    logo: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/296289e8-d1b7-46fb-a6d8-f52a9f0e4569_320w.png",
    links: [
      { label: "Rituals", href: "#" },
      { label: "Ingredients", href: "#" },
      { label: "Results", href: "#" },
      { label: "Stories", href: "#" },
    ],
  },
  hero: {
    titleLine1: "Give Your Skin",
    titleLine2: "the calm it deserves",
    description: "A three-step ritual for sensitive, overworked skin. Clinically measured to reduce redness, strengthen your barrier, and bring back a quiet, lasting glow.",
    rating: {
      score: 4.9,
      reviews: "2,304",
      avatars: [
        "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ffc24c17-d47b-4b9b-972e-cd31b73ab395_320w.webp",
        "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a2cdd22f-4895-4c8c-b054-f19b899606b1_320w.webp",
        "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7f465f35-2fc5-42c2-977e-54a9217f7ce2_320w.webp",
      ]
    },
    mainImage: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7d30ad3a-ffbc-427c-8120-a79ae8b3da6d_1600w.webp",
    badge: {
      title: "Clinically Calm",
      subtitle: "Irritation down by 87% in 4 weeks.",
      note: "Tested on 120 sensitive-skin participants under dermatological supervision."
    },
    features: [
      {
        tag: "98% less plastic",
        title: "Refillable Glass",
        subtitle: "Designed for the long term",
        description: "Each bottle is crafted from fully recyclable glass and ships in compostable mailers to keep your ritual gentle on the planet.",
        note: "Refill program saves 1.3kg CO₂ / year",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/097cb637-6762-467b-a1d3-db0d530693f4_320w.jpg"
      },
      {
        tag: "BOTANICAL BLEND",
        title: "99% Origin from Plants",
        subtitle: "100% peace of mind",
        bullets: [
          "No synthetic fragrance or dyes",
          "Cold-pressed seed oils and adaptogens",
          "Certified cruelty-free and ethically harvested"
        ],
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c396622e-2acf-40fd-a5de-4e0448603187_800w.jpg"
      }
    ]
  },
  eveningRitual: {
    tag: "THE EVENING RITUAL",
    title: "Let your skin",
    titleItalic: "unwind for the night",
    description: "Three quiet steps, five minutes, and a texture your skin will look forward to. Layer each formula to reset stressed skin and wake up visibly calmer.",
    steps: [
      {
        number: "01",
        name: "Cleanse",
        tag: "pH 5.5",
        title: "Cloud Melt Cleansing Gel",
        description: "A cushiony gel that melts away SPF and city air without stripping. Ceramides and oat protein keep skin soft and quietly hydrated.",
        bullets: [
          "Removes makeup in one rinse",
          "Ophthalmologist tested for eye area"
        ],
        price: "$29",
        size: "120 ml"
      },
      {
        number: "02",
        name: "Treat",
        tag: "Night-active",
        title: "Lumina Barrier Serum",
        description: "A featherlight serum with calming algae and niacinamide to visibly ease redness while supporting your skin’s barrier overnight.",
        bullets: [
          "10% glycerin for deep hydration",
          "3% niacinamide to even tone"
        ],
        price: "$42",
        size: "30 ml"
      },
      {
        number: "03",
        name: "Seal",
        tag: "Rich but breathable",
        title: "Velvet Lock Moisture Cream",
        description: "A soft, velvet-finish cream with squalane and shea that cocoons the skin, helping to reduce transepidermal water loss as you sleep.",
        bullets: [
          "Ideal for sensitive and combination skin",
          "Non-comedogenic, tested on reactive skin"
        ],
        price: "$38",
        size: "50 ml"
      }
    ],
    highlight: {
      image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2e5380fe-71ef-461a-9057-bc8092cbffff_1600w.webp",
      tag: "RESULTS YOU CAN FEEL",
      title: "84% woke up with calmer-looking skin",
      description: "In a four-week independent study, most participants reported visibly reduced redness, less tightness after cleansing, and a smoother canvas for morning SPF and makeup.",
      stats: [
        { label: "Reduced visible redness", value: "-31% after 2 weeks" },
        { label: "Barrier strength", value: "+27% hydration" }
      ],
      note: "52 participants with self-identified sensitive skin. Results are self-reported and may vary."
    }
  },
  numbers: {
    title: "The Numbers",
    titleItalic: "behind quiet skin",
    description: "A calm barrier shows up in the data first. These are the results our community sees after making the nightly ritual a habit.",
    note: "Strategy, science, and consistency—your skin’s long-term support system, bottled.",
    stats: [
      {
        tag: "COMMUNITY",
        value: "180k",
        label: "Nightly rituals completed",
        description: "From first cleanse to final cream, over one hundred eighty thousand evening routines have been logged by our most consistent customers."
      },
      {
        tag: "SKIN COMFORT",
        value: "93",
        unit: "%",
        label: "Less dryness reported",
        description: "After 6 weeks, ninety-three percent of users noticed fewer dry patches and a softer, more even texture."
      },
      {
        tag: "ROUTINE LOYALTY",
        value: "27",
        unit: "days",
        label: "Average streak length",
        description: "Most members stay with their ritual for at least twenty-seven consecutive nights before switching or adding new steps."
      }
    ]
  },
  shop: {
    tag: "SHOP THE RITUAL",
    title: "Build a routine",
    titleItalic: "that actually fits",
    description: "Start with something new, or anchor your ritual with the formulas our community refuses to skip.",
    newArrivals: [
      {
        tag: "Just launched",
        title: "Midnight Recovery Mask",
        description: "An overnight gel-cream mask with microalgae and beta-glucan to visibly soften morning redness.",
        price: "$54",
        size: "60 ml",
        note: "Ideal 2–3 nights per week",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/95221975-49b7-4db6-a8fe-15f9a78f1303_800w.webp"
      },
      {
        tag: "Limited run",
        title: "Velvet Oil Cleanser",
        description: "A cushiony first cleanse with meadowfoam and plum oil that rinses clean without a separate washcloth.",
        price: "$36",
        size: "150 ml",
        note: "Best for dry & reactive skin",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1d661cf7-dc20-4e73-b462-15d75ebcce7f_800w.jpg"
      },
      {
        tag: "New shade-safe",
        title: "Daylight Dew SPF 30",
        description: "Mineral SPF that disappears on every undertone and layers smoothly under makeup or bare skin.",
        price: "$48",
        size: "50 ml",
        note: "No white cast, zero fragrance",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c18290e4-e8fb-4831-9a08-0dc9f7fea7d2_800w.jpg"
      }
    ],
    topProducts: [
      {
        tag: "BESTSELLER",
        title: "Lumina Barrier Serum",
        description: "The nightly essential that anchors most of our routines, now with 10% glycerin and calming botanicals.",
        price: "$42",
        size: "30 ml",
        rating: 4.9,
        reviews: "1,203",
        quote: "“This is the only serum that calms my cheeks after a long day in office air.”",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg"
      },
      {
        tag: "MOST LOVED CLEANSER",
        title: "Cloud Melt Cleansing Gel",
        description: "A low-foam, pH-balanced gel that removes SPF and city air without leaving your skin tight.",
        price: "$29",
        size: "120 ml",
        rating: 4.8,
        reviews: "839",
        quote: "“Feels like water, cleans like a dream. My barrier finally feels quiet again.”",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b2edfce5-c681-4885-a065-002de436d9b4_800w.jpg"
      },
      {
        tag: "NIGHT CREAM",
        title: "Velvet Lock Moisture Cream",
        description: "A breathable but cocooning cream that seals in hydration and helps reduce overnight moisture loss.",
        price: "$38",
        size: "50 ml",
        rating: 4.9,
        reviews: "612",
        quote: "“My face still feels cushioned in the morning, but never greasy. Instant repurchase.”",
        image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/335dee2e-eeef-4292-8168-ea58d3eeca44_800w.jpg"
      }
    ]
  },
  cta: {
    tag: "START TONIGHT",
    title: "Ready to give your skin",
    titleItalic: "the quiet it’s asking for?",
    description: "Answer a few questions and we’ll build a gentle, step-by-step ritual that fits your skin, your time, and your budget—no 10-step overwhelm required.",
    bullets: [
      "Dermatologist reviewed routines",
      "No subscription required"
    ],
    sampleRitual: {
      tag: "SAMPLE RITUAL",
      subtitle: "For reactive, city-stressed skin",
      time: "~5 min",
      stepsCount: "3 steps",
      steps: [
        {
          number: "01",
          name: "Cleanse",
          product: "Cloud Melt Cleansing Gel",
          description: "Rinse away SPF and buildup without the post-wash tightness."
        },
        {
          number: "02",
          name: "Treat",
          product: "Lumina Barrier Serum",
          description: "Target visible redness and restore suppleness with barrier-supporting actives."
        },
        {
          number: "03",
          name: "Seal",
          product: "Velvet Lock Moisture Cream",
          description: "Lock in hydration overnight without clogging pores or heaviness."
        }
      ],
      stats: {
        avatars: [
          "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4cd168c2-063d-4fc6-9a8b-e7dc29079fbb_320w.webp",
          "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e54a682e-0572-4963-acad-3fef8c475181_320w.webp",
          "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a99bb2ef-7049-4322-b3d5-5c763f91718f_320w.webp"
        ],
        count: "2,304",
        text: "people built their ritual in the last 30 days.",
        note: "You can adjust or skip any step—your skin, your pace."
      }
    }
  },
  footer: {
    description: "Gentle, clinically-minded rituals for skin that’s easily overwhelmed.",
    links: [
      { label: "Ingredients", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" }
    ]
  },
  productDetails: <Product>{
    id: "prod_1",
    name: "Lumina Glow Serum",
    slug: "lumina-glow-serum",
    description: "<p>A powerful, lightweight serum that brightens and evens skin tone while providing deep hydration. Formulated with clinical-grade Vitamin C and Hyaluronic Acid.</p><p>Our award-winning formula absorbs instantly, leaving a radiant, dewy finish without any sticky residue.</p>",
    shortDescription: "Brightening and evening serum for a radiant complexion.",
    proTip: "Apply to slightly damp skin immediately after cleansing for maximum absorption and hydration.",
    primaryCategory: "face",
    formulationType: "serum",
    basePrice: 45.00,
    compareAtPrice: 55.00,
    applicationInstructions: [
      "Cleanse face thoroughly and pat dry.",
      "Apply 2-3 drops to the palms of your hands.",
      "Gently press into the face and neck.",
      "Follow with your favorite moisturizer."
    ],
    warnings: ["For external use only.", "Avoid direct contact with eyes. If contact occurs, rinse thoroughly with water."],
    contraindications: ["Do not use in the same routine as strong exfoliating acids (AHA/BHA) or retinol to avoid irritation."],
    pregnancySafe: true,
    routineStep: 2,
    timeOfDay: "both",
    shelfLifeMonths: 24,
    periodAfterOpeningMonths: 12,
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    isVegan: true,
    isCrueltyFree: true,
    isFragranceFree: true,
    isReefSafe: false,
    isOrganic: true,
    isNatural: true,
    isGlutenFree: true,
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    variants: [
      { id: "v1", sku: "LGS-30", name: "30ml", price: 45.00, compareAtPrice: 55.00, stockQuantity: 15, isActive: true, displayOrder: 1, attributes: [{ attributeType: "size", value: "30ml" }], images: [] },
      { id: "v2", sku: "LGS-50", name: "50ml", price: 65.00, compareAtPrice: null, stockQuantity: 2, isActive: true, displayOrder: 2, attributes: [{ attributeType: "size", value: "50ml" }], images: [] },
      { id: "v3", sku: "LGS-100", name: "100ml", price: 110.00, compareAtPrice: 130.00, stockQuantity: 0, isActive: true, displayOrder: 3, attributes: [{ attributeType: "size", value: "100ml" }], images: [] }
    ],
    images: [
      { id: "img1", imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg", altText: "Lumina Glow Serum Bottle", isPrimary: true, displayOrder: 1 },
      { id: "img2", imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7d30ad3a-ffbc-427c-8120-a79ae8b3da6d_1600w.webp", altText: "Lumina Glow Serum Texture", isPrimary: false, displayOrder: 2 },
      { id: "img3", imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c396622e-2acf-40fd-a5de-4e0448603187_800w.jpg", altText: "Lumina Glow Serum Application", isPrimary: false, displayOrder: 3 },
      { id: "img4", imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2e5380fe-71ef-461a-9057-bc8092cbffff_1600w.webp", altText: "Lumina Glow Serum Lifestyle", isPrimary: false, displayOrder: 4 }
    ],
    averageRating: 4.8,
    reviewCount: 124,
    reviews: [
      {
        id: "rev1",
        reviewerName: "Sarah M.",
        rating: 5,
        date: "2026-03-15",
        comment: "This serum completely changed my skin texture. I've struggled with redness for years, and within two weeks of using this, my skin looks so much calmer and brighter. The texture is lightweight and absorbs instantly."
      },
      {
        id: "rev2",
        reviewerName: "Elena R.",
        rating: 4,
        date: "2026-02-28",
        comment: "Really lovely product. It feels very soothing going on and doesn't pill under my moisturizer or makeup. Taking off one star because I wish the bottle was slightly larger for the price, but the formula itself is fantastic."
      },
      {
        id: "rev3",
        reviewerName: "Jessica T.",
        rating: 5,
        date: "2026-01-10",
        comment: "Holy grail status! I have extremely reactive skin and this is one of the few active serums that doesn't cause a flare-up. It gives a beautiful, healthy glow."
      }
    ],
    faceDetails: { skinTypes: ["all", "dry", "combination", "oily"], spf: null, isNonComedogenic: true, isHypoallergenic: true, retinoidStrength: null, acidPercentage: "15%" },
    ingredients: [
      { id: "ing1", inciName: "Ascorbic Acid", commonName: "Vitamin C", description: "A potent antioxidant that brightens skin and boosts collagen production.", displayOrder: 1, isKeyIngredient: true, concentration: "15%", isFragrance: false, isComedogenic: false, ewgScore: 1 },
      { id: "ing2", inciName: "Sodium Hyaluronate", commonName: "Hyaluronic Acid", description: "Draws moisture into the skin for deep, lasting hydration.", displayOrder: 2, isKeyIngredient: true, concentration: "2%", isFragrance: false, isComedogenic: false, ewgScore: 1 },
      { id: "ing3", inciName: "Niacinamide", commonName: "Vitamin B3", description: "Improves skin texture and reduces the appearance of pores.", displayOrder: 3, isKeyIngredient: true, concentration: "5%", isFragrance: false, isComedogenic: false, ewgScore: 1 },
      { id: "ing4", inciName: "Water", commonName: "Water", description: "Solvent.", displayOrder: 4, isKeyIngredient: false, concentration: null, isFragrance: false, isComedogenic: false, ewgScore: 1 },
      { id: "ing5", inciName: "Glycerin", commonName: "Glycerin", description: "Humectant.", displayOrder: 5, isKeyIngredient: false, concentration: null, isFragrance: false, isComedogenic: false, ewgScore: 1 }
    ],
    relatedProducts: [
      { relatedProductId: "rp1", relationshipType: "Complete the Routine", note: "Pairs well with", displayOrder: 1, product: { name: "Cloud Melt Cleansing Gel", slug: "hydrating-cleanser", basePrice: 29.00, images: [{ imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/b2edfce5-c681-4885-a065-002de436d9b4_800w.jpg", altText: "Cleanser" }] } },
      { relatedProductId: "rp2", relationshipType: "Complete the Routine", note: "Pairs well with", displayOrder: 2, product: { name: "Velvet Lock Moisture Cream", slug: "rich-moisturizer", basePrice: 38.00, images: [{ imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/335dee2e-eeef-4292-8168-ea58d3eeca44_800w.jpg", altText: "Moisturizer" }] } },
      { relatedProductId: "rp3", relationshipType: "Similar Products", note: "You might also like", displayOrder: 3, product: { name: "Midnight Recovery Mask", slug: "niacinamide-toner", basePrice: 54.00, images: [{ imageUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/95221975-49b7-4db6-a8fe-15f9a78f1303_800w.webp", altText: "Mask" }] } }
    ]
  }
};
