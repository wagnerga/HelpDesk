using HelpDeskModels.Enums;
using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.TicketControllerModels;

public class GetTicketsRequest
{
	[Required]
	public int Skip { get; set; }

	[Required]
	public required List<ModelSortColumn> SortColumns { get; set; }

	public TicketStatus? Status { get; set; }

	[Required]
	public int Take { get; set; }
}