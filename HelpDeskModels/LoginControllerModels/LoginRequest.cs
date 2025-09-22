using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.LoginControllerModels;

public class LoginRequest
{
	[Required]
	public required string Password { get; set; }

	[Required]
	public required string Username { get; set; }
}