import 'dart:convert';
import 'dart:io';
import 'package:hive/hutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late Box _userBox;
  late Box _settingsBox;
  late Box _emergencyBox;
  late Box _cacheBox;
  bool _isInitialized = false;

  // Getters
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialize Hive
      await Hive.initFlutter();

      // Open boxes
      _userBox = await Hive.openBox('user_data');
      _settingsBox = await Hive.openBox('app_settings');
      _emergencyBox = await Hive.openBox('emergency_data');
      _cacheBox = await Hive.openBox('app_cache');

      // Initialize default settings
      await _initializeDefaultSettings();

      _isInitialized = true;
      print('StorageService initialized successfully');
    } catch (e) {
      print('Error initializing StorageService: $e');
      rethrow;
    }
  }

  Future<void> _initializeDefaultSettings() async {
    // Set default app settings if not already set
    if (!_settingsBox.containsKey('theme_mode')) {
      await _settingsBox.put('theme_mode', 'system');
    }
    
    if (!_settingsBox.containsKey('language')) {
      await _settingsBox.put('language', 'en');
    }
    
    if (!_settingsBox.containsKey('notifications_enabled')) {
      await _settingsBox.put('notifications_enabled', true);
    }
    
    if (!_settingsBox.containsKey('location_enabled')) {
      await _settingsBox.put('location_enabled', true);
    }
    
    if (!_settingsBox.containsKey('offline_mode')) {
      await _settingsBox.put('offline_mode', true);
    }
    
    if (!_settingsBox.containsKey('emergency_contacts')) {
      await _settingsBox.put('emergency_contacts', jsonEncode([]));
    }
  }

  // User Data Methods
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    try {
      await _userBox.put('user_profile', jsonEncode(userData));
      print('User data saved');
    } catch (e) {
      print('Error saving user data: $e');
    }
  }

  Future<Map<String, dynamic>?> getUserData() async {
    try {
      final data = _userBox.get('user_profile');
      if (data != null) {
        return jsonDecode(data);
      }
      return null;
    } catch (e) {
      print('Error getting user data: $e');
      return null;
    }
  }

  Future<void> clearUserData() async {
    try {
      await _userBox.clear();
      print('User data cleared');
    } catch (e) {
      print('Error clearing user data: $e');
    }
  }

  // Settings Methods
  Future<void> saveSetting(String key, dynamic value) async {
    try {
      await _settingsBox.put(key, value);
      print('Setting saved: $key');
    } catch (e) {
      print('Error saving setting: $e');
    }
  }

  Future<T?> getSetting<T>(String key) async {
    try {
      return _settingsBox.get(key);
    } catch (e) {
      print('Error getting setting: $e');
      return null;
    }
  }

  Future<void> removeSetting(String key) async {
    try {
      await _settingsBox.delete(key);
      print('Setting removed: $key');
    } catch (e) {
      print('Error removing setting: $e');
    }
  }

  // Emergency Data Methods
  Future<void> saveEmergencyData(String key, Map<String, dynamic> data) async {
    try {
      await _emergencyBox.put(key, jsonEncode(data));
      print('Emergency data saved: $key');
    } catch (e) {
      print('Error saving emergency data: $e');
    }
  }

  Future<Map<String, dynamic>?> getEmergencyData(String key) async {
    try {
      final data = _emergencyBox.get(key);
      if (data != null) {
        return jsonDecode(data);
      }
      return null;
    } catch (e) {
      print('Error getting emergency data: $e');
      return null;
    }
  }

  Future<List<String>> getAllEmergencyKeys() async {
    try {
      return _emergencyBox.keys.cast<String>().toList();
    } catch (e) {
      print('Error getting emergency keys: $e');
      return [];
    }
  }

  Future<void> clearEmergencyData() async {
    try {
      await _emergencyBox.clear();
      print('Emergency data cleared');
    } catch (e) {
      print('Error clearing emergency data: $e');
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

  // Specific Data Methods
  Future<void> saveSnakeSpecies(List<Map<String, dynamic>> species) async {
    await cacheData('snake_species', {
      'species': species,
      'lastUpdated': DateTime.now().toIso8601String(),
    }, expiry: const Duration(hours: 24));
  }

  Future<List<Map<String, dynamic>>?> getSnakeSpecies() async {
    final data = await getCachedData('snake_species');
    return data?['species'];
  }

  Future<void> saveHospitals(List<Map<String, dynamic>> hospitals) async {
    await cacheData('hospitals', {
      'hospitals': hospitals,
      'lastUpdated': DateTime.now().toIso8601String(),
    }, expiry: const Duration(hours: 12));
  }

  Future<List<Map<String, dynamic>>?> getHospitals() async {
    final data = await getCachedData('hospitals');
    return data?['hospitals'];
  }

  Future<void> saveEducationContent(List<Map<String, dynamic>> content) async {
    await cacheData('education_content', {
      'content': content,
      'lastUpdated': DateTime.now().toIso8601String(),
    }, expiry: const Duration(hours: 6));
  }

  Future<List<Map<String, dynamic>>?> getEducationContent() async {
    final data = await getCachedData('education_content');
    return data?['content'];
  }

  Future<void> saveEmergencyContacts(List<Map<String, dynamic>> contacts) async {
    await saveSetting('emergency_contacts', jsonEncode(contacts));
  }

  Future<List<Map<String, dynamic>>?> getEmergencyContacts() async {
    final contactsJson = await getSetting<String>('emergency_contacts');
    if (contactsJson != null) {
      return List<Map<String, dynamic>>.from(jsonDecode(contactsJson));
    }
    return null;
  }

  // User Preferences
  Future<void> setThemeMode(String mode) async {
    await saveSetting('theme_mode', mode);
  }

  Future<String> getThemeMode() async {
    return await getSetting<String>('theme_mode') ?? 'system';
  }

  Future<void> setLanguage(String language) async {
    await saveSetting('language', language);
  }

  Future<String> getLanguage() async {
    return await getSetting<String>('language') ?? 'en';
  }

  Future<void> setNotificationsEnabled(bool enabled) async {
    await saveSetting('notifications_enabled', enabled);
  }

  Future<bool> getNotificationsEnabled() async {
    return await getSetting<bool>('notifications_enabled') ?? true;
  }

  Future<void> setLocationEnabled(bool enabled) async {
    await saveSetting('location_enabled', enabled);
  }

  Future<bool> getLocationEnabled() async {
    return await getSetting<bool>('location_enabled') ?? true;
  }

  Future<void> setOfflineMode(bool enabled) async {
    await saveSetting('offline_mode', enabled);
  }

  Future<bool> getOfflineMode() async {
    return await getSetting<bool>('offline_mode') ?? true;
  }

  // Storage Management
  Future<int> getStorageSize() async {
    try {
      int totalSize = 0;
      
      // Calculate size of all boxes
      for (final box in [_userBox, _settingsBox, _emergencyBox, _cacheBox]) {
        for (final key in box.keys) {
          final value = box.get(key);
          if (value is String) {
            totalSize += value.length;
          }
        }
      }
      
      return totalSize;
    } catch (e) {
      print('Error calculating storage size: $e');
      return 0;
    }
  }

  Future<Map<String, int>> getStorageBreakdown() async {
    try {
      final breakdown = <String, int>{};
      
      breakdown['user_data'] = _calculateBoxSize(_userBox);
      breakdown['settings'] = _calculateBoxSize(_settingsBox);
      breakdown['emergency_data'] = _calculateBoxSize(_emergencyBox);
      breakdown['cache'] = _calculateBoxSize(_cacheBox);
      
      return breakdown;
    } catch (e) {
      print('Error calculating storage breakdown: $e');
      return {};
    }
  }

  int _calculateBoxSize(Box box) {
    int size = 0;
    for (final key in box.keys) {
      final value = box.get(key);
      if (value is String) {
        size += value.length;
      }
    }
    return size;
  }

  Future<void> cleanupStorage() async {
    try {
      // Clear expired cache entries
      await _cleanupExpiredCache();
      
      // Clear old emergency data (older than 30 days)
      await _cleanupOldEmergencyData();
      
      print('Storage cleanup completed');
    } catch (e) {
      print('Error during storage cleanup: $e');
    }
  }

  Future<void> _cleanupExpiredCache() async {
    try {
      final keysToRemove = <String>[];
      
      for (final key in _cacheBox.keys) {
        final cacheEntry = _cacheBox.get(key);
        if (cacheEntry != null) {
          try {
            final entry = jsonDecode(cacheEntry);
            final timestamp = entry['timestamp'] as int;
            final expiry = entry['expiry'] as int?;
            
            if (expiry != null) {
              final expiryTime = DateTime.fromMillisecondsSinceEpoch(timestamp + expiry);
              if (DateTime.now().isAfter(expiryTime)) {
                keysToRemove.add(key);
              }
            }
          } catch (e) {
            // Invalid cache entry, remove it
            keysToRemove.add(key);
          }
        }
      }
      
      for (final key in keysToRemove) {
        await _cacheBox.delete(key);
      }
      
      if (keysToRemove.isNotEmpty) {
        print('Cleaned up ${keysToRemove.length} expired cache entries');
      }
    } catch (e) {
      print('Error cleaning up expired cache: $e');
    }
  }

  Future<void> _cleanupOldEmergencyData() async {
    try {
      final keysToRemove = <String>[];
      final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
      
      for (final key in _emergencyBox.keys) {
        final data = _emergencyBox.get(key);
        if (data != null) {
          try {
            final entry = jsonDecode(data);
            final timestamp = entry['timestamp'] as String?;
            
            if (timestamp != null) {
              final entryTime = DateTime.parse(timestamp);
              if (entryTime.isBefore(thirtyDaysAgo)) {
                keysToRemove.add(key);
              }
            }
          } catch (e) {
            // Invalid entry, remove it
            keysToRemove.add(key);
          }
        }
      }
      
      for (final key in keysToRemove) {
        await _emergencyBox.delete(key);
      }
      
      if (keysToRemove.isNotEmpty) {
        print('Cleaned up ${keysToRemove.length} old emergency data entries');
      }
    } catch (e) {
      print('Error cleaning up old emergency data: $e');
    }
  }

  // Export/Import
  Future<Map<String, dynamic>> exportData() async {
    try {
      final data = <String, dynamic>{};
      
      // Export user data
      final userData = await getUserData();
      if (userData != null) {
        data['user_data'] = userData;
      }
      
      // Export settings
      final settings = <String, dynamic>{};
      for (final key in _settingsBox.keys) {
        settings[key] = _settingsBox.get(key);
      }
      data['settings'] = settings;
      
      // Export emergency data
      final emergencyData = <String, dynamic>{};
      for (final key in _emergencyBox.keys) {
        final value = _emergencyBox.get(key);
        if (value != null) {
          emergencyData[key] = jsonDecode(value);
        }
      }
      data['emergency_data'] = emergencyData;
      
      return data;
    } catch (e) {
      print('Error exporting data: $e');
      return {};
    }
  }

  Future<void> importData(Map<String, dynamic> data) async {
    try {
      // Import user data
      if (data.containsKey('user_data')) {
        await saveUserData(data['user_data']);
      }
      
      // Import settings
      if (data.containsKey('settings')) {
        final settings = data['settings'] as Map<String, dynamic>;
        for (final entry in settings.entries) {
          await saveSetting(entry.key, entry.value);
        }
      }
      
      // Import emergency data
      if (data.containsKey('emergency_data')) {
        final emergencyData = data['emergency_data'] as Map<String, dynamic>;
        for (final entry in emergencyData.entries) {
          await saveEmergencyData(entry.key, entry.value);
        }
      }
      
      print('Data imported successfully');
    } catch (e) {
      print('Error importing data: $e');
      rethrow;
    }
  }

  // Dispose
  Future<void> dispose() async {
    try {
      await _userBox.close();
      await _settingsBox.close();
      await _emergencyBox.close();
      await _cacheBox.close();
      _isInitialized = false;
      print('StorageService disposed');
    } catch (e) {
      print('Error disposing StorageService: $e');
    }
  }
}
