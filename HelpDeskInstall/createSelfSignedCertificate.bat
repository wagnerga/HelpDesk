set CERTIFICATES_PATH="C:\HelpDesk\HelpDeskWeb\Certificates"

mkdir %CERTIFICATES_PATH%

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout %CERTIFICATES_PATH%\key.pem -out %CERTIFICATES_PATH%\cert.pem -subj "/C=US/ST=Ohio/L=Columbus/O=HelpDesk/OU=IT/CN=localhost/emailAddress=support@helpdesk.com" -addext "subjectAltName=IP:127.0.0.1"
openssl pkcs12 -export -in %CERTIFICATES_PATH%\cert.pem -inkey %CERTIFICATES_PATH%\key.pem -out %CERTIFICATES_PATH%\cert.pfx -passout pass: