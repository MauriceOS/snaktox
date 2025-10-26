import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import '../config/app_config.dart';
import 'offline_service.dart';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final OfflineService _offlineService = OfflineService();
  final Connectivity _connectivity = Connectivity();
  
  bool _isOnline = false;
  bool _isSyncing = false;

  // Getters
  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;

  Future<void> initialize() async {
    // Check initial connectivity
    await _checkConnectivity();
    
    // Listen to connectivity changes
    _connectivity.onConnectivityChanged.listen((result) {
      _handleConnectivityChange(result);
    });
  }

  Future<void> _checkConnectivity() async {
    try {
      final connectivityResult = await _connectivity.checkConnectivity();
      _isOnline = connectivityResult != ConnectivityResult.none;
      
      if (_isOnline) {
        await _triggerSync();
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

  Future<void> _triggerSync() async {
    if (_isSyncing || !_isOnline) return;

    _isSyncing = true;
    try {
      await _syncPendingOperations();
      await _syncCriticalData();
    } catch (e) {
      print('Error during sync: $e');
    } finally {
      _isSyncing = false;
    }
  }

  // Sync Operations
  Future<void> _syncPendingOperations() async {
    try {
      final syncItems = await _offlineService.getSyncQueue();
      
      for (final item in syncItems) {
        try {
          await _syncOperation(item);
          await _offlineService.removeFromSyncQueue(item['id']);
        } catch (e) {
          print('Error syncing operation ${item['id']}: $e');
          // Handle retry logic here
        }
      }
    } catch (e) {
      print('Error syncing pending operations: $e');
    }
  }

  Future<void> _syncOperation(Map<String, dynamic> item) async {
    final operation = item['operation'] as String;
    final data = item['data'] as Map<String, dynamic>;
    
    switch (operation) {
      case 'create_sos_report':
        await _syncCreateSosReport(data);
        break;
      case 'update_user_profile':
        await _syncUpdateUserProfile(data);
        break;
      case 'create_community_post':
        await _syncCreateCommunityPost(data);
        break;
      case 'join_event':
        await _syncJoinEvent(data);
        break;
      default:
        print('Unknown sync operation: $operation');
    }
  }

  // Specific Sync Methods
  Future<void> _syncCreateSosReport(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/api/sos'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${data['token']}',
        },
        body: jsonEncode({
          'location': data['location'],
          'description': data['description'],
          'imageUrl': data['imageUrl'],
          'severity': data['severity'],
        }),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        // Update local data with server response
        await _offlineService.storeOfflineData(
          'sos_report_${data['localId']}',
          responseData,
        );
        print('SOS report synced successfully');
      } else {
        throw Exception('Failed to sync SOS report: ${response.statusCode}');
      }
    } catch (e) {
      print('Error syncing SOS report: $e');
      rethrow;
    }
  }

  Future<void> _syncUpdateUserProfile(Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('${AppConfig.apiBaseUrl}/api/users/${data['userId']}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${data['token']}',
        },
        body: jsonEncode(data['profile']),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        // Update local user data
        await _offlineService.storeOfflineData(
          'user_profile_${data['userId']}',
          responseData,
        );
        print('User profile synced successfully');
      } else {
        throw Exception('Failed to sync user profile: ${response.statusCode}');
      }
    } catch (e) {
      print('Error syncing user profile: $e');
      rethrow;
    }
  }

  Future<void> _syncCreateCommunityPost(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/api/campaigns/community/posts'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${data['token']}',
        },
        body: jsonEncode({
          'title': data['title'],
          'content': data['content'],
          'type': data['type'],
          'category': data['category'],
          'authorId': data['authorId'],
        }),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        // Update local data
        await _offlineService.storeOfflineData(
          'community_post_${data['localId']}',
          responseData,
        );
        print('Community post synced successfully');
      } else {
        throw Exception('Failed to sync community post: ${response.statusCode}');
      }
    } catch (e) {
      print('Error syncing community post: $e');
      rethrow;
    }
  }

  Future<void> _syncJoinEvent(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/api/campaigns/community/events/${data['eventId']}/join'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${data['token']}',
        },
        body: jsonEncode({
          'userId': data['userId'],
        }),
      );

      if (response.statusCode == 200) {
        print('Event join synced successfully');
      } else {
        throw Exception('Failed to sync event join: ${response.statusCode}');
      }
    } catch (e) {
      print('Error syncing event join: $e');
      rethrow;
    }
  }

  // Critical Data Sync
  Future<void> _syncCriticalData() async {
    try {
      await _syncSnakeSpecies();
      await _syncHospitals();
      await _syncEducationContent();
      await _syncEmergencyContacts();
    } catch (e) {
      print('Error syncing critical data: $e');
    }
  }

  Future<void> _syncSnakeSpecies() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/api/snakes'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _offlineService.cacheData(
          'snake_species',
          {
            'species': data,
            'lastUpdated': DateTime.now().toIso8601String(),
          },
          expiry: const Duration(hours: 24),
        );
        print('Snake species synced successfully');
      }
    } catch (e) {
      print('Error syncing snake species: $e');
    }
  }

  Future<void> _syncHospitals() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/api/hospitals'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _offlineService.cacheData(
          'hospitals',
          {
            'hospitals': data,
            'lastUpdated': DateTime.now().toIso8601String(),
          },
          expiry: const Duration(hours: 12),
        );
        print('Hospitals synced successfully');
      }
    } catch (e) {
      print('Error syncing hospitals: $e');
    }
  }

  Future<void> _syncEducationContent() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/api/content'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _offlineService.cacheData(
          'education_content',
          {
            'content': data,
            'lastUpdated': DateTime.now().toIso8601String(),
          },
          expiry: const Duration(hours: 6),
        );
        print('Education content synced successfully');
      }
    } catch (e) {
      print('Error syncing education content: $e');
    }
  }

  Future<void> _syncEmergencyContacts() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.apiBaseUrl}/api/emergency/contacts'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _offlineService.cacheData(
          'emergency_contacts',
          {
            'contacts': data,
            'lastUpdated': DateTime.now().toIso8601String(),
          },
          expiry: const Duration(hours: 1),
        );
        print('Emergency contacts synced successfully');
      }
    } catch (e) {
      print('Error syncing emergency contacts: $e');
    }
  }

  // Manual Sync Methods
  Future<void> syncNow() async {
    if (!_isOnline) {
      throw Exception('No internet connection available');
    }
    
    await _triggerSync();
  }

  Future<void> forceSyncAll() async {
    if (!_isOnline) {
      throw Exception('No internet connection available');
    }

    _isSyncing = true;
    try {
      await _syncPendingOperations();
      await _syncCriticalData();
      await _offlineService.clearCache();
      await _syncCriticalData(); // Re-cache everything
    } finally {
      _isSyncing = false;
    }
  }

  // Queue Operations
  Future<void> queueSosReport(Map<String, dynamic> sosData) async {
    await _offlineService.addToSyncQueue('create_sos_report', sosData);
  }

  Future<void> queueUserProfileUpdate(String userId, Map<String, dynamic> profileData) async {
    await _offlineService.addToSyncQueue('update_user_profile', {
      'userId': userId,
      'profile': profileData,
    });
  }

  Future<void> queueCommunityPost(Map<String, dynamic> postData) async {
    await _offlineService.addToSyncQueue('create_community_post', postData);
  }

  Future<void> queueEventJoin(String eventId, String userId) async {
    await _offlineService.addToSyncQueue('join_event', {
      'eventId': eventId,
      'userId': userId,
    });
  }

  // Status Methods
  Future<Map<String, dynamic>> getSyncStatus() async {
    final syncQueue = await _offlineService.getSyncQueue();
    final lastSyncTime = _offlineService.lastSyncTime;
    
    return {
      'isOnline': _isOnline,
      'isSyncing': _isSyncing,
      'pendingOperations': syncQueue.length,
      'lastSyncTime': lastSyncTime?.toIso8601String(),
      'offlineDataSize': await _offlineService.getOfflineDataSize(),
    };
  }

  Future<List<Map<String, dynamic>>> getPendingOperations() async {
    return await _offlineService.getSyncQueue();
  }

  Future<void> clearPendingOperations() async {
    await _offlineService.clearSyncQueue();
  }
}
