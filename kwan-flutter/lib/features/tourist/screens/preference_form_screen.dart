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
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: _currentStep == 0
              ? () => context.pop()
              : () => _previousStep(),
        ),
        title: Text('Plan Your Kwan — Step ${_currentStep + 1} of $_totalSteps'),
      ),
      body: Column(
        children: [
          // ── Progress Bar ────────────────────────────────────────────────
          _ProgressBar(current: _currentStep, total: _totalSteps),

          // ── Page Content ────────────────────────────────────────────────
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

          // ── Bottom CTA ──────────────────────────────────────────────────
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Where are you headed?',
              style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 8),
          Text('Choose your destination country and city.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),

          Text('Country', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _countries.entries.map((e) {
              final selected = form.country == e.key;
              return GestureDetector(
                onTap: () => onChanged(form.copyWith(country: e.key)),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: selected ? AppTheme.primary.withValues(alpha: 0.15) : AppTheme.surfaceElevated,
                    borderRadius: AppTheme.radiusSm,
                    border: Border.all(
                      color: selected ? AppTheme.primary : AppTheme.border,
                      width: selected ? 2 : 1,
                    ),
                  ),
                  child: Text(
                    e.value,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 14,
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                      color: selected ? AppTheme.primary : AppTheme.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 32),
          Text('City', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          TextFormField(
            key: ValueKey('destination-input'),
            initialValue: form.destination,
            style: const TextStyle(color: AppTheme.textPrimary, fontFamily: 'Outfit'),
            decoration: const InputDecoration(
              hintText: 'e.g. Accra, Lagos, Dakar...',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary),
            ),
            onChanged: (v) => onChanged(form.copyWith(destination: v)),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0),
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('When & How much?',
              style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 8),
          Text('Kwan will plan your days and stay within your budget.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),

          // Date pickers
          Row(
            children: [
              Expanded(child: _DatePickerCard(
                label: 'Start Date',
                date: form.startDate,
                onPicked: (d) => onChanged(form.copyWith(startDate: d)),
              )),
              const SizedBox(width: 12),
              Expanded(child: _DatePickerCard(
                label: 'End Date',
                date: form.endDate,
                onPicked: (d) => onChanged(form.copyWith(endDate: d)),
              )),
            ],
          ),

          if (form.totalDays > 0) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: AppTheme.radiusSm,
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today, color: AppTheme.primary, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    '${form.totalDays} day${form.totalDays > 1 ? "s" : ""} planned',
                    style: const TextStyle(
                      fontFamily: 'Outfit', color: AppTheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),
          Text('Total Budget (USD)', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Text(
            '\$${form.budgetUsd.toStringAsFixed(0)}',
            style: const TextStyle(
              fontFamily: 'Outfit', fontSize: 36,
              fontWeight: FontWeight.w700, color: AppTheme.primary,
            ),
          ),
          Slider(
            value: form.budgetUsd,
            min: 50, max: 5000,
            divisions: 99,
            activeColor: AppTheme.primary,
            inactiveColor: AppTheme.border,
            onChanged: (v) => onChanged(form.copyWith(budgetUsd: v)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('\$50', style: Theme.of(context).textTheme.bodySmall),
              Text('\$5,000', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),

          const SizedBox(height: 28),
          Text('Group Size', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton(
                onPressed: form.groupSize > 1
                    ? () => onChanged(form.copyWith(groupSize: form.groupSize - 1))
                    : null,
                icon: const Icon(Icons.remove_circle_outline, color: AppTheme.primary),
                iconSize: 32,
              ),
              const SizedBox(width: 8),
              Text('${form.groupSize}',
                  style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () => onChanged(form.copyWith(groupSize: form.groupSize + 1)),
                icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
                iconSize: 32,
              ),
              const SizedBox(width: 8),
              Text(
                form.groupSize == 1 ? 'Solo traveller' : 'travellers',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0),
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
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surfaceElevated,
          borderRadius: AppTheme.radiusMd,
          border: Border.all(
            color: date != null ? AppTheme.primary : AppTheme.border,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(
              fontFamily: 'Outfit', fontSize: 11,
              color: AppTheme.textMuted, letterSpacing: 0.5,
            )),
            const SizedBox(height: 8),
            Text(
              date != null
                  ? '${date!.day}/${date!.month}/${date!.year}'
                  : 'Pick date',
              style: TextStyle(
                fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.w600,
                color: date != null ? AppTheme.textPrimary : AppTheme.textMuted,
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('What moves you?', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 8),
          Text('Kwan will build your trip around these passions.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: allInterests.map((interest) {
              final selected = form.interests.contains(interest);
              return GestureDetector(
                onTap: () {
                  final updated = List<String>.from(form.interests);
                  selected ? updated.remove(interest) : updated.add(interest);
                  onChanged(form.copyWith(interests: updated));
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: selected ? AppTheme.primary.withValues(alpha: 0.15) : AppTheme.surfaceElevated,
                    borderRadius: AppTheme.radiusMd,
                    border: Border.all(
                      color: selected ? AppTheme.primary : AppTheme.border,
                      width: selected ? 2 : 1,
                    ),
                  ),
                  child: Text(interest,
                    style: TextStyle(
                      fontFamily: 'Outfit', fontSize: 14,
                      fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                      color: selected ? AppTheme.primary : AppTheme.textSecondary,
                    )),
                ),
              );
            }).toList(),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0),
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Almost there.', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 8),
          Text('Kwan personalises every detail.',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),

          // Pace
          Text('Travel Pace', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          Row(
            children: ['RELAXED', 'MODERATE', 'PACKED'].map((p) {
              final label = p == 'RELAXED' ? '🧘 Relaxed'
                  : p == 'MODERATE' ? '🚶 Moderate' : '🏃 Packed';
              final selected = form.pace == p;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onChanged(form.copyWith(pace: p)),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: selected ? AppTheme.primary.withValues(alpha: 0.15) : AppTheme.surfaceElevated,
                      borderRadius: AppTheme.radiusSm,
                      border: Border.all(color: selected ? AppTheme.primary : AppTheme.border),
                    ),
                    child: Text(label,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Outfit', fontSize: 12,
                        fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                        color: selected ? AppTheme.primary : AppTheme.textSecondary,
                      )),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),
          Text('Language', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: form.language,
            dropdownColor: AppTheme.surfaceElevated,
            style: const TextStyle(fontFamily: 'Outfit', color: AppTheme.textPrimary),
            items: languages.entries.map((e) => DropdownMenuItem(
              value: e.key,
              child: Text(e.value),
            )).toList(),
            onChanged: (v) => onChanged(form.copyWith(language: v ?? 'en')),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.translate, color: AppTheme.primary),
            ),
          ),

          const SizedBox(height: 28),
          Text('Include in my trip', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),

          _ToggleTile(
            id: 'toggle-transport',
            icon: '🚌',
            label: 'Informal Transport',
            subtitle: 'Trotros, matatus, boda bodas',
            value: form.includeTransport,
            onChanged: (v) => onChanged(form.copyWith(includeTransport: v)),
          ),
          _ToggleTile(
            id: 'toggle-markets',
            icon: '🛒',
            label: 'Local Markets & Vendors',
            subtitle: 'Makola, Kejetia, street food stalls',
            value: form.includeMarkets,
            onChanged: (v) => onChanged(form.copyWith(includeMarkets: v)),
          ),
          _ToggleTile(
            id: 'toggle-tips',
            icon: '💬',
            label: 'Community Travel Tips',
            subtitle: 'Insider knowledge from locals',
            value: form.includeCommunityTips,
            onChanged: (v) => onChanged(form.copyWith(includeCommunityTips: v)),
          ),
          _ToggleTile(
            id: 'toggle-homestay',
            icon: '🏠',
            label: 'Homestays & Guesthouses',
            subtitle: 'Authentic local stays',
            value: form.includeHomestays,
            onChanged: (v) => onChanged(form.copyWith(includeHomestays: v)),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String id;
  final String icon;
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
    return Container(
      key: ValueKey(id),
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: AppTheme.radiusSm,
        border: Border.all(color: value ? AppTheme.primary.withValues(alpha: 0.4) : AppTheme.border),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 14),
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
            activeThumbColor: AppTheme.primary,
          ),
        ],
      ),
    );
  }
}

// ── Progress Bar ───────────────────────────────────────────────────────────────

class _ProgressBar extends StatelessWidget {
  final int current;
  final int total;
  const _ProgressBar({required this.current, required this.total});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      color: AppTheme.border,
      child: FractionallySizedBox(
        widthFactor: (current + 1) / total,
        alignment: Alignment.centerLeft,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
        ),
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
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.border)),
      ),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          key: const ValueKey('btn-next'),
          onPressed: canProceed && !isGenerating ? onNext : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: canProceed ? null : AppTheme.border,
          ),
          child: isGenerating
              ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(
                        color: AppTheme.background, strokeWidth: 2,
                      ),
                    ),
                    SizedBox(width: 12),
                    Text('Kwan is building your path...'),
                  ],
                )
              : Text(isLastStep ? '✨ Generate My Kwan' : 'Continue →'),
        ),
      ),
    );
  }
}
