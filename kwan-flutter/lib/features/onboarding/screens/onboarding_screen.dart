import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),

                // ── Logo & Tagline ──────────────────────────────────────────
                _KwanLogo()
                    .animate()
                    .fadeIn(duration: 600.ms)
                    .slideY(begin: -0.2, end: 0),

                const SizedBox(height: 56),

                // ── Hero Text ───────────────────────────────────────────────
                Text(
                  'Your path through\nAfrica\'s real\neconomy.',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        height: 1.15,
                        foreground: Paint()
                          ..shader = const LinearGradient(
                            colors: [AppTheme.textPrimary, AppTheme.primary],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ).createShader(
                              const Rect.fromLTWH(0, 0, 300, 120)),
                      ),
                )
                    .animate(delay: 200.ms)
                    .fadeIn(duration: 700.ms)
                    .slideY(begin: 0.3, end: 0),

                const SizedBox(height: 16),

                Text(
                  'AI-powered. Mobile Money enabled.\nBuilt for the 90% the world ignores.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppTheme.textSecondary,
                        height: 1.6,
                      ),
                )
                    .animate(delay: 400.ms)
                    .fadeIn(duration: 700.ms)
                    .slideY(begin: 0.3, end: 0),

                const Spacer(),

                // ── Feature Pills ───────────────────────────────────────────
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _FeaturePill('🚌 Trotros & Matatus'),
                    _FeaturePill('🛒 Local Markets'),
                    _FeaturePill('📱 Mobile Money'),
                    _FeaturePill('💬 Dialect Translation'),
                    _FeaturePill('🏠 Homestays'),
                    _FeaturePill('🗺️ Community Tips'),
                  ],
                )
                    .animate(delay: 600.ms)
                    .fadeIn(duration: 700.ms),

                const SizedBox(height: 48),

                // ── CTA Buttons ─────────────────────────────────────────────
                Text(
                  'I am a...',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textMuted,
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w600,
                      ),
                ).animate(delay: 800.ms).fadeIn(),

                const SizedBox(height: 16),

                _RoleButton(
                  id: 'btn-tourist',
                  label: 'Traveller',
                  subtitle: 'I want to explore Africa authentically',
                  icon: Icons.explore_outlined,
                  onTap: () => context.pushNamed('plan'),
                )
                    .animate(delay: 900.ms)
                    .fadeIn(duration: 400.ms)
                    .slideX(begin: -0.3, end: 0),

                const SizedBox(height: 12),

                _RoleButton(
                  id: 'btn-operator',
                  label: 'Local Operator',
                  subtitle: 'I want to list my business & get bookings',
                  icon: Icons.storefront_outlined,
                  outlined: true,
                  onTap: () => context.pushNamed('operator-dashboard'),
                )
                    .animate(delay: 1000.ms)
                    .fadeIn(duration: 400.ms)
                    .slideX(begin: 0.3, end: 0),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Sub-widgets ────────────────────────────────────────────────────────────────

class _KwanLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: AppTheme.radiusSm,
            boxShadow: AppTheme.goldGlow,
          ),
          child: const Center(
            child: Text(
              'K',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppTheme.background,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Kwan',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            Text(
              'The Path · Kwan wo ho',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 11,
                color: AppTheme.primary.withValues(alpha: 0.8),
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _FeaturePill extends StatelessWidget {
  final String label;
  const _FeaturePill(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: AppTheme.radiusSm,
        border: Border.all(color: AppTheme.border),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Outfit',
          fontSize: 12,
          color: AppTheme.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String id;
  final String label;
  final String subtitle;
  final IconData icon;
  final bool outlined;
  final VoidCallback onTap;

  const _RoleButton({
    required this.id,
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        key: ValueKey(id),
        duration: const Duration(milliseconds: 150),
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: outlined ? null : AppTheme.primaryGradient,
          color: outlined ? Colors.transparent : null,
          borderRadius: AppTheme.radiusMd,
          border: outlined
              ? Border.all(color: AppTheme.primary.withValues(alpha: 0.5), width: 1.5)
              : null,
          boxShadow: outlined ? null : AppTheme.goldGlow,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: outlined ? AppTheme.primary : AppTheme.background,
              size: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: outlined ? AppTheme.textPrimary : AppTheme.background,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 13,
                      color: outlined
                          ? AppTheme.textSecondary
                          : AppTheme.background.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios_rounded,
              color: outlined ? AppTheme.primary : AppTheme.background,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
