using HelpDeskDatabaseModels;
using HelpDeskModels;
using HelpDeskModels.Enums;
using HelpDeskModels.TicketControllerModels;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Json;

namespace HelpDeskTests;

[TestClass]
public class TicketControllerIntegrationTests : ControllerIntegrationTestBase
{
	[TestMethod]
	[TestCategory("Integration")]
	public async Task AssignTicket_ValidRequest_UpdatesAssignedUserId()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place
		var ticketId = Guid.NewGuid();

		await SeedTicketAsync(ticketId, null, "Integration test ticket.");

		var request = new AssignTicketRequest
		{
			TicketId = ticketId,
			UserId = userId
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket/assign", request);
		await AssertResponseSuccessAsync(response);

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		// Assert
		Assert.IsTrue(response.IsSuccessStatusCode);
		Assert.IsTrue(result?.Result);

		await UseScopedServiceAsync<HelpDeskContext>(async context =>
		{
			var updatedTicket = await context.Ticket.FindAsync(ticketId);
			Assert.AreEqual(userId, updatedTicket?.AssignedUserId);
		});
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task UnassignTicket_ValidRequest_UpdatesAssignedUserId()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place
		var ticketId = Guid.NewGuid();

		await SeedTicketAsync(ticketId, userId, "Integration test ticket with assigned user.");

		// Act
		var response = await _client.DeleteAsync($"/ticket/{ticketId}");

		// Assert
		await AssertResponseSuccessAsync(response);

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsTrue(response.IsSuccessStatusCode, "Response status code should be success.");
		Assert.IsTrue(result?.Result, "Response result should be true.");

		await UseScopedServiceAsync<HelpDeskContext>(async context =>
		{
			var updatedTicket = await context.Ticket.FindAsync(ticketId);
			Assert.IsNull(updatedTicket?.AssignedUserId, "AssignedUserId should be null after unassignment.");
		});
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task AssignTicket_InvalidUserId_ReturnsBadRequest()
	{
		// Arrange
		await AuthenticateTestUserAsync(); // ensure auth is in place
		var ticketId = Guid.NewGuid();
		var invalidUserId = Guid.NewGuid(); // not registered

		await SeedTicketAsync(ticketId, null, "Integration test ticket.");

		var request = new AssignTicketRequest
		{
			TicketId = ticketId,
			UserId = invalidUserId
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket/assign", request);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode, "Expected BadRequest for invalid user ID.");

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when user ID is invalid.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task UnassignTicket_NonexistentTicket_ReturnsBadRequest()
	{
		// Arrange
		await AuthenticateTestUserAsync(); // ensure authentication
		var nonexistentTicketId = Guid.NewGuid(); // not seeded

		// Act
		var response = await _client.DeleteAsync($"/ticket/{nonexistentTicketId}");

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode, "Expected BadRequest for nonexistent ticket.");

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<bool>>(json);

		Assert.IsFalse(result?.Result ?? true, "Result should be false when ticket does not exist.");
		Assert.IsFalse(string.IsNullOrWhiteSpace(result?.ErrorMessage), "Error message should be provided.");
		Assert.IsTrue(result?.ErrorMessage?.Contains("does not exist", StringComparison.OrdinalIgnoreCase) ?? false,
			"Error message should indicate that the ticket does not exist.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task GetTickets_ValidRequest_ReturnsPaginatedSortedResults()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place

		// Seed multiple tickets with different statuses and timestamps
		var ticketIds = new List<Guid>();
		for (int i = 0; i < 5; i++)
		{
			var ticketId = Guid.NewGuid();
			ticketIds.Add(ticketId);

			await SeedTicketAsync(
				ticketId,
				i % 2 == 0 ? userId : null,
				$"Ticket {i}",
				i % 2 == 0 ? "Open" : "Closed"
			);

			// Slight delay to ensure different CreatedAt timestamps
			await Task.Delay(10);
		}

		var request = new GetTicketsRequest
		{
			Skip = 0,
			Take = 3,
			SortColumns =
			[
				new ModelSortColumn { Column = Column.CreatedAt, Ascending = false }
			],
			Status = null // no filter
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket/list", request);

		// Assert
		await AssertResponseSuccessAsync(response);

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<ModelWrapper<ModelTicket>>>(json);

		Assert.IsNotNull(result?.Result, "Expected ticket list in response.");
		Assert.AreEqual(5, result.Result.Total, "Total ticket count should match seeded tickets.");
		Assert.AreEqual(3, result?.Result?.Results?.Count, "Should return paginated subset of tickets.");

		// Optional: verify sorting
		var timestamps = result?.Result?.Results?.Select(t => t.CreatedAt).ToList();
		Assert.IsTrue(timestamps?.SequenceEqual(timestamps.OrderByDescending(t => t)), "Tickets should be sorted by CreatedAt descending.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task GetTickets_ByStatusFilter_ReturnsFilteredResults()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place

		// Seed tickets with mixed statuses
		var openTicketId = Guid.NewGuid();
		var closedTicketId = Guid.NewGuid();

		await SeedTicketAsync(openTicketId, userId, "Open ticket", "Open");
		await SeedTicketAsync(closedTicketId, null, "Closed ticket", "Closed");

		var request = new GetTicketsRequest
		{
			Skip = 0,
			Take = 10,
			SortColumns =
			[
				new ModelSortColumn { Column = Column.CreatedAt, Ascending = true }
			],
			Status = TicketStatus.Open
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket/list", request);

		// Assert
		await AssertResponseSuccessAsync(response);

		var json = await response.Content.ReadAsStringAsync();
		var result = JsonConvert.DeserializeObject<Response<ModelWrapper<ModelTicket>>>(json);

		Assert.IsNotNull(result?.Result, "Expected ticket list in response.");
		Assert.IsTrue(result?.Result?.Results?.All(t => t.Status == TicketStatus.Open), "All returned tickets should have status 'Open'.");
		Assert.IsTrue(result?.Result?.Results?.Any(t => t.Id == openTicketId), "Open ticket should be included.");
		Assert.IsFalse(result?.Result?.Results?.Any(t => t.Id == closedTicketId), "Closed ticket should be excluded.");
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task InsertTicket_ValidRequest_ReturnsOk()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place
		var request = new InsertTicketRequest
		{
			Ticket = new ModelTicket
			{
				Id = Guid.NewGuid(),
				AssignedUserId = null,
				CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
				Description = "This is a valid ticket description.",
				Status = TicketStatus.Open
			}
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket", request);

		// Assert
		await AssertResponseSuccessAsync(response);

		var content = await response.Content.ReadFromJsonAsync<Response<bool>>();
		Assert.IsTrue(content?.Result);
	}

	[TestMethod]
	[TestCategory("Integration")]
	public async Task InsertTicket_DescriptionTooLong_ReturnsBadRequest()
	{
		// Arrange
		var userId = await AuthenticateTestUserAsync(); // ensure auth is in place
		var request = new InsertTicketRequest
		{
			Ticket = new ModelTicket
			{
				Id = Guid.NewGuid(),
				AssignedUserId = null,
				CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
				Description = new string('x', 3001), // exceeds limit
				Status = TicketStatus.Open
			}
		};

		// Act
		var response = await _client.PostAsJsonAsync("/ticket", request);

		// Assert
		Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);

		var content = await response.Content.ReadFromJsonAsync<Response<bool>>();
		Assert.IsFalse(content?.Result ?? true);
		Assert.AreEqual("Description exceeds 3000 character maximum.", content?.ErrorMessage);
	}
}