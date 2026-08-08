import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';

// ── Provider ──────────────────────────────────────────────────────────────────

// In a real app, operatorId comes from auth. For demo, we use a fixed ID.
const _demoOperatorId = 'demo-operator-id';

final dashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiServiceProvider);
  return api.getOperatorDashboard(_demoOperatorId);
});

// ── Screen ─────────────────────────────────────────────────────────────────────

class OperatorDashboardScreen extends ConsumerWidget {
  const OperatorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashAsync = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: NestedScrollView(
        headerSliverBuilder: (ctx, _) => [
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppTheme.background,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded),
              onPressed: () => context.pop(),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
                tooltip: 'Add Listing',
                onPressed: () => context.pushNamed('add-listing', extra: _demoOperatorId),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
                padding: const EdgeInsets.fromLTRB(24, 80, 24, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text('Operator Hub',
                        style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 13,
                          color: AppTheme.primary, letterSpacing: 1,
                          fontWeight: FontWeight.w600,
                        )),
                    dashAsync.when(
                      data: (data) => Text(
                        data['operatorName'] ?? 'My Business',
                        style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 28,
                          fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                        ),
                      ),
                      loading: () => const Text('Loading...',
                          style: TextStyle(fontFamily: 'Outfit', fontSize: 28,
                              color: AppTheme.textMuted)),
                      error: (_, __) => const Text('Your Dashboard',
                          style: TextStyle(fontFamily: 'Outfit', fontSize: 28,
                              color: AppTheme.textPrimary)),
                    ),
                    dashAsync.when(
                      data: (data) => Text(
                        data['country'] ?? '',
                        style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        body: dashAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppTheme.primary),
          ),
          error: (err, _) => _ErrorState(
            message: err.toString(),
            onRetry: () => ref.invalidate(dashboardProvider),
          ),
          data: (data) => _DashboardContent(data: data),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.pushNamed('add-listing', extra: _demoOperatorId),
        backgroundColor: AppTheme.primary,
        icon: const Icon(Icons.add, color: AppTheme.background),
        label: const Text('Add Listing',
            style: TextStyle(
              fontFamily: 'Outfit', fontWeight: FontWeight.w700,
              color: AppTheme.background,
            )),
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  final Map<String, dynamic> data;
  const _DashboardContent({required this.data});

  @override
  Widget build(BuildContext context) {
    final listings = (data['listings'] as List<dynamic>? ?? []);
    final currency = data['currency'] ?? 'GHS';
    final revenue = (data['totalRevenueLocal'] as num?)?.toDouble() ?? 0.0;
    final bookings = (data['confirmedBookings'] as num?)?.toInt() ?? 0;
    final listingCount = (data['listingCount'] as num?)?.toInt() ?? 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Stats Row ─────────────────────────────────────────────────────
          Row(
            children: [
              Expanded(child: _StatCard(
                id: 'stat-revenue',
                label: 'Total Revenue',
                value: '$currency ${revenue.toStringAsFixed(0)}',
                icon: Icons.account_balance_wallet_outlined,
                color: AppTheme.primary,
                delay: 0,
              )),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(
                id: 'stat-bookings',
                label: 'Bookings',
                value: bookings.toString(),
                icon: Icons.confirmation_number_outlined,
                color: AppTheme.secondary,
                delay: 100,
              )),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(
                id: 'stat-listings',
                label: 'Listings',
                value: listingCount.toString(),
                icon: Icons.storefront_outlined,
                color: AppTheme.accent,
                delay: 200,
              )),
            ],
          ),

          const SizedBox(height: 28),

          // ── Kwan Insight Banner ───────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: AppTheme.radiusMd,
              boxShadow: AppTheme.goldGlow,
            ),
            child: Row(
              children: [
                const Text('🤖', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Kwan AI is working for you',
                          style: TextStyle(
                            fontFamily: 'Outfit', fontWeight: FontWeight.w700,
                            color: AppTheme.background, fontSize: 14,
                          )),
                      SizedBox(height: 4),
                      Text(
                        'Your listings are embedded in Kwan\'s AI. Every tourist who plans a trip to your city sees your business.',
                        style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 12,
                          color: AppTheme.background, height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate(delay: 300.ms).fadeIn(duration: 500.ms),

          const SizedBox(height: 28),

          // ── Listings ──────────────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('My Listings', style: Theme.of(context).textTheme.titleLarge),
              TextButton(
                onPressed: () {},
                child: const Text('Manage all',
                    style: TextStyle(color: AppTheme.primary, fontFamily: 'Outfit')),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (listings.isEmpty)
            _EmptyListings()
          else
            ...listings.asMap().entries.map((e) {
              final listing = e.value as Map<String, dynamic>;
              return _ListingCard(listing: listing, delay: e.key * 80);
            }),

          const SizedBox(height: 80), // FAB clearance
        ],
      ),
    );
  }
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  final String id;
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final int delay;

  const _StatCard({
    required this.id, required this.label, required this.value,
    required this.icon, required this.color, required this.delay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      key: ValueKey(id),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: AppTheme.radiusMd,
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 10),
          Text(value,
              style: TextStyle(
                fontFamily: 'Outfit', fontSize: 18,
                fontWeight: FontWeight.w700, color: color,
              )),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(
                fontFamily: 'Outfit', fontSize: 11,
                color: AppTheme.textMuted,
              )),
        ],
      ),
    ).animate(delay: delay.ms).fadeIn(duration: 400.ms).slideY(begin: 0.3, end: 0);
  }
}

// ── Listing Card ───────────────────────────────────────────────────────────────

class _ListingCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  final int delay;
  const _ListingCard({required this.listing, required this.delay});

  @override
  Widget build(BuildContext context) {
    final category = listing['category'] as String? ?? 'DAY_TOUR';
    final catColor = AppTheme.categoryColor(category);
    final catIcon = AppTheme.categoryIcon(category);
    final price = listing['priceAmount'] as num?;
    final currency = listing['priceCurrency'] as String? ?? 'GHS';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: AppTheme.radiusMd,
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: catColor.withValues(alpha: 0.15),
              borderRadius: AppTheme.radiusSm,
            ),
            child: Icon(catIcon, color: catColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(listing['title'] ?? '',
                    style: const TextStyle(
                      fontFamily: 'Outfit', fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    )),
                const SizedBox(height: 4),
                Text(
                  '${listing['city'] ?? ''} · ${category.replaceAll('_', ' ')}',
                  style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$currency ${price?.toStringAsFixed(0) ?? "—"}',
                style: const TextStyle(
                  fontFamily: 'Outfit', fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.secondary.withValues(alpha: 0.15),
                  borderRadius: AppTheme.radiusSm,
                ),
                child: Text(
                  (listing['isActive'] == true) ? 'Live' : 'Paused',
                  style: TextStyle(
                    fontFamily: 'Outfit', fontSize: 11, fontWeight: FontWeight.w600,
                    color: (listing['isActive'] == true)
                        ? AppTheme.secondary
                        : AppTheme.textMuted,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate(delay: delay.ms).fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0);
  }
}

// ── Empty State ────────────────────────────────────────────────────────────────

class _EmptyListings extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(40),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Text('🗺️', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          const Text('No listings yet',
              style: TextStyle(
                fontFamily: 'Outfit', fontSize: 18,
                fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
              )),
          const SizedBox(height: 8),
          const Text(
            'Add your first listing and Kwan AI will start recommending your business to travellers.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Outfit', fontSize: 14,
              color: AppTheme.textSecondary, height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: AppTheme.accent, size: 48),
          const SizedBox(height: 16),
          Text(message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textSecondary, fontFamily: 'Outfit')),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
