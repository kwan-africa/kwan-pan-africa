import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/itinerary_model.dart';
import 'package:share_plus/share_plus.dart';

class ItineraryViewScreen extends StatefulWidget {
  final ItineraryModel itinerary;
  const ItineraryViewScreen({super.key, required this.itinerary});

  @override
  State<ItineraryViewScreen> createState() => _ItineraryViewScreenState();
}

class _ItineraryViewScreenState extends State<ItineraryViewScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  // ignore: unused_field
  int _selectedDay = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: widget.itinerary.days.length,
      vsync: this,
    );
    _tabController.addListener(() {
      setState(() => _selectedDay = _tabController.index);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final it = widget.itinerary;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // ── Hero App Bar ──────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 240,
            floating: false,
            pinned: true,
            backgroundColor: AppTheme.background,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
              color: AppTheme.textSecondary,
              onPressed: () => context.pop(),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_outlined, size: 20),
                color: AppTheme.textSecondary,
                onPressed: () => Share.share(
                  'Check out my Kwan-planned trip to ${it.destination}! Generated with Kwan AI 🌍',
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppTheme.background,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 80, 24, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      AppTheme.sectionBadge('${it.totalDays}-Day Concierge Path'),
                      const SizedBox(height: 10),
                      Text(
                        it.destination,
                        style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 34,
                          fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                          letterSpacing: -1.0,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Clean stat row — no gold borders, just text with icons
                      Row(
                        children: [
                          _StatItem(
                            icon: Icons.attach_money_rounded,
                            label: '\$${it.estimatedTotalCostUsd.toStringAsFixed(0)} total',
                          ),
                          const SizedBox(width: 20),
                          _StatItem(
                            icon: Icons.directions_walk_rounded,
                            label: it.pace.toLowerCase().replaceAll('_', ' '),
                          ),
                          const SizedBox(width: 20),
                          _StatItem(
                            icon: Icons.savings_outlined,
                            label: '~82% cheaper',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(48),
              child: Container(
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
                ),
                child: TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  labelColor: AppTheme.primary,
                  unselectedLabelColor: AppTheme.textMuted,
                  indicatorColor: AppTheme.primary,
                  indicatorWeight: 2,
                  indicatorSize: TabBarIndicatorSize.label,
                  dividerColor: Colors.transparent,
                  labelStyle: const TextStyle(
                    fontFamily: 'Outfit', fontWeight: FontWeight.w700, fontSize: 13,
                  ),
                  unselectedLabelStyle: const TextStyle(
                    fontFamily: 'Outfit', fontWeight: FontWeight.w400, fontSize: 13,
                  ),
                  tabs: it.days.map((d) => Tab(text: 'Day ${d.dayNumber}')).toList(),
                ),
              ),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: it.days.map((day) => _DayView(day: day, destination: it.destination)).toList(),
        ),
      ),

      // ── Transport FAB ──────────────────────────────────────────────────────
      floatingActionButton: GestureDetector(
        onTap: () => _showTransportSheet(context, it),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: AppTheme.radiusLg,
            border: Border.all(color: AppTheme.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.directions_bus_outlined, color: AppTheme.textSecondary, size: 18),
              SizedBox(width: 8),
              Text('Transit Fares',
                  style: TextStyle(
                    fontFamily: 'Outfit', color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600, fontSize: 14,
                  )),
            ],
          ),
        ),
      ),
    );
  }

  void _showTransportSheet(BuildContext context, ItineraryModel it) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: AppTheme.radiusLg),
      builder: (ctx) => _TransportSheet(summary: it.transportSummary),
    );
  }
}

// Clean text+icon stat — no chip border, just readable metadata
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppTheme.textMuted),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Outfit', fontSize: 12,
            color: AppTheme.textSecondary, fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ── Day View ───────────────────────────────────────────────────────────────────

class _DayView extends StatelessWidget {
  final DayPlanModel day;
  final String destination;
  const _DayView({required this.day, required this.destination});

  @override
  Widget build(BuildContext context) {
    final isLagos = destination.toLowerCase().contains('lagos');
    final hotelBenchmarkText = isLagos ? 'vs 5-Star City Benchmark (\$320/n)' : 'vs 5-Star City Benchmark (\$350/n)';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Day theme header — left gold accent bar, clean layout
          Container(
            width: double.infinity,
            clipBehavior: Clip.hardEdge,
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(width: 3, color: AppTheme.primary),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(day.theme,
                              style: const TextStyle(
                                fontFamily: 'Outfit', fontSize: 17,
                                fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                              )),
                          const SizedBox(height: 6),
                          Text(day.aiNarrative,
                              style: const TextStyle(
                                fontFamily: 'Outfit', fontSize: 13,
                                color: AppTheme.textSecondary, height: 1.6,
                              )),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Text(
                                '\$${day.estimatedDayCostUsd.toStringAsFixed(0)} USD today',
                                style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 13,
                                  fontWeight: FontWeight.w600, color: AppTheme.primary,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '~85% cheaper',
                                style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 11,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(duration: 400.ms),

          const SizedBox(height: 20),

          // Activity timeline
          ...day.activities.asMap().entries.map((entry) {
            final i = entry.key;
            final activity = entry.value;
            return _ActivityCard(
              activity: activity,
              isLast: i == day.activities.length - 1,
            ).animate(delay: (100 * i).ms).fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0);
          }),
        ],
      ),
    );
  }
}

// ── Activity Card ──────────────────────────────────────────────────────────────

class _ActivityCard extends StatelessWidget {
  final ActivityModel activity;
  final bool isLast;

  const _ActivityCard({required this.activity, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final catColor = AppTheme.categoryColor(activity.category);
    final catIcon = AppTheme.categoryIcon(activity.category);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline indicator
          SizedBox(
            width: 48,
            child: Column(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: catColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: catColor, width: 2),
                  ),
                  child: Icon(catIcon, color: catColor, size: 16),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: AppTheme.border,
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(width: 12),

          // Card content
          Expanded(
            child: Container(
              margin: EdgeInsets.only(bottom: isLast ? 0 : 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: AppTheme.radiusMd,
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Time slot + category badge
                  Row(
                    children: [
                      Text(
                        activity.timeSlot.toUpperCase(),
                        style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 10,
                          color: AppTheme.textMuted, letterSpacing: 1,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: catColor.withValues(alpha: 0.15),
                          borderRadius: AppTheme.radiusSm,
                        ),
                        child: Text(
                          activity.category.replaceAll('_', ' '),
                          style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 10,
                            color: catColor, fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),
                  Text(activity.title,
                      style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 16,
                        fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                      )),

                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(activity.operatorName,
                          style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 13,
                            color: AppTheme.textPrimary, fontWeight: FontWeight.w600,
                          )),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.secondary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.3)),
                        ),
                        child: const Text(
                          'Verified Local Host',
                          style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 10,
                            color: AppTheme.secondary, fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),
                  Text(activity.description,
                      style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 13,
                        color: AppTheme.textSecondary, height: 1.5,
                      )),

                  const SizedBox(height: 12),

                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 14, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(activity.location,
                            style: const TextStyle(
                              fontFamily: 'Outfit', fontSize: 12,
                              color: AppTheme.textMuted,
                            )),
                      ),
                    ],
                  ),

                  // Price
                  if (activity.priceUsd > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          '\$${activity.priceUsd.toStringAsFixed(0)}.00 USD',
                          style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 16,
                            fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '≈ ${activity.localCurrency} ${activity.priceLocal.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 12,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],

                  // Dialect phrase
                  if (activity.dialectPhrase != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.secondary.withValues(alpha: 0.1),
                        borderRadius: AppTheme.radiusSm,
                        border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.record_voice_over_outlined,
                              size: 14, color: AppTheme.secondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              activity.dialectPhrase!,
                              style: const TextStyle(
                                fontFamily: 'Outfit', fontSize: 12,
                                color: AppTheme.secondary, fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Local tips (Clean text without emojis)
                  if (activity.localTips.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    ...activity.localTips.map((tip) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('LOCAL HOST INSIDER TIP: ',
                                  style: TextStyle(
                                    fontFamily: 'Outfit', fontSize: 10,
                                    fontWeight: FontWeight.bold, color: AppTheme.primary,
                                  )),
                              Expanded(
                                child: Text(tip,
                                    style: const TextStyle(
                                      fontFamily: 'Outfit', fontSize: 12,
                                      color: AppTheme.textSecondary,
                                    )),
                              ),
                            ],
                          ),
                        )),
                  ],

                  // Action buttons
                  if (activity.isBookable || activity.whatsappContact != null) ...[
                    const SizedBox(height: 14),
                    const Divider(color: AppTheme.border),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (activity.isBookable && activity.listingId != null)
                          Expanded(
                            child: ElevatedButton.icon(
                              key: ValueKey('book-${activity.listingId}'),
                              onPressed: () => _bookNow(context, activity),
                              icon: const Icon(Icons.credit_card, size: 16),
                              label: const Text('Book This Stop'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                backgroundColor: AppTheme.primary,
                                foregroundColor: AppTheme.background,
                                textStyle: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        if (activity.isBookable && activity.whatsappContact != null)
                          const SizedBox(width: 8),
                        if (activity.whatsappContact != null)
                          Expanded(
                            child: OutlinedButton.icon(
                              key: ValueKey('wa-${activity.listingId}'),
                              onPressed: () => _openWhatsApp(activity.whatsappContact!),
                              icon: const Icon(Icons.chat_outlined, size: 16),
                              label: const Text('WhatsApp'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                textStyle: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _bookNow(BuildContext context, ActivityModel activity) {
    context.pushNamed('checkout', extra: {
      'listingId': activity.listingId,
      'listingTitle': activity.title,
      'priceUsd': activity.priceUsd,
      'operatorName': activity.operatorName,
      'whatsapp': activity.whatsappContact,
    });
  }

  Future<void> _openWhatsApp(String number) async {
    final uri = Uri.parse('https://wa.me/${number.replaceAll('+', '')}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }
}

// ── Transport Bottom Sheet with Multi-Modal Transit & Ride-Hailing Comparator ────────────────

class _TransportSheet extends StatelessWidget {
  final TransportSummaryModel? summary;
  const _TransportSheet({this.summary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Transit & Fare Comparator',
            style: TextStyle(
              fontFamily: 'Outfit', fontSize: 20,
              fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Compare local trotro buses, Pragya tuk-tuks, and Bolt / Uber.',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 13, color: AppTheme.textSecondary, height: 1.5),
          ),
          const SizedBox(height: 16),

          // Fare comparison grid
          Row(
            children: [
              Expanded(child: _TransitOptionCard(title: 'Trotro Bus', fare: '₵6.50 GHS', usd: '\$0.42 USD', note: 'Hand signals')),
              const SizedBox(width: 8),
              Expanded(child: _TransitOptionCard(title: 'Pragya Tuk-Tuk', fare: '₵20.00 GHS', usd: '\$1.29 USD', note: 'Market shuttle')),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _TransitOptionCard(title: 'Bolt / Yango', fare: '₵45.00 GHS', usd: '\$2.90 USD', note: 'Ride hailing')),
              const SizedBox(width: 8),
              Expanded(child: _TransitOptionCard(title: 'Uber Comfort', fare: '₵65.00 GHS', usd: '\$4.19 USD', note: 'AC private car')),
            ],
          ),

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close Transit Comparator'),
            ),
          ),
        ],
      ),
    );
  }
}

class _TransitOptionCard extends StatelessWidget {
  final String title;
  final String fare;
  final String usd;
  final String note;

  const _TransitOptionCard({
    required this.title, required this.fare,
    required this.usd, required this.note,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(fare, style: const TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          Text('$usd · $note', style: const TextStyle(fontFamily: 'Outfit', fontSize: 10, color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}
