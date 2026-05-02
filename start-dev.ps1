Set-Location "C:\cafe\kagongzido"

# [1/3] Wi-Fi IP 감지
Write-Host "[1/3] Wi-Fi IP 감지 중..."
$ip = (Get-NetIPAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
            $_.IPAddress -notmatch '^127\.' -and
            $_.IPAddress -notmatch '^169\.' -and
            $_.PrefixOrigin -ne 'WellKnown'
        } | Select-Object -First 1).IPAddress
}

if (-not $ip) {
    Write-Host "[오류] IP를 감지하지 못했어요. granite.config.ts를 직접 수정하세요."
    Read-Host "엔터를 누르면 닫힙니다"
    exit 1
}

Write-Host "[1/3] IP: $ip"

# [2/3] granite.config.ts 업데이트
Write-Host "[2/3] granite.config.ts 업데이트 중..."
$file = "C:\cafe\kagongzido\granite.config.ts"
$content = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
$updated = $content -replace "host: '[^']+'", "host: '$ip'"
[IO.File]::WriteAllText($file, $updated, [Text.Encoding]::UTF8)
Write-Host "[2/3] 완료 - host: '$ip'"

# [3/3] 개발 서버 시작
Write-Host ""
Write-Host "[3/3] 개발 서버 시작 (http://${ip}:3000)"
Write-Host ""

$env:PATH = "C:\Program Files\nodejs;$env:PATH"
& "C:\Program Files\nodejs\npm.cmd" run dev
