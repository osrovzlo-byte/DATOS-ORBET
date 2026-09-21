$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$tempDir = Join-Path $env:TEMP "chrome_test_profile_$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "=================================================="
Write-Host "   TEST AUTOMATIZADO EN GOOGLE CHROME (HEADLESS)  "
Write-Host "=================================================="

$process = Start-Process -FilePath $chromePath `
    -ArgumentList "--headless=new", "--disable-gpu", "--user-data-dir=`"$tempDir`"", "--dump-dom", "http://localhost:8080/" `
    -NoNewWindow -PassThru -RedirectStandardOutput "$tempDir\dom.html" -RedirectStandardError "$tempDir\err.log"

$finished = $process.WaitForExit(10000)
if (-not $finished) {
    Write-Host "Chrome demoró más de 10 segundos, finalizando proceso..."
    $process.Kill()
} else {
    Write-Host "Chrome Headless ejecutó correctamente (ExitCode: $($process.ExitCode))`n"
    $content = Get-Content "$tempDir\dom.html" -Raw -Encoding UTF8

    $checks = [ordered]@{
        "1. Botón de navegación 'Juega y Cobra' (data-view='view-play-safe')" = ($content -match 'data-view="view-play-safe"')
        "2. Eliminación total del botón de navegación 'Importar'"             = (-not ($content -match 'data-view="view-import"'))
        "3. Sección principal 'view-play-safe' presente en el DOM"            = ($content -match 'id="view-play-safe"')
        "4. Carga del script 'js/play-safe-engine.js'"                         = ($content -match 'src="js/play-safe-engine.js"')
        "5. Selector de operadoras de lotería (play-lottery-select)"          = ($content -match 'id="play-lottery-select"')
        "6. Selector de turnos / horarios dinámicos (play-schedules-container)"= ($content -match 'id="play-schedules-container"')
        "7. Campo para ingresar o buscar animalitos (play-number-input)"       = ($content -match 'id="play-number-input"')
        "8. Modal catálogo completo de animalitos (animalitos-grid-modal)"     = ($content -match 'id="animalitos-grid-modal"')
        "9. Contenedor de fichas/chips seleccionadas (play-selected-chips)"    = ($content -match 'id="play-selected-chips"')
        "10. Campo de monto por número (play-amount-input)"                    = ($content -match 'id="play-amount-input"')
        "11. Banner de monto total a cancelar en Bs (play-total-bs)"           = ($content -match 'id="play-total-bs"')
        "12. Copiado 1-click de Pago Móvil (PaymentsAndWhatsApp.copyText)"     = ($content -match 'PaymentsAndWhatsApp\.copyText')
        "13. Campo de número de referencia de pago (play-reference-input)"     = ($content -match 'id="play-reference-input"')
        "14. Alerta para adjuntar captura de Pago Móvil (capture)"             = ($content -match 'capture')
        "15. Botón de envío de ticket a WhatsApp (submitPlaySafeTicket)"       = ($content -match 'PlaySafeEngine\.submitPlaySafeTicket')
        "16. Historial de tickets guardados (play-tickets-history)"            = ($content -match 'id="play-tickets-history"')
    }

    $allPassed = $true
    foreach ($k in $checks.Keys) {
        $status = if ($checks[$k]) { "PASS" } else { "FAIL"; $allPassed = $false }
        Write-Host "[$status] $k"
    }

    Write-Host ""
    if ($allPassed) {
        Write-Host ">>> TODOS LOS 16 CHEQUEOS PASARON EXITOSAMENTE EN GOOGLE CHROME <<<" -ForegroundColor Green
    } else {
        Write-Host ">>> ALGUNOS CHEQUEOS FALLARON <<<" -ForegroundColor Red
    }
}

Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
