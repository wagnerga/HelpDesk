using HelpDeskLibrary;
using HelpDeskModels;

namespace HelpDeskWorker
{
	public class Worker : BackgroundService
	{
		private readonly ILogger<Worker> _logger;

		public Worker(ILoggerFactory loggerFactory)
		{
			_logger = loggerFactory.CreateLogger<Worker>();
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			while (!stoppingToken.IsCancellationRequested)
			{
				if (_logger.IsEnabled(LogLevel.Information))
				{
					_logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
				}
				await Task.Delay(1000, stoppingToken);
			}
		}

		public override async Task StartAsync(CancellationToken cancellationToken)
		{
			_logger.LogInformation("Starting");

			// start nodejs server
			Process.Execute($"{Constants.NodeJSPath}", "cmd.exe", "npm run start", _logger);

			await base.StartAsync(cancellationToken);
		}

		public override async Task StopAsync(CancellationToken cancellationToken)
		{
			_logger.LogInformation("Stopping");

			// kill nodejs server
			await Process.KillPorts([Constants.NodeJSPort], _logger);

			await base.StopAsync(cancellationToken);
		}
	}
}
