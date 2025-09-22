using HelpDeskModels;
using HelpDeskModels.Enums;

namespace HelpDeskLibrary.Interfaces;

public interface ITicketService
{
	Task AssignTicket(Guid ticketId, Guid userId);
	Task<ModelWrapper<ModelTicket>> GetTickets(int skip, int take, List<ModelSortColumn> sortColumns, TicketStatus? status);
	Task InsertTicket(ModelTicket ticket);
	Task UnassignTicket(Guid ticketId);
	Task UpdateTicket(Guid id, string description, TicketStatus status);
}