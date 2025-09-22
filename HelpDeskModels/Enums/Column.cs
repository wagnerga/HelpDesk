using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HelpDeskModels.Enums;

[JsonConverter(typeof(StringEnumConverter))]
public enum Column
{
	CreatedAt,
	FirstName,
	LastName,
	Status,
	UpdatedAt
}