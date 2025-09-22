using HelpDeskModels;

namespace HelpDeskLibrary.Interfaces;

public interface IUserService
{
	Task<ModelUser?> GetUser(string username);
	Task<List<ModelUser>> GetUsers();
}