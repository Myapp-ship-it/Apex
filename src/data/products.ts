export interface AffiliateLink {
  retailer: string;
  price: number;
  originalPrice?: number;
  couponCode?: string;
  link: string;
  inStock: boolean;
  isLowestPrice?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Audio & Sound' | 'Desk & Ergonomics' | 'Home & Coffee' | 'Photo & Video' | 'Travel & Bags';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  awardLabel?: string;
  image: string;
  shortVerdict: string;
  fullReview: string;
  testedHours: number;
  pros: string[];
  cons: string[];
  specs: ProductSpec[];
  affiliateLinks: AffiliateLink[];
  scoreBreakdown: {
    performance: number;
    buildQuality: number;
    valueForMoney: number;
    ergonomics: number;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: 'aurae-h1-headphones',
    title: 'Aurae H1 Over-Ear Wireless ANC Headphones',
    brand: 'Aurae Acoustics',
    category: 'Audio & Sound',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewsCount: 1840,
    awardLabel: "Editor's Choice",
    image: '/src/assets/images/product_headphones_pro_1792241538646.jpg',
    shortVerdict: 'Unrivaled noise isolation paired with natural, airy soundstage and all-day ear cup comfort.',
    fullReview: 'After 180 hours of rigorous acoustic testing on cross-country flights, crowded subways, and bustling open-plan offices, the Aurae H1 proved to be the most balanced wireless over-ear headphone we have tested this year. Its custom 40mm bio-cellulose drivers produce pristine midrange transparency without the boomy bass masking found in competitor headsets. The physical tactile dial for transparency mode is intuitive, and multi-point Bluetooth switching worked flawlessly across macOS and iOS devices.',
    testedHours: 180,
    pros: [
      'Industry-leading active noise cancellation with zero cabin-pressure hiss',
      '45-hour continuous battery life with USB-C quick charge (5 min = 4 hours)',
      'Plush memory foam ear cushions with genuine lambskin exterior',
      'Lossless USB-C audio DAC mode built right in'
    ],
    cons: [
      'Travel case is slightly bulkier than folding designs',
      'Companion app requires an account for custom 10-band EQ presets'
    ],
    specs: [
      { label: 'Driver Size', value: '40mm Custom Bio-Cellulose' },
      { label: 'Battery Life', value: '45 hours (ANC On), 60 hours (ANC Off)' },
      { label: 'Weight', value: '254g' },
      { label: 'Bluetooth Codecs', value: 'LDAC, AAC, aptX Adaptive, SBC' },
      { label: 'Connectivity', value: 'Bluetooth 5.4, 3.5mm Aux, USB-C Audio' }
    ],
    affiliateLinks: [
      {
        retailer: 'Amazon',
        price: 349.99,
        originalPrice: 399.99,
        couponCode: 'APEXAURAE15',
        link: 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'Best Buy',
        price: 359.99,
        originalPrice: 399.99,
        link: 'https://www.bestbuy.com/site/aurora-h1/6401928.p?aff=apexwire',
        inStock: true
      },
      {
        retailer: 'B&H Photo',
        price: 369.00,
        originalPrice: 399.99,
        link: 'https://www.bhphotovideo.com/c/product/aurora-h1?ref=apexwire',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.8,
      buildQuality: 9.6,
      valueForMoney: 9.2,
      ergonomics: 9.7
    }
  },
  {
    id: 'apex-pro-75-keyboard',
    title: 'Apex Pro 75 Anodized Aluminum Mechanical Keyboard',
    brand: 'Apex Foundry',
    category: 'Desk & Ergonomics',
    price: 189.00,
    originalPrice: 229.00,
    rating: 4.8,
    reviewsCount: 960,
    awardLabel: 'Best Typist Pick',
    image: '/src/assets/images/product_keyboard_studio_1792241539698.jpg',
    shortVerdict: 'Gasket-mounted acoustic dampening, CNC milled solid chassis, and ultra-smooth pre-lubed switches.',
    fullReview: 'For mechanical keyboard enthusiasts who dread spending weekends lubing individual switches, the Apex Pro 75 arrives as a ready-to-type masterpiece. The hefty CNC aluminum chassis sits like an anchor on the desk, eliminating ping and hollow resonance. The gasket mount dampeners provide a subtle flex that significantly cushions typing strain during 8-hour coding and writing sessions. It is QMK/VIA programmable out of the box with zero proprietary bloatware.',
    testedHours: 240,
    pros: [
      'Genuinely acoustically tuned with silicone and PORON dual-layer dampening',
      'Solid 1.8kg CNC aluminum casing with seamless anodized chamfers',
      'South-facing hot-swappable sockets compatible with 3-pin and 5-pin MX switches',
      'Multi-device 2.4GHz wireless dongle plus Bluetooth 5.2 and braided cable'
    ],
    cons: [
      'Weight makes it strictly a desk fixture, not travel-friendly',
      'No shine-through legends on the stock PBT dye-sub keycaps'
    ],
    specs: [
      { label: 'Layout', value: '75% Compact (82 keys + rotary encoder knob)' },
      { label: 'Mounting Style', value: 'Gasket Mount with FR4 Plate' },
      { label: 'Switches', value: 'Factory Pre-Lubed Linear Jade (45g actuation)' },
      { label: 'Keycaps', value: 'Thick 1.5mm Dye-Sub PBT Cherry Profile' },
      { label: 'Firmware', value: 'Open-source QMK / VIA support' }
    ],
    affiliateLinks: [
      {
        retailer: 'MechanicalKeyboards.com',
        price: 189.00,
        originalPrice: 229.00,
        couponCode: 'CLACK10',
        link: 'https://mechanicalkeyboards.com/shop/apex-pro-75?aff=apexwire',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'Amazon',
        price: 199.99,
        originalPrice: 229.00,
        link: 'https://www.amazon.com/dp/B0KB75PRO?tag=apexwire-20',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.5,
      buildQuality: 9.9,
      valueForMoney: 9.4,
      ergonomics: 9.3
    }
  },
  {
    id: 'ergoluxe-kinetix-chair',
    title: 'ErgoLuxe Kinetix Synchronous Mesh Task Chair',
    brand: 'ErgoLuxe Design',
    category: 'Desk & Ergonomics',
    price: 649.00,
    originalPrice: 799.00,
    rating: 4.9,
    reviewsCount: 712,
    awardLabel: 'Top Spine Health',
    image: '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
    shortVerdict: 'Adaptive lumbar tracking that eliminates lower back fatigue during marathon desk work.',
    fullReview: 'We had three team members with varying heights (5ft 4in to 6ft 3in) live in the ErgoLuxe Kinetix for 30 consecutive workdays. Unlike chairs that force you into an upright posture, the Kinetix fluidly adapts to your micromovements. The 4D armrests adjust smoothly in width, depth, pivot angle, and height, allowing elbows to rest at true neutral 90 degrees while typing. The breathable elastomer mesh stays cool without sagging even under sustained weight.',
    testedHours: 320,
    pros: [
      'Active dynamic lumbar wing system automatically supports sacrum and lower spine',
      'Breathable proprietary polymer mesh with 12-year warranty against sagging',
      'Polished solid aluminum wheelbase and heavy-duty class 4 pneumatic cylinder',
      'Seat pan depth adjustment accommodates petite to tall leg lengths'
    ],
    cons: [
      'Assembly takes approximately 25 minutes with included hex wrench',
      'Mesh feel may require 3-4 days of adjustment for folks used to memory foam pads'
    ],
    specs: [
      { label: 'Weight Capacity', value: '350 lbs (158 kg)' },
      { label: 'Recommended Height', value: '5\'2" to 6\'4" (157cm to 193cm)' },
      { label: 'Recline Range', value: '90° to 135° with 4 locking tilt stops' },
      { label: 'Armrest', value: '4-Directional Cushioned PU Polyurethane' },
      { label: 'Certifications', value: 'BIFMA Compliant, GREENGUARD Gold' }
    ],
    affiliateLinks: [
      {
        retailer: 'ErgoLuxe Direct',
        price: 649.00,
        originalPrice: 799.00,
        couponCode: 'SPINECRAFT50',
        link: 'https://ergoluxedesign.com/chairs/kinetix?ref=apexwire',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'Design Within Reach',
        price: 699.00,
        originalPrice: 799.00,
        link: 'https://www.dwr.com/workspace-chairs/kinetix?aff=apexwire',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.7,
      buildQuality: 9.8,
      valueForMoney: 9.0,
      ergonomics: 9.9
    }
  },
  {
    id: 'artisan-barista-pro-espresso',
    title: 'Artisan Barista Pro E61 Italian Espresso Machine',
    brand: 'Officina Craft',
    category: 'Home & Coffee',
    price: 1195.00,
    originalPrice: 1350.00,
    rating: 4.8,
    reviewsCount: 428,
    awardLabel: 'Barista Gold Award',
    image: '/src/assets/images/product_espresso_machine_1792241540159.jpg',
    shortVerdict: 'Commercial 58mm grouphead with walnut wood accents and lightning-fast dual thermoblock heating.',
    fullReview: 'Pulling café-tier espresso at home used to require a 25-minute warmup wait. The Artisan Barista Pro reaches 93°C extraction temperature in just 4 minutes thanks to its twin PID-regulated thermoblocks, one dedicated to continuous brewing and the other to dry 1.5-bar microfoam steam. In our extraction tests using light-roast Ethiopian Yirgacheffe, the 9-bar pre-infusion yielded sweet, viscous, tiger-striped crema that matched our local specialty coffee shop.',
    testedHours: 195,
    pros: [
      'Dual PID temperature control accurate to within ±0.5°C with digital display',
      'Solid commercial 58mm stainless steel portafilter with walnut wood handle',
      'Instant steam power capable of texturing silky microfoam in under 18 seconds',
      'Integrated extraction shot timer and illuminated grouphead LED'
    ],
    cons: [
      'Footprint requires 14 inches of vertical cabinet clearance',
      'Demands a capable burr grinder to truly shine'
    ],
    specs: [
      { label: 'Grouphead', value: 'Commercial Standard 58mm Brass' },
      { label: 'Water Reservoir', value: '2.5 Liters with low-water sensor' },
      { label: 'Pump', value: '15-Bar Italian Ulka Vibration Pump with OPV tuned to 9 bar' },
      { label: 'Body Construction', value: 'Brushed 304 Stainless Steel & American Walnut' },
      { label: 'Warmup Time', value: '4 minutes to brew temp' }
    ],
    affiliateLinks: [
      {
        retailer: 'Whole Latte Love',
        price: 1195.00,
        originalPrice: 1350.00,
        couponCode: 'BARISTA100',
        link: 'https://www.wholelattelove.com/products/artisan-barista-pro?ref=apexwire',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'Seattle Coffee Gear',
        price: 1249.00,
        originalPrice: 1350.00,
        link: 'https://www.seattlecoffeegear.com/artisan-pro?aff=apexwire',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.6,
      buildQuality: 9.7,
      valueForMoney: 8.9,
      ergonomics: 9.2
    }
  },
  {
    id: 'lumina-x30-camera',
    title: 'Lumina X-30 II Street Rangefinder Mirrorless Camera',
    brand: 'Lumina Optical',
    category: 'Photo & Video',
    price: 999.00,
    originalPrice: 1149.00,
    rating: 4.9,
    reviewsCount: 885,
    awardLabel: 'Best Street Camera',
    image: '/src/assets/images/product_mirrorless_camera_1792241540345.jpg',
    shortVerdict: 'Pocketable analog tactile dials, 26MP APS-C sensor, and film emulation modes that spark instant joy.',
    fullReview: 'In an era of smartphone computational photography that can feel sterile and over-sharpened, the Lumina X-30 II restores the pure craft of photography. The mechanical shutter speed dial and exposure compensation wheel on top click with tactile precision. Its proprietary film simulation recipes (Classic Chrome, Acros Black & White, Astia) output JPEGs so gorgeous straight out of camera that you will rarely feel the need to edit RAW files on a computer.',
    testedHours: 210,
    pros: [
      'Incredible film recipe colors that produce ready-to-share photos straight out of camera',
      'Ultra-compact form factor slips easily into a jacket pocket or small sling',
      'Fast hybrid phase-detect autofocus with reliable human eye and face tracking',
      'Crisp 3.69M-dot OLED electronic viewfinder with zero perceptible refresh lag'
    ],
    cons: [
      'No in-body image stabilization (IBIS); best paired with stabilized lenses for video',
      'Single UHS-II SD card slot instead of dual card slots'
    ],
    specs: [
      { label: 'Sensor', value: '26.1MP X-Trans CMOS 4 APS-C' },
      { label: 'Video Capability', value: '4K/30p 10-bit internal, Full HD 240fps slow-motion' },
      { label: 'Continuous Shooting', value: 'Up to 20 fps electronic shutter' },
      { label: 'Weight', value: '378g (including battery and SD card)' },
      { label: 'Screen', value: '2-way tilting 3.0-inch 1.62M-dot touchscreen' }
    ],
    affiliateLinks: [
      {
        retailer: 'B&H Photo Video',
        price: 999.00,
        originalPrice: 1149.00,
        couponCode: 'SHUTTER50',
        link: 'https://www.bhphotovideo.com/c/product/lumina-x30-ii?ref=apexwire',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'Amazon',
        price: 1049.00,
        originalPrice: 1149.00,
        link: 'https://www.amazon.com/dp/B0LUMINA30?tag=apexwire-20',
        inStock: true
      },
      {
        retailer: 'Adorama',
        price: 1049.00,
        originalPrice: 1149.00,
        link: 'https://www.adorama.com/lumx30ii.html?ref=apexwire',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.4,
      buildQuality: 9.8,
      valueForMoney: 9.3,
      ergonomics: 9.5
    }
  },
  {
    id: 'nomad-horizon-28l-backpack',
    title: 'Nomad Horizon 28L Weatherproof Travel Daypack',
    brand: 'Nomad Provisions',
    category: 'Travel & Bags',
    price: 185.00,
    originalPrice: 220.00,
    rating: 4.8,
    reviewsCount: 1290,
    awardLabel: 'Best Everyday Carry',
    image: '/src/assets/images/product_travel_backpack_1792241539966.jpg',
    shortVerdict: 'Clamshell suitcase opening, bombproof recycled Cordura, and a suspended tech compartment.',
    fullReview: 'We packed the Nomad Horizon 28L through rainstorms in Seattle and cramped European regional flights. The 840D recycled ballistic nylon shell with TPU coating shed heavy downpours with zero moisture penetrating the laptop compartment. The clamshell suitcase opening allows you to unpack clothes without digging from the top, while the top quick-access magnetic pocket holds passport, keys, and sunglasses securely.',
    testedHours: 175,
    pros: [
      'Fully suspended false-bottom 16-inch laptop pocket protects against accidental drops',
      'Pass-through luggage strap securely mounts horizontally on rolling luggage handles',
      'Concealed RFID-blocking passport pocket hidden against the lumbar mesh panel',
      'YKK AquaGuard weather-sealed zippers with silent corded pulls'
    ],
    cons: [
      'Water bottle pocket fits 26oz bottles snuggly, but 32oz insulated flasks are tight',
      'Minimalist exterior aesthetic has few external lash attachment points'
    ],
    specs: [
      { label: 'Capacity', value: '28 Liters (expandable to 31L)' },
      { label: 'Dimensions', value: '19.5" H x 12.5" W x 7.5" D' },
      { label: 'Weight', value: '1.28 kg (2.8 lbs)' },
      { label: 'Primary Fabric', value: '840D Recycled Ballistic Nylon with TPU Water-Repellent Coating' },
      { label: 'Laptop Sleeve', value: 'Fits up to 16" MacBook Pro / 15.6" Gaming Laptop' }
    ],
    affiliateLinks: [
      {
        retailer: 'Nomad Gear Direct',
        price: 185.00,
        originalPrice: 220.00,
        couponCode: 'NOMADHORIZON15',
        link: 'https://nomadgear.com/products/horizon-28l?ref=apexwire',
        inStock: true,
        isLowestPrice: true
      },
      {
        retailer: 'REI Co-op',
        price: 199.95,
        originalPrice: 220.00,
        link: 'https://www.rei.com/product/nomad-horizon-28l?ref=apexwire',
        inStock: true
      },
      {
        retailer: 'Amazon',
        price: 199.95,
        originalPrice: 220.00,
        link: 'https://www.amazon.com/dp/B0NOMAD28L?tag=apexwire-20',
        inStock: true
      }
    ],
    scoreBreakdown: {
      performance: 9.6,
      buildQuality: 9.7,
      valueForMoney: 9.5,
      ergonomics: 9.6
    }
  }
];

export const CATEGORIES = [
  'All Products',
  'Audio & Sound',
  'Desk & Ergonomics',
  'Home & Coffee',
  'Photo & Video',
  'Travel & Bags'
] as const;
