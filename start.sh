#!/bin/bash

# Start script for production

echo "🚀 Starting Kohlarn Hotel System..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
fi

# Start with PM2
echo "🔄 Starting PM2..."
pm2 start ecosystem.config.js

echo "✅ Application started!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"
