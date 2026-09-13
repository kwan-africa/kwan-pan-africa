import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  static const _slides = [
    _Slide(
      emoji: '🏺',
      title: 'Meet the makers.',
      subtitle: 'Kente weavers, bead artists, community guides — verified, local, genuine.',
      accent: AppTheme.primary,
      tag: 'DISCOVER',
    ),
    _Slide(
      emoji: '🔐',
      title: 'Pay safe. Zero cash.',
      subtitle: 'Your card payment is held in Kwan Escrow and sent to the operator\'s MoMo wallet only after your experience.',
      accent: AppTheme.secondary,
      tag: 'PROTECTED',
    ),
    _Slide(
      emoji: '🗣️',
      title: 'Sound like a local.',
      subtitle: 'Native Twi audio + interactive trotro route maps. Explore deeper, spend smarter.',
      accent: AppTheme.accent,
      tag: 'IMMERSE',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Skip
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => context.go(AppRoutes.discover),
                child: const Text('Skip',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontFamily: 'Outfit')),
              ),
            ),
            // Slides
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _slides.length,
                itemBuilder: (ctx, i) => _SlideView(slide: _slides[i]),
              ),
            ),
            // Dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_slides.length, (i) {
                final active = i == _page;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active
                        ? _slides[_page].accent
                        : AppTheme.border,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            const SizedBox(height: 32),
            // CTA
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_page < _slides.length - 1) {
                      _controller.nextPage(
                          duration: const Duration(milliseconds: 350),
                          curve: Curves.easeOutCubic);
                    } else {
                      context.go(AppRoutes.discover);
                    }
                  },
                  child: Text(
                    _page < _slides.length - 1 ? 'Next' : 'Explore Accra →',
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _Slide {
  final String emoji;
  final String title;
  final String subtitle;
  final Color accent;
  final String tag;
  const _Slide({required this.emoji, required this.title,
      required this.subtitle, required this.accent, required this.tag});
}

class _SlideView extends StatelessWidget {
  final _Slide slide;
  const _SlideView({required this.slide});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120, height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: slide.accent.withValues(alpha: 0.08),
              boxShadow: [
                BoxShadow(
                  color: slide.accent.withValues(alpha: 0.2),
                  blurRadius: 40, spreadRadius: 8,
                )
              ],
            ),
            child: Center(child: Text(slide.emoji,
                style: const TextStyle(fontSize: 52))),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: slide.accent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: slide.accent.withValues(alpha: 0.3)),
            ),
            child: Text(slide.tag,
                style: TextStyle(
                    fontFamily: 'Outfit', fontSize: 10, fontWeight: FontWeight.w700,
                    color: slide.accent, letterSpacing: 2)),
          ),
          const SizedBox(height: 16),
          Text(slide.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 32,
                  fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                  height: 1.15, letterSpacing: -0.8)),
          const SizedBox(height: 16),
          Text(slide.subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 16,
                  color: AppTheme.textSecondary, height: 1.65)),
        ],
      ),
    );
  }
}
