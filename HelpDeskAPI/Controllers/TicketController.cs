using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.TicketControllerModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskAPI.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class TicketController : ControllerBase
{
	private readonly ITicketService _ticketService;

	public TicketController(ITicketService ticketService)
	{
		_ticketService = ticketService;
	}

	[HttpPost("assign")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> AssignTicket([FromBody] AssignTicketRequest request)
	{
		try
		{
			await _ticketService.AssignTicket(request.TicketId, request.UserId);

			return Ok(new Response<bool> { Result = true });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}

	[HttpPost("list")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<ModelWrapper<ModelTicket>>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> GetTickets([FromBody] GetTicketsRequest request)
	{
		try
		{
			var tickets = await _ticketService.GetTickets(request.Skip, request.Take, request.SortColumns, request.Status);

			return Ok(new Response<ModelWrapper<ModelTicket>> { Result = tickets });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}

	[HttpDelete("{ticketId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> UnassignTicket([FromRoute] Guid ticketId)
	{
		try
		{
			await _ticketService.UnassignTicket(ticketId);

			return Ok(new Response<bool> { Result = true });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}

	[HttpPost("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> InsertTicket([FromBody] InsertTicketRequest request)
	{
		try
		{
			await _ticketService.InsertTicket(request.Ticket);

			return Ok(new Response<bool> { Result = true });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}

	[HttpPatch("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<bool>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> UpdateTicket([FromBody] UpdateTicketRequest request)
	{
		try
		{
			await _ticketService.UpdateTicket(request.Id, request.Description, request.Status);

			return Ok(new Response<bool> { Result = true });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}
}
