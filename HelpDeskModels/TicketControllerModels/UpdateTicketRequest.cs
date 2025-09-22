using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.TicketControllerModels;

public class InsertTicketRequest
{
	[Required]
	public required ModelTicket Ticket { get; set; }
}