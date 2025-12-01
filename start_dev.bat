@echo off
echo Starting PulseKart Infrastructure...
docker compose up -d

echo.
echo Installing Backend Dependencies...
cd backend
call npm install

echo.
echo Initializing Database...
call npx ts-node src/db/init.ts

echo.
echo Starting Backend Server...
call npm run dev
pause
