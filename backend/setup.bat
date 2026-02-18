@echo off
echo Setting up Django Backend...
echo.

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Setup complete! Now run:
echo   cd loginproject
echo   python manage.py migrate
echo   python manage.py runserver 8000
echo.
pause
