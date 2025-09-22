using HelpDeskModels.LoginControllerModels;

namespace HelpDeskLibrary.Interfaces;

public interface ILoginService
{
	Task<LoginResponse> Login(string username, string password);
}