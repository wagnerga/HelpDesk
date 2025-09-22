using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels;

public class ModelUser
{
	[Required]
	public required string FirstName { get; set; }

	[Required]
	public Guid Id { get; set; }

	[Required]
	public required string LastName { get; set; }

	[JsonIgnore]
	public string? Password { get; set; }

	[JsonIgnore]
	public required string Username { get; set; }
}