using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using HelpDeskModels;

namespace HelpDeskTests;

public abstract class WorkerIntegrationTestBase
{
	protected IContainer _nodeContainer = null!;

	[TestInitialize]
	public async Task Setup()
	{
		_nodeContainer = new ContainerBuilder()
			.WithImage("node:18")
			.WithName("node-test-server")
			.WithPortBinding(Constants.NodeJSPort, true)
			.WithWorkingDirectory("/app")
			.WithBindMount(Path.GetFullPath("PathToYourNodeApp"), "/app")
			.WithCommand("sh", "-c", "npm install && npm run start")
			.Build();

		await _nodeContainer.StartAsync();
	}

	[TestCleanup]
	public async Task Cleanup()
	{
		if (_nodeContainer is not null)
			await _nodeContainer.DisposeAsync();
	}
}