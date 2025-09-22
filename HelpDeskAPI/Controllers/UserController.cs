using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskAPI.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
	private readonly IUserService _userService;

	public UserController(IUserService userService)
	{
		_userService = userService;
	}

	[HttpGet("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<List<ModelUser>>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> GetUsers()
	{
		try
		{
			var users = await _userService.GetUsers();

			return Ok(new Response<List<ModelUser>> { Result = users });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}
}
