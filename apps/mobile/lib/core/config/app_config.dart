class AppConfig {
  // API Configuration
  static const String baseUrl = 'http://localhost:3001';
  static const String aiServiceUrl = 'http://localhost:8000';
  static const String wsUrl = 'ws://localhost:3001';
  
  // Production URLs (to be updated for deployment)
  static const String prodBaseUrl = 'https://api.snaktox.com';
  static const String prodAiServiceUrl = 'https://ai.snaktox.com';
  static const String prodWsUrl = 'wss://api.snaktox.com';
  
  // App Configuration
  static const String appName = 'SnaKTox';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'AI-powered snakebite emergency response system';
  
  // Emergency Configuration
  static const String emergencyHotline = '+254-20-2726300'; // Kenyatta National Hospital
  static const String emergencySms = '999';
  
  // Map Configuration
  static const double defaultLatitude = -1.2921; // Nairobi
  static const double defaultLongitude = 36.8219;
  static const double defaultZoom = 10.0;
  
  // AI Configuration
  static const double minConfidenceThreshold = 0.8;
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png'];
  
  // Offline Configuration
  static const int maxOfflineStorage = 100 * 1024 * 1024; // 100MB
  static const int cacheExpirationHours = 24;
  
  // Notification Configuration
  static const String emergencyChannelId = 'emergency_alerts';
  static const String emergencyChannelName = 'Emergency Alerts';
  static const String emergencyChannelDescription = 'Critical emergency notifications';
  
  // Security Configuration
  static const int sessionTimeoutMinutes = 30;
  static const int maxLoginAttempts = 3;
  
  // Feature Flags
  static const bool enableOfflineMode = true;
  static const bool enablePushNotifications = true;
  static const bool enableLocationTracking = true;
  static const bool enableAnalytics = true;
  
  // Development Configuration
  static const bool isDebugMode = true;
  static const bool enableLogging = true;
  static const bool enableCrashReporting = true;
  
  // Get current environment
  static bool get isProduction => !isDebugMode;
  
  // Get appropriate URLs based on environment
  static String get apiBaseUrl => isProduction ? prodBaseUrl : baseUrl;
  static String get aiApiUrl => isProduction ? prodAiServiceUrl : aiServiceUrl;
  static String get websocketUrl => isProduction ? prodWsUrl : wsUrl;
}
