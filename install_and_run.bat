@echo off
echo =========================================
echo   KaamSetu Setup and Run Script
echo =========================================
echo.

echo Installing Backend packages...
cd backend
call npm install

echo.
echo Installing Frontend packages...
cd ..\frontend
call npm install

echo.
echo Setup Complete!
echo You can run the servers by running 'npm run dev' in both backend and frontend directories.
echo Here is an automated start for your convenience...
echo.

cd ..\backend
start cmd /k "npm run dev"

cd ..\frontend
start cmd /k "npm run dev"

echo KaamSetu servers are launching in new windows!
