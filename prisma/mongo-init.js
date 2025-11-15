// MongoDB initialization script
// This runs when MongoDB container starts

db = db.getSiblingDB('snaktox');

// Create collections and indexes
db.createCollection('snake_species');
db.createCollection('venom_types');
db.createCollection('hospitals');
db.createCollection('education_materials');
db.createCollection('sos_reports');
db.createCollection('stock_updates');
db.createCollection('analytics_logs');
db.createCollection('ai_models');
db.createCollection('users');
db.createCollection('user_sessions');

// Create indexes for better performance
db.snake_species.createIndex({ "scientificName": 1 }, { unique: true });
db.snake_species.createIndex({ "commonName": 1 });
db.snake_species.createIndex({ "region": 1 });

db.venom_types.createIndex({ "name": 1 }, { unique: true });

db.hospitals.createIndex({ "coordinates": "2dsphere" });
db.hospitals.createIndex({ "country": 1 });
db.hospitals.createIndex({ "verifiedStatus": 1 });

db.education_materials.createIndex({ "category": 1, "language": 1 });
db.education_materials.createIndex({ "isActive": 1 });

db.sos_reports.createIndex({ "gpsCoordinates": "2dsphere" });
db.sos_reports.createIndex({ "timestamp": -1 });
db.sos_reports.createIndex({ "status": 1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true, sparse: true });

db.user_sessions.createIndex({ "token": 1 }, { unique: true });
db.user_sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('✅ MongoDB database initialized successfully!');