# Start Python server
Write-Host "Starting Python server..."
$pythonProcess = Start-Process python -ArgumentList "server.py" -PassThru -NoNewWindow

# Wait for server to be ready
Write-Host "Waiting for server to initialize..."
Start-Sleep -Seconds 2

# Launch Chrome
Write-Host "Launching Chrome for test..."
Start-Process chrome -ArgumentList '--new-instance', '--user-data-dir=./test-chrome-profile', '--disable-session-crashed-bubble', '--no-first-run', 'http://127.0.0.1:8080/
index.html?startPlayback=test-run-2'

# Wait for test to complete
Write-Host "Test running... waiting 20 seconds"
Start-Sleep -Seconds 20

# Clean up
Write-Host "Cleaning up..."
Remove-Item -Path test-chrome-profile -Recurse -Force -ErrorAction SilentlyContinue
Stop-Process -InputObject $pythonProcess -Force -ErrorAction SilentlyContinue

Write-Host "Done."
