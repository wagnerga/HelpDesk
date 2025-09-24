using HelpDeskDatabaseModels;
using HelpDeskLibrary.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Text.RegularExpressions;

namespace HelpDeskLibrary;

public class RegisterService : IRegisterService
{
	private readonly IServiceScopeFactory _scopeFactory;

	public RegisterService(IServiceScopeFactory scopeFactory)
	{
		_scopeFactory = scopeFactory;
	}

	public async Task<Guid> RegisterAsync(string username, string confirmUsername, string password,
		string confirmPassword, string firstName, string lastName)
	{
		await ValidateUserAsync(username, confirmUsername, password, confirmPassword);

		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var user = new User
		{
			FirstName = firstName,
			LastName = lastName,
			Password = await LoginService.GetTokenAsync(password),
			Username = username
		};

		await context.User.AddAsync(user);

		await context.SaveChangesAsync();

		return user.Id;
	}

	private static void ValidatePassword(string password, string confirmPassword)
	{
		var hasUpperCase = Regex.IsMatch(password, @"[A-Z]");
		var hasLowerCase = Regex.IsMatch(password, @"[a-z]");
		var hasNumber = Regex.IsMatch(password, @"\d");
		var hasNonAlphas = Regex.IsMatch(password, @"\W");

		if (string.IsNullOrEmpty(password))
			throw new Exception("Password cannot be empty.");
		if (password != confirmPassword)
			throw new Exception("Password and Confirm Password do not match.");
		if (password.Length > 50)
			throw new Exception("Password exceeds 50 character maximum.");
		if (password.Length < 10)
			throw new Exception("Password must be at least 10 characters long.");
		if (!hasUpperCase)
			throw new Exception("Password must have at least 1 uppercase character.");
		if (!hasLowerCase)
			throw new Exception("Password must have at least 1 lowercase character.");
		if (!hasNumber)
			throw new Exception("Password must have at least 1 number.");
		if (!hasNonAlphas)
			throw new Exception("Password must have at least 1 special character.");
	}

	private async Task ValidateUserAsync(string username, string confirmUsername, string password, string confirmPassword)
	{
		await ValidateUsernameAsync(username, confirmUsername);

		ValidatePassword(password, confirmPassword);
	}

	private async Task ValidateUsernameAsync(string username, string confirmUsername)
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