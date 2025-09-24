using HelpDeskModels;
using HelpDeskModels.Enums;

namespace HelpDeskLibrary.Interfaces;

public interface ITicketService
{
	Task AssignTicketAsync(Guid ticketId, Guid userId);
	Task<ModelWrapper<ModelTicket>> GetTicketsAsync(int skip, int take, List<ModelSortColumn> sortColumns, TicketStatus? status);
	Task InsertTicketAsync(ModelTicket ticket);
	Task UnassignTicketAsync(Guid ticketId);
	Task UpdateTicketAsync(Guid id, string description, TicketStatus status);
}