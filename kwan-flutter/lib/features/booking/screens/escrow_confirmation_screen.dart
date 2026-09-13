import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

class EscrowConfirmationScreen extends StatefulWidget {
  final String bookingRef;
  const EscrowConfirmationScreen({super.key, required this.bookingRef});

  @override
  State<EscrowConfirmationScreen> createState() =>
      _EscrowConfirmationScreenState();
}

class _EscrowConfirmationScreenState extends State<EscrowConfirmationScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleIn;
  late Animation<double> _fadeIn;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _scaleIn = Tween(begin: 0.4, end: 1.0).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _fadeIn = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Animated check
              ScaleTransition(
                scale: _scaleIn,
                child: FadeTransition(
                  opacity: _fadeIn,
                  child: Container(
                    width: 110, height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.secondary.withValues(alpha: 0.12),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.secondary.withValues(alpha: 0.25),
                          blurRadius: 40, spreadRadius: 8,
                        )
                      ],
                    ),
                    child: const Center(
                      child: Icon(Icons.check_circle_outline_rounded,
                          color: AppTheme.secondary, size: 58),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              FadeTransition(
                opacity: _fadeIn,
                child: Column(children: [
                  const Text('Booking Confirmed!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 30,
                          fontWeight: FontWeight.w800, color: AppTheme.textPrimary,
                          height: 1.1)),
                  const SizedBox(height: 12),
                  Text('Ref: ${widget.bookingRef}',
                      style: const TextStyle(
                          fontFamily: 'Outfit', fontSize: 13,
                          color: AppTheme.textMuted, letterSpacing: 1)),
                  const SizedBox(height: 28),
                  // 3-step escrow flow visual
                  _EscrowStepFlow(),
                  const SizedBox(height: 28),
                  // Twi phrase teaser
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.06),
                      borderRadius: AppTheme.radiusMd,
                      border: Border.all(
                          color: AppTheme.primary.withValues(alpha: 0.2)),
                    ),
                    child: Column(children: [
                      const Text('Say it in Twi 🗣️',
                          style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary, letterSpacing: 0.5)),
                      const SizedBox(height: 8),
                      const Text('"Akwaaba!"',
                          style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary)),
                      const SizedBox(height: 4),
                      const Text('"You are welcome" — greet your host',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 12,
                              color: AppTheme.textSecondary)),
                      const SizedBox(height: 10),
                      GestureDetector(
                        onTap: () => context.go(AppRoutes.dialect),
                        child: const Text('Learn more Twi phrases →',
                            style: TextStyle(
                                fontFamily: 'Outfit', fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primary,
                                decoration: TextDecoration.underline,
                                decorationColor: AppTheme.primary)),
                      ),
                    ]),
                  ),
                ]),
              ),
              const Spacer(),
              FadeTransition(
                opacity: _fadeIn,
                child: Column(children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go(AppRoutes.discover),
                      child: const Text('Discover More Experiences'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go(AppRoutes.dialect),
                      child: const Text('Open Twi Dialect Studio'),
                    ),
                  ),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EscrowStepFlow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const steps = [
      ('💳', 'Your card charged', 'Secured in Kwan Escrow'),
      ('🔐', 'Funds held safely', 'Released after experience'),
      ('📱', 'MoMo payout sent', '90% to operator wallet'),
    ];

    return Row(children: steps.asMap().entries.map((entry) {
      final i = entry.key;
      final (icon, label, sub) = entry.value;
      return Expanded(
        child: Row(children: [
          Expanded(
            child: Column(children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.border),
                ),
                child: Center(child: Text(icon, style: const TextStyle(fontSize: 18))),
              ),
              const SizedBox(height: 6),
              Text(label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 10,
                      fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              Text(sub,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 9,
                      color: AppTheme.textMuted, height: 1.4)),
            ]),
          ),
          if (i < steps.length - 1)
            const Padding(
              padding: EdgeInsets.only(bottom: 28),
              child: Icon(Icons.arrow_forward_ios_rounded,
                  size: 10, color: AppTheme.textMuted),
            ),
        ]),
      );
    }).toList());
  }
}
