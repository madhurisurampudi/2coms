#!/bin/bash

# Technological Passport App Setup Script

echo "🚀 Setting up Technological Passport Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your database credentials"
fi

echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Import the database schema: mysql -u your_user -p your_database < backend/config/schema.sql"
echo "3. Start the server: cd backend && npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For development with auto-restart: cd backend && npm run dev"