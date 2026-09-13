import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/splash/splash_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/discover/screens/discover_screen.dart';
import '../../features/operator/screens/operator_detail_screen.dart';
import '../../features/booking/screens/booking_screen.dart';
import '../../features/booking/screens/escrow_confirmation_screen.dart';
import '../../features/dialect/screens/dialect_screen.dart';
import '../../features/transit/screens/transit_screen.dart';
import '../../features/shell/main_shell.dart';

// ─── Route name constants ─────────────────────────────────────────────────────
class AppRoutes {
  static const splash       = '/';
  static const onboarding   = '/onboarding';
  static const discover     = '/discover';
  static const operatorDetail = '/operator/:id';
  static const booking      = '/booking';
  static const confirmation = '/confirmation';
  static const dialect      = '/dialect';
  static const transit      = '/transit';
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.onboarding,
        pageBuilder: (_, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const OnboardingScreen(),
          transitionsBuilder: _slideUp,
        ),
      ),
      ShellRoute(
        builder: (_, __, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.discover,
            builder: (_, __) => const DiscoverScreen(),
          ),
          GoRoute(
            path: AppRoutes.dialect,
            builder: (_, __) => const DialectScreen(),
          ),
          GoRoute(
            path: AppRoutes.transit,
            builder: (_, __) => const TransitScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/operator/:id',
        pageBuilder: (_, state) => CustomTransitionPage(
          key: state.pageKey,
          child: OperatorDetailScreen(operatorId: state.pathParameters['id']!),
          transitionsBuilder: _slideLeft,
        ),
      ),
      GoRoute(
        path: AppRoutes.booking,
        pageBuilder: (_, state) {
          final extra = state.extra as Map<String, dynamic>;
          return CustomTransitionPage(
            key: state.pageKey,
            child: BookingScreen(
              operatorId:   extra['operatorId']   as String,
              experienceId: extra['experienceId'] as String,
            ),
            transitionsBuilder: _slideUp,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.confirmation,
        pageBuilder: (_, state) {
          final extra = state.extra as Map<String, dynamic>;
          return CustomTransitionPage(
            key: state.pageKey,
            child: EscrowConfirmationScreen(bookingRef: extra['ref'] as String),
            transitionsBuilder: _slideUp,
          );
        },
      ),
    ],
  );
});

// ─── Transition builders ──────────────────────────────────────────────────────
Widget _slideLeft(BuildContext ctx, Animation<double> anim,
    Animation<double> sec, Widget child) {
  return SlideTransition(
    position: Tween(begin: const Offset(1, 0), end: Offset.zero)
        .animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
    child: child,
  );
}

Widget _slideUp(BuildContext ctx, Animation<double> anim,
    Animation<double> sec, Widget child) {
  return SlideTransition(
    position: Tween(begin: const Offset(0, 0.08), end: Offset.zero)
        .animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
    child: FadeTransition(opacity: anim, child: child),
  );
}
