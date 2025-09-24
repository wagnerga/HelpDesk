using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.LoginControllerModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskAPI.Controllers.Public;

[Route("[controller]")]
[ApiController]
[AllowAnonymous]
public class LoginController : ControllerBase
{
	private readonly ILoginService _loginService;

	public LoginController(ILoginService loginService)
	{
		_loginService = loginService;
	}

	[HttpPost("")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response<LoginResponse>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(Response<bool>))]
	public async Task<ActionResult> Login([FromBody] LoginRequest request)
	{
		try
		{
			var response = await _loginService.LoginAsync(request.Username, request.Password);

			return Ok(new Response<LoginResponse> { Result = response });
		}
		catch (Exception ex)
		{
			return BadRequest(new Response<bool> { ErrorMessage = ex.Message });
		}
	}
}