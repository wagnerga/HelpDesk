using HelpDeskLibrary;
using HelpDeskModels;
using HelpDeskWorker;
using Microsoft.Extensions.Logging;

namespace HelpDeskTests;

[TestClass]
public class WorkerIntegrationTests : WorkerIntegrationTestBase
{
	[TestMethod]
	[TestCategory("Integration")]
	public async Task Worker_NodeServerStartAndStop_Succeeds()
	{
		// Arrange
		var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
		var portLogger = loggerFactory.CreateLogger<WorkerIntegrationTests>();
		var worker = new Worker(loggerFactory); // Worker creates its own logger internally

		// Act
		await worker.StartAsync(CancellationToken.None);

		var isRunning = await WaitForPortAsync(Constants.NodeJSPort, true, portLogger);

		// Assert
		Assert.IsTrue(isRunning, $"Node.js server did not start within expected time on port {Constants.NodeJSPort}.");

		// Act
		await worker.StopAsync(CancellationToken.None);

		var isStopped = await WaitForPortAsync(Constants.NodeJSPort, false, portLogger);

		// Assert
		Assert.IsTrue(isStopped, $"Node.js server did not stop within expected time on port {Constants.NodeJSPort}.");
	}

	private static async Task<bool> WaitForPortAsync(int port, bool expectListening, ILogger logger, int retries = 10, int delayMs = 5000)
	{
		for (int i = 0; i < retries; i++)
		{
			await Task.Delay(delayMs);

			var isListening = await ProcessService.AreAnyPortsListeningAsync([port], logger);

			if (isListening == expectListening)
				return true;
		}

		return false;
	}
}