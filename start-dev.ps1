Set-Location "C:\cafe\kagongzido"

$file = "C:\cafe\kagongzido\granite.config.ts"

# [1/3] granite.config.ts 무결성 확인 + IP 반영 (가드는 setup-ip.ps1에 있음)
Write-Host "[1/3] IP 감지 및 granite.config.ts 업데이트 중..."
& powershell -NoProfile -ExecutionPolicy Bypass -File "C:\cafe\kagongzido\setup-ip.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[오류] IP 설정 실패."
    Read-Host "엔터를 누르면 닫힙니다"
    exit 1
}

$ip = ([regex]::Match([IO.File]::ReadAllText($file, [Text.Encoding]::UTF8), "host: '([^']+)'")).Groups[1].Value

# [3/3] 개발 서버 시작
Write-Host ""
Write-Host "[3/3] 개발 서버 시작 (http://${ip}:3000)"
Write-Host ""

$env:PATH = "C:\Program Files\nodejs;$env:PATH"
& "C:\Program Files\nodejs\npm.cmd" run dev

# 서버가 죽어도 창이 바로 닫히지 않도록
Write-Host ""
Write-Host "서버가 종료됐습니다. (exit code: $LASTEXITCODE)"
Read-Host "엔터를 누르면 닫힙니다"
