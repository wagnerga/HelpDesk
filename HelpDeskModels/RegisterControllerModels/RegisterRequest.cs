using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.RegisterControllerModels;

public class RegisterRequest
{
	[Required]
	public required string ConfirmPassword { get; set; }

	[Required]
	public required string ConfirmUsername { get; set; }

	[Required]
	public required string FirstName { get; set; }

	[Required]
	public required string LastName { get; set; }

	[Required]
	public required string Password { get; set; }

	[Required]
	public required string Username { get; set; }
}