using System.ComponentModel.DataAnnotations;

namespace HelpDeskModels;

public class ModelWrapper<T>
{
	[Required]
	public List<T>? Results { get; set; }

	[Required]
	public int Total { get; set; }
}
