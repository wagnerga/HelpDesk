using HelpDeskDatabaseModels;
using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using HelpDeskModels.LoginControllerModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HelpDeskLibrary;

public class LoginService : ILoginService
{
	private readonly IConfiguration _configuration;
	private readonly IServiceScopeFactory _scopeFactory;
	private readonly IUserService _userService;

	public LoginService(IConfiguration configuration, IServiceScopeFactory scopeFactory, IUserService userService)
	{
		_scopeFactory = scopeFactory;
		_userService = userService;
		_configuration = configuration;
	}

	public async Task<LoginResponse> Login(string username, string password)
	{
		await using var scope = _scopeFactory.CreateAsyncScope();
		var context = scope.ServiceProvider.GetRequiredService<HelpDeskContext>();
		var user = await _userService.GetUser(username) ?? throw new Exception("Login failed.");

		var token = await GetToken(password);

		if (user.Password != token)
			throw new Exception("Login failed.");

		var jwt = GenerateJWT(user.Username, user.Id);

		return new LoginResponse
		{
			JWT = jwt
		};
	}

	private string GenerateJWT(string username, Guid userId)
	{
		byte[] keyBytes;
		var audience = _configuration["JWTConfig:Audience"];
		var issuer = _configuration["JWTConfig:Issuer"];
		var expirationInMinutes = _configuration["JWTConfig:ExpirationInMinutes"];

		try
		{
			keyBytes = File.ReadAllBytes(Path.Combine(Constants.JWTPath, Constants.JWTPrivateKey));
		}
		catch
		{
			throw new Exception("JWT private key missing.");
		}

		if (keyBytes.Length == 0)
			throw new Exception("JWT private key missing.");

		if (string.IsNullOrEmpty(audience) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(expirationInMinutes))
			throw new Exception("JWT configuration missing.");

		if (!double.TryParse(expirationInMinutes, out var expiration))
			throw new Exception("Invalid JWT configuration ExpirationInMinutes.");

		using var rsa = RSA.Create();

		rsa.ImportPkcs8PrivateKey(keyBytes, out _);

		var signingCredentials = new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)
		{
			CryptoProviderFactory = new CryptoProviderFactory { CacheSignatureProviders = false }
		};

		var utcNow = DateTime.UtcNow;

		var jwt = new JwtSecurityToken(
			audience,
			issuer,
			[new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.NameIdentifier, userId.ToString())],
			utcNow,
			utcNow.AddMinutes(expiration),
			signingCredentials
		);

		var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();

		return jwtSecurityTokenHandler.WriteToken(jwt);
	}

	public static async Task<string> GetToken(string value)
	{
		var bytes = Encoding.UTF8.GetBytes(value);
		using var sha1 = SHA1.Create();
		var tokenBytes = await sha1.ComputeHashAsync(new MemoryStream(bytes));
		var token = Convert.ToBase64String(tokenBytes);

		return token;
	}
}