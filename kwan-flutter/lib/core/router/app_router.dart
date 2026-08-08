import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/tourist/screens/preference_form_screen.dart';
import '../../features/tourist/screens/itinerary_view_screen.dart';
import '../../features/tourist/screens/checkout_screen.dart';
import '../../features/operator/screens/dashboard_screen.dart';
import '../../features/operator/screens/add_listing_screen.dart';
import '../../core/models/itinerary_model.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/onboarding',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // ── Tourist Flow ──────────────────────────────────────────────────────
      GoRoute(
        path: '/plan',
        name: 'plan',
        builder: (context, state) => const PreferenceFormScreen(),
      ),
      GoRoute(
        path: '/itinerary',
        name: 'itinerary',
        builder: (context, state) {
          final itinerary = state.extra as ItineraryModel;
          return ItineraryViewScreen(itinerary: itinerary);
        },
      ),
      GoRoute(
        path: '/checkout',
        name: 'checkout',
        builder: (context, state) {
          final args = state.extra as Map<String, dynamic>;
          return CheckoutScreen(
            listingId: args['listingId'],
            listingTitle: args['listingTitle'],
            priceUsd: args['priceUsd'],
            operatorName: args['operatorName'],
            whatsapp: args['whatsapp'],
          );
        },
      ),

      // ── Operator Flow ─────────────────────────────────────────────────────
      GoRoute(
        path: '/operator',
        name: 'operator-dashboard',
        builder: (context, state) => const OperatorDashboardScreen(),
      ),
      GoRoute(
        path: '/operator/listing/add',
        name: 'add-listing',
        builder: (context, state) {
          final operatorId = state.extra as String?;
          return AddListingScreen(operatorId: operatorId ?? '');
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
});
