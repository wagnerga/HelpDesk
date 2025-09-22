using HelpDeskDatabaseModels;
using HelpDeskWorker;
using Microsoft.EntityFrameworkCore;

static Action<HostBuilderContext, IConfigurationBuilder> ConfigureAppConfiguration()
{
	return (hostContext, config) =>
	{
		var env = hostContext.HostingEnvironment;

		config.AddJsonFile("appsettings.json")
			.AddJsonFile($"appsettings.{env.EnvironmentName}.json");

		config.AddEnvironmentVariables();
	};
}

static Action<ILoggingBuilder> ConfigureLogging()
{
	return logger =>
	{
		logger.ClearProviders();
		logger.AddConsole();
		logger.AddLog4Net("log4net.config");
	};
}

static Action<HostBuilderContext, IServiceCollection> ConfigureServices()
{
	return (hostContext, services) =>
	{
		var password = Environment.GetEnvironmentVariable("HDADMINPASSWORD");
		var connectionString = $"Host=localhost;Database=HelpDesk;Username=hdadmin;Password={password};Pooling=true;MinPoolSize=5;MaxPoolSize=100;";

		// Add the database context to the service container.
		services.AddDbContext<HelpDeskContext>(options => options.UseNpgsql(connectionString));

		services.AddHostedService<Worker>();
	};
}

var host = Host.CreateDefaultBuilder(args)
	.ConfigureAppConfiguration(ConfigureAppConfiguration())
	.UseWindowsService()
	.ConfigureLogging(ConfigureLogging())
	.ConfigureServices(ConfigureServices())
	.Build();

await host.RunAsync();