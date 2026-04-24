# Wi-Fi IP 감지
$ip = (Get-NetIPAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress

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

Write-Host "[2/3] 현재 IP: $ip"

# granite.config.ts 절대경로로 업데이트
$file = "C:\cafe\kagongzido\granite.config.ts"
$content = [IO.File]::ReadAllText($file, [Text.Encoding]::UTF8)
$updated = $content -replace "host: '[^']+'", "host: '$ip'"
[IO.File]::WriteAllText($file, $updated, [Text.Encoding]::UTF8)

Write-Host "[2/3] granite.config.ts 업데이트 완료 -> host: '$ip'"
