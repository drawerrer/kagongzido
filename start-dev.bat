@echo off
chcp 65001 > nul
title 카공지도 개발서버

echo ============================================
echo  카공지도 개발서버
echo ============================================
echo.

echo [1/3] Wi-Fi IP 감지 및 granite.config.ts 업데이트 중...
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\cafe\kagongzido\setup-ip.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo [오류] IP 설정 실패. 위 내용을 확인하세요.
    pause
    exit /b 1
)

set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\cafe\kagongzido"

:RESTART
echo.
echo [2/3] 이전 서버 잔여 프로세스 정리 중...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8081" ^| find "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [3/3] 서버 시작 중... (%TIME%)
echo.

npm run dev

echo.
echo ============================================
echo  서버 종료됨. 5초 후 자동 재시작...
echo  완전히 닫으려면 이 창 X 버튼 누르세요.
echo ============================================
timeout /t 5 /nobreak
goto RESTART
