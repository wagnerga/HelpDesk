using HelpDeskModels.Enums;
using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.TicketControllerModels;

public class UpdateTicketRequest
{
	[Required]
	public required string Description { get; set; }

	[Required]
	public Guid Id { get; set; }

	[Required]
	public TicketStatus Status { get; set; }
}