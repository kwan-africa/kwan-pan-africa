import 'package:flutter/material.dart';

/// Kwan — Design System v2
/// Premium African-inspired dark theme. Clean, trusted, professional.
/// Inspired by the whitespace discipline and visual hierarchy of best-in-class
/// SaaS products — adapted for Kwan's warm gold identity.
class AppTheme {
  // ─── Brand Colors ─────────────────────────────────────────────────────────
  static const Color primary = Color(0xFFE8A838);      // Warm African gold
  static const Color primaryDark = Color(0xFFC4881A);
  static const Color primaryLight = Color(0xFFF5C76A);

  static const Color secondary = Color(0xFF2A7A6F);    // Deep savanna green
  static const Color secondaryLight = Color(0xFF3DA897);

  static const Color accent = Color(0xFFE85D3A);       // Sunset terracotta

  // ─── Neutral / Background ─────────────────────────────────────────────────
  static const Color background = Color(0xFF080A0C);   // Near-black — deeper, richer
  static const Color surface = Color(0xFF111316);      // Card background
  static const Color surfaceElevated = Color(0xFF1A1D22); // Elevated card
  static const Color surfaceGlass = Color(0x14FFFFFF); // Semi-transparent glass
  static const Color border = Color(0xFF222529);       // Subtle borders
  static const Color borderSubtle = Color(0xFF1A1D20); // Ultra-subtle dividers

  // ─── Text ─────────────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFF2F2EE);
  static const Color textSecondary = Color(0xFF9A9A96);
  static const Color textMuted = Color(0xFF55575A);

  // ─── Category Colors ──────────────────────────────────────────────────────
  static const Color tourColor = Color(0xFF4A9EFF);
  static const Color foodColor = Color(0xFFFF7043);
  static const Color accommodationColor = Color(0xFF9C6CFF);
  static const Color transportColor = Color(0xFF26C6DA);
  static const Color marketColor = Color(0xFFFFCA28);
  static const Color cultureColor = Color(0xFF66BB6A);
  static const Color tipColor = Color(0xFFEF5350);

  // ─── Spacing System ────────────────────────────────────────────────────────
  static const double spaceXs = 4;
  static const double spaceSm = 8;
  static const double spaceMd = 16;
  static const double spaceLg = 24;
  static const double spaceXl = 40;
  static const double spaceXxl = 64;

  // ─── Gradients ────────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFE8A838), Color(0xFFC4881A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF080A0C), Color(0xFF0E1012), Color(0xFF0B0E10)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF111316), Color(0xFF161920)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Ambient radial glow used behind hero content — very subtle, like SyncX
  static const RadialGradient heroAmbientGlow = RadialGradient(
    colors: [Color(0x18E8A838), Color(0x00E8A838)],
    center: Alignment(-0.4, -0.3),
    radius: 0.85,
  );

  // ─── Shadows ──────────────────────────────────────────────────────────────
  static List<BoxShadow> goldGlow = [
    BoxShadow(
      color: primary.withValues(alpha: 0.25),
      blurRadius: 24,
      spreadRadius: 0,
    ),
  ];

  static List<BoxShadow> subtleGlow = [
    BoxShadow(
      color: primary.withValues(alpha: 0.12),
      blurRadius: 32,
      spreadRadius: 4,
    ),
  ];

  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.5),
      blurRadius: 20,
      offset: const Offset(0, 4),
    ),
  ];

  // ─── Border Radius ────────────────────────────────────────────────────────
  static const BorderRadius radiusXs = BorderRadius.all(Radius.circular(6));
  static const BorderRadius radiusSm = BorderRadius.all(Radius.circular(10));
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
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: textPrimary,
            letterSpacing: -0.3,
          ),
          iconTheme: IconThemeData(color: textSecondary),
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
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 18),
            shape: const RoundedRectangleBorder(borderRadius: radiusMd),
            elevation: 0,
            textStyle: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: textPrimary,
            side: const BorderSide(color: border, width: 1.5),
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 18),
            shape: const RoundedRectangleBorder(borderRadius: radiusMd),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surfaceElevated,
          contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
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
            borderSide: const BorderSide(color: primary, width: 1.5),
          ),
          labelStyle: const TextStyle(color: textSecondary, fontFamily: 'Outfit', fontSize: 14),
          hintStyle: const TextStyle(color: textMuted, fontFamily: 'Outfit', fontSize: 14),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: surfaceElevated,
          selectedColor: primary.withValues(alpha: 0.15),
          labelStyle: const TextStyle(color: textPrimary, fontFamily: 'Outfit', fontSize: 13),
          side: const BorderSide(color: border),
          shape: const RoundedRectangleBorder(borderRadius: radiusSm),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        dividerTheme: const DividerThemeData(color: borderSubtle, space: 1, thickness: 1),
        sliderTheme: SliderThemeData(
          activeTrackColor: primary,
          inactiveTrackColor: border,
          thumbColor: primary,
          overlayColor: primary.withValues(alpha: 0.12),
          trackHeight: 3,
          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: surface,
          selectedItemColor: primary,
          unselectedItemColor: textMuted,
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: surfaceElevated,
          contentTextStyle: const TextStyle(
            fontFamily: 'Outfit',
            fontSize: 14,
            color: textPrimary,
          ),
          shape: const RoundedRectangleBorder(borderRadius: radiusMd),
          behavior: SnackBarBehavior.floating,
        ),
      );

  static TextTheme _buildTextTheme() => TextTheme(
        displayLarge: const TextStyle(
          fontFamily: 'Outfit', fontSize: 52, fontWeight: FontWeight.w700,
          color: textPrimary, letterSpacing: -2.0, height: 1.05,
        ),
        displayMedium: const TextStyle(
          fontFamily: 'Outfit', fontSize: 40, fontWeight: FontWeight.w700,
          color: textPrimary, letterSpacing: -1.5, height: 1.1,
        ),
        displaySmall: const TextStyle(
          fontFamily: 'Outfit', fontSize: 30, fontWeight: FontWeight.w600,
          color: textPrimary, letterSpacing: -0.8, height: 1.2,
        ),
        headlineLarge: const TextStyle(
          fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.w600,
          color: textPrimary, letterSpacing: -0.5,
        ),
        headlineMedium: const TextStyle(
          fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w600,
          color: textPrimary, letterSpacing: -0.3,
        ),
        titleLarge: const TextStyle(
          fontFamily: 'Outfit', fontSize: 17, fontWeight: FontWeight.w600,
          color: textPrimary, letterSpacing: -0.2,
        ),
        titleMedium: const TextStyle(
          fontFamily: 'Outfit', fontSize: 15, fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        bodyLarge: const TextStyle(
          fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w400,
          color: textSecondary, height: 1.65,
        ),
        bodyMedium: const TextStyle(
          fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w400,
          color: textSecondary, height: 1.6,
        ),
        bodySmall: const TextStyle(
          fontFamily: 'Outfit', fontSize: 12, fontWeight: FontWeight.w400,
          color: textMuted, height: 1.5,
        ),
        labelLarge: const TextStyle(
          fontFamily: 'Outfit', fontSize: 11, fontWeight: FontWeight.w700,
          color: textMuted, letterSpacing: 1.2,
        ),
        labelSmall: const TextStyle(
          fontFamily: 'Outfit', fontSize: 10, fontWeight: FontWeight.w600,
          color: textMuted, letterSpacing: 1.0,
        ),
      );

  // ─── Shared Widget Styles ─────────────────────────────────────────────────

  /// SyncX-style section badge: "• How it works" / "• Features"
  static Widget sectionBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primary.withValues(alpha: 0.25)),
      ),
      child: Text(
        '• $label',
        style: const TextStyle(
          fontFamily: 'Outfit',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: primary,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  /// Glass-style card container — premium look
  static BoxDecoration glassCard({Color? borderColor}) => BoxDecoration(
        color: surfaceGlass,
        borderRadius: radiusMd,
        border: Border.all(color: borderColor ?? border),
      );

  /// Clean surface card with very subtle border
  static BoxDecoration cleanCard({BorderRadius? borderRadius}) => BoxDecoration(
        color: surface,
        borderRadius: borderRadius ?? radiusMd,
        border: Border.all(color: border),
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
