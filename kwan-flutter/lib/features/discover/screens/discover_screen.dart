import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/operator_model.dart';
import '../../core/router/app_router.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  OperatorCategory? _filter;

  List<KwanOperator> get _filtered => _filter == null
      ? kDemoOperators
      : kDemoOperators.where((o) => o.category == _filter).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          _buildEscrowBanner(),
          _buildFilters(),
          _buildOperatorGrid(),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildAppBar() => SliverAppBar(
        floating: true,
        backgroundColor: AppTheme.background,
        surfaceTintColor: Colors.transparent,
        expandedHeight: 120,
        collapsedHeight: 60,
        flexibleSpace: FlexibleSpaceBar(
          titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          title: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Good morning ✨',
                  style: TextStyle(
                      fontFamily: 'Outfit', fontSize: 12,
                      color: AppTheme.textSecondary)),
              const SizedBox(height: 2),
              RichText(
                text: const TextSpan(
                  style: TextStyle(fontFamily: 'Outfit'),
                  children: [
                    TextSpan(
                        text: 'Discover ',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary)),
                    TextSpan(
                        text: 'Accra',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.w700,
                            color: AppTheme.primary)),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16, top: 12, bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
            ),
            child: const Row(children: [
              Text('🇬🇭', style: TextStyle(fontSize: 14)),
              SizedBox(width: 4),
              Text('Accra, Ghana',
                  style: TextStyle(
                      fontFamily: 'Outfit', fontSize: 11,
                      color: AppTheme.primary, fontWeight: FontWeight.w600)),
            ]),
          ),
        ],
      );

  Widget _buildEscrowBanner() => SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppTheme.secondary.withValues(alpha: 0.08),
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.25)),
            ),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.secondary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.lock_outline,
                    color: AppTheme.secondary, size: 16),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('Kwan Smart Escrow',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 12,
                          fontWeight: FontWeight.w700, color: AppTheme.secondary)),
                  Text('Pay by card · Funds released to MoMo after your experience',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 11,
                          color: AppTheme.textSecondary)),
                ]),
              ),
            ]),
          ),
        ),
      );

  Widget _buildFilters() => SliverToBoxAdapter(
        child: SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            children: [
              _FilterChip(label: 'All', selected: _filter == null,
                  onTap: () => setState(() => _filter = null)),
              _FilterChip(label: '🪡 Artisan', selected: _filter == OperatorCategory.artisan,
                  onTap: () => setState(() => _filter = OperatorCategory.artisan)),
              _FilterChip(label: '🧭 Guide', selected: _filter == OperatorCategory.guide,
                  onTap: () => setState(() => _filter = OperatorCategory.guide)),
              _FilterChip(label: '🚌 Transit', selected: _filter == OperatorCategory.transit,
                  onTap: () => setState(() => _filter = OperatorCategory.transit)),
            ],
          ),
        ),
      );

  Widget _buildOperatorGrid() => SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (ctx, i) => _OperatorCard(operator: _filtered[i]),
            childCount: _filtered.length,
          ),
        ),
      );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────
class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primary : AppTheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: selected ? AppTheme.primary : AppTheme.border),
        ),
        child: Text(label,
            style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 12,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? AppTheme.background : AppTheme.textSecondary)),
      ),
    );
  }
}

// ─── Operator card ────────────────────────────────────────────────────────────
class _OperatorCard extends StatelessWidget {
  final KwanOperator operator;
  const _OperatorCard({required this.operator});

  @override
  Widget build(BuildContext context) {
    final cheapest = operator.experiences.reduce(
        (a, b) => a.priceUsd < b.priceUsd ? a : b);

    return GestureDetector(
      onTap: () => context.push('/operator/${operator.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: AppTheme.radiusMd,
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Hero
          Container(
            height: 140,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              gradient: LinearGradient(
                colors: [
                  AppTheme.primary.withValues(alpha: 0.12),
                  AppTheme.secondary.withValues(alpha: 0.08),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(children: [
              Center(child: Text(operator.heroEmoji,
                  style: const TextStyle(fontSize: 64))),
              // Verified badge
              if (operator.isVerified)
                Positioned(
                  top: 12, right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.secondary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(children: [
                      Icon(Icons.verified, color: Colors.white, size: 11),
                      SizedBox(width: 4),
                      Text('Verified',
                          style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 10,
                              fontWeight: FontWeight.w700, color: Colors.white)),
                    ]),
                  ),
                ),
              // Category tag
              Positioned(
                top: 12, left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.background.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Text(operator.categoryLabel,
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textSecondary)),
                ),
              ),
            ]),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(
                  child: Text(operator.name,
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 17,
                          fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                ),
                const SizedBox(width: 8),
                // Rating
                Row(children: [
                  const Icon(Icons.star_rounded, color: AppTheme.primary, size: 14),
                  const SizedBox(width: 3),
                  Text('${operator.rating}',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 13,
                          fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                  Text(' (${operator.totalReviews})',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 12,
                          color: AppTheme.textSecondary)),
                ]),
              ]),
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.location_on_outlined,
                    color: AppTheme.textMuted, size: 13),
                const SizedBox(width: 4),
                Text(operator.location,
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 12,
                        color: AppTheme.textMuted)),
              ]),
              const SizedBox(height: 10),
              Text(operator.bio,
                  maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 13,
                      color: AppTheme.textSecondary, height: 1.5)),
              const SizedBox(height: 12),
              // Bottom row
              Row(children: [
                // Price
                Expanded(child: RichText(
                  text: TextSpan(
                    style: const TextStyle(fontFamily: 'Outfit'),
                    children: [
                      const TextSpan(
                          text: 'From ',
                          style: TextStyle(
                              fontSize: 12, color: AppTheme.textMuted)),
                      TextSpan(
                          text: '\$${cheapest.priceUsd.toStringAsFixed(0)}',
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w800,
                              color: AppTheme.primary)),
                      const TextSpan(
                          text: ' USD',
                          style: TextStyle(
                              fontSize: 11, color: AppTheme.textMuted)),
                    ],
                  ),
                )),
                // MoMo indicator
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Row(children: [
                    const Text('📱',
                        style: TextStyle(fontSize: 11)),
                    const SizedBox(width: 4),
                    Text(operator.momoProvider,
                        style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textSecondary)),
                  ]),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: AppTheme.radiusSm,
                  ),
                  child: const Text('Book →',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.background)),
                ),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }
}
