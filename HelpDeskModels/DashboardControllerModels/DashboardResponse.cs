using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels.DashboardControllerModels;

public class DashboardResponse
{
	[Required]
	public required List<ModelUser> Users { get; set; }
}