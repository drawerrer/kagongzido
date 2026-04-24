@echo off
chcp 65001 > nul
title 카공지도 개발서버

:: 관리자 권한 자동 요청
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%
cd /d "C:\cafe\kagongzido"

echo ============================================
echo  카공지도 개발서버 [관리자]
echo ============================================
echo.

echo [1/5] 최신 코드 받아오는 중...
git pull origin develop
echo.

echo [2/5] Wi-Fi IP 감지 및 설정 중...
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\cafe\kagongzido\setup-ip.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo [오류] IP 설정 실패. 위 내용을 확인하세요.
    pause
    exit /b 1
)
echo.

echo [3/5] 네트워크 방화벽 설정 중...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-NetConnectionProfile -InterfaceAlias 'Wi-Fi' -NetworkCategory Private" >nul 2>&1
netsh advfirewall firewall delete rule name="Dev 3000" >nul 2>&1
netsh advfirewall firewall delete rule name="Dev 8081" >nul 2>&1
netsh advfirewall firewall delete rule name="Node.js" >nul 2>&1
netsh advfirewall firewall add rule name="Dev 3000" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="Dev 8081" dir=in action=allow protocol=TCP localport=8081 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes profile=any >nul 2>&1
echo     완료
echo.

:RESTART
echo [4/5] 이전 서버 정리 중...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING" 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8081" ^| find "LISTENING" 2^>nul') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

echo [5/5] 서버 시작 중... (%TIME%)
echo.
npm run dev

echo.
echo ============================================
echo  서버 종료됨.
echo  [R] 재시작  /  [Q] 완전 종료 + 방화벽 정리
echo  5초 후 자동 재시작됩니다.
echo ============================================
choice /C RQ /N /T 5 /D R /M "선택 (R=재시작 / Q=종료+방화벽정리): "
if %ERRORLEVEL% EQU 2 goto CLEANUP
goto RESTART

:CLEANUP
echo.
echo 방화벽 규칙 제거 중...
netsh advfirewall firewall delete rule name="Dev 3000" >nul 2>&1
netsh advfirewall firewall delete rule name="Dev 8081" >nul 2>&1
netsh advfirewall firewall delete rule name="Node.js" >nul 2>&1
echo     완료 - 포트 3000, 8081 차단됨
echo.
echo 창을 닫으셔도 됩니다.
pause
exit /b 0
