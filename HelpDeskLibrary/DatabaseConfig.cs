namespace HelpDeskLibrary;

public static class DatabaseConfig
{
	public static string GetConnectionString(int? port = null)
	{
		var password = Environment.GetEnvironmentVariable("HDADMINPASSWORD");

		if (password == null)
			throw new InvalidOperationException("Failed to get HDADMINPASSWORD environment variable.");

		if (port == null)
			return $"Host=localhost;Database=HelpDesk;Username=hdadmin;Password={password};Pooling=true;MinPoolSize=5;MaxPoolSize=100;";

		return $"Host=localhost;Port={port};Database=HelpDesk;Username=hdadmin;Password={password};Pooling=true;MinPoolSize=5;MaxPoolSize=100;";
	}
}
