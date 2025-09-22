using HelpDeskDatabaseModels;
using HelpDeskModels.Enums;
using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels;

public class ModelTicket
{
	public User? AssignedUser { get; set; }
	public Guid? AssignedUserId { get; set; }

	[Required]
	public long CreatedAt { get; set; }

	[Required]
	public required string Description { get; set; }

	[Required]
	public Guid Id { get; set; }

	[Required]
	public TicketStatus Status { get; set; }

	public long? UpdatedAt { get; set; }
}