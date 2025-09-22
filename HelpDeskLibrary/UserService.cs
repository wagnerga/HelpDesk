using HelpDeskDatabaseModels;
using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HelpDeskLibrary;

public class UserService : IUserService
{
	private readonly IServiceScopeFactory _scopeFactory;

	public UserService(IServiceScopeFactory scopeFactory)
	{
		_scopeFactory = scopeFactory;
	}

	public async Task<ModelUser?> GetUser(string username)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var user = await context.User.Where(user => user.Username.ToLower() == username.ToLower()).SingleOrDefaultAsync();

		return user != null
			? new ModelUser
			{
				FirstName = user.FirstName,
				Id = user.Id,
				LastName = user.LastName,
				Password = user.Password,
				Username = user.Username,
			}
			: null;
	}

	public async Task<List<ModelUser>> GetUsers()
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var users = await context.User.Select(user => new ModelUser
		{
			FirstName = user.FirstName,
			Id = user.Id,
			LastName = user.LastName,
			Username = user.Username
		}).ToListAsync();

		return users;
	}
}