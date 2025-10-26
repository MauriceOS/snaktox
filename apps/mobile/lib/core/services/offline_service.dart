import 'dart:convert';
import 'dart:io';
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class OfflineService {
  static final OfflineService _instance = OfflineService._internal();
  factory OfflineService() => _instance;
  OfflineService._internal();

  late Box _offlineBox;
  late Box _syncQueueBox;
  late Box _cacheBox;
  bool _isInitialized = false;

  // Connectivity
  final Connectivity _connectivity = Connectivity();
  final InternetConnectionChecker _connectionChecker = InternetConnectionChecker();

  // Sync status
  bool _isOnline = false;
  bool _isSyncing = false;
  DateTime? _lastSyncTime;

  // Getters
  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;
  DateTime? get lastSyncTime => _lastSyncTime;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialize Hive boxes
      _offlineBox = await Hive.openBox('offline_data');
      _syncQueueBox = await Hive.openBox('sync_queue');
      _cacheBox = await Hive.openBox('cache_data');

      // Check initial connectivity
      await _checkConnectivity();

      // Listen to connectivity changes
      _connectivity.onConnectivityChanged.listen((result) {
        _handleConnectivityChange(result);
      });

      // Start periodic sync
      _startPeriodicSync();

      _isInitialized = true;
      print('OfflineService initialized successfully');
    } catch (e) {
      print('Error initializing OfflineService: $e');
      rethrow;
    }
  }

  Future<void> _checkConnectivity() async {
    try {
      final connectivityResult = await _connectivity.checkConnectivity();
      final hasInternet = await _connectionChecker.hasConnection;
      
      _isOnline = connectivityResult != ConnectivityResult.none && hasInternet;
      
      if (_isOnline && !_isSyncing) {
        _triggerSync();
      }
    } catch (e) {
      print('Error checking connectivity: $e');
      _isOnline = false;
    }
  }

  void _handleConnectivityChange(List<ConnectivityResult> results) {
    final hasConnection = results.any((result) => 
      result != ConnectivityResult.none);
    
    if (hasConnection != _isOnline) {
      _isOnline = hasConnection;
      
      if (_isOnline) {
        _triggerSync();
      }
    }
  }

  void _startPeriodicSync() {
    // Sync every 5 minutes when online
    Future.delayed(const Duration(minutes: 5), () {
      if (_isOnline && !_isSyncing) {
        _triggerSync();
      }
      _startPeriodicSync();
    });
  }

  Future<void> _triggerSync() async {
    if (_isSyncing || !_isOnline) return;

    _isSyncing = true;
    try {
      await _syncPendingData();
      await _updateCache();
      _lastSyncTime = DateTime.now();
      
      // Save last sync time
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_sync_time', _lastSyncTime!.toIso8601String());
    } catch (e) {
      print('Error during sync: $e');
    } finally {
      _isSyncing = false;
    }
  }

  // Data Storage Methods
  Future<void> storeOfflineData(String key, Map<String, dynamic> data) async {
    try {
      await _offlineBox.put(key, jsonEncode(data));
      print('Data stored offline: $key');
    } catch (e) {
      print('Error storing offline data: $e');
    }
  }

  Future<Map<String, dynamic>?> getOfflineData(String key) async {
    try {
      final data = _offlineBox.get(key);
      if (data != null) {
        return jsonDecode(data);
      }
      return null;
    } catch (e) {
      print('Error getting offline data: $e');
      return null;
    }
  }

  Future<void> removeOfflineData(String key) async {
    try {
      await _offlineBox.delete(key);
      print('Offline data removed: $key');
    } catch (e) {
      print('Error removing offline data: $e');
    }
  }

  Future<List<String>> getAllOfflineKeys() async {
    try {
      return _offlineBox.keys.cast<String>().toList();
    } catch (e) {
      print('Error getting offline keys: $e');
      return [];
    }
  }

  // Cache Methods
  Future<void> cacheData(String key, Map<String, dynamic> data, {Duration? expiry}) async {
    try {
      final cacheEntry = {
        'data': data,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'expiry': expiry?.inMilliseconds,
      };
      
      await _cacheBox.put(key, jsonEncode(cacheEntry));
      print('Data cached: $key');
    } catch (e) {
      print('Error caching data: $e');
    }
  }

  Future<Map<String, dynamic>?> getCachedData(String key) async {
    try {
      final cacheEntry = _cacheBox.get(key);
      if (cacheEntry == null) return null;

      final entry = jsonDecode(cacheEntry);
      final timestamp = entry['timestamp'] as int;
      final expiry = entry['expiry'] as int?;

      // Check if cache is expired
      if (expiry != null) {
        final expiryTime = DateTime.fromMillisecondsSinceEpoch(timestamp + expiry);
        if (DateTime.now().isAfter(expiryTime)) {
          await _cacheBox.delete(key);
          return null;
        }
      }

      return entry['data'];
    } catch (e) {
      print('Error getting cached data: $e');
      return null;
    }
  }

  Future<void> clearCache() async {
    try {
      await _cacheBox.clear();
      print('Cache cleared');
    } catch (e) {
      print('Error clearing cache: $e');
    }
  }

  // Sync Queue Methods
  Future<void> addToSyncQueue(String operation, Map<String, dynamic> data) async {
    try {
      final syncItem = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'operation': operation,
        'data': data,
        'timestamp': DateTime.now().toIso8601String(),
        'retryCount': 0,
      };

      await _syncQueueBox.put(syncItem['id'], jsonEncode(syncItem));
      print('Added to sync queue: $operation');
    } catch (e) {
      print('Error adding to sync queue: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getSyncQueue() async {
    try {
      final items = <Map<String, dynamic>>[];
      for (final key in _syncQueueBox.keys) {
        final item = jsonDecode(_syncQueueBox.get(key));
        items.add(item);
      }
      return items;
    } catch (e) {
      print('Error getting sync queue: $e');
      return [];
    }
  }

  Future<void> removeFromSyncQueue(String id) async {
    try {
      await _syncQueueBox.delete(id);
      print('Removed from sync queue: $id');
    } catch (e) {
      print('Error removing from sync queue: $e');
    }
  }

  Future<void> clearSyncQueue() async {
    try {
      await _syncQueueBox.clear();
      print('Sync queue cleared');
    } catch (e) {
      print('Error clearing sync queue: $e');
    }
  }

  // Sync Methods
  Future<void> _syncPendingData() async {
    try {
      final syncItems = await getSyncQueue();
      
      for (final item in syncItems) {
        try {
          await _syncItem(item);
          await removeFromSyncQueue(item['id']);
        } catch (e) {
          print('Error syncing item ${item['id']}: $e');
          
          // Increment retry count
          final retryCount = (item['retryCount'] ?? 0) + 1;
          if (retryCount >= 3) {
            // Remove after 3 failed attempts
            await removeFromSyncQueue(item['id']);
          } else {
            // Update retry count
            item['retryCount'] = retryCount;
            await _syncQueueBox.put(item['id'], jsonEncode(item));
          }
        }
      }
    } catch (e) {
      print('Error syncing pending data: $e');
    }
  }

  Future<void> _syncItem(Map<String, dynamic> item) async {
    // This would integrate with your API service
    // For now, we'll simulate the sync
    final operation = item['operation'] as String;
    final data = item['data'] as Map<String, dynamic>;
    
    print('Syncing $operation with data: $data');
    
    // Simulate API call delay
    await Future.delayed(const Duration(seconds: 1));
    
    // In a real implementation, you would make actual API calls here
    // based on the operation type (create, update, delete, etc.)
  }

  Future<void> _updateCache() async {
    try {
      // Update frequently accessed data
      await _cacheSnakeSpecies();
      await _cacheHospitals();
      await _cacheEducationContent();
    } catch (e) {
      print('Error updating cache: $e');
    }
  }

  Future<void> _cacheSnakeSpecies() async {
    // Cache snake species data for offline access
    final speciesData = {
      'species': [
        {
          'id': '1',
          'scientificName': 'Naja pallida',
          'commonName': 'Red Spitting Cobra',
          'riskLevel': 'HIGH',
          'firstAid': [
            'Keep the victim calm and still',
            'Remove any jewelry or tight clothing',
            'Do not apply a tourniquet',
            'Seek immediate medical attention',
          ],
        },
        // Add more species data
      ],
      'lastUpdated': DateTime.now().toIso8601String(),
    };

    await cacheData('snake_species', speciesData, expiry: const Duration(hours: 24));
  }

  Future<void> _cacheHospitals() async {
    // Cache hospital data for offline access
    final hospitalsData = {
      'hospitals': [
        {
          'id': '1',
          'name': 'Kenyatta National Hospital',
          'location': {
            'latitude': -1.3048,
            'longitude': 36.8156,
          },
          'phone': '+254-20-2726300',
          'hasAntivenom': true,
        },
        // Add more hospital data
      ],
      'lastUpdated': DateTime.now().toIso8601String(),
    };

    await cacheData('hospitals', hospitalsData, expiry: const Duration(hours: 12));
  }

  Future<void> _cacheEducationContent() async {
    // Cache education content for offline access
    final educationData = {
      'content': [
        {
          'id': '1',
          'title': 'Snakebite First Aid',
          'category': 'first_aid',
          'content': 'Immediate steps to take after a snakebite...',
          'language': 'en',
        },
        // Add more education content
      ],
      'lastUpdated': DateTime.now().toIso8601String(),
    };

    await cacheData('education_content', educationData, expiry: const Duration(hours: 6));
  }

  // Utility Methods
  Future<bool> isDataStale(String key, Duration maxAge) async {
    try {
      final data = await getOfflineData(key);
      if (data == null) return true;

      final lastUpdated = DateTime.parse(data['lastUpdated']);
      return DateTime.now().difference(lastUpdated) > maxAge;
    } catch (e) {
      print('Error checking data staleness: $e');
      return true;
    }
  }

  Future<int> getOfflineDataSize() async {
    try {
      int totalSize = 0;
      for (final key in _offlineBox.keys) {
        final data = _offlineBox.get(key);
        if (data is String) {
          totalSize += data.length;
        }
      }
      return totalSize;
    } catch (e) {
      print('Error calculating offline data size: $e');
      return 0;
    }
  }

  Future<void> cleanupOldData() async {
    try {
      final maxAge = const Duration(days: 30);
      final keys = await getAllOfflineKeys();
      
      for (final key in keys) {
        if (await isDataStale(key, maxAge)) {
          await removeOfflineData(key);
        }
      }
      
      print('Old offline data cleaned up');
    } catch (e) {
      print('Error cleaning up old data: $e');
    }
  }

  // Emergency Mode
  Future<void> enableEmergencyMode() async {
    try {
      // Store critical data for emergency access
      await _cacheSnakeSpecies();
      await _cacheHospitals();
      await _cacheEducationContent();
      
      // Clear non-essential cache
      await clearCache();
      
      print('Emergency mode enabled');
    } catch (e) {
      print('Error enabling emergency mode: $e');
    }
  }

  Future<void> disableEmergencyMode() async {
    try {
      // Restore normal caching behavior
      await _updateCache();
      
      print('Emergency mode disabled');
    } catch (e) {
      print('Error disabling emergency mode: $e');
    }
  }

  // Dispose
  Future<void> dispose() async {
    try {
      await _offlineBox.close();
      await _syncQueueBox.close();
      await _cacheBox.close();
      _isInitialized = false;
      print('OfflineService disposed');
    } catch (e) {
      print('Error disposing OfflineService: $e');
    }
  }
}
