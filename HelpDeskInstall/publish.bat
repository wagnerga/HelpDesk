@echo off
echo ============================================
echo Starting HelpDesk build and publish process
echo ============================================

rem --- Validate input parameters ---
if "%1"=="" goto :ShowUsage
if "%2"=="" goto :ShowUsage

set "RUNTIME=%1"
set "CONFIGURATION=%2"

rem --- Define paths ---
set "GIT_PATH=%~dp0..\"
set "BUILD_PATH=C:\build\windows\HelpDesk"
set "WEB_PATH=%BUILD_PATH%\HelpDeskWeb"
set "API_PATH=%WEB_PATH%\HelpDeskAPI"
set "WORKER_PATH=%BUILD_PATH%\HelpDeskWorker"
set "UI_PATH=%WEB_PATH%\HelpDeskUI"
set "NODEJS_PATH=%BUILD_PATH%\HelpDeskNodeJS"

rem --- Clean existing build directory ---
echo.
echo Cleaning existing build directory: %BUILD_PATH%
rmdir /S /Q "%BUILD_PATH%"
if %errorlevel% neq 0 (
    echo WARNING: Failed to remove "%BUILD_PATH%". It may not exist.
)
echo Build directory cleaned.
echo.

rem --- Publish HelpDeskAPI ---
echo Publishing HelpDeskAPI project...
dotnet publish "%GIT_PATH%\HelpDeskAPI\HelpDeskAPI.csproj" -r %RUNTIME% -c %CONFIGURATION% --framework net9.0 --output "%API_PATH%" --no-self-contained
if %errorlevel% neq 0 (
    echo ERROR: dotnet publish failed. Aborting.
    goto :eof
)
echo HelpDeskAPI published to: %API_PATH%
echo.

rem --- Publish HelpDeskWorker ---
echo Publishing HelpDeskWorker project...
dotnet publish "%GIT_PATH%\HelpDeskWorker\HelpDeskWorker.csproj" -r %RUNTIME% -c %CONFIGURATION% --framework net9.0 --output "%WORKER_PATH%" --no-self-contained
if %errorlevel% neq 0 (
    echo ERROR: dotnet publish failed. Aborting.
    goto :eof
)
echo HelpDeskWorker published to: %WORKER_PATH%
echo.

rem --- Prepare NodeJS directory ---
if not exist "%NODEJS_PATH%" (
    echo Creating NodeJS directory: %NODEJS_PATH%
    mkdir "%NODEJS_PATH%"
)

rem --- Copy HelpDeskNodeJS files ---
echo Copying HelpDeskNodeJS files to: %NODEJS_PATH%
xcopy /y /e /i "%GIT_PATH%\HelpDeskNodeJS\*" "%NODEJS_PATH%" /EXCLUDE:%GIT_PATH%\HelpDeskInstall\exclude.txt
if %errorlevel% neq 0 (
    echo ERROR: NodeJS file copy failed. Aborting.
    goto :eof
)
echo NodeJS files copied.
echo Installing NodeJS dependencies...
cd "%NODEJS_PATH%"
call npm install
echo NodeJS setup complete.
echo.

rem --- Prepare UI directory ---
if not exist "%UI_PATH%" (
    echo Creating UI directory: %UI_PATH%
    mkdir "%UI_PATH%"
)

rem --- Copy HelpDeskUI files ---
echo Copying HelpDeskUI files to: %UI_PATH%
xcopy /y /e "%GIT_PATH%\HelpDeskUI\*" "%UI_PATH%" /EXCLUDE:%GIT_PATH%\HelpDeskInstall\exclude.txt
if %errorlevel% neq 0 (
    echo ERROR: UI file copy failed. Aborting.
    goto :eof
)
echo HelpDeskUI files copied.
echo.

rem --- Build HelpDeskUI ---
cd "%UI_PATH%"
echo Installing UI dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Aborting.
    goto :eof
)
echo Dependencies installed.

echo Building HelpDeskUI...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: npm run build failed. Aborting.
    goto :eof
)
echo HelpDeskUI build complete.
echo.

rem --- Clean up unnecessary UI files ---
echo Cleaning up unnecessary UI files and directories...
rmdir /S /Q .next
rmdir /S /Q app
rmdir /S /Q components
rmdir /S /Q hooks
rmdir /S /Q node_modules
rmdir /S /Q pages
rmdir /S /Q public
rmdir /S /Q services
rmdir /S /Q styles
rmdir /S /Q util
rmdir /S /Q api-client
rmdir /S /Q store

del .env.*
del eslint.config.mjs
del next.config.ts
del next-env.d.ts
del openapitools.json
del package.json
del package-lock.json
del README.md
del reportWebVitals.ts
del server.js
del swagger.json
del tsconfig.json
echo UI cleanup complete.
echo.

move /Y web.config "%UI_PATH%\build\web.config"

rem --- Finalize ---
cd "%GIT_PATH%\HelpDeskInstall"
echo ============================================
echo Build and publish process completed successfully!
echo ============================================
goto :eof

:ShowUsage
echo.
echo ERROR: Missing required parameters.
echo Usage: publish.bat [RUNTIME] [CONFIGURATION]
echo Example: publish.bat win-x64 Debug
echo.
goto :eof