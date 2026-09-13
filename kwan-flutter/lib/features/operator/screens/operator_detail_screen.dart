import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/operator_model.dart';
import '../../core/router/app_router.dart';

class OperatorDetailScreen extends StatelessWidget {
  final String operatorId;
  const OperatorDetailScreen({super.key, required this.operatorId});

  @override
  Widget build(BuildContext context) {
    final operator = kDemoOperators.firstWhere((o) => o.id == operatorId,
        orElse: () => kDemoOperators.first);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          _buildHeroBar(context, operator),
          SliverToBoxAdapter(child: _buildProfile(operator)),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
              child: Text('Available Experiences',
                  style: Theme.of(context).textTheme.headlineMedium),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _ExperienceCard(
                    experience: operator.experiences[i], operator: operator),
                childCount: operator.experiences.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }

  Widget _buildHeroBar(BuildContext context, KwanOperator op) =>
      SliverAppBar(
        backgroundColor: AppTheme.background,
        surfaceTintColor: Colors.transparent,
        expandedHeight: 200,
        pinned: true,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.border),
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded,
                size: 14, color: AppTheme.textPrimary),
          ),
          onPressed: () => context.pop(),
        ),
        flexibleSpace: FlexibleSpaceBar(
          background: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.primary.withValues(alpha: 0.15),
                  AppTheme.secondary.withValues(alpha: 0.1),
                ],
              ),
            ),
            child: Center(
              child: Text(op.heroEmoji, style: const TextStyle(fontSize: 80)),
            ),
          ),
        ),
      );

  Widget _buildProfile(KwanOperator op) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Name + verified
          Row(children: [
            Expanded(
              child: Text(op.name,
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 24,
                      fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            ),
            if (op.isVerified) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.secondary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.secondary.withValues(alpha: 0.3)),
                ),
                child: const Row(children: [
                  Icon(Icons.verified, color: AppTheme.secondary, size: 13),
                  SizedBox(width: 4),
                  Text('Ghana Card Verified',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.secondary)),
                ]),
              ),
            ],
          ]),
          const SizedBox(height: 6),
          Row(children: [
            const Icon(Icons.star_rounded, color: AppTheme.primary, size: 15),
            const SizedBox(width: 4),
            Text('${op.rating} · ${op.totalReviews} reviews',
                style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 13,
                    color: AppTheme.textSecondary)),
            const SizedBox(width: 12),
            const Icon(Icons.location_on_outlined,
                color: AppTheme.textMuted, size: 13),
            const SizedBox(width: 4),
            Text(op.location,
                style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 13,
                    color: AppTheme.textMuted)),
          ]),
          const SizedBox(height: 16),
          Text(op.bio,
              style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 15,
                  color: AppTheme.textSecondary, height: 1.7)),
          const SizedBox(height: 20),
          // MoMo trust card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(children: [
              const Text('💸', style: TextStyle(fontSize: 22)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Operator earns 90% of your booking',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary)),
                  Text(
                      'Paid to ${op.name.split(' ').first}\'s ${op.momoProvider} MoMo wallet 24h after your experience',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 11,
                          color: AppTheme.textSecondary)),
                ]),
              ),
            ]),
          ),
          const SizedBox(height: 20),
          const Divider(color: AppTheme.border),
          const SizedBox(height: 8),
        ]),
      );
}

// ─── Experience card ──────────────────────────────────────────────────────────
class _ExperienceCard extends StatelessWidget {
  final KwanExperience experience;
  final KwanOperator operator;
  const _ExperienceCard({required this.experience, required this.operator});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: AppTheme.radiusMd,
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(
                child: Text(experience.title,
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary)),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(experience.durationLabel,
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary)),
              ),
            ]),
            const SizedBox(height: 8),
            Text(experience.description,
                style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 13,
                    color: AppTheme.textSecondary, height: 1.6)),
            const SizedBox(height: 12),
            // Highlights
            Wrap(spacing: 6, runSpacing: 6, children: experience.highlights
                .map((h) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Text('✓ $h',
                          style: const TextStyle(
                              fontFamily: 'Outfit', fontSize: 11,
                              color: AppTheme.textSecondary)),
                    ))
                .toList()),
            const SizedBox(height: 14),
            // Why it matters
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.secondary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                    color: AppTheme.secondary.withValues(alpha: 0.15)),
              ),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                const Text('💚', style: TextStyle(fontSize: 12)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(experience.whyItMatters,
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 11,
                          color: AppTheme.textSecondary, height: 1.5)),
                ),
              ]),
            ),
          ]),
        ),
        // Footer CTA
        Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppTheme.border)),
          ),
          padding: const EdgeInsets.all(14),
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text('\$${experience.priceUsd.toStringAsFixed(0)} USD',
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary)),
                Text(
                    'Max ${experience.maxGroupSize} guests · '
                    '\$${experience.operatorEarningUsd.toStringAsFixed(2)} to operator',
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 10,
                        color: AppTheme.textMuted)),
              ]),
            ),
            ElevatedButton(
              onPressed: () => context.push(
                AppRoutes.booking,
                extra: {
                  'operatorId': operator.id,
                  'experienceId': experience.id,
                },
              ),
              child: const Text('Book Now'),
            ),
          ]),
        ),
      ]),
    );
  }
}
