// ─── Itinerary Model ──────────────────────────────────────────────────────────

class ItineraryModel {
  final String? itineraryId;
  final String destination;
  final String country;
  final int totalDays;
  final double estimatedTotalCostUsd;
  final String pace;
  final List<DayPlanModel> days;
  final List<String> travelTips;
  final TransportSummaryModel? transportSummary;
  final String? languageNote;

  const ItineraryModel({
    this.itineraryId,
    required this.destination,
    required this.country,
    required this.totalDays,
    required this.estimatedTotalCostUsd,
    required this.pace,
    required this.days,
    required this.travelTips,
    this.transportSummary,
    this.languageNote,
  });

  factory ItineraryModel.fromJson(Map<String, dynamic> json) => ItineraryModel(
        itineraryId: json['itineraryId'],
        destination: json['destination'] ?? '',
        country: json['country'] ?? '',
        totalDays: json['totalDays'] ?? 0,
        estimatedTotalCostUsd: (json['estimatedTotalCostUsd'] ?? 0).toDouble(),
        pace: json['pace'] ?? 'MODERATE',
        days: (json['days'] as List<dynamic>? ?? [])
            .map((d) => DayPlanModel.fromJson(d as Map<String, dynamic>))
            .toList(),
        travelTips: List<String>.from(json['travelTips'] ?? []),
        transportSummary: json['transportSummary'] != null
            ? TransportSummaryModel.fromJson(json['transportSummary'])
            : null,
        languageNote: json['languageNote'],
      );
}

class DayPlanModel {
  final int dayNumber;
  final String date;
  final String theme;
  final String aiNarrative;
  final double estimatedDayCostUsd;
  final List<ActivityModel> activities;

  const DayPlanModel({
    required this.dayNumber,
    required this.date,
    required this.theme,
    required this.aiNarrative,
    required this.estimatedDayCostUsd,
    required this.activities,
  });

  factory DayPlanModel.fromJson(Map<String, dynamic> json) => DayPlanModel(
        dayNumber: json['dayNumber'] ?? 0,
        date: json['date'] ?? '',
        theme: json['theme'] ?? '',
        aiNarrative: json['aiNarrative'] ?? '',
        estimatedDayCostUsd: (json['estimatedDayCostUsd'] ?? 0).toDouble(),
        activities: (json['activities'] as List<dynamic>? ?? [])
            .map((a) => ActivityModel.fromJson(a as Map<String, dynamic>))
            .toList(),
      );
}

class ActivityModel {
  final String timeSlot;
  final String title;
  final String description;
  final String category;
  final String operatorName;
  final String? operatorId;
  final String? listingId;
  final double priceLocal;
  final String localCurrency;
  final double priceUsd;
  final String location;
  final String? whatsappContact;
  final String? instagramHandle;
  final String bookingType;
  final bool isBookable;
  final List<String> localTips;
  final String? dialectPhrase;
  final String? imageUrl;

  const ActivityModel({
    required this.timeSlot,
    required this.title,
    required this.description,
    required this.category,
    required this.operatorName,
    this.operatorId,
    this.listingId,
    required this.priceLocal,
    required this.localCurrency,
    required this.priceUsd,
    required this.location,
    this.whatsappContact,
    this.instagramHandle,
    required this.bookingType,
    required this.isBookable,
    required this.localTips,
    this.dialectPhrase,
    this.imageUrl,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) => ActivityModel(
        timeSlot: json['timeSlot'] ?? 'Morning',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        category: json['category'] ?? 'DAY_TOUR',
        operatorName: json['operatorName'] ?? '',
        operatorId: json['operatorId'],
        listingId: json['listingId'],
        priceLocal: (json['priceLocal'] ?? 0).toDouble(),
        localCurrency: json['localCurrency'] ?? 'GHS',
        priceUsd: (json['priceUsd'] ?? 0).toDouble(),
        location: json['location'] ?? '',
        whatsappContact: json['whatsappContact'],
        instagramHandle: json['instagramHandle'],
        bookingType: json['bookingType'] ?? 'WALK_IN',
        isBookable: json['isBookable'] ?? false,
        localTips: List<String>.from(json['localTips'] ?? []),
        dialectPhrase: json['dialectPhrase'],
        imageUrl: json['imageUrl'],
      );
}

class TransportSummaryModel {
  final String gettingAroundTip;
  final List<TransportOptionModel> options;

  const TransportSummaryModel({
    required this.gettingAroundTip,
    required this.options,
  });

  factory TransportSummaryModel.fromJson(Map<String, dynamic> json) =>
      TransportSummaryModel(
        gettingAroundTip: json['gettingAroundTip'] ?? '',
        options: (json['options'] as List<dynamic>? ?? [])
            .map((o) => TransportOptionModel.fromJson(o as Map<String, dynamic>))
            .toList(),
      );
}

class TransportOptionModel {
  final String type;
  final String description;
  final String typicalFare;
  final String tip;

  const TransportOptionModel({
    required this.type,
    required this.description,
    required this.typicalFare,
    required this.tip,
  });

  factory TransportOptionModel.fromJson(Map<String, dynamic> json) =>
      TransportOptionModel(
        type: json['type'] ?? '',
        description: json['description'] ?? '',
        typicalFare: json['typicalFare'] ?? '',
        tip: json['tip'] ?? '',
      );
}
