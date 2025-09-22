using System.Security.Cryptography.X509Certificates;

namespace HelpDeskLibrary;

public class CertificateMonitorService
{
	private readonly string _certPFXPath;
	private X509Certificate2? _cachedCertificate;
	private readonly FileSystemWatcher? _fileWatcher;

	public CertificateMonitorService(string certPFXPath)
	{
		_certPFXPath = certPFXPath;

		var directoryName = Path.GetDirectoryName(_certPFXPath);

		if (directoryName != null)
		{
			// Initialize FileSystemWatcher
			_fileWatcher = new FileSystemWatcher(directoryName)
			{
				Filter = "*.pem",
				NotifyFilter = NotifyFilters.LastWrite,
				EnableRaisingEvents = true
			};

			_fileWatcher.Changed += OnCertificateChanged;

			// Initial certificate load
			ReloadCertificate();
		}
	}

	public X509Certificate2 GetCertificate()
	{
		if (_cachedCertificate == null)
			throw new Exception("Certificate is invalid.");

		return _cachedCertificate;
	}

	private void ReloadCertificate()
	{
		try
		{
			// Load the certificate and private key
			_cachedCertificate = X509CertificateLoader.LoadPkcs12FromFile(_certPFXPath, string.Empty);
		}
		catch
		{
			throw new Exception("Certificate failed to load.");
		}
	}

	private void OnCertificateChanged(object sender, FileSystemEventArgs e)
	{
		if (e.FullPath == _certPFXPath)
			ReloadCertificate();
	}
}
