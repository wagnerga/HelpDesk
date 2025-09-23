namespace HelpDeskLibrary;

public static class DatabaseConfig
{
	public static string GetConnectionString()
	{
		var password = Environment.GetEnvironmentVariable("HDADMINPASSWORD");

		return password == null
			? throw new InvalidOperationException("Failed to get HDADMINPASSWORD environment variable.")
			: $"Host=localhost;Database=HelpDesk;Username=hdadmin;Password={password};Pooling=true;MinPoolSize=5;MaxPoolSize=100;";
	}
}
