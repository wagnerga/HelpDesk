using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HelpDeskModels;

public class Response
{
	public static void HandleFailedResponse(string json, ILogger logger)
	{
		if (!string.IsNullOrEmpty(json))
		{
			Response<bool>? response = null;

			try
			{
				response = JsonConvert.DeserializeObject<Response<bool>>(json);
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Something went wrong.");
			}

			if (!string.IsNullOrEmpty(response?.ErrorMessage))
				throw new Exception(response.ErrorMessage);
		}

		throw new Exception("Something went wrong.");
	}
}

public class Response<T>
{
	public int ErrorCode { get; set; }
	public string? ErrorMessage { get; set; }
	public T? Result { get; set; }
}