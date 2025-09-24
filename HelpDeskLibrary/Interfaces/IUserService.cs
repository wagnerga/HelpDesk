using HelpDeskModels;

namespace HelpDeskLibrary.Interfaces;

public interface IUserService
{
	Task<ModelUser?> GetUserAsync(string username);
	Task<List<ModelUser>> GetUsersAsync();
}