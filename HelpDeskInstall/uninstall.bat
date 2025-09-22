@echo off
echo.
echo === HelpDesk Uninstall Script ===
echo.

rem === Step 1: Remove HelpDesk directory ===
echo Removing HelpDesk directory at C:\HelpDesk...
if exist "C:\HelpDesk" (
    rmdir /S /Q "C:\HelpDesk"
    echo HelpDesk directory removed.
) else (
    echo HelpDesk directory not found. Skipping.
)
echo.

rem === Step 2: Remove build directory ===
echo Removing build directory at C:\build...
if exist "C:\build" (
    rmdir /S /Q "C:\build"
    echo Build directory removed.
) else (
    echo Build directory not found. Skipping.
)
echo.

rem === Step 3: Remove HDADMINPASSWORD environment variable ===
echo Removing HDADMINPASSWORD from machine-level environment...
powershell -Command "[Environment]::SetEnvironmentVariable('HDADMINPASSWORD', $null, 'Machine')"
echo Environment variable removed.
echo.

rem === Step 4: Destroy pm2 instances and clear logs ===
echo Destroying pm2 instances and clearing logs...
pm2 delete all
pm2 flush
pm2 save --force
del "%USERPROFILE%\.pm2\dump.pm2" /Q
echo pm2 instances destroyed and logs cleared.
echo.

rem === Step 5: Completion Message ===
echo Uninstall complete.
echo All directories and environment variables have been cleaned up.
echo.