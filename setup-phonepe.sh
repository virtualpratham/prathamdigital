#!/bin/bash

# PhonePe Payment Integration - Quick Start Guide
# Run this to get started quickly

echo "🚀 PhonePe Integration Quick Start"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Creating .env from example..."
    cp .env.example .env
    echo "✅ Created .env"
    echo ""
    echo "📝 IMPORTANT: Edit .env and add your PhonePe credentials:"
    echo "   - PHONEPE_CLIENT_ID"
    echo "   - PHONEPE_CLIENT_SECRET"
    echo "   - PHONEPE_MERCHANT_ID"
    echo ""
else
    echo "✅ .env file found"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔧 Setup Steps:"
echo "1. Edit .env and add your PhonePe credentials"
echo "2. Run: npm start"
echo "3. Open: http://localhost:3000"
echo "4. Test payment flow (add to cart → checkout → payment)"
echo ""
echo "📚 Documentation:"
echo "   - PHONEPE_SETUP_GUIDE.md - Full integration guide"
echo "   - DEBUGGING_INSTRUCTIONS.md - Cart debugging"
echo "   - README.md - Project overview"
echo ""
echo "✅ Setup complete! Run 'npm start' to begin testing."
