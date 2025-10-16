# Fix all fetch calls to use authenticatedFetch with JWT

$filePath = "public\js\admin_v2.js"
$content = Get-Content $filePath -Raw

Write-Host "`n🔧 แก้ไข fetch calls ให้ใช้ JWT Authentication...`n" -ForegroundColor Yellow

# 1. Room Types - Update
$content = $content -replace `
    'response = await fetch\(`/api/admin/room-types/\$\{roomTypeId\}`, \{[^}]+method: ''PUT'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+roomType[^}]+\}\)[^}]+\}\);', `
    'response = await authenticatedFetch(`/api/admin/room-types/${roomTypeId}`, { method: ''PUT'', body: JSON.stringify({ roomType }) });'

# 2. Room Types - Create  
$content = $content -replace `
    'response = await fetch\(''/api/admin/room-types'', \{[^}]+method: ''POST'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+roomType[^}]+\}\)[^}]+\}\);', `
    'response = await authenticatedFetch(''/api/admin/room-types'', { method: ''POST'', body: JSON.stringify({ roomType }) });'

# 3. Room Types - Delete
$content = $content -replace `
    'const response = await fetch\(`/api/admin/room-types/\$\{roomTypeId\}`, \{[^}]+method: ''DELETE'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+roomTypeName[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(`/api/admin/room-types/${roomTypeId}`, { method: ''DELETE'', body: JSON.stringify({ roomTypeName }) });'

# 4. Accommodation Types - Update
$content = $content -replace `
    'const response = await fetch\(`/api/admin/accommodation-types/\$\{typeId\}`, \{[^}]+method: ''PUT'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+accommodationType[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(`/api/admin/accommodation-types/${typeId}`, { method: ''PUT'', body: JSON.stringify({ accommodationType }) });'

# 5. Accommodation Types - Create
$content = $content -replace `
    'const response = await fetch\(''/api/admin/accommodation-types'', \{[^}]+method: ''POST'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+accommodationType[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(''/api/admin/accommodation-types'', { method: ''POST'', body: JSON.stringify({ accommodationType }) });'

# 6. Accommodation Types - Delete
$content = $content -replace `
    'const response = await fetch\(`/api/admin/accommodation-types/\$\{typeId\}`, \{[^}]+method: ''DELETE'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+typeName[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(`/api/admin/accommodation-types/${typeId}`, { method: ''DELETE'', body: JSON.stringify({ typeName }) });'

# 7. Web Settings
$content = $content -replace `
    'const response = await fetch\(''/api/websettings'', \{[^}]+method: ''POST'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+settings[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(''/api/websettings'', { method: ''POST'', body: JSON.stringify({ settings }) });'

# 8. Members - Update
$content = $content -replace `
    'const response = await fetch\(`/api/admin/members/\$\{memberId\}`, \{[^}]+method: ''PUT'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+memberData[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(`/api/admin/members/${memberId}`, { method: ''PUT'', body: JSON.stringify({ memberData }) });'

# 9. Members - Delete
$content = $content -replace `
    'const response = await fetch\(`/api/admin/members/\$\{memberId\}`, \{[^}]+method: ''DELETE'',[^}]+headers: \{ ''Content-Type'': ''application/json'' \},[^}]+body: JSON\.stringify\(\{[^}]+username: currentUser\.username,[^}]+password: currentUser\.password,[^}]+username: memberUsername[^}]+\}\)[^}]+\}\);', `
    'const response = await authenticatedFetch(`/api/admin/members/${memberId}`, { method: ''DELETE'', body: JSON.stringify({ username: memberUsername }) });'

# Save
$content | Set-Content $filePath -NoNewline

Write-Host "✅ แก้ไขเรียบร้อย!`n" -ForegroundColor Green
Write-Host "📝 การเปลี่ยนแปลง:" -ForegroundColor Cyan
Write-Host "   - Room Types API: ใช้ authenticatedFetch + JWT" -ForegroundColor White
Write-Host "   - Accommodation Types API: ใช้ authenticatedFetch + JWT" -ForegroundColor White  
Write-Host "   - Web Settings API: ใช้ authenticatedFetch + JWT" -ForegroundColor White
Write-Host "   - Members API: ใช้ authenticatedFetch + JWT" -ForegroundColor White
Write-Host "   - ลบ username/password ออกจาก request body`n" -ForegroundColor White
