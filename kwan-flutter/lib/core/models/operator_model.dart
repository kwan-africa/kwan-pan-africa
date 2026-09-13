/// Kwan MVP — Operator / Host data model
/// Represents a verified grassroots local operator (artisan, guide, transit)
library;

enum OperatorCategory { artisan, guide, transit, homestay }
enum ExperienceStyle { cultural, adventure, food, craft, transit }

class KwanOperator {
  final String id;
  final String name;
  final String bio;
  final String location;
  final OperatorCategory category;
  final bool isVerified;
  final double rating;
  final int totalReviews;
  final String momoNumber;       // MTN/Telecel MoMo number
  final String momoProvider;     // "MTN" | "Telecel"
  final List<KwanExperience> experiences;
  final String heroEmoji;

  const KwanOperator({
    required this.id,
    required this.name,
    required this.bio,
    required this.location,
    required this.category,
    required this.isVerified,
    required this.rating,
    required this.totalReviews,
    required this.momoNumber,
    required this.momoProvider,
    required this.experiences,
    required this.heroEmoji,
  });

  String get categoryLabel => switch (category) {
        OperatorCategory.artisan  => 'Artisan',
        OperatorCategory.guide    => 'Community Guide',
        OperatorCategory.transit  => 'Transit Operator',
        OperatorCategory.homestay => 'Homestay Host',
      };
}

class KwanExperience {
  final String id;
  final String title;
  final String description;
  final double priceUsd;
  final int durationMinutes;
  final ExperienceStyle style;
  final int maxGroupSize;
  final List<String> highlights;
  final String whyItMatters; // Lean Canvas: explains the value

  const KwanExperience({
    required this.id,
    required this.title,
    required this.description,
    required this.priceUsd,
    required this.durationMinutes,
    required this.style,
    required this.maxGroupSize,
    required this.highlights,
    required this.whyItMatters,
  });

  String get durationLabel {
    if (durationMinutes < 60) return '${durationMinutes}min';
    final h = durationMinutes ~/ 60;
    final m = durationMinutes % 60;
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  double get operatorEarningUsd => priceUsd * 0.90;  // 90% to operator
  double get kwanFeeUsd          => priceUsd * 0.10;  // 10% platform fee
}

// ─── DEMO SEED DATA (MVP validation — no backend needed) ──────────────────────

const List<KwanOperator> kDemoOperators = [
  KwanOperator(
    id: 'op_001',
    heroEmoji: '🪡',
    name: 'Adwoa Mensah',
    bio: 'Third-generation kente weaver from Bonwire. I learned from my grandmother and now teach visitors the meaning behind every pattern. My studio is inside Accra Arts Centre.',
    location: 'Accra Arts Centre, Accra',
    category: OperatorCategory.artisan,
    isVerified: true,
    rating: 4.9,
    totalReviews: 34,
    momoNumber: '0244XXXXXX',
    momoProvider: 'MTN',
    experiences: [
      KwanExperience(
        id: 'exp_001a',
        title: 'Kente Weaving Workshop',
        description: 'Learn to weave a traditional kente strip on a handloom. Understand the stories behind the colours — gold for royalty, green for growth, black for maturity. Take your woven strip home.',
        priceUsd: 45,
        durationMinutes: 120,
        style: ExperienceStyle.craft,
        maxGroupSize: 4,
        highlights: ['Hands-on loom weaving', 'Pattern symbolism explained', 'Take your strip home', 'Refreshments included'],
        whyItMatters: 'Adwoa earns \$40.50 directly to her MTN MoMo wallet — 2.5× what she\'d earn through an agency middleman.',
      ),
      KwanExperience(
        id: 'exp_001b',
        title: 'Market Tour & Craft Sourcing',
        description: 'Private tour of Accra Arts Centre with Adwoa as your guide. Learn how to negotiate respectfully, identify quality crafts, and understand fair pricing — no tourist tax.',
        priceUsd: 30,
        durationMinutes: 90,
        style: ExperienceStyle.cultural,
        maxGroupSize: 6,
        highlights: ['Skip tourist pricing', 'Negotiation coaching', 'Hidden workshop visits', 'No hidden fees'],
        whyItMatters: 'Travellers who do this tour spend 40% less on crafts and feel confident every purchase reaches the maker.',
      ),
    ],
  ),

  KwanOperator(
    id: 'op_002',
    heroEmoji: '🥊',
    name: 'Kofi Asante',
    bio: 'Born and raised in Jamestown. I run boxing heritage tours through the neighbourhood — the birthplace of Ghana\'s Olympic boxing tradition. I also organise weekly community fights for visitors.',
    location: 'Jamestown, Accra',
    category: OperatorCategory.guide,
    isVerified: true,
    rating: 5.0,
    totalReviews: 19,
    momoNumber: '0554XXXXXX',
    momoProvider: 'MTN',
    experiences: [
      KwanExperience(
        id: 'exp_002a',
        title: 'Jamestown Boxing Heritage Walk',
        description: 'Walk through the narrow streets of Jamestown with Kofi. Visit the historic Bukom Boxing Arena, meet active fighters, learn Ghana\'s boxing history, and end at a traditional chop bar.',
        priceUsd: 35,
        durationMinutes: 150,
        style: ExperienceStyle.cultural,
        maxGroupSize: 8,
        highlights: ['Bukom Boxing Arena access', 'Meet active fighters', 'Jamestown history & street art', 'Local chop bar lunch'],
        whyItMatters: 'No agency runs this tour. Kofi built it from scratch — every booking is \$31.50 straight to his MoMo.',
      ),
      KwanExperience(
        id: 'exp_002b',
        title: 'Sunrise Fishing Harbour & Lighthouse',
        description: 'Join Kofi at 5:30 AM to watch the Jamestown fishing boats come in with their catch. Walk to the colonial lighthouse for panoramic city views. Best photo spot in Accra.',
        priceUsd: 25,
        durationMinutes: 120,
        style: ExperienceStyle.cultural,
        maxGroupSize: 6,
        highlights: ['5:30 AM harbour arrival', 'Fresh fish market', 'British-era lighthouse', 'Sunrise panorama'],
        whyItMatters: 'This experience doesn\'t exist on Airbnb or Viator. Kwan makes it discoverable for the first time.',
      ),
    ],
  ),

  KwanOperator(
    id: 'op_003',
    heroEmoji: '🚌',
    name: 'Emmanuel Trotro Services',
    bio: 'Licensed trotro driver on the Achimota–Circle–Osu corridor since 2009. I offer guided trotro rides for tourists — teaching hand signals, negotiating fares, and navigating Accra like a local.',
    location: 'Achimota Station, Accra',
    category: OperatorCategory.transit,
    isVerified: true,
    rating: 4.7,
    totalReviews: 52,
    momoNumber: '0276XXXXXX',
    momoProvider: 'Telecel',
    experiences: [
      KwanExperience(
        id: 'exp_003a',
        title: 'Trotro Navigator: Achimota to Osu',
        description: 'Learn to ride trotro like a local. Emmanuel guides you from Achimota Station all the way to Oxford Street Osu — showing you the hand signals, correct fare (GHS 4, not GHS 20), and station etiquette.',
        priceUsd: 20,
        durationMinutes: 90,
        style: ExperienceStyle.transit,
        maxGroupSize: 4,
        highlights: ['Real trotro ride, not a taxi', 'Hand signal & fare coaching', 'Achimota → Circle → Osu route', 'Zero tourist overcharge'],
        whyItMatters: 'Tourists pay GHS 20–60 for Bolt every trip. This costs GHS 4 + \$20 guide fee. Net saving: \$15+ per journey.',
      ),
    ],
  ),

  KwanOperator(
    id: 'op_004',
    heroEmoji: '🫙',
    name: 'Ama\'s Bead Studio',
    bio: 'I make traditional Krobo glass beads — the same technique used for 200 years. My workshop is in Osu. I teach the history of bead trade in West Africa and help visitors create custom pieces.',
    location: 'Osu, Accra',
    category: OperatorCategory.artisan,
    isVerified: true,
    rating: 4.8,
    totalReviews: 27,
    momoNumber: '0201XXXXXX',
    momoProvider: 'MTN',
    experiences: [
      KwanExperience(
        id: 'exp_004a',
        title: 'Krobo Bead Making Workshop',
        description: 'Design and fire your own traditional Krobo beads using powdered glass and ancient moulds. Learn the history of bead trade from Ghana to the Caribbean. Take your beads home.',
        priceUsd: 40,
        durationMinutes: 120,
        style: ExperienceStyle.craft,
        maxGroupSize: 5,
        highlights: ['Design your own bead pattern', 'Kiln firing session', 'History of Krobo bead trade', 'Completed beads to take home'],
        whyItMatters: 'Ama earns \$36 per booking — more than 3× her daily cash foot traffic income from the stall.',
      ),
    ],
  ),
];
