namespace HelpDeskLibrary.Interfaces;

public interface IRegisterService
{
	Task Register(string username, string confirmUsername, string password,
		string confirmPassword, string firstName, string lastName);
}