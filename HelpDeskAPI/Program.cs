using HelpDeskAPI;
using HelpDeskLibrary;
using HelpDeskModels;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

static Action<ILoggingBuilder> ConfigureLogging()
{
	return logger =>
	{
		logger.ClearProviders();
		logger.AddConsole();
		logger.AddLog4Net("log4net.config");
	};
}

var pfxPath = $"{Constants.CertificatesPath}\\cert.pfx";
var certificateMonitorService = new CertificateMonitorService(pfxPath);
var host = GetHost(args, certificateMonitorService);
await host.UseWindowsService().Build().RunAsync();

IHostBuilder GetHost(string[] args, CertificateMonitorService certificateMonitorService)
{
	var host = Host.CreateDefaultBuilder(args)
		.ConfigureLogging(ConfigureLogging())
		.ConfigureAppConfiguration((hostContext, builder) =>
		{
			var env = hostContext.HostingEnvironment;

			builder.AddJsonFile("appsettings.json")
				.AddJsonFile($"appsettings.{env.EnvironmentName}.json");

			builder.AddEnvironmentVariables();
		})
		.ConfigureWebHostDefaults(webBuilder =>
		{
			webBuilder.UseStartup<Startup>();

			webBuilder.ConfigureKestrel(x =>
			{
				x.ListenLocalhost(7001, y =>
				{
					y.UseHttps(z =>
					{
						z.ServerCertificateSelector = (_, _) => certificateMonitorService.GetCertificate();
					});
				});
			});
		});

	return host;
}