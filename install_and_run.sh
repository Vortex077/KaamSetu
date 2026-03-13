#!/bin/bash

echo "========================================="
echo "  KaamSetu Setup and Run Script"
echo "========================================="
echo ""

echo "Installing Backend packages..."
cd backend || exit
npm install

echo ""
echo "Installing Frontend packages..."
cd ../frontend || exit
npm install

echo ""
echo "Setup Complete!"
echo "Starting both backend and frontend servers..."
echo ""

cd ../backend || exit
npm run dev &
BACKEND_PID=$!

cd ../frontend || exit
npm run dev &
FRONTEND_PID=$!

echo "KaamSetu servers are running in the background."
echo "Use 'kill $BACKEND_PID $FRONTEND_PID' to stop both servers."
wait
