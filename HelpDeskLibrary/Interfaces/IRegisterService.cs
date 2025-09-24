namespace HelpDeskLibrary.Interfaces;

public interface IRegisterService
{
	Task<Guid> RegisterAsync(string username, string confirmUsername, string password,
		string confirmPassword, string firstName, string lastName);
}