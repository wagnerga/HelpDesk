using HelpDeskLibrary;
using HelpDeskModels;
using HelpDeskModels.RegisterControllerModels;
using HelpDeskWorker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Json;

namespace HelpDeskTests;

[TestClass]
public class RegisterControllerIntegrationTests : ControllerIntegrationTestBase
{
	[TestMethod]
	[TestCategory("Integration")]
	public async Task Register_PasswordsDoNotMatch_ReturnsBadRequest()
	{
		// Arrange
		var request = new RegisterRequest
		{
			Username = "mismatchUser",
			ConfirmUsername = "mismatchUser",
			Password = "p@ssw0rD1245",
			ConfirmPassword = "differentPassword",
			FirstName = "Mismatch",
			LastName = "Tester"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/register", request);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode, "Expected BadRequest due to password mismatch.");

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when passwords do not match.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
		Assert.IsTrue(result?.ErrorMessage?.Contains("do not match", StringComparison.OrdinalIgnoreCase) ?? false,
			"Error message should indicate that passwords do not match.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task Register_UsernameAlreadyExists_ReturnsBadRequest()
	{
		// Arrange
		var username = "existingUser";
		var password = "p@ssw0rD1245";

		// First registration should succeed
		var firstRequest = new RegisterRequest
		{
			Username = username,
			ConfirmUsername = username,
			Password = password,
			ConfirmPassword = password,
			FirstName = "First",
			LastName = "User"
		};

		var firstResponse = await _client.PostAsJsonAsync("/register", firstRequest);
		await AssertResponseSuccessAsync(firstResponse);

		// Second registration with same username should fail
		var secondRequest = new RegisterRequest
		{
			Username = username,
			ConfirmUsername = username,
			Password = password,
			ConfirmPassword = password,
			FirstName = "Second",
			LastName = "User"
		};

		// Act
		var secondResponse = await _client.PostAsJsonAsync("/register", secondRequest);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, secondResponse.StatusCode, "Expected BadRequest for duplicate username.");

		var json = await secondResponse.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when username already exists.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
		Assert.IsTrue(result?.ErrorMessage?.Contains("already exists", StringComparison.OrdinalIgnoreCase) ?? false,
			"Error message should indicate that the username is already taken.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task Register_UsernameMismatch_ReturnsBadRequest()
	{
		// Arrange
		var request = new RegisterRequest
		{
			Username = "userA",
			ConfirmUsername = "userB", // mismatch
			Password = "p@ssw0rD1245",
			ConfirmPassword = "p@ssw0rD1245",
			FirstName = "Mismatch",
			LastName = "Tester"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/register", request);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode, "Expected BadRequest due to username mismatch.");

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when usernames do not match.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
		Assert.IsTrue(result?.ErrorMessage?.Contains("do not match", StringComparison.OrdinalIgnoreCase) ?? false,
			"Error message should indicate that usernames do not match.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task Register_PasswordNotComplexEnough_ReturnsBadRequest()
	{
		// Arrange
		var request = new RegisterRequest
		{
			Username = "weakPasswordUser",
			ConfirmUsername = "weakPasswordUser",
			Password = "simplepass", // lacks uppercase, number, and special character
			ConfirmPassword = "simplepass",
			FirstName = "Weak",
			LastName = "Password"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/register", request);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode, "Expected BadRequest due to weak password.");

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when password is not complex enough.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
		Assert.IsTrue(
			result?.ErrorMessage?.Contains("uppercase", StringComparison.OrdinalIgnoreCase) == true ||
			result?.ErrorMessage?.Contains("lowercase", StringComparison.OrdinalIgnoreCase) == true ||
			result?.ErrorMessage?.Contains("number", StringComparison.OrdinalIgnoreCase) == true ||
			result?.ErrorMessage?.Contains("special character", StringComparison.OrdinalIgnoreCase) == true,
			"Error message should indicate which complexity rule failed."
		);
	}
}
