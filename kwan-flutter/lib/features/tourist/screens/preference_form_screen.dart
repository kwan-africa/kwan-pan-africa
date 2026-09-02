import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/itinerary_model.dart';

// ── State ──────────────────────────────────────────────────────────────────────
class PlanFormState {
  final String destination;
  final String country;
  final DateTime? startDate;
  final DateTime? endDate;
  final double budgetUsd;
  final List<String> interests;
  final String pace;
  final int groupSize;
  final String language;
  final bool includeTransport;
  final bool includeMarkets;
  final bool includeCommunityTips;
  final bool includeHomestays;

  const PlanFormState({
    this.destination = '',
    this.country = 'GH',
    this.startDate,
    this.endDate,
    this.budgetUsd = 500,
    this.interests = const [],
    this.pace = 'MODERATE',
    this.groupSize = 1,
    this.language = 'en',
    this.includeTransport = true,
    this.includeMarkets = true,
    this.includeCommunityTips = true,
    this.includeHomestays = true,
  });

  PlanFormState copyWith({
    String? destination, String? country,
    DateTime? startDate, DateTime? endDate,
    double? budgetUsd, List<String>? interests,
    String? pace, int? groupSize, String? language,
    bool? includeTransport, bool? includeMarkets,
    bool? includeCommunityTips, bool? includeHomestays,
  }) => PlanFormState(
    destination: destination ?? this.destination,
    country: country ?? this.country,
    startDate: startDate ?? this.startDate,
    endDate: endDate ?? this.endDate,
    budgetUsd: budgetUsd ?? this.budgetUsd,
    interests: interests ?? this.interests,
    pace: pace ?? this.pace,
    groupSize: groupSize ?? this.groupSize,
    language: language ?? this.language,
    includeTransport: includeTransport ?? this.includeTransport,
    includeMarkets: includeMarkets ?? this.includeMarkets,
    includeCommunityTips: includeCommunityTips ?? this.includeCommunityTips,
    includeHomestays: includeHomestays ?? this.includeHomestays,
  );

  int get totalDays {
    if (startDate == null || endDate == null) return 0;
    return endDate!.difference(startDate!).inDays;
  }
}

final planFormProvider = StateProvider<PlanFormState>((ref) => const PlanFormState());
final isGeneratingProvider = StateProvider<bool>((ref) => false);

// ── Screen ─────────────────────────────────────────────────────────────────────

class PreferenceFormScreen extends ConsumerStatefulWidget {
  const PreferenceFormScreen({super.key});

  @override
  ConsumerState<PreferenceFormScreen> createState() => _PreferenceFormScreenState();
}

class _PreferenceFormScreenState extends ConsumerState<PreferenceFormScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  final int _totalSteps = 4;

  static const _allInterests = [
    '🏛️ History', '🍽️ Local Food', '🌿 Nature', '🎭 Culture',
    '🏖️ Beach', '🦁 Wildlife', '🛒 Markets', '🎵 Music',
    '⛪ Religion & Heritage', '🤸 Adventure', '📸 Photography',
    '🍺 Nightlife', '💼 Business', '🧘 Wellness',
  ];

  static const _languages = {
    'en': '🇬🇧 English', 'fr': '🇫🇷 French',
    'tw': '🇬🇭 Twi', 'ha': 'Hausa', 'yo': '🇳🇬 Yoruba', 'ig': 'Igbo',
  };

  @override
  Widget build(BuildContext context) {
    final form = ref.watch(planFormProvider);
    final isGenerating = ref.watch(isGeneratingProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          Column(
            children: [
              // ── Custom AppBar ─────────────────────────────────────────────
              SafeArea(
                bottom: false,
                child: _FormAppBar(
                  currentStep: _currentStep,
                  totalSteps: _totalSteps,
                  onBack: _currentStep == 0
                      ? () => context.pop()
                      : () => _previousStep(),
                ),
              ),

              // ── Page content ──────────────────────────────────────────────
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _Step1Destination(form: form, onChanged: _updateForm),
                    _Step2DatesAndBudget(form: form, onChanged: _updateForm),
                    _Step3Interests(
                      form: form,
                      allInterests: _allInterests,
                      onChanged: _updateForm,
                    ),
                    _Step4Preferences(
                      form: form,
                      languages: _languages,
                      onChanged: _updateForm,
                    ),
                  ],
                ),
              ),

              // ── Bottom CTA ────────────────────────────────────────────────
              _BottomBar(
                isLastStep: _currentStep == _totalSteps - 1,
                isGenerating: isGenerating,
                canProceed: _canProceed(form),
                onNext: () => _currentStep == _totalSteps - 1
                    ? _generateItinerary(form)
                    : _nextStep(),
              ),
            ],
          ),

          // ── Generation loading overlay ─────────────────────────────────
          if (isGenerating)
            const _GeneratingOverlay(),
        ],
      ),
    );
  }

  void _updateForm(PlanFormState updated) {
    ref.read(planFormProvider.notifier).state = updated;
  }

  void _nextStep() {
    setState(() => _currentStep++);
    _pageController.animateToPage(
      _currentStep,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOut,
    );
  }

  void _previousStep() {
    setState(() => _currentStep--);
    _pageController.animateToPage(
      _currentStep,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOut,
    );
  }

  bool _canProceed(PlanFormState form) {
    return switch (_currentStep) {
      0 => form.destination.isNotEmpty && form.country.isNotEmpty,
      1 => form.startDate != null && form.endDate != null && form.totalDays >= 1,
      2 => form.interests.isNotEmpty,
      _ => true,
    };
  }

  Future<void> _generateItinerary(PlanFormState form) async {
    ref.read(isGeneratingProvider.notifier).state = true;
    try {
      final api = ref.read(apiServiceProvider);
      final result = await api.generateItinerary({
        'destination': form.destination,
        'country': form.country,
        'startDate': form.startDate!.toIso8601String().split('T')[0],
        'endDate': form.endDate!.toIso8601String().split('T')[0],
        'budgetUsd': form.budgetUsd,
        'interests': form.interests,
        'pace': form.pace,
        'groupSize': form.groupSize,
        'preferredLanguage': form.language,
        'includeInformalTransport': form.includeTransport,
        'includeLocalMarkets': form.includeMarkets,
        'includeCommunityTips': form.includeCommunityTips,
        'includeHomestays': form.includeHomestays,
      });
      final itinerary = ItineraryModel.fromJson(result);
      if (mounted) {
        context.pushNamed('itinerary', extra: itinerary);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate itinerary: $e'),
            backgroundColor: AppTheme.accent,
          ),
        );
      }
    } finally {
      ref.read(isGeneratingProvider.notifier).state = false;
    }
  }
}

// ── Custom AppBar with sleek progress bar ─────────────────────────────────────

class _FormAppBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final VoidCallback onBack;

  const _FormAppBar({
    required this.currentStep,
    required this.totalSteps,
    required this.onBack,
  });

  static const _stepLabels = ['Destination', 'Dates & Budget', 'Interests', 'Preferences'];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spaceMd,
            vertical: AppTheme.spaceSm,
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                color: AppTheme.textSecondary,
                onPressed: onBack,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
              ),
              const SizedBox(width: AppTheme.spaceSm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _stepLabels[currentStep],
                      style: const TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    Text(
                      'Step ${currentStep + 1} of $totalSteps',
                      style: const TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 12,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              // Step dots
              Row(
                children: List.generate(totalSteps, (i) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.only(left: 4),
                    width: i == currentStep ? 16 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: i <= currentStep
                          ? AppTheme.primary
                          : AppTheme.border,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
        // Thin progress line
        SizedBox(
          height: 2,
          child: LayoutBuilder(builder: (ctx, constraints) {
            return Stack(
              children: [
                Container(color: AppTheme.borderSubtle),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOut,
                  width: constraints.maxWidth * (currentStep + 1) / totalSteps,
                  decoration: const BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                  ),
                ),
              ],
            );
          }),
        ),
      ],
    );
  }
}

// ── Step 1: Destination ────────────────────────────────────────────────────────

class _Step1Destination extends StatelessWidget {
  final PlanFormState form;
  final void Function(PlanFormState) onChanged;

  const _Step1Destination({required this.form, required this.onChanged});

  static const _countries = {
    'GH': '🇬🇭 Ghana', 'NG': '🇳🇬 Nigeria', 'SN': '🇸🇳 Senegal',
    'CI': '🇨🇮 Côte d\'Ivoire', 'CM': '🇨🇲 Cameroon', 'BJ': '🇧🇯 Benin',
    'TG': '🇹🇬 Togo', 'GN': '🇬🇳 Guinea',
  };

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.spaceLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppTheme.spaceSm),
          AppTheme.sectionBadge('Step 1'),
          const SizedBox(height: AppTheme.spaceMd),
          Text('Where are you headed?',
              style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: AppTheme.spaceSm),
          Text('Choose your destination country and city.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: AppTheme.spaceXl),

          // Country grid — 2 columns, cleaner than wrap
          Text('Country', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: AppTheme.spaceSm,
            mainAxisSpacing: AppTheme.spaceSm,
            childAspectRatio: 3.2,
            children: _countries.entries.map((e) {
              final selected = form.country == e.key;
              return GestureDetector(
                onTap: () => onChanged(form.copyWith(country: e.key)),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected
                        ? AppTheme.primary.withValues(alpha: 0.12)
                        : AppTheme.surface,
                    borderRadius: AppTheme.radiusSm,
                    border: Border.all(
                      color: selected ? AppTheme.primary : AppTheme.border,
                      width: selected ? 1.5 : 1,
                    ),
                  ),
                  child: Text(
                    e.value,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 13,
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                      color: selected ? AppTheme.primary : AppTheme.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: AppTheme.spaceXl),
          Text('City / Destination', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),
          TextFormField(
            key: const ValueKey('destination-input'),
            initialValue: form.destination,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontFamily: 'Outfit',
              fontSize: 15,
            ),
            decoration: const InputDecoration(
              hintText: 'e.g. Accra, Lagos, Dakar...',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary, size: 20),
            ),
            onChanged: (v) => onChanged(form.copyWith(destination: v)),
          ),
        ],
      ).animate().fadeIn(duration: 350.ms).slideX(begin: 0.06, end: 0),
    );
  }
}

// ── Step 2: Dates & Budget ─────────────────────────────────────────────────────

class _Step2DatesAndBudget extends StatelessWidget {
  final PlanFormState form;
  final void Function(PlanFormState) onChanged;

  const _Step2DatesAndBudget({required this.form, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.spaceLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppTheme.spaceSm),
          AppTheme.sectionBadge('Step 2'),
          const SizedBox(height: AppTheme.spaceMd),
          Text('When & how much?',
              style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: AppTheme.spaceSm),
          Text('Kwan will plan your days and stay within budget.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: AppTheme.spaceXl),

          // Date pickers
          Row(
            children: [
              Expanded(child: _DatePickerCard(
                label: 'Arrival',
                date: form.startDate,
                onPicked: (d) => onChanged(form.copyWith(startDate: d)),
              )),
              const SizedBox(width: AppTheme.spaceSm),
              Expanded(child: _DatePickerCard(
                label: 'Departure',
                date: form.endDate,
                onPicked: (d) => onChanged(form.copyWith(endDate: d)),
              )),
            ],
          ),

          if (form.totalDays > 0) ...[
            const SizedBox(height: AppTheme.spaceMd),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.08),
                borderRadius: AppTheme.radiusSm,
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.wb_sunny_outlined, color: AppTheme.primary, size: 16),
                  const SizedBox(width: 10),
                  Text(
                    '${form.totalDays} day${form.totalDays > 1 ? "s" : ""} planned',
                    style: const TextStyle(
                      fontFamily: 'Outfit', color: AppTheme.primary,
                      fontWeight: FontWeight.w600, fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: AppTheme.spaceXl),

          // Budget
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Total Budget', style: Theme.of(context).textTheme.labelLarge),
              Text(
                '\$${form.budgetUsd.toStringAsFixed(0)} USD',
                style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 28,
                  fontWeight: FontWeight.w700, color: AppTheme.primary,
                  letterSpacing: -1,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.spaceSm),
          Slider(
            value: form.budgetUsd,
            min: 50, max: 5000,
            divisions: 99,
            onChanged: (v) => onChanged(form.copyWith(budgetUsd: v)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('\$50', style: Theme.of(context).textTheme.bodySmall),
              Text('\$5,000', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),

          const SizedBox(height: AppTheme.spaceXl),

          // Group size
          Text('Group Size', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: form.groupSize > 1
                      ? () => onChanged(form.copyWith(groupSize: form.groupSize - 1))
                      : null,
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceElevated,
                      borderRadius: AppTheme.radiusSm,
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Icon(
                      Icons.remove,
                      color: form.groupSize > 1
                          ? AppTheme.textPrimary : AppTheme.textMuted,
                      size: 16,
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Column(
                      children: [
                        Text(
                          '${form.groupSize}',
                          style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 28,
                            fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          form.groupSize == 1 ? 'Solo traveller' : 'travellers',
                          style: const TextStyle(
                            fontFamily: 'Outfit', fontSize: 12,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => onChanged(form.copyWith(groupSize: form.groupSize + 1)),
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceElevated,
                      borderRadius: AppTheme.radiusSm,
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: const Icon(Icons.add, color: AppTheme.textPrimary, size: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ).animate().fadeIn(duration: 350.ms).slideX(begin: 0.06, end: 0),
    );
  }
}

class _DatePickerCard extends StatelessWidget {
  final String label;
  final DateTime? date;
  final void Function(DateTime) onPicked;

  const _DatePickerCard({required this.label, this.date, required this.onPicked});

  @override
  Widget build(BuildContext context) {
    final hasDate = date != null;
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: date ?? DateTime.now().add(const Duration(days: 7)),
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
              colorScheme: const ColorScheme.dark(primary: AppTheme.primary),
            ),
            child: child!,
          ),
        );
        if (picked != null) onPicked(picked);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: AppTheme.radiusMd,
          border: Border.all(
            color: hasDate ? AppTheme.primary.withValues(alpha: 0.5) : AppTheme.border,
            width: hasDate ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  hasDate ? Icons.check_circle_outline : Icons.calendar_today_outlined,
                  color: hasDate ? AppTheme.primary : AppTheme.textMuted,
                  size: 14,
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 11,
                    color: AppTheme.textMuted, letterSpacing: 0.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              date != null
                  ? '${date!.day}/${date!.month}/${date!.year}'
                  : 'Pick date',
              style: TextStyle(
                fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w600,
                color: hasDate ? AppTheme.textPrimary : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Step 3: Interests ──────────────────────────────────────────────────────────

class _Step3Interests extends StatelessWidget {
  final PlanFormState form;
  final List<String> allInterests;
  final void Function(PlanFormState) onChanged;

  const _Step3Interests({
    required this.form,
    required this.allInterests,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.spaceLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppTheme.spaceSm),
          AppTheme.sectionBadge('Step 3'),
          const SizedBox(height: AppTheme.spaceMd),
          Text('What moves you?', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: AppTheme.spaceSm),
          Text('Kwan builds your trip around these passions.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: AppTheme.spaceXl),

          if (form.interests.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: AppTheme.spaceMd),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.08),
                  borderRadius: AppTheme.radiusSm,
                  border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
                ),
                child: Text(
                  '${form.interests.length} selected',
                  style: const TextStyle(
                    fontFamily: 'Outfit', fontSize: 13,
                    fontWeight: FontWeight.w600, color: AppTheme.primary,
                  ),
                ),
              ),
            ),

          // Interest chips in a wrap layout
          Wrap(
            spacing: AppTheme.spaceSm,
            runSpacing: AppTheme.spaceSm,
            children: allInterests.map((interest) {
              final selected = form.interests.contains(interest);
              return GestureDetector(
                onTap: () {
                  final updated = List<String>.from(form.interests);
                  selected ? updated.remove(interest) : updated.add(interest);
                  onChanged(form.copyWith(interests: updated));
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppTheme.primary.withValues(alpha: 0.12)
                        : AppTheme.surface,
                    borderRadius: AppTheme.radiusSm,
                    border: Border.all(
                      color: selected ? AppTheme.primary : AppTheme.border,
                      width: selected ? 1.5 : 1,
                    ),
                  ),
                  child: Text(
                    interest,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 13,
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                      color: selected ? AppTheme.primary : AppTheme.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ).animate().fadeIn(duration: 350.ms).slideX(begin: 0.06, end: 0),
    );
  }
}

// ── Step 4: Preferences ────────────────────────────────────────────────────────

class _Step4Preferences extends StatelessWidget {
  final PlanFormState form;
  final Map<String, String> languages;
  final void Function(PlanFormState) onChanged;

  const _Step4Preferences({
    required this.form, required this.languages, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppTheme.spaceLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppTheme.spaceSm),
          AppTheme.sectionBadge('Step 4'),
          const SizedBox(height: AppTheme.spaceMd),
          Text('Almost there.', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: AppTheme.spaceSm),
          Text('Kwan personalises every detail for you.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: AppTheme.spaceXl),

          // Pace selector
          Text('Travel Pace', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),
          Row(
            children: [
              for (final (pace, emoji, label) in [
                ('RELAXED', '🧘', 'Relaxed'),
                ('MODERATE', '🚶', 'Moderate'),
                ('PACKED', '🏃', 'Packed'),
              ])
                Expanded(
                  child: GestureDetector(
                    onTap: () => onChanged(form.copyWith(pace: pace)),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: EdgeInsets.only(
                          right: pace != 'PACKED' ? AppTheme.spaceSm : 0),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        color: form.pace == pace
                            ? AppTheme.primary.withValues(alpha: 0.12)
                            : AppTheme.surface,
                        borderRadius: AppTheme.radiusSm,
                        border: Border.all(
                          color: form.pace == pace
                              ? AppTheme.primary : AppTheme.border,
                          width: form.pace == pace ? 1.5 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(emoji, style: const TextStyle(fontSize: 20)),
                          const SizedBox(height: 4),
                          Text(
                            label,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 12,
                              fontWeight: form.pace == pace
                                  ? FontWeight.w700 : FontWeight.w400,
                              color: form.pace == pace
                                  ? AppTheme.primary : AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: AppTheme.spaceXl),
          Text('Language', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),
          DropdownButtonFormField<String>(
            initialValue: form.language,
            dropdownColor: AppTheme.surfaceElevated,
            style: const TextStyle(fontFamily: 'Outfit', color: AppTheme.textPrimary, fontSize: 14),
            items: languages.entries.map((e) => DropdownMenuItem(
              value: e.key,
              child: Text(e.value),
            )).toList(),
            onChanged: (v) => onChanged(form.copyWith(language: v ?? 'en')),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.translate_rounded, color: AppTheme.primary, size: 20),
            ),
          ),

          const SizedBox(height: AppTheme.spaceXl),
          Text('Include in my trip', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spaceMd),

          _ToggleTile(
            id: 'toggle-transport',
            icon: Icons.directions_bus_outlined,
            label: 'Informal Transport',
            subtitle: 'Trotros, matatus, boda bodas',
            value: form.includeTransport,
            onChanged: (v) => onChanged(form.copyWith(includeTransport: v)),
          ),
          _ToggleTile(
            id: 'toggle-markets',
            icon: Icons.storefront_outlined,
            label: 'Local Markets & Vendors',
            subtitle: 'Makola, Kejetia, street food stalls',
            value: form.includeMarkets,
            onChanged: (v) => onChanged(form.copyWith(includeMarkets: v)),
          ),
          _ToggleTile(
            id: 'toggle-tips',
            icon: Icons.forum_outlined,
            label: 'Community Travel Tips',
            subtitle: 'Insider knowledge from locals',
            value: form.includeCommunityTips,
            onChanged: (v) => onChanged(form.copyWith(includeCommunityTips: v)),
          ),
          _ToggleTile(
            id: 'toggle-homestay',
            icon: Icons.house_outlined,
            label: 'Homestays & Guesthouses',
            subtitle: 'Authentic local stays',
            value: form.includeHomestays,
            onChanged: (v) => onChanged(form.copyWith(includeHomestays: v)),
          ),

          const SizedBox(height: AppTheme.spaceMd),
        ],
      ).animate().fadeIn(duration: 350.ms).slideX(begin: 0.06, end: 0),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String id;
  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final void Function(bool) onChanged;

  const _ToggleTile({
    required this.id, required this.icon, required this.label,
    required this.subtitle, required this.value, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      key: ValueKey(id),
      duration: const Duration(milliseconds: 180),
      margin: const EdgeInsets.only(bottom: AppTheme.spaceSm),
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spaceMd, vertical: 14),
      decoration: BoxDecoration(
        color: value ? AppTheme.primary.withValues(alpha: 0.06) : AppTheme.surface,
        borderRadius: AppTheme.radiusSm,
        border: Border.all(
          color: value ? AppTheme.primary.withValues(alpha: 0.3) : AppTheme.border,
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: value ? AppTheme.primary : AppTheme.textMuted,
            size: 20,
          ),
          const SizedBox(width: AppTheme.spaceMd),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                )),
                Text(subtitle, style: const TextStyle(
                  fontFamily: 'Outfit', fontSize: 12, color: AppTheme.textMuted,
                )),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppTheme.primary,
            trackOutlineColor: WidgetStateProperty.resolveWith(
              (s) => s.contains(WidgetState.selected)
                  ? AppTheme.primary.withValues(alpha: 0.4)
                  : AppTheme.border,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bottom Bar ─────────────────────────────────────────────────────────────────

class _BottomBar extends StatelessWidget {
  final bool isLastStep;
  final bool isGenerating;
  final bool canProceed;
  final VoidCallback onNext;

  const _BottomBar({
    required this.isLastStep, required this.isGenerating,
    required this.canProceed, required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppTheme.spaceLg, AppTheme.spaceMd, AppTheme.spaceLg,
        MediaQuery.paddingOf(context).bottom + AppTheme.spaceMd,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.background,
        border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
      ),
      child: GestureDetector(
        key: const ValueKey('btn-next'),
        onTap: canProceed && !isGenerating ? onNext : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: double.infinity,
          height: 56,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: canProceed ? AppTheme.primaryGradient : null,
            color: canProceed ? null : AppTheme.surface,
            borderRadius: AppTheme.radiusMd,
            border: canProceed ? null : Border.all(color: AppTheme.border),
            boxShadow: canProceed
                ? [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: Text(
            isLastStep ? '✦  Generate My Kwan' : 'Continue',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: canProceed ? AppTheme.background : AppTheme.textMuted,
              letterSpacing: -0.2,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Generating Overlay ─────────────────────────────────────────────────────────

class _GeneratingOverlay extends StatelessWidget {
  const _GeneratingOverlay();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTheme.background.withValues(alpha: 0.92),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: AppTheme.radiusMd,
                boxShadow: AppTheme.goldGlow,
              ),
              child: const Center(
                child: Text(
                  'K',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.background,
                  ),
                ),
              ),
            )
                .animate(onPlay: (c) => c.repeat())
                .shimmer(duration: 1200.ms, color: AppTheme.primaryLight),
            const SizedBox(height: AppTheme.spaceXl),
            const Text(
              'Planning your path...',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5,
              ),
            ).animate().fadeIn(duration: 400.ms),
            const SizedBox(height: AppTheme.spaceSm),
            const Text(
              'Kwan AI is weaving together local knowledge,\nroutes, and experiences for you.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 14,
                color: AppTheme.textMuted,
                height: 1.6,
              ),
            ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: AppTheme.spaceXl),
            const SizedBox(
              width: 120,
              child: LinearProgressIndicator(
                color: AppTheme.primary,
                backgroundColor: AppTheme.border,
              ),
            ).animate(delay: 300.ms).fadeIn(duration: 400.ms),
          ],
        ),
      ),
    );
  }
}
