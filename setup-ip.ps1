$ErrorActionPreference = 'Stop'
$file = "C:\cafe\kagongzido\granite.config.ts"

# [가드 1] 설정 파일이 없거나 비어 있으면 절대 덮어쓰지 않고 중단
if (-not (Test-Path $file)) {
    Write-Host "[오류] granite.config.ts 가 없습니다. (git pull 로 삭제됐을 수 있어요)"
    Write-Host "복구: git show faa09d1^:granite.config.ts > granite.config.ts"
    exit 1
}
if ((Get-Item $file).Length -lt 50) {
    Write-Host "[오류] granite.config.ts 가 비어 있습니다 ($((Get-Item $file).Length) bytes)."
    Write-Host "복구: git show faa09d1^:granite.config.ts > granite.config.ts"
    exit 1
}

# Wi-Fi IP 감지
$ip = (Get-NetIPAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notmatch '^169\.' } |
    Select-Object -First 1).IPAddress

# Wi-Fi 어댑터명이 다를 경우 fallback
if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
            $_.IPAddress -notmatch '^127\.' -and
            $_.IPAddress -notmatch '^169\.' -and
            $_.PrefixOrigin -ne 'WellKnown'
        } | Select-Object -First 1).IPAddress
}

if (-not $ip) {
    Write-Host "[오류] IP를 감지하지 못했어요."
    Write-Host "granite.config.ts 의 host 값을 직접 수정해주세요."
    exit 1
}

Write-Host "[2/5] 현재 IP: $ip"

$content = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)

# [가드 2] host 줄이 없으면 치환이 무의미하므로 중단
if ($content -notmatch "host: '[^']+'") {
    Write-Host "[오류] granite.config.ts 안에서 host 설정을 찾지 못했습니다. 파일이 손상됐을 수 있어요."
    exit 1
}

$updated = $content -replace "host: '[^']+'", "host: '$ip'"

# [가드 3] 결과가 비었으면 쓰지 않음
if ([string]::IsNullOrWhiteSpace($updated)) {
    Write-Host "[오류] 치환 결과가 비어 있어 저장을 중단합니다."
    exit 1
}

[IO.File]::WriteAllText($file, $updated, [Text.Encoding]::UTF8)
Write-Host "[2/5] granite.config.ts 업데이트 완료 -> host: '$ip'"
