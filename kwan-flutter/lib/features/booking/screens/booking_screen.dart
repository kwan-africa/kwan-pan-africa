import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/operator_model.dart';
import '../../core/router/app_router.dart';

class BookingScreen extends StatefulWidget {
  final String operatorId;
  final String experienceId;
  const BookingScreen({super.key, required this.operatorId, required this.experienceId});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late KwanOperator _operator;
  late KwanExperience _experience;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 3));
  int _guests = 1;
  bool _paying = false;

  @override
  void initState() {
    super.initState();
    _operator = kDemoOperators.firstWhere((o) => o.id == widget.operatorId);
    _experience = _operator.experiences.firstWhere((e) => e.id == widget.experienceId);
  }

  double get _total => _experience.priceUsd * _guests;
  double get _operatorEarns => _total * 0.90;
  double get _kwanFee => _total * 0.10;

  Future<void> _processPayment() async {
    setState(() => _paying = true);
    // Simulate Paystack escrow processing
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() => _paying = false);
    final bookingRef = 'KWN-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    context.go(AppRoutes.confirmation, extra: {'ref': bookingRef});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Confirm Booking'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Experience summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(children: [
              Text(_operator.heroEmoji,
                  style: const TextStyle(fontSize: 36)),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(_experience.title,
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 15,
                        fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                Text(_operator.name,
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 13,
                        color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Row(children: [
                  const Icon(Icons.verified, color: AppTheme.secondary, size: 13),
                  const SizedBox(width: 4),
                  const Text('Ghana Card Verified',
                      style: TextStyle(
                          fontFamily: 'Outfit', fontSize: 11,
                          color: AppTheme.secondary, fontWeight: FontWeight.w600)),
                ]),
              ])),
            ]),
          ),
          const SizedBox(height: 24),

          // Date selector
          _SectionLabel(label: 'Select Date'),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: List.generate(7, (i) {
              final date = DateTime.now().add(Duration(days: i + 1));
              final selected = _selectedDate.day == date.day;
              final weekDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  [date.weekday - 1];
              return GestureDetector(
                onTap: () => setState(() => _selectedDate = date),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: selected ? AppTheme.primary : AppTheme.surface,
                    borderRadius: AppTheme.radiusSm,
                    border: Border.all(
                        color: selected ? AppTheme.primary : AppTheme.border),
                  ),
                  child: Column(children: [
                    Text(weekDay,
                        style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: selected ? AppTheme.background : AppTheme.textMuted)),
                    const SizedBox(height: 4),
                    Text('${date.day}',
                        style: TextStyle(
                            fontFamily: 'Outfit', fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: selected ? AppTheme.background : AppTheme.textPrimary)),
                  ]),
                ),
              );
            })),
          ),
          const SizedBox(height: 24),

          // Guest counter
          _SectionLabel(label: 'Number of Guests'),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(children: [
              const Icon(Icons.people_outline, color: AppTheme.textSecondary, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text('$_guests guest${_guests > 1 ? "s" : ""}',
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 15,
                        fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              ),
              _CounterButton(
                icon: Icons.remove_rounded,
                onTap: _guests > 1 ? () => setState(() => _guests--) : null,
              ),
              const SizedBox(width: 16),
              Text('$_guests',
                  style: const TextStyle(
                      fontFamily: 'Outfit', fontSize: 18,
                      fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
              const SizedBox(width: 16),
              _CounterButton(
                icon: Icons.add_rounded,
                onTap: _guests < _experience.maxGroupSize
                    ? () => setState(() => _guests++)
                    : null,
              ),
            ]),
          ),
          const SizedBox(height: 24),

          // Escrow breakdown
          _SectionLabel(label: 'Kwan Smart Escrow Breakdown'),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: AppTheme.radiusMd,
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(children: [
              _BreakdownRow(
                  label: 'Experience (×$_guests)',
                  value: '\$${_total.toStringAsFixed(2)}'),
              const Divider(color: AppTheme.border, height: 1),
              _BreakdownRow(
                  label: 'To ${_operator.name.split(" ").first} (90%)',
                  value: '\$${_operatorEarns.toStringAsFixed(2)}',
                  valueColor: AppTheme.secondary),
              _BreakdownRow(
                  label: 'Kwan platform fee (10%)',
                  value: '\$${_kwanFee.toStringAsFixed(2)}',
                  valueColor: AppTheme.textMuted),
              const Divider(color: AppTheme.border, height: 1),
              _BreakdownRow(
                  label: 'Total charged to your card',
                  value: '\$${_total.toStringAsFixed(2)}',
                  bold: true,
                  valueColor: AppTheme.primary),
            ]),
          ),
          const SizedBox(height: 12),
          // Escrow note
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.secondary.withValues(alpha: 0.06),
              borderRadius: AppTheme.radiusSm,
              border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.2)),
            ),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(Icons.lock_outline, color: AppTheme.secondary, size: 14),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                    'Your payment is held in Kwan Secure Escrow. '
                    '\$${_operatorEarns.toStringAsFixed(2)} is released to '
                    '${_operator.name.split(" ").first}\'s ${_operator.momoProvider} MoMo wallet '
                    'within 24 hours of your completed experience.',
                    style: const TextStyle(
                        fontFamily: 'Outfit', fontSize: 11,
                        color: AppTheme.textSecondary, height: 1.55)),
              ),
            ]),
          ),
          const SizedBox(height: 32),

          // Pay CTA
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _paying ? null : _processPayment,
              child: _paying
                  ? const SizedBox(
                      height: 20, width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppTheme.background))
                  : Text(
                      'Pay \$${_total.toStringAsFixed(2)} · Powered by Paystack',
                    ),
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              '🔒 3D Secure · Zero fraud risk · Escrow protected',
              style: TextStyle(
                  fontFamily: 'Outfit', fontSize: 11,
                  color: AppTheme.textMuted),
            ),
          ),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(label,
        style: const TextStyle(
            fontFamily: 'Outfit', fontSize: 12,
            fontWeight: FontWeight.w700, color: AppTheme.textMuted,
            letterSpacing: 0.8));
  }
}

class _CounterButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  const _CounterButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    final active = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34, height: 34,
        decoration: BoxDecoration(
          color: active ? AppTheme.primary.withValues(alpha: 0.1) : AppTheme.surface,
          shape: BoxShape.circle,
          border: Border.all(color: active ? AppTheme.primary : AppTheme.border),
        ),
        child: Icon(icon,
            size: 16,
            color: active ? AppTheme.primary : AppTheme.textMuted),
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  final String label, value;
  final bool bold;
  final Color? valueColor;
  const _BreakdownRow({required this.label, required this.value,
      this.bold = false, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(
          child: Text(label,
              style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: bold ? 13 : 12,
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                  color: bold ? AppTheme.textPrimary : AppTheme.textSecondary)),
        ),
        Text(value,
            style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: bold ? 15 : 13,
                fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
                color: valueColor ?? AppTheme.textPrimary)),
      ]),
    );
  }
}
