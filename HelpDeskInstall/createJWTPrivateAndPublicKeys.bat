@echo off
echo.
echo --- Starting JWT Key Generation and Setup ---
echo.

set JWT_PATH=C:\HelpDesk\HelpDeskWeb\HelpDeskAPI\JWT

rem === Step 1: Generate Private Key ===
echo Generating a 2048-bit RSA private key...
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred during private key generation. Exiting.
    goto :eof
)

rem === Step 2: Convert to PKCS#8 DER format for .NET ===
echo Converting the private key to PKCS#8 DER format...
openssl pkcs8 -topk8 -inform PEM -outform DER -nocrypt -in private_key.pem -out private_key.pkcs8.der
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred during key format conversion. Exiting.
    goto :eof
)
echo Private key converted successfully.
echo.

rem === Step 3: Generate Public Key in PEM format ===
echo Converting DER private key to PEM for public key extraction...
openssl pkcs8 -inform DER -outform PEM -nocrypt -in private_key.pkcs8.der -out private_key.pkcs8.pem
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred during DER to PEM conversion. Exiting.
    goto :eof
)

echo Generating the public key from the PEM private key...
openssl rsa -in private_key.pkcs8.pem -pubout -out public_key.pem
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred during public key PEM generation. Exiting.
    goto :eof
)
echo Public key PEM created successfully.
echo.

rem === Step 4: Convert Public Key to DER format ===
echo Converting public key to DER format...
openssl rsa -pubin -inform PEM -in public_key.pem -outform DER -out public_key.der
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred during public key DER conversion. Exiting.
    goto :eof
)
echo Public key DER created successfully.
echo.

rem === Step 5: Move key files to HelpDeskAPI/JWT directory ===
echo Moving key files to %JWT_PATH%...
if not exist %JWT_PATH% (
    mkdir %JWT_PATH%
)
move /Y private_key.pkcs8.der %JWT_PATH%\private_key.der
move /Y public_key.der %JWT_PATH%\public_key.der
if %ERRORLEVEL% NEQ 0 (
    echo An error occurred while moving files. Exiting.
    goto :eof
)
echo Files moved successfully.
echo.

rem === Step 6: Clean Up Temporary Files ===
echo Cleaning up temporary files...
del private_key.pem
del private_key.pkcs8.pem
echo Cleanup complete.
echo.

echo --- Process Complete ---
echo Private key (DER) and public key (PEM + DER) are now in %JWT_PATH%
echo.