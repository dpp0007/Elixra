# Start the FastAPI backend server

$scriptDir = $PSScriptRoot
Set-Location $scriptDir

Write-Host "🚀 Starting Chemistry Lab Backend" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$scriptDir\venv")) {
    Write-Host "Virtual environment not found. Running setup..." -ForegroundColor Yellow
    & "$scriptDir\setup.ps1"
    if ($LASTEXITCODE -ne 0) {
        exit 1
    }
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "$scriptDir\venv\Scripts\Activate.ps1"

Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python "$scriptDir\main.py"
