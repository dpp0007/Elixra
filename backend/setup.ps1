# Python Backend Setup Script for Windows PowerShell

Write-Host "Setup Chemistry Lab Backend" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow

# Create virtual environment
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"
Write-Host "Virtual environment activated" -ForegroundColor Green

Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow

# Upgrade pip
python -m pip install --upgrade pip
Write-Host "pip upgraded" -ForegroundColor Green

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Install requirements
pip install -r requirements.txt
Write-Host "Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the backend:" -ForegroundColor Cyan
Write-Host "  1. Activate: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  2. Run: python main.py" -ForegroundColor White
