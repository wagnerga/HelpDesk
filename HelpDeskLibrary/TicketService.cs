using HelpDeskDatabaseModels;
using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Linq.Dynamic.Core;

namespace HelpDeskLibrary;

public class TicketService : ITicketService
{
	private readonly IServiceScopeFactory _scopeFactory;

	public TicketService(IServiceScopeFactory scopeFactory)
	{
		_scopeFactory = scopeFactory;
	}

	public async Task AssignTicketAsync(Guid ticketId, Guid userId)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var ticket = await context.Ticket.FirstOrDefaultAsync(ticket => ticket.Id == ticketId);

		if (ticket == null)
			throw new Exception("Ticket does not exist.");

		if (ticket.AssignedUserId != null)
			throw new Exception("Ticket is already assigned.");

		ticket.AssignedUserId = userId;
		ticket.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

		await context.SaveChangesAsync();
	}

	public async Task<ModelWrapper<ModelTicket>> GetTicketsAsync(int skip, int take, List<ModelSortColumn> sortColumns, TicketStatus? status)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var query = context.Ticket.AsQueryable();

		if (status.HasValue)
			query = query.Where(ticket => ticket.Status == status.Value.ToString());

		var total = await query.CountAsync();

		var orderBy = string.Join(", ", sortColumns.Select(sc => $"{sc.Column} {(sc.Ascending ? "asc" : "desc")}"));

		if (!string.IsNullOrWhiteSpace(orderBy))
			query = query.OrderBy(orderBy);

		var tickets = await query
			.Skip(skip)
			.Take(take)
			.Select(ticket => new ModelTicket
			{
				AssignedUser = ticket.AssignedUser,
				AssignedUserId = ticket.AssignedUserId,
				CreatedAt = ticket.CreatedAt,
				Description = ticket.Description,
				Id = ticket.Id,
				Status = Enum.Parse<TicketStatus>(ticket.Status),
				UpdatedAt = ticket.UpdatedAt
			}).ToListAsync();

		return new ModelWrapper<ModelTicket>
		{
			Results = tickets,
			Total = total
		};
	}

	public async Task InsertTicketAsync(ModelTicket ticket)
	{
		if (ticket.Description != null)
			ValidateDescription(ticket.Description);

		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		context.Add(new Ticket
		{
			AssignedUserId = ticket.AssignedUserId,
			CreatedAt = ticket.CreatedAt,
			Description = ticket.Description ?? string.Empty,
			Id = ticket.Id,
			Status = ticket.Status.ToString()
		});

		await context.SaveChangesAsync();
	}

	public async Task UnassignTicketAsync(Guid ticketId)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var ticket = await context.Ticket.FirstOrDefaultAsync(ticket => ticket.Id == ticketId);

		if (ticket == null)
			throw new Exception("Ticket does not exist.");

		if (ticket.AssignedUserId != null)
		{
			ticket.AssignedUserId = null;
			ticket.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

			await context.SaveChangesAsync();
		}
	}

	public async Task UpdateTicketAsync(Guid id, string description, TicketStatus status)
	{
		ValidateDescription(description);

		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();

		var existingTicket = await context.Ticket.FirstOrDefaultAsync(ticket => ticket.Id == id);

		if (existingTicket == null)
			throw new Exception("Ticket does not exist.");

		existingTicket.Description = description;
		existingTicket.Status = status.ToString();
		existingTicket.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

		await context.SaveChangesAsync();
	}

	private static void ValidateDescription(string description)
	{
		if (description.Length > 3000)
			throw new Exception("Description exceeds 3000 character maximum.");
	}
}