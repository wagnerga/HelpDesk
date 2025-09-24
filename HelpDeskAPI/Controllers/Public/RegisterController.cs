using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.RegisterControllerModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskAPI.Controllers.Public;

[Route("[controller]")]
[ApiController]
[AllowAnonymous]
public class RegisterController : ControllerBase
{
	private readonly IRegisterService _registerService;

	public RegisterController(IRegisterService registerService)
	{
		_registerService = registerService;
	}

	[HttpPost("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<Guid>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> Register([FromBody] RegisterRequest request)
	{
		try
		{
			var userId = await _registerService.Register(request.Username, request.ConfirmUsername,
				request.Password, request.ConfirmPassword, request.FirstName, request.LastName);

			return Ok(new Response<Guid> { Result = userId });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}
}