import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';

class AddListingScreen extends ConsumerStatefulWidget {
  final String operatorId;
  const AddListingScreen({super.key, required this.operatorId});

  @override
  ConsumerState<AddListingScreen> createState() => _AddListingScreenState();
}

class _AddListingScreenState extends ConsumerState<AddListingScreen> {
  final _formKey = GlobalKey<FormState>();

  // Form state
  String _title = '';
  String _description = '';
  String _category = 'DAY_TOUR';
  double _price = 0;
  String _currency = 'GHS';
  String _city = '';
  String _locationDetails = '';
  int _durationHours = 2;
  int _maxGroupSize = 10;
  String _whatsapp = '';
  String _instagram = '';
  final List<String> _selectedTags = [];
  bool _isSubmitting = false;

  static const _categories = {
    'DAY_TOUR': '🗺️ Day Tour',
    'MULTI_DAY_TOUR': '🏕️ Multi-Day Tour',
    'ACCOMMODATION': '🏠 Accommodation',
    'FOOD_EXPERIENCE': '🍽️ Food Experience',
    'TRANSPORT': '🚌 Transport Service',
    'CULTURAL_EXPERIENCE': '🎭 Cultural Experience',
    'STREET_VENDOR': '🛒 Market / Street Vendor',
    'ADVENTURE': '🧗 Adventure',
    'WELLNESS': '🧘 Wellness',
    'PHOTOGRAPHY': '📸 Photography',
  };

  static const _currencies = ['GHS', 'NGN', 'XOF', 'XAF', 'USD'];

  static const _allTags = [
    'history', 'culture', 'food', 'market', 'beach', 'wildlife',
    'eco', 'family-friendly', 'budget-friendly', 'luxury',
    'photography', 'adventure', 'nightlife', 'community',
    'trotro', 'matatu', 'homestay', 'heritage', 'music',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Add Listing'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, size: 20),
          color: AppTheme.textSecondary,
          onPressed: () => context.pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── AI Embedding Notice ─────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(AppTheme.spaceMd),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: AppTheme.radiusMd,
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withValues(alpha: 0.1),
                        borderRadius: AppTheme.radiusSm,
                      ),
                      child: const Icon(Icons.auto_awesome_outlined,
                          color: AppTheme.primary, size: 16),
                    ),
                    const SizedBox(width: AppTheme.spaceMd),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Kwan AI will index this listing',
                              style: TextStyle(
                                fontFamily: 'Outfit', fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary, fontSize: 13,
                              )),
                          SizedBox(height: 3),
                          Text(
                            'Travellers building AI itineraries for your city will automatically discover your business.',
                            style: TextStyle(
                              fontFamily: 'Outfit', fontSize: 12,
                              color: AppTheme.textSecondary, height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),



              const SizedBox(height: 28),

              // ── Category Selection ──────────────────────────────────────
              _SectionLabel('Category'),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: _categories.entries.map((e) {
                  final selected = _category == e.key;
                  return GestureDetector(
                    onTap: () => setState(() => _category = e.key),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? AppTheme.primary.withValues(alpha: 0.15) : AppTheme.surfaceElevated,
                        borderRadius: AppTheme.radiusSm,
                        border: Border.all(
                          color: selected ? AppTheme.primary : AppTheme.border,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Text(e.value,
                          style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 13,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                            color: selected ? AppTheme.primary : AppTheme.textSecondary,
                          )),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),

              // ── Basic Info ──────────────────────────────────────────────
              _SectionLabel('Listing Details'),
              const SizedBox(height: 12),

              _Field(
                id: 'field-title',
                label: 'Listing Title *',
                hint: 'e.g. Jamestown Walking Tour',
                onChanged: (v) => _title = v,
                validator: (v) => (v?.isEmpty ?? true) ? 'Title is required' : null,
              ),
              const SizedBox(height: 14),
              _Field(
                id: 'field-description',
                label: 'Description *',
                hint: 'Describe exactly what travellers get. Be specific — the AI uses this to match your listing to tourist searches.',
                onChanged: (v) => _description = v,
                maxLines: 5,
                validator: (v) =>
                    (v?.length ?? 0) < 50 ? 'Minimum 50 characters for good AI matching' : null,
              ),

              const SizedBox(height: 24),

              // ── Pricing ─────────────────────────────────────────────────
              _SectionLabel('Pricing'),
              const SizedBox(height: 12),
              Row(
                children: [
                  SizedBox(
                    width: 120,
                    child: DropdownButtonFormField<String>(
                      initialValue: _currency,
                      dropdownColor: AppTheme.surfaceElevated,
                      style: const TextStyle(fontFamily: 'Outfit', color: AppTheme.textPrimary),
                      decoration: const InputDecoration(labelText: 'Currency'),
                      items: _currencies.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                      onChanged: (v) => setState(() => _currency = v ?? 'GHS'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      key: const ValueKey('field-price'),
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontFamily: 'Outfit', color: AppTheme.textPrimary),
                      decoration: const InputDecoration(labelText: 'Price Amount *'),
                      onChanged: (v) => _price = double.tryParse(v) ?? 0,
                      validator: (v) => (double.tryParse(v ?? '0') ?? 0) <= 0 ? 'Enter a valid price' : null,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // ── Location ─────────────────────────────────────────────────
              _SectionLabel('Location'),
              const SizedBox(height: 12),
              _Field(
                id: 'field-city',
                label: 'City *',
                hint: 'e.g. Accra',
                onChanged: (v) => _city = v,
                validator: (v) => (v?.isEmpty ?? true) ? 'City is required' : null,
              ),
              const SizedBox(height: 14),
              _Field(
                id: 'field-location',
                label: 'Meeting Point / Address',
                hint: 'e.g. Meets at Jamestown Lighthouse',
                onChanged: (v) => _locationDetails = v,
              ),

              const SizedBox(height: 24),

              // ── Details ──────────────────────────────────────────────────
              _SectionLabel('Experience Details'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Duration (hours)',
                            style: TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppTheme.textMuted)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            IconButton(
                              onPressed: _durationHours > 1
                                  ? () => setState(() => _durationHours--)
                                  : null,
                              icon: const Icon(Icons.remove_circle_outline,
                                  color: AppTheme.primary, size: 28),
                            ),
                            Text('$_durationHours h',
                                style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 18,
                                  fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                                )),
                            IconButton(
                              onPressed: () => setState(() => _durationHours++),
                              icon: const Icon(Icons.add_circle_outline,
                                  color: AppTheme.primary, size: 28),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Max Group Size',
                            style: TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppTheme.textMuted)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            IconButton(
                              onPressed: _maxGroupSize > 1
                                  ? () => setState(() => _maxGroupSize--)
                                  : null,
                              icon: const Icon(Icons.remove_circle_outline,
                                  color: AppTheme.primary, size: 28),
                            ),
                            Text('$_maxGroupSize',
                                style: const TextStyle(
                                  fontFamily: 'Outfit', fontSize: 18,
                                  fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                                )),
                            IconButton(
                              onPressed: () => setState(() => _maxGroupSize++),
                              icon: const Icon(Icons.add_circle_outline,
                                  color: AppTheme.primary, size: 28),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // ── Tags ─────────────────────────────────────────────────────
              _SectionLabel('Tags (helps AI match you)'),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: _allTags.map((tag) {
                  final selected = _selectedTags.contains(tag);
                  return GestureDetector(
                    onTap: () => setState(() {
                      selected ? _selectedTags.remove(tag) : _selectedTags.add(tag);
                    }),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? AppTheme.secondary.withValues(alpha: 0.15) : AppTheme.surfaceElevated,
                        borderRadius: AppTheme.radiusSm,
                        border: Border.all(color: selected ? AppTheme.secondary : AppTheme.border),
                      ),
                      child: Text('#$tag',
                          style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 12,
                            color: selected ? AppTheme.secondary : AppTheme.textMuted,
                            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                          )),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),

              // ── Contact ───────────────────────────────────────────────────
              _SectionLabel('Booking Contact'),
              const SizedBox(height: 12),
              _Field(
                id: 'field-whatsapp',
                label: 'WhatsApp Number',
                hint: '+233 24 123 4567',
                onChanged: (v) => _whatsapp = v,
                keyboardType: TextInputType.phone,
                prefix: const Icon(Icons.chat_outlined, color: AppTheme.primary, size: 18),
              ),
              const SizedBox(height: 14),
              _Field(
                id: 'field-instagram',
                label: 'Instagram Handle',
                hint: '@mybusiness',
                onChanged: (v) => _instagram = v,
                prefix: const Icon(Icons.camera_alt_outlined, color: AppTheme.primary, size: 18),
              ),

              const SizedBox(height: 32),

              // ── Submit ────────────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  key: const ValueKey('btn-submit-listing'),
                  onPressed: _isSubmitting ? null : _submitListing,
                  child: _isSubmitting
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
                            Text('Uploading & indexing with AI...'),
                          ],
                        )
                      : const Text('✨ Publish Listing'),
                ),
              ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.2, end: 0),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitListing() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final api = ref.read(apiServiceProvider);
      await api.createListing(widget.operatorId, {
        'title': _title,
        'description': _description,
        'category': _category,
        'priceAmount': _price,
        'priceCurrency': _currency,
        'city': _city,
        'locationDetails': _locationDetails,
        'durationHours': _durationHours,
        'maxGroupSize': _maxGroupSize,
        'tags': _selectedTags,
        'whatsappBookingLink': _whatsapp.isNotEmpty ? 'https://wa.me/${_whatsapp.replaceAll('+', '')}' : null,
        'instagramHandle': _instagram.replaceAll('@', ''),
        'isActive': true,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Listing published! Kwan AI is indexing it now.'),
            backgroundColor: AppTheme.secondary,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to publish: $e'),
            backgroundColor: AppTheme.accent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
          fontFamily: 'Outfit', fontSize: 14,
          fontWeight: FontWeight.w700, color: AppTheme.textSecondary,
          letterSpacing: 0.5,
        ),
      );
}

class _Field extends StatelessWidget {
  final String id;
  final String label;
  final String? hint;
  final void Function(String) onChanged;
  final String? Function(String?)? validator;
  final int maxLines;
  final TextInputType? keyboardType;
  final Widget? prefix;

  const _Field({
    required this.id,
    required this.label,
    this.hint,
    required this.onChanged,
    this.validator,
    this.maxLines = 1,
    this.keyboardType,
    this.prefix,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      key: ValueKey(id),
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: AppTheme.textPrimary, fontFamily: 'Outfit'),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: prefix,
      ),
      onChanged: onChanged,
      validator: validator,
    );
  }
}
