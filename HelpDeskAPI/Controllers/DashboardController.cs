using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.DashboardControllerModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskAPI.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
	private readonly IUserService _userService;

	public DashboardController(IUserService userService)
	{
		_userService = userService;
	}

	[HttpGet("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<DashboardResponse>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> GetDashboard()
	{
		try
		{
			var users = await _userService.GetUsers();

			return Ok(new Response<DashboardResponse>
			{
				Result = new DashboardResponse
				{
					Users = users
				}
			});
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}
}