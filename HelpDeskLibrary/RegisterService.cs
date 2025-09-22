using HelpDeskDatabaseModels;
using HelpDeskLibrary.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HelpDeskLibrary;

public class RegisterService : IRegisterService
{
	private readonly IServiceScopeFactory _scopeFactory;

	public RegisterService(IServiceScopeFactory scopeFactory)
	{
		_scopeFactory = scopeFactory;
	}

	public async Task Register(string username, string confirmUsername, string password,
		string confirmPassword, string firstName, string lastName)
	{
		await ValidateUser(username, confirmUsername, password, confirmPassword);

		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		await context.User.AddAsync(new User
		{
			FirstName = firstName,
			LastName = lastName,
			Password = await LoginService.GetToken(password),
			Username = username
		});

		await context.SaveChangesAsync();
	}

	private static void ValidatePassword(string password, string confirmPassword)
	{
		if (string.IsNullOrEmpty(password))
			throw new Exception("Password cannot be empty.");
		if (password != confirmPassword)
			throw new Exception("Password and Confirm Password do not match.");
		if (password.Length > 50)
			throw new Exception("Password exceeds 50 character maximum.");
	}

	private async Task ValidateUser(string username, string confirmUsername, string password, string confirmPassword)
	{
		await ValidateUsername(username, confirmUsername);

		ValidatePassword(password, confirmPassword);
	}

	private async Task ValidateUsername(string username, string confirmUsername)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		if (string.IsNullOrEmpty(username))
			throw new Exception("Username cannot be empty.");
		if (string.IsNullOrEmpty(confirmUsername))
			throw new Exception("Confirm Username cannot be empty.");
		if (username != confirmUsername)
			throw new Exception("Username and Confirm Username do not match.");
		if (username.Length > 50)
			throw new Exception("Username exceeds 50 character maximum.");

		var user = await context.User.Where(x => x.Username.ToLower() == username.ToLower()).FirstOrDefaultAsync();

		if (user != null)
			throw new Exception("Username already exists.");
	}
}