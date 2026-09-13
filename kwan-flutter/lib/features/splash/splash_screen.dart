import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeIn;
  late Animation<double> _scaleIn;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1400));
    _fadeIn  = CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.6, curve: Curves.easeOut));
    _scaleIn = Tween(begin: 0.85, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack)));
    _ctrl.forward();

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) context.go(AppRoutes.onboarding);
    });
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
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
        child: Center(
          child: FadeTransition(
            opacity: _fadeIn,
            child: ScaleTransition(
              scale: _scaleIn,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Gold glow ring
                  Container(
                    width: 100, height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primary.withValues(alpha: 0.08),
                      boxShadow: AppTheme.goldGlow,
                    ),
                    child: const Center(
                      child: Text('✈️',
                          style: TextStyle(fontSize: 44)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Wordmark
                  const Text('KWAN',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 48,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                        letterSpacing: 8,
                      )),
                  const SizedBox(height: 6),
                  const Text('GRASSROOTS AFRICA',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                        letterSpacing: 3.5,
                      )),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
