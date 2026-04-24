@echo off
chcp 65001 > nul
title 카공지도 개발서버

set LOGFILE=C:\cafe\dev-log.txt
echo. > %LOGFILE%
echo [%DATE% %TIME%] 서버 시작 시도 >> %LOGFILE%

echo ============================================
echo  카공지도 개발서버
echo  로그: %LOGFILE%
echo ============================================
echo.

echo [1/3] Wi-Fi IP 감지 및 granite.config.ts 업데이트 중...
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\cafe\kagongzido\setup-ip.ps1" >> %LOGFILE% 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [오류] IP 설정 실패 - 로그 확인: %LOGFILE%
    echo [%DATE% %TIME%] IP 설정 실패 >> %LOGFILE%
    pause
    exit /b 1
)

echo.
cd /d "C:\cafe\kagongzido"

:RESTART
echo.
echo [2/3] 이전 서버 잔여 프로세스 정리 중...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING" 2^>nul') do (
    echo     포트 3000 점유 PID %%a 종료 중...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [3/3] 서버 시작 중... (%TIME%)
echo [%DATE% %TIME%] npm run dev 실행 >> %LOGFILE%
echo.

npm run dev >> %LOGFILE% 2>&1

echo.
echo [%DATE% %TIME%] npm run dev 종료 >> %LOGFILE%
echo ============================================
echo  서버 종료됨. 로그: %LOGFILE%
echo  5초 후 자동 재시작... (닫으려면 Ctrl+C)
echo ============================================
timeout /t 5 /nobreak
goto RESTART
