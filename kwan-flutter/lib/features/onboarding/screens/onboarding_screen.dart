import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
                // ── Top nav bar ───────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spaceLg,
                    vertical: AppTheme.spaceMd,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const _KwanLogo()
                          .animate()
                          .fadeIn(duration: 500.ms),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppTheme.border),
                          borderRadius: AppTheme.radiusXl,
                        ),
                        child: const Text(
                          'v1.0',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ).animate().fadeIn(duration: 500.ms),
                    ],
                  ),
                ),

                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.spaceLg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: AppTheme.spaceXl),

                        // ── Section badge ─────────────────────────────────
                        AppTheme.sectionBadge('AI-Powered · Mobile Money')
                            .animate(delay: 100.ms)
                            .fadeIn(duration: 500.ms)
                            .slideY(begin: 0.2, end: 0),

                        const SizedBox(height: AppTheme.spaceMd),

                        // ── Hero headline ─────────────────────────────────
                        ShaderMask(
                          blendMode: BlendMode.srcIn,
                          shaderCallback: (bounds) =>
                              const LinearGradient(
                            colors: [
                              AppTheme.textPrimary,
                              Color(0xFFD4A832),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ).createShader(bounds),
                          child: Text(
                            'Your path\nthrough Africa.',
                            style: Theme.of(context)
                                .textTheme
                                .displayLarge
                                ?.copyWith(height: 1.04),
                          ),
                        )
                            .animate(delay: 200.ms)
                            .fadeIn(duration: 600.ms)
                            .slideY(begin: 0.15, end: 0),

                        const SizedBox(height: AppTheme.spaceMd),

                        // ── Sub-copy ──────────────────────────────────────
                        Text(
                          'Built for the 90% the world ignores.\nReal economy. Real operators. Real Africa.',
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge
                              ?.copyWith(
                                color: AppTheme.textSecondary,
                                height: 1.6,
                              ),
                        )
                            .animate(delay: 350.ms)
                            .fadeIn(duration: 600.ms)
                            .slideY(begin: 0.15, end: 0),

                        const SizedBox(height: AppTheme.spaceXl),

                        // ── Feature strip ─────────────────────────────────
                        const _FeatureStrip()
                            .animate(delay: 500.ms)
                            .fadeIn(duration: 500.ms),

                        const Spacer(),

                        // ── Role buttons ──────────────────────────────────
                        _RoleButton(
                          id: 'btn-tourist',
                          label: 'Traveller',
                          subtitle: 'Explore Africa authentically',
                          icon: Icons.explore_outlined,
                          isPrimary: true,
                          onTap: () => context.pushNamed('plan'),
                        )
                            .animate(delay: 650.ms)
                            .fadeIn(duration: 400.ms)
                            .slideY(begin: 0.15, end: 0),

                        const SizedBox(height: AppTheme.spaceSm),

                        _RoleButton(
                          id: 'btn-operator',
                          label: 'Local Operator',
                          subtitle: 'List your business & get bookings',
                          icon: Icons.storefront_outlined,
                          isPrimary: false,
                          onTap: () =>
                              context.pushNamed('operator-dashboard'),
                        )
                            .animate(delay: 750.ms)
                            .fadeIn(duration: 400.ms)
                            .slideY(begin: 0.15, end: 0),

                        const SizedBox(height: AppTheme.spaceLg),

                        // ── Legal footnote ─────────────────────────────────
                        Center(
                          child: Text(
                            'By continuing, you agree to our Terms & Privacy Policy.',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: AppTheme.textMuted),
                            textAlign: TextAlign.center,
                          ),
                        ).animate(delay: 850.ms).fadeIn(duration: 500.ms),

                        const SizedBox(height: AppTheme.spaceMd),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
    );
  }
}

// ── Logo ───────────────────────────────────────────────────────────────────────

class _KwanLogo extends StatelessWidget {
  const _KwanLogo();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: AppTheme.radiusSm,
          ),
          child: const Center(
            child: Text(
              'K',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppTheme.background,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Kwan',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            Text(
              'The Path',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 10,
                color: AppTheme.primary.withValues(alpha: 0.7),
                letterSpacing: 0.5,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── Feature Strip ──────────────────────────────────────────────────────────────

class _FeatureStrip extends StatelessWidget {
  const _FeatureStrip();

  static const _features = [
    (icon: Icons.directions_bus_outlined, label: 'Trotros & Matatus'),
    (icon: Icons.storefront_outlined, label: 'Local Markets'),
    (icon: Icons.phone_android_outlined, label: 'Mobile Money'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spaceMd),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: AppTheme.radiusMd,
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          for (int i = 0; i < _features.length; i++) ...[
            Expanded(
              child: Column(
                children: [
                  Icon(
                    _features[i].icon,
                    color: AppTheme.primary,
                    size: 22,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _features[i].label,
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            if (i < _features.length - 1)
              Container(
                width: 1,
                height: 36,
                color: AppTheme.border,
              ),
          ],
        ],
      ),
    );
  }
}

// ── Role Button ────────────────────────────────────────────────────────────────

class _RoleButton extends StatefulWidget {
  final String id;
  final String label;
  final String subtitle;
  final IconData icon;
  final bool isPrimary;
  final VoidCallback onTap;

  const _RoleButton({
    required this.id,
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.isPrimary,
    required this.onTap,
  });

  @override
  State<_RoleButton> createState() => _RoleButtonState();
}

class _RoleButtonState extends State<_RoleButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      key: ValueKey(widget.id),
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _pressed ? 0.975 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spaceLg,
            vertical: 20,
          ),
          decoration: widget.isPrimary
              ? BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: AppTheme.radiusMd,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    )
                  ],
                )
              : BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: AppTheme.radiusMd,
                  border: Border.all(color: AppTheme.border),
                ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: widget.isPrimary
                      ? AppTheme.background.withValues(alpha: 0.2)
                      : AppTheme.surfaceElevated,
                  borderRadius: AppTheme.radiusSm,
                ),
                child: Icon(
                  widget.icon,
                  color: widget.isPrimary
                      ? AppTheme.background
                      : AppTheme.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppTheme.spaceMd),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.label,
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: widget.isPrimary
                            ? AppTheme.background
                            : AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.subtitle,
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: widget.isPrimary
                            ? AppTheme.background.withValues(alpha: 0.65)
                            : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_rounded,
                color: widget.isPrimary
                    ? AppTheme.background.withValues(alpha: 0.7)
                    : AppTheme.textMuted,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
