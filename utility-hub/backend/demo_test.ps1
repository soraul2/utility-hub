$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"
$email = "demo" + (Get-Random) + "@example.com"
$password = "password123"

Write-Host "=== API Demo Start ==="
Write-Host "User: $email"

# 1. Signup
Write-Host "1. Signup..."
$signupBody = @{
      email    = $email
      password = $password
      name     = "DemoUser"
} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
Write-Host " -> OK"

# 2. Login
Write-Host "2. Login..."
$loginBody = @{
      email    = $email
      password = $password
} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable "mySession"
Write-Host " -> OK (Cookie Received)"

# 3. Daily Card
Write-Host "3. Daily Card..."
$dailyResponse = Invoke-RestMethod -Uri "$baseUrl/tarot/daily-card" -Method Get -WebSession $mySession
Write-Host " -> Card: $($dailyResponse.card.cardInfo.nameKo)"
Write-Host " -> Reading: $($dailyResponse.reading)"

# 4. History
Write-Host "4. History..."
$historyResponse = Invoke-RestMethod -Uri "$baseUrl/tarot/readings/history" -Method Get -WebSession $mySession
Write-Host " -> Count: $($historyResponse.Count)"

# 5. Logout
Write-Host "5. Logout..."
$null = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method Post -WebSession $mySession
Write-Host " -> OK"

Write-Host "=== Demo Complete ==="
