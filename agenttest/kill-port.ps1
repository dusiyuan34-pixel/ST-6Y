$processes = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
foreach ($procId in $processes) {
    if ($procId) {
        Stop-Process -Id $procId -Force
        Write-Host "Killed process with PID: $procId"
    }
}