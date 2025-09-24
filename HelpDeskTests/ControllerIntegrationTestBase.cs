using HelpDeskAPI;
using HelpDeskDatabaseModels;
using HelpDeskLibrary;
using HelpDeskModels;
using HelpDeskModels.LoginControllerModels;
using HelpDeskModels.RegisterControllerModels;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Testcontainers.PostgreSql;

namespace HelpDeskTests;

public abstract class ControllerIntegrationTestBase
{
	protected PostgreSqlContainer _pgContainer = null!;
	protected WebApplicationFactory<Startup> _factory = null!;
	protected HttpClient _client = null!;

	protected async Task<TResult> UseScopedServiceAsync<T, TResult>(Func<T, Task<TResult>> action) where T : notnull
	{
		using var scope = _factory.Services.CreateScope();
		var service = scope.ServiceProvider.GetRequiredService<T>();
		return await action(service);
	}

	protected async Task UseScopedServiceAsync<T>(Func<T, Task> action) where T : notnull
	{
		using var scope = _factory.Services.CreateScope();
		var service = scope.ServiceProvider.GetRequiredService<T>();
		await action(service);
	}

	protected async Task AssertResponseSuccessAsync(HttpResponseMessage response)
	{
		if (!response.IsSuccessStatusCode)
		{
			var raw = await response.Content.ReadAsStringAsync();
			Assert.Fail($"Request failed: {response.StatusCode}\n{raw}");
		}
	}

	protected async Task<Ticket> SeedTicketAsync(Guid id, Guid? assignedUserId, string description, string status = "Open")
	{
		return await UseScopedServiceAsync<HelpDeskContext, Ticket>(async context =>
		{
			var ticket = new Ticket
			{
				Id = id,
				AssignedUserId = assignedUserId,
				CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
				Description = description,
				Status = status
			};

			await context.Ticket.AddAsync(ticket);
			await context.SaveChangesAsync();

			return ticket;
		});
	}

	protected async Task<User> SeedUserAsync(Guid id, string firstName, string lastName, string username, string password)
	{
		return await UseScopedServiceAsync<HelpDeskContext, User>(async context =>
		{
			var user = new User
			{
				Id = id,
				FirstName = firstName,
				LastName = lastName,
				Password = password,
				Username = username
			};

			await context.User.AddAsync(user);
			await context.SaveChangesAsync();

			return user;
		});
	}

	[TestInitialize]
	public async Task Setup()
	{
		const string hdadminPassword = "hadadminpassword";
		Environment.SetEnvironmentVariable("HDADMINPASSWORD", hdadminPassword);

		_pgContainer = new PostgreSqlBuilder()
			.WithDatabase("HelpDesk")
			.WithUsername("postgres")
			.WithPassword("password")
			.Build();

		await _pgContainer.StartAsync();

		// Use postgres to create hdadmin and scaffold schema
		var tempConnectionString = _pgContainer.GetConnectionString();

		var optionsBuilder = new DbContextOptionsBuilder<HelpDeskContext>();
		optionsBuilder.UseNpgsql(tempConnectionString);

		using var context = new HelpDeskContext(optionsBuilder.Options);

		var sql = await File.ReadAllTextAsync("HelpDesk.sql");

		await context.Database.ExecuteSqlRawAsync($"CREATE ROLE hdadmin WITH LOGIN PASSWORD '{hdadminPassword}';");
		await context.Database.ExecuteSqlRawAsync("GRANT ALL PRIVILEGES ON DATABASE \"HelpDesk\" TO hdadmin;");

		try
		{
			await context.Database.ExecuteSqlRawAsync(sql);
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Schema setup failed: {ex.Message}");
			throw;
		}

		var port = new NpgsqlConnectionStringBuilder(_pgContainer.GetConnectionString()).Port;

		var connectionString = DatabaseConfigService.GetConnectionString(port);

		_factory = new WebApplicationFactory<Startup>()
			.WithWebHostBuilder(builder =>
			{
				builder.ConfigureServices(services =>
				{
					var descriptor = services.SingleOrDefault(service => service.ServiceType == typeof(DbContextOptions<HelpDeskContext>));

					if (descriptor != null)
						services.Remove(descriptor);

					services.AddDbContext<HelpDeskContext>(options => options.UseNpgsql(connectionString));
				});
			});

		_client = _factory.CreateClient();
	}

	[TestCleanup]
	public async Task Cleanup()
	{
		if (_pgContainer is not null)
			await _pgContainer.DisposeAsync();
	}

	protected async Task<Guid> AuthenticateTestUserAsync(string username = "john", string password = "p@ssw0rD1245")
	{
		var registerRequest = new RegisterRequest
		{
			ConfirmUsername = username,
			ConfirmPassword = password,
			FirstName = "John",
			LastName = "Jackson",
			Username = username,
			Password = password
		};

		var registerResponse = await _client.PostAsJsonAsync("/register", registerRequest);

		await AssertResponseSuccessAsync(registerResponse);

		var registerContent = await registerResponse.Content.ReadFromJsonAsync<Response<Guid>>();
		Assert.IsNotNull(registerContent?.Result, "User Id was not returned from register.");

		var loginRequest = new LoginRequest
		{
			Username = username,
			Password = password
		};

		var loginResponse = await _client.PostAsJsonAsync("/login", loginRequest);

		await AssertResponseSuccessAsync(loginResponse);

		var loginContent = await loginResponse.Content.ReadFromJsonAsync<Response<LoginResponse>>();
		var jwt = loginContent?.Result?.JWT;

		Assert.IsNotNull(jwt, "JWT token was not returned from login.");
		_client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

		return registerContent.Result;
	}
}