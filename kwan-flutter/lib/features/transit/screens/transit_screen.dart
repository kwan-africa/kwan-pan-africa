import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class TransitScreen extends StatefulWidget {
  const TransitScreen({super.key});

  @override
  State<TransitScreen> createState() => _TransitScreenState();
}

class _TransitScreenState extends State<TransitScreen> {
  int _fromIndex = 0;
  int _toIndex = 3;

  static const _stations = [
    _Station('Achimota Station', 'Northern terminus · Trotros to Circle & beyond', '🚉'),
    _Station('37 Station', 'Airport Road junction · Tema & East Legon routes', '🚌'),
    _Station('Circle (Nkrumah Circle)', 'Central hub · All routes pass here', '🔵'),
    _Station('Osu / Oxford Street', 'Tourist district · Arts & Nightlife', '🏙️'),
    _Station('Kaneshie Market', 'Western routes · Kasoa & Cape Coast buses', '🛒'),
    _Station('Madina Station', 'Eastern routes · Adenta & Pantang', '🗺️'),
  ];

  static const _routes = [
    _TrotroRoute(
      from: 'Achimota', to: 'Circle',
      fare: 'GHS 4', duration: '20–30 min',
      handSignal: 'Index finger pointing forward ✋',
      stops: ['Achimota', 'Accra Mall flyover', 'Legon Junction', 'Circle'],
      tip: 'Board from the main covered bay. Say "Circle, Circle" and hold one finger up.',
    ),
    _TrotroRoute(
      from: 'Circle', to: 'Osu',
      fare: 'GHS 3', duration: '10–15 min',
      handSignal: 'Two fingers sideways — like a peace sign turned sideways ✌️',
      stops: ['Circle', 'Danquah Circle', 'Osu Oxford Street'],
      tip: 'Board from the yellow painted bay. Ask "Osu?" before entering. Total Circle→Osu: GHS 3.',
    ),
    _TrotroRoute(
      from: 'Achimota', to: 'Osu (full route)',
      fare: 'GHS 6 total', duration: '35–45 min',
      handSignal: 'One finger (Achimota→Circle) · Peace sign (Circle→Osu)',
      stops: ['Achimota', 'Circle', 'Osu Oxford Street'],
      tip: 'Change at Circle. Total cost GHS 4 + GHS 3 = GHS 7 max. Far cheaper than Bolt (~GHS 60+).',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppTheme.background,
            surfaceTintColor: Colors.transparent,
            expandedHeight: 140,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              title: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.transportColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppTheme.transportColor.withValues(alpha: 0.25)),
                  ),
                  child: const Text('🚌 TROTRO NAVIGATOR',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.transportColor, letterSpacing: 1.2)),
                ),
                const SizedBox(height: 6),
                const Text('Navigate Accra locally',
                    style: TextStyle(
                        fontFamily: 'Outfit', fontSize: 22,
                        fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              ]),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              child: Text(
                  'Trotro costs GHS 3–8 vs Bolt\'s GHS 40–80. Use this guide to travel like a local and save 90%.',
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 13,
                      color: AppTheme.textSecondary, height: 1.6)),
            ),
          ),
          // Route cards
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _RouteCard(route: _routes[i]),
                childCount: _routes.length,
              ),
            ),
          ),
          // Hand signal legend
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('HAND SIGNAL GUIDE',
                    style: TextStyle(
                        fontFamily: 'Outfit', fontSize: 11,
                        fontWeight: FontWeight.w700, color: AppTheme.textMuted,
                        letterSpacing: 1.2)),
                const SizedBox(height: 10),
                _SignalRow('☝️', 'One finger up',
                    'Short route (e.g. Achimota→Circle, fare: GHS 4)'),
                _SignalRow('✌️', 'Two fingers sideways',
                    'Mid route (e.g. Circle→Osu, fare: GHS 3)'),
                _SignalRow('👋', 'Open hand wave',
                    'Long route (e.g. Circle→Kaneshie, fare: GHS 5–8)'),
                _SignalRow('🤚', 'Stop — palm forward',
                    'Tell the mate you want to alight at the next stop'),
              ]),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}

class _Station {
  final String name, description, icon;
  const _Station(this.name, this.description, this.icon);
}

class _TrotroRoute {
  final String from, to, fare, duration, handSignal, tip;
  final List<String> stops;
  const _TrotroRoute({required this.from, required this.to,
      required this.fare, required this.duration, required this.handSignal,
      required this.stops, required this.tip});
}

class _RouteCard extends StatefulWidget {
  final _TrotroRoute route;
  const _RouteCard({required this.route});

  @override
  State<_RouteCard> createState() => _RouteCardState();
}

class _RouteCardState extends State<_RouteCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: AppTheme.radiusMd,
          border: Border.all(
              color: _expanded ? AppTheme.transportColor : AppTheme.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              // From → To
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Row(children: [
                  Text(widget.route.from,
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 15,
                          fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Icons.arrow_forward_rounded,
                        size: 16, color: AppTheme.textMuted),
                  ),
                  Text(widget.route.to,
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 15,
                          fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                ]),
                const SizedBox(height: 4),
                Row(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(widget.route.fare,
                        style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 11,
                            fontWeight: FontWeight.w700, color: AppTheme.secondary)),
                  ),
                  const SizedBox(width: 8),
                  Text('· ${widget.route.duration}',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 11,
                          color: AppTheme.textMuted)),
                ]),
              ])),
              Icon(
                  _expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                  color: AppTheme.textMuted),
            ]),
          ),
          if (_expanded) ...[
            const Divider(color: AppTheme.border, height: 1),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Hand signal
                Row(children: [
                  const Text('👋', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Expanded(child: Text('Signal: ${widget.route.handSignal}',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 12,
                          color: AppTheme.textSecondary))),
                ]),
                const SizedBox(height: 10),
                // Stops
                const Text('STOPS', style: TextStyle(
                    fontFamily: 'Outfit', fontSize: 10,
                    fontWeight: FontWeight.w700, color: AppTheme.textMuted,
                    letterSpacing: 1)),
                const SizedBox(height: 6),
                Row(children: widget.route.stops.asMap().entries.map((e) {
                  final isLast = e.key == widget.route.stops.length - 1;
                  return Expanded(child: Row(children: [
                    Expanded(child: Column(children: [
                      Container(
                        width: 8, height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isLast
                              ? AppTheme.secondary
                              : AppTheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(e.value,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              fontFamily: 'Outfit', fontSize: 9,
                              color: AppTheme.textSecondary)),
                    ])),
                    if (!isLast) Expanded(
                      child: Container(height: 2,
                          color: AppTheme.border, margin: const EdgeInsets.only(bottom: 14)),
                    ),
                  ]));
                }).toList()),
                const SizedBox(height: 10),
                // Tip
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: AppTheme.primary.withValues(alpha: 0.15)),
                  ),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    const Text('💡', style: TextStyle(fontSize: 12)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(widget.route.tip,
                        style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 11,
                            color: AppTheme.textSecondary, height: 1.55))),
                  ]),
                ),
              ]),
            ),
          ],
        ]),
      ),
    );
  }
}

Widget _SignalRow(String emoji, String signal, String meaning) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(emoji, style: const TextStyle(fontSize: 20)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(signal, style: const TextStyle(
            fontFamily: 'Outfit', fontSize: 13, fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary)),
        Text(meaning, style: const TextStyle(
            fontFamily: 'Outfit', fontSize: 11, color: AppTheme.textSecondary)),
      ])),
    ]),
  );
}
