import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/offline_service.dart';
import '../services/sync_service.dart';
import '../services/storage_service.dart';
import '../services/notification_service.dart';
import '../services/location_service.dart';

// Offline Service Provider
final offlineServiceProvider = Provider<OfflineService>((ref) {
  return OfflineService();
});

// Sync Service Provider
final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService();
});

// Storage Service Provider
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

// Notification Service Provider
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

// Location Service Provider
final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService();
});

// Connectivity Provider
final connectivityProvider = StreamProvider<bool>((ref) {
  final syncService = ref.watch(syncServiceProvider);
  return Stream.periodic(
    const Duration(seconds: 5),
    (_) => syncService.isOnline,
  );
});

// Sync Status Provider
final syncStatusProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final syncService = ref.watch(syncServiceProvider);
  return await syncService.getSyncStatus();
});

// Offline Data Provider
final offlineDataProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final offlineService = ref.watch(offlineServiceProvider);
  final keys = await offlineService.getAllOfflineKeys();
  
  final data = <String, dynamic>{};
  for (final key in keys) {
    final value = await offlineService.getOfflineData(key);
    if (value != null) {
      data[key] = value;
    }
  }
  
  return data;
});

// User Data Provider
final userDataProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getUserData();
});

// App Settings Provider
final appSettingsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  
  return {
    'theme_mode': await storageService.getThemeMode(),
    'language': await storageService.getLanguage(),
    'notifications_enabled': await storageService.getNotificationsEnabled(),
    'location_enabled': await storageService.getLocationEnabled(),
    'offline_mode': await storageService.getOfflineMode(),
  };
});

// Snake Species Provider
final snakeSpeciesProvider = FutureProvider<List<Map<String, dynamic>>?>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getSnakeSpecies();
});

// Hospitals Provider
final hospitalsProvider = FutureProvider<List<Map<String, dynamic>>?>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getHospitals();
});

// Education Content Provider
final educationContentProvider = FutureProvider<List<Map<String, dynamic>>?>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getEducationContent();
});

// Emergency Contacts Provider
final emergencyContactsProvider = FutureProvider<List<Map<String, dynamic>>?>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getEmergencyContacts();
});

// Storage Size Provider
final storageSizeProvider = FutureProvider<int>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getStorageSize();
});

// Storage Breakdown Provider
final storageBreakdownProvider = FutureProvider<Map<String, int>>((ref) async {
  final storageService = ref.watch(storageServiceProvider);
  return await storageService.getStorageBreakdown();
});

// Pending Operations Provider
final pendingOperationsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final syncService = ref.watch(syncServiceProvider);
  return await syncService.getPendingOperations();
});

// Theme Mode Provider
final themeModeProvider = StateProvider<String>((ref) {
  return 'system';
});

// Language Provider
final languageProvider = StateProvider<String>((ref) {
  return 'en';
});

// Notifications Enabled Provider
final notificationsEnabledProvider = StateProvider<bool>((ref) {
  return true;
});

// Location Enabled Provider
final locationEnabledProvider = StateProvider<bool>((ref) {
  return true;
});

// Offline Mode Provider
final offlineModeProvider = StateProvider<bool>((ref) {
  return true;
});

// Emergency Mode Provider
final emergencyModeProvider = StateProvider<bool>((ref) {
  return false;
});

// App Initialization Provider
final appInitializationProvider = FutureProvider<bool>((ref) async {
  try {
    final offlineService = ref.watch(offlineServiceProvider);
    final syncService = ref.watch(syncServiceProvider);
    final storageService = ref.watch(storageServiceProvider);
    final notificationService = ref.watch(notificationServiceProvider);
    final locationService = ref.watch(locationServiceProvider);

    // Initialize all services
    await Future.wait([
      offlineService.initialize(),
      syncService.initialize(),
      storageService.initialize(),
      NotificationService.initialize(),
      LocationService.initialize(),
    ]);

    return true;
  } catch (e) {
    print('Error initializing app: $e');
    return false;
  }
});

// Router Provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      
      // Authentication
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main App with Bottom Navigation
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/emergency',
            name: 'emergency',
            builder: (context, state) => const EmergencyPage(),
          ),
          GoRoute(
            path: '/snake-identification',
            name: 'snake-identification',
            builder: (context, state) => const SnakeIdentificationPage(),
          ),
          GoRoute(
            path: '/hospitals',
            name: 'hospitals',
            builder: (context, state) => const HospitalsPage(),
          ),
          GoRoute(
            path: '/education',
            name: 'education',
            builder: (context, state) => const EducationPage(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});
