import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';

class DialectScreen extends StatefulWidget {
  const DialectScreen({super.key});

  @override
  State<DialectScreen> createState() => _DialectScreenState();
}

class _DialectScreenState extends State<DialectScreen> {
  int? _playingIndex;

  static const _phrases = [
    _Phrase(twi: 'Akwaaba', english: 'Welcome / You are welcome',
        phonetic: 'ah-KWA-ba', context: 'Greet your host when you arrive'),
    _Phrase(twi: 'Medaase', english: 'Thank you',
        phonetic: 'meh-DAA-say', context: 'After a meal, workshop, or kind gesture'),
    _Phrase(twi: 'Te so kakra', english: 'Speak slowly, please',
        phonetic: 'teh-SO kah-KRA', context: 'Ask your host to slow down their speech'),
    _Phrase(twi: 'Ɛyɛ', english: 'It is good / OK',
        phonetic: 'eh-YEH', context: 'Agreement · Appreciation · Confirmation'),
    _Phrase(twi: 'Εden na wopɛ?', english: 'What do you want?',
        phonetic: 'eh-DEN nah wo-PEH', context: 'Market negotiation opener'),
    _Phrase(twi: 'Sika no yɛ dɛn?', english: 'How much does it cost?',
        phonetic: 'si-KA no yeh DEN', context: 'Ask price before negotiating'),
    _Phrase(twi: 'Ei, too mu!', english: 'Wow, it is expensive!',
        phonetic: 'AY too-MOO', context: 'Friendly market price response'),
    _Phrase(twi: 'Yɛkɔ', english: 'Let\'s go',
        phonetic: 'yeh-KOR', context: 'Signal to your guide you\'re ready to move'),
  ];

  Future<void> _simulatePlay(int index) async {
    HapticFeedback.lightImpact();
    setState(() => _playingIndex = index);
    await Future.delayed(const Duration(milliseconds: 1800));
    if (mounted) setState(() => _playingIndex = null);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppTheme.background,
            surfaceTintColor: Colors.transparent,
            expandedHeight: 140,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              title: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppTheme.accent.withValues(alpha: 0.25)),
                      ),
                      child: const Text('🇬🇭 TWI DIALECT STUDIO',
                          style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 9,
                              fontWeight: FontWeight.w700, color: AppTheme.accent,
                              letterSpacing: 1.2)),
                    ),
                    const SizedBox(height: 6),
                    const Text('Sound like a local',
                        style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary)),
                  ]),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Text(
                  'Tap any phrase to hear the native pronunciation. Twi is spoken by over 9 million people in Ghana.',
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 13,
                      color: AppTheme.textSecondary, height: 1.6)),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) {
                  final phrase = _phrases[i];
                  final playing = _playingIndex == i;
                  return GestureDetector(
                    onTap: () => _simulatePlay(i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: playing
                            ? AppTheme.primary.withValues(alpha: 0.08)
                            : AppTheme.surface,
                        borderRadius: AppTheme.radiusMd,
                        border: Border.all(
                            color: playing ? AppTheme.primary : AppTheme.border,
                            width: playing ? 1.5 : 1),
                      ),
                      child: Row(children: [
                        // Play button
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: playing
                                ? AppTheme.primary
                                : AppTheme.primary.withValues(alpha: 0.1),
                          ),
                          child: Icon(
                              playing
                                  ? Icons.volume_up_rounded
                                  : Icons.play_arrow_rounded,
                              color: playing
                                  ? AppTheme.background
                                  : AppTheme.primary,
                              size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Row(children: [
                            Text(phrase.twi,
                                style: const TextStyle(
                                    fontFamily: 'Outfit', fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.textPrimary)),
                            const SizedBox(width: 8),
                            Text('[${phrase.phonetic}]',
                                style: const TextStyle(
                                    fontFamily: 'Outfit', fontSize: 12,
                                    color: AppTheme.primary,
                                    fontStyle: FontStyle.italic)),
                          ]),
                          const SizedBox(height: 3),
                          Text(phrase.english,
                              style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textSecondary)),
                          const SizedBox(height: 3),
                          Text(phrase.context,
                              style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 11,
                                  color: AppTheme.textMuted, height: 1.4)),
                          if (playing)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: _WaveformVisualizer(),
                            ),
                        ])),
                      ]),
                    ),
                  );
                },
                childCount: _phrases.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}

class _Phrase {
  final String twi, english, phonetic, context;
  const _Phrase({required this.twi, required this.english,
      required this.phonetic, required this.context});
}

class _WaveformVisualizer extends StatefulWidget {
  @override
  State<_WaveformVisualizer> createState() => _WaveformVisualizerState();
}

class _WaveformVisualizerState extends State<_WaveformVisualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))
      ..repeat(reverse: true);
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) {
        return Row(
          children: List.generate(12, (i) {
            final height = 4.0 + (8 * _ctrl.value * ((i % 3 == 0) ? 1 : 0.5));
            return Container(
              margin: const EdgeInsets.only(right: 2),
              width: 3,
              height: height,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(2),
              ),
            );
          }),
        );
      },
    );
  }
}
