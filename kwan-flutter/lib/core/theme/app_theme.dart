import 'package:flutter/material.dart';

/// Kwan — Design System
/// Premium African-inspired dark theme with warm gold accents.
class AppTheme {
  // ─── Brand Colors ─────────────────────────────────────────────────────────
  static const Color primary = Color(0xFFE8A838);      // Warm African gold
  static const Color primaryDark = Color(0xFFC4881A);
  static const Color primaryLight = Color(0xFFF5C76A);

  static const Color secondary = Color(0xFF2A7A6F);    // Deep savanna green
  static const Color secondaryLight = Color(0xFF3DA897);

  static const Color accent = Color(0xFFE85D3A);       // Sunset terracotta

  // ─── Neutral / Background ─────────────────────────────────────────────────
  static const Color background = Color(0xFF0E0E0F);   // Near-black
  static const Color surface = Color(0xFF1A1A1D);      // Card background
  static const Color surfaceElevated = Color(0xFF252528); // Elevated card
  static const Color border = Color(0xFF2E2E32);

  // ─── Text ─────────────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFF5F5F0);
  static const Color textSecondary = Color(0xFFADADAA);
  static const Color textMuted = Color(0xFF6B6B68);

  // ─── Category Colors ──────────────────────────────────────────────────────
  static const Color tourColor = Color(0xFF4A9EFF);
  static const Color foodColor = Color(0xFFFF7043);
  static const Color accommodationColor = Color(0xFF9C6CFF);
  static const Color transportColor = Color(0xFF26C6DA);
  static const Color marketColor = Color(0xFFFFCA28);
  static const Color cultureColor = Color(0xFF66BB6A);
  static const Color tipColor = Color(0xFFEF5350);

  // ─── Gradients ────────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFE8A838), Color(0xFFC4881A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF0E0E0F), Color(0xFF1A1A1D), Color(0xFF1E1A10)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1A1A1D), Color(0xFF212121)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ─── Shadows ──────────────────────────────────────────────────────────────
  static List<BoxShadow> goldGlow = [
    BoxShadow(
      color: primary.withValues(alpha: 0.3),
      blurRadius: 20,
      spreadRadius: 2,
    ),
  ];

  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.4),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  // ─── Border Radius ────────────────────────────────────────────────────────
  static const BorderRadius radiusSm = BorderRadius.all(Radius.circular(8));
  static const BorderRadius radiusMd = BorderRadius.all(Radius.circular(16));
  static const BorderRadius radiusLg = BorderRadius.all(Radius.circular(24));
  static const BorderRadius radiusXl = BorderRadius.all(Radius.circular(32));

  // ─── Theme Data ───────────────────────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: primary,
          secondary: secondary,
          surface: surface,
          onPrimary: background,
          onSecondary: textPrimary,
          onSurface: textPrimary,
          error: Color(0xFFCF6679),
        ),
        scaffoldBackgroundColor: background,
        textTheme: _buildTextTheme(),
        appBarTheme: const AppBarTheme(
          backgroundColor: background,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          titleTextStyle: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
          iconTheme: IconThemeData(color: textPrimary),
        ),
        cardTheme: const CardThemeData(
          color: surface,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: radiusMd),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: background,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: const RoundedRectangleBorder(borderRadius: radiusMd),
            textStyle: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: primary,
            side: const BorderSide(color: primary, width: 1.5),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: const RoundedRectangleBorder(borderRadius: radiusMd),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surfaceElevated,
          border: OutlineInputBorder(
            borderRadius: radiusMd,
            borderSide: const BorderSide(color: border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: radiusMd,
            borderSide: const BorderSide(color: border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: radiusMd,
            borderSide: const BorderSide(color: primary, width: 2),
          ),
          labelStyle: const TextStyle(color: textSecondary, fontFamily: 'Outfit'),
          hintStyle: const TextStyle(color: textMuted, fontFamily: 'Outfit'),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: surfaceElevated,
          selectedColor: primary.withValues(alpha: 0.2),
          labelStyle: const TextStyle(color: textPrimary, fontFamily: 'Outfit'),
          side: const BorderSide(color: border),
          shape: const RoundedRectangleBorder(borderRadius: radiusSm),
        ),
        dividerTheme: const DividerThemeData(color: border, space: 1),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: surface,
          selectedItemColor: primary,
          unselectedItemColor: textMuted,
        ),
      );

  static TextTheme _buildTextTheme() => TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'Outfit', fontSize: 48, fontWeight: FontWeight.w700,
          color: textPrimary, letterSpacing: -1.5,
        ),
        displayMedium: TextStyle(
          fontFamily: 'Outfit', fontSize: 36, fontWeight: FontWeight.w700,
          color: textPrimary, letterSpacing: -1.0,
        ),
        displaySmall: TextStyle(
          fontFamily: 'Outfit', fontSize: 28, fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineLarge: TextStyle(
          fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        titleLarge: TextStyle(
          fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        titleMedium: TextStyle(
          fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        bodyLarge: TextStyle(
          fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w400,
          color: textPrimary, height: 1.6,
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w400,
          color: textSecondary, height: 1.5,
        ),
        bodySmall: TextStyle(
          fontFamily: 'Outfit', fontSize: 12, fontWeight: FontWeight.w400,
          color: textMuted,
        ),
        labelLarge: TextStyle(
          fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w600,
          color: textPrimary, letterSpacing: 0.5,
        ),
      );

  // ─── Category helpers ─────────────────────────────────────────────────────
  static Color categoryColor(String category) {
    return switch (category.toUpperCase()) {
      'DAY_TOUR' || 'MULTI_DAY_TOUR' => tourColor,
      'FOOD_EXPERIENCE' => foodColor,
      'ACCOMMODATION' => accommodationColor,
      'TRANSPORT' => transportColor,
      'STREET_VENDOR' || 'CULTURAL_EXPERIENCE' => cultureColor,
      'COMMUNITY_TIP' => tipColor,
      _ => primary,
    };
  }

  static IconData categoryIcon(String category) {
    return switch (category.toUpperCase()) {
      'DAY_TOUR' || 'MULTI_DAY_TOUR' => Icons.map_outlined,
      'FOOD_EXPERIENCE' || 'STREET_VENDOR' => Icons.restaurant_outlined,
      'ACCOMMODATION' => Icons.hotel_outlined,
      'TRANSPORT' => Icons.directions_bus_outlined,
      'CULTURAL_EXPERIENCE' => Icons.museum_outlined,
      'COMMUNITY_TIP' => Icons.lightbulb_outlined,
      _ => Icons.star_outline,
    };
  }
}
