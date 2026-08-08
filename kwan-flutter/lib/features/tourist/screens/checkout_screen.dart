import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  final String? listingId;
  final String listingTitle;
  final double priceUsd;
  final String operatorName;
  final String? whatsapp;

  const CheckoutScreen({
    super.key,
    required this.listingId,
    required this.listingTitle,
    required this.priceUsd,
    required this.operatorName,
    this.whatsapp,
  });

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isProcessing = false;
  String? _errorMessage;

  static const double _platformFee = 0.05; // 5%

  double get _operatorReceives => widget.priceUsd * (1 - _platformFee);
  double get _platformCut => widget.priceUsd * _platformFee;

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Complete Booking'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Booking Summary ─────────────────────────────────────────────
            _BookingSummaryCard(
              title: widget.listingTitle,
              operatorName: widget.operatorName,
              priceUsd: widget.priceUsd,
              operatorReceives: _operatorReceives,
              platformFee: _platformCut,
            ).animate().fadeIn(duration: 400.ms),

            const SizedBox(height: 28),

            // ── Mobile Money Info Banner ────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.secondary.withValues(alpha: 0.1),
                borderRadius: AppTheme.radiusMd,
                border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.phone_android, color: AppTheme.secondary, size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Operator receives payment directly to their Mobile Money account. Powered by Paystack.',
                      style: TextStyle(
                        fontFamily: 'Outfit', fontSize: 13,
                        color: AppTheme.secondary, height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ).animate(delay: 200.ms).fadeIn(),

            const SizedBox(height: 28),

            // ── Tourist Details ─────────────────────────────────────────────
            Text('Your Details', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),

            TextFormField(
              key: const ValueKey('checkout-name'),
              controller: _nameController,
              style: const TextStyle(color: AppTheme.textPrimary, fontFamily: 'Outfit'),
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person_outline, color: AppTheme.primary),
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              key: const ValueKey('checkout-email'),
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: AppTheme.textPrimary, fontFamily: 'Outfit'),
              decoration: const InputDecoration(
                labelText: 'Email (for booking confirmation)',
                prefixIcon: Icon(Icons.email_outlined, color: AppTheme.primary),
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              key: const ValueKey('checkout-notes'),
              controller: _notesController,
              maxLines: 2,
              style: const TextStyle(color: AppTheme.textPrimary, fontFamily: 'Outfit'),
              decoration: const InputDecoration(
                labelText: 'Special requests (optional)',
                prefixIcon: Icon(Icons.note_outlined, color: AppTheme.primary),
              ),
            ),

            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accent.withValues(alpha: 0.1),
                  borderRadius: AppTheme.radiusSm,
                  border: Border.all(color: AppTheme.accent.withValues(alpha: 0.3)),
                ),
                child: Text(_errorMessage!,
                    style: const TextStyle(
                      fontFamily: 'Outfit', color: AppTheme.accent, fontSize: 13,
                    )),
              ),
            ],

            const SizedBox(height: 32),

            // ── Pay Button ──────────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                key: const ValueKey('btn-pay'),
                onPressed: _isProcessing ? null : _initiatePayment,
                child: _isProcessing
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
                          Text('Connecting to Paystack...'),
                        ],
                      )
                    : Text(
                        'Pay \$${widget.priceUsd.toStringAsFixed(2)} via Paystack',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
              ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.2, end: 0),
            ),

            // ── WhatsApp Alternative ────────────────────────────────────────
            if (widget.whatsapp != null) ...[
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  key: const ValueKey('btn-whatsapp-checkout'),
                  onPressed: () => _openWhatsApp(widget.whatsapp!),
                  icon: const Icon(Icons.chat_outlined, size: 18),
                  label: const Text('Or book via WhatsApp'),
                ),
              ).animate(delay: 500.ms).fadeIn(),
            ],

            const SizedBox(height: 24),

            // ── Trust indicators ────────────────────────────────────────────
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _TrustBadge(icon: Icons.lock_outline, label: 'Secure'),
                SizedBox(width: 24),
                _TrustBadge(icon: Icons.verified_outlined, label: 'Paystack'),
                SizedBox(width: 24),
                _TrustBadge(icon: Icons.phone_android, label: 'MoMo Ready'),
              ],
            ).animate(delay: 600.ms).fadeIn(),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Future<void> _initiatePayment() async {
    if (_nameController.text.trim().isEmpty || _emailController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Please enter your name and email.');
      return;
    }

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      final api = ref.read(apiServiceProvider);
      final result = await api.initializePayment({
        'listingId': widget.listingId,
        'touristEmail': _emailController.text.trim(),
        'touristName': _nameController.text.trim(),
        'amountUsd': widget.priceUsd,
        'specialRequests': _notesController.text.trim(),
        'groupSize': 1,
      });

      final authUrl = result['authorizationUrl'] as String?;
      if (authUrl != null && mounted) {
        final uri = Uri.parse(authUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          // Show success message — in production, wait for webhook/deep link
          if (mounted) {
            _showSuccessSheet(result['bookingId'] ?? '');
          }
        }
      }
    } catch (e) {
      setState(() => _errorMessage = 'Payment failed: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showSuccessSheet(String bookingId) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: AppTheme.radiusLg),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                color: AppTheme.secondary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_outline,
                  color: AppTheme.secondary, size: 40),
            ),
            const SizedBox(height: 20),
            const Text('Payment Initiated!',
                style: TextStyle(
                  fontFamily: 'Outfit', fontSize: 22,
                  fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
                )),
            const SizedBox(height: 10),
            Text(
              'Complete payment in your browser. ${widget.operatorName} will receive Mobile Money once confirmed.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Outfit', fontSize: 14,
                color: AppTheme.textSecondary, height: 1.6,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.goNamed('onboarding');
                },
                child: const Text('Back to Home'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openWhatsApp(String number) async {
    final uri = Uri.parse(
        'https://wa.me/${number.replaceAll('+', '')}?text=Hi, I\'d like to book: ${widget.listingTitle}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }
}

// ── Booking Summary Card ───────────────────────────────────────────────────────

class _BookingSummaryCard extends StatelessWidget {
  final String title;
  final String operatorName;
  final double priceUsd;
  final double operatorReceives;
  final double platformFee;

  const _BookingSummaryCard({
    required this.title, required this.operatorName,
    required this.priceUsd, required this.operatorReceives,
    required this.platformFee,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.cardGradient,
        borderRadius: AppTheme.radiusLg,
        border: Border.all(color: AppTheme.border),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.receipt_long_outlined, color: AppTheme.primary),
              const SizedBox(width: 10),
              const Text('Booking Summary',
                  style: TextStyle(
                    fontFamily: 'Outfit', fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  )),
            ],
          ),
          const SizedBox(height: 16),
          Text(title,
              style: const TextStyle(
                fontFamily: 'Outfit', fontSize: 18,
                fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
              )),
          const SizedBox(height: 4),
          Text('by $operatorName',
              style: const TextStyle(
                fontFamily: 'Outfit', color: AppTheme.primary,
              )),
          const SizedBox(height: 16),
          const Divider(color: AppTheme.border),
          const SizedBox(height: 12),
          _SummaryRow('You pay', '\$${priceUsd.toStringAsFixed(2)}', bold: true),
          const SizedBox(height: 8),
          _SummaryRow('Operator receives (MoMo)',
              '\$${operatorReceives.toStringAsFixed(2)}',
              color: AppTheme.secondary),
          const SizedBox(height: 4),
          _SummaryRow('Kwan platform fee (5%)',
              '\$${platformFee.toStringAsFixed(2)}',
              color: AppTheme.textMuted, small: true),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? color;
  final bool small;

  const _SummaryRow(this.label, this.value,
      {this.bold = false, this.color, this.small = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: small ? 12 : 14,
              color: color ?? AppTheme.textSecondary,
            )),
        Text(value,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: small ? 12 : 14,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              color: color ?? AppTheme.textPrimary,
            )),
      ],
    );
  }
}

class _TrustBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  const _TrustBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.textMuted, size: 18),
        const SizedBox(height: 4),
        Text(label,
            style: const TextStyle(
              fontFamily: 'Outfit', fontSize: 11,
              color: AppTheme.textMuted,
            )),
      ],
    );
  }
}
