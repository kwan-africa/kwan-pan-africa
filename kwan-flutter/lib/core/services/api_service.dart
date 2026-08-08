import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

String get _defaultBaseUrl {
  if (kIsWeb) return 'http://localhost:8080';
  if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
}

const String _customBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

final dioProvider = Provider<Dio>((ref) {
  final baseUrl = _customBaseUrl.isNotEmpty ? _customBaseUrl : _defaultBaseUrl;
  return Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 120),
    headers: {'Content-Type': 'application/json'},
  ))
    ..interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: false,
      error: true,
    ));
});

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.read(dioProvider));
});

class ApiService {
  final Dio _dio;
  ApiService(this._dio);

  // ── Itinerary ─────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> generateItinerary(Map<String, dynamic> request) async {
    final response = await _dio.post('/api/itinerary/generate', data: request);
    return response.data as Map<String, dynamic>;
  }

  // ── Operators & Listings ──────────────────────────────────────────────────

  Future<List<dynamic>> getOperators({String? country}) async {
    final response = await _dio.get('/api/operators',
        queryParameters: country != null ? {'country': country} : null);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getOperatorDashboard(String operatorId) async {
    final response = await _dio.get('/api/operators/$operatorId/dashboard');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createOperator(Map<String, dynamic> data) async {
    final response = await _dio.post('/api/operators', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createListing(
      String operatorId, Map<String, dynamic> data) async {
    final response = await _dio.post('/api/operators/$operatorId/listings', data: data);
    return response.data as Map<String, dynamic>;
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> initializePayment(Map<String, dynamic> request) async {
    final response = await _dio.post('/api/payments/initialize', data: request);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyPayment(String reference) async {
    final response = await _dio.get('/api/payments/verify',
        queryParameters: {'reference': reference});
    return response.data as Map<String, dynamic>;
  }
}
