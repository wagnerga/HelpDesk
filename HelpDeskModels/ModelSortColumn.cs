using System.ComponentModel.DataAnnotations;
using HelpDeskModels.Enums;

namespace HelpDeskModels;

public class ModelSortColumn
{
	[Required]
	public bool Ascending { get; set; }

	[Required]
	public Column Column { get; set; }
}