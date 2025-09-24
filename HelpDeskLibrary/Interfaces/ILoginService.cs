using HelpDeskModels.LoginControllerModels;

namespace HelpDeskLibrary.Interfaces;

public interface ILoginService
{
	Task<LoginResponse> LoginAsync(string username, string password);
}