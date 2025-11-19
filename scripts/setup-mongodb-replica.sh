#!/bin/bash

# MongoDB Replica Set Setup Script for SnaKTox
# This sets up a single-node replica set for development

set -e

echo "🔧 Setting up MongoDB Replica Set for SnaKTox"
echo "=============================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "❌ MongoDB is not running"
    echo "   Start it with: brew services start mongodb-community"
    exit 1
fi

echo "✓ MongoDB is running"
echo ""

# Check if already initialized
REPLICA_STATUS=$(mongosh --quiet --eval "try { rs.status().ok } catch(e) { 0 }" 2>/dev/null || echo "0")

if [ "$REPLICA_STATUS" = "1" ]; then
    echo "✓ Replica set already initialized"
    echo ""
    echo "Replica set status:"
    mongosh --quiet --eval "rs.status().set" 2>/dev/null
    exit 0
fi

echo "📝 Initializing replica set..."
echo ""

# Initialize replica set
INIT_RESULT=$(mongosh --quiet --eval "
try {
    rs.initiate({
        _id: 'rs0',
        members: [{ _id: 0, host: 'localhost:27017' }]
    });
    'SUCCESS'
} catch(e) {
    if (e.message.includes('already initialized')) {
        'ALREADY_INIT'
    } else {
        'ERROR: ' + e.message
    }
}
" 2>&1)

if echo "$INIT_RESULT" | grep -q "SUCCESS"; then
    echo "✓ Replica set initialized successfully!"
    echo ""
    echo "⏳ Waiting for replica set to be ready (this may take a few seconds)..."
    sleep 5
    
    # Check status
    STATUS=$(mongosh --quiet --eval "rs.status().ok" 2>/dev/null || echo "0")
    if [ "$STATUS" = "1" ]; then
        echo "✓ Replica set is ready!"
        echo ""
        echo "You can now run: npm run db:seed"
    else
        echo "⚠️  Replica set initialized but not ready yet"
        echo "   Wait a few more seconds and try: npm run db:seed"
    fi
elif echo "$INIT_RESULT" | grep -q "ALREADY_INIT"; then
    echo "✓ Replica set already exists"
else
    echo "❌ Failed to initialize replica set"
    echo ""
    echo "Error: $INIT_RESULT"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure MongoDB is running: brew services start mongodb-community"
    echo "2. Check MongoDB logs: tail -f /usr/local/var/log/mongodb/mongo.log"
    echo "3. You may need to restart MongoDB with replica set enabled"
    echo "   See: docs/MONGODB_REPLICA_SET_SETUP.md"
    exit 1
fi

