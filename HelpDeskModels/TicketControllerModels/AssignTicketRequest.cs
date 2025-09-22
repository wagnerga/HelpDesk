using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.TicketControllerModels;

public class AssignTicketRequest
{
	[Required]
	public Guid TicketId { get; set; }

	[Required]
	public Guid UserId { get; set; }
}