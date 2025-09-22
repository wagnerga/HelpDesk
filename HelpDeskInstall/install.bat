@echo off
echo ============================================
echo Starting HelpDesk installation process
echo ============================================

rem --- Validate input parameters ---
if "%1"=="" goto :ShowUsage
if "%2"=="" goto :ShowUsage
if "%3"=="" goto :ShowUsage

rem --- Set variables ---
set "RUNTIME=%1"
set "CONFIGURATION=%2"
set "ENVIRONMENT=%3"
set "GIT_PATH=%~dp0..\"
set "BUILD_PATH=C:\build\windows\HelpDesk"
set "INSTALL_PATH=C:\HelpDesk"

rem --- Step 1: Build and publish the application ---
echo.
echo Publishing HelpDesk application...
call publish.bat %RUNTIME% %CONFIGURATION%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Publishing failed. Aborting installation.
    goto :eof
)
echo Publishing complete.
echo.

rem --- Step 2: Stop the Windows services to avoid file locks ---
echo Stopping HelpDeskAPI service (if running)...
sc stop HelpDeskAPI >nul 2>&1
echo Service stopped or not running.
echo.

echo Stopping HelpDeskWorker service (if running)...
sc stop HelpDeskWorker >nul 2>&1
echo Service stopped or not running.
echo.

rem --- Step 3: Clean clean install directory ---
echo.
echo Cleaning existing install directory: %INSTALL_PATH%
rmdir /S /Q "%INSTALL_PATH%"
if %errorlevel% neq 0 (
    echo WARNING: Failed to remove "%INSTALL_PATH%". It may not exist.
)
echo Install directory cleaned.
echo.

rem --- Step 4: Generate admin password for database setup ---
echo Generating random password for hdadmin user...
for /f %%i in ('powershell -Command "[guid]::NewGuid().ToString('N')"') do (
    setx HDADMINPASSWORD %%i /m
    set "HDADMINPASSWORD=%%i"
)
echo Password generated and stored in HDADMINPASSWORD.
echo.

rem --- Step 5: Drop and recreate the database ---
echo Dropping and recreating HelpDesk database...
psql -d postgres -U postgres -w -f "%GIT_PATH%\HelpDeskDatabaseModels\DropAndCreateDatabase.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to drop database. Aborting.
    goto :eof
)

echo Creating new hdadmin user with password...
psql -U postgres -d postgres -c "CREATE USER hdadmin WITH PASSWORD '%HDADMINPASSWORD%'"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create hdadmin user. Aborting.
    goto :eof
)

psql -d HelpDesk -U postgres -w -f "%GIT_PATH%\HelpDeskDatabaseModels\HelpDesk.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database. Aborting.
    goto :eof
)
echo Database setup complete.
echo.

rem --- Step 6: Copy published files to installation directory ---
echo Copying published files to: %INSTALL_PATH%
xcopy "%BUILD_PATH%" "%INSTALL_PATH%" /E /H /C /I /Y
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: File copy failed. Aborting.
    goto :eof
)
echo Files copied successfully.
echo.

rem --- Step 7: Generate JWT keys ---
echo Creating JWT private and public keys...
call createJWTPrivateAndPublicKeys.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: JWT key generation failed. Aborting.
    goto :eof
)
echo JWT keys created.
echo.

rem --- Step 8: Create self-signed certificate ---
echo Creating self-signed certificate...
call createSelfSignedCertificate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Certificate creation failed. Aborting.
    goto :eof
)
echo Certificate created.
echo.

rem --- Step 9: Create and configure Windows service ---
echo Configuring HelpDeskAPI Windows service...
sc query HelpDeskAPI >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Service already exists. Skipping creation.
    sc description HelpDeskAPI "HelpDeskAPI"
    sc config HelpDeskAPI start=demand
    sc config HelpDeskAPI obj="LocalSystem"
) else (
    echo Creating HelpDeskAPI service...
    sc create HelpDeskAPI binPath= "\"C:\Program Files\dotnet\dotnet.exe\" \"%INSTALL_PATH%\HelpDeskWeb\HelpDeskAPI\HelpDeskAPI.dll\"" DisplayName= "HelpDeskAPI"
    if %ERRORLEVEL% EQU 0 (
        sc description HelpDeskAPI "HelpDeskAPI"
        sc config HelpDeskAPI start=demand
        sc config HelpDeskAPI obj="LocalSystem"
    ) else (
        echo ERROR: Failed to create HelpDeskAPI service.
        goto :eof
    )
)
echo Service configuration complete.
echo.

echo Configuring HelpDeskWorker Windows service...
sc query HelpDeskWorker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Service already exists. Skipping creation.
    sc description HelpDeskWorker "HelpDeskWorker"
    sc config HelpDeskWorker start=demand
    sc config HelpDeskWorker obj="LocalSystem"
) else (
    echo Creating HelpDeskWorker service...
    sc create HelpDeskWorker binPath= "\"C:\Program Files\dotnet\dotnet.exe\" \"%INSTALL_PATH%\HelpDeskWorker\HelpDeskWorker.dll\"" DisplayName= "HelpDeskWorker"
    if %ERRORLEVEL% EQU 0 (
        sc description HelpDeskWorker "HelpDeskWorker"
        sc config HelpDeskWorker start=demand
        sc config HelpDeskWorker obj="LocalSystem"
    ) else (
        echo ERROR: Failed to create HelpDeskWorker service.
        goto :eof
    )
)
echo Service configuration complete.
echo.

rem --- Step 10: Set environment variables ---
echo Setting environment variables...
setx ASPNETCORE_ENVIRONMENT "%ENVIRONMENT%" /m
setx DOTNET_ENVIRONMENT "%ENVIRONMENT%" /m
setx HDADMINPASSWORD "%HDADMINPASSWORD%" /m
echo Environment variables set.
echo.

rem --- Step 11: Start the Windows services ---
echo Starting HelpDeskAPI service...
sc start HelpDeskAPI
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start HelpDeskAPI service.
    goto :eof
)
echo HelpDeskAPI service started.
echo.

echo Starting HelpDeskWorker service...
sc start HelpDeskWorker
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start HelpDeskWorker service.
    goto :eof
)
echo HelpDeskWorker service started.
echo.

rem --- Step 12: Run PowerShell setup script ---
echo Running setup.ps1 PowerShell script...

call powershell -ExecutionPolicy Bypass -File setup.ps1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: setup.ps1 execution failed. Aborting.
    goto :eof
)

echo setup.ps1 executed successfully.
echo.

rem --- Final Summary ---
echo ============================================
echo HelpDesk installation complete!
echo Runtime:        %RUNTIME%
echo Configuration:  %CONFIGURATION%
echo Environment:    %ENVIRONMENT%
echo Server:         https://localhost:7000
echo ============================================
echo.

goto :eof

:ShowUsage
echo.
echo ERROR: Missing required parameters.
echo Usage: install.bat [RUNTIME] [CONFIGURATION] [ENVIRONMENT]
echo Example: install.bat win-x64 Debug Development
echo.
goto :eof