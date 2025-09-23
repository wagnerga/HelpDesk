using HelpDeskDatabaseModels;
using HelpDeskLibrary;
using HelpDeskLibrary.Interfaces;
using HelpDeskModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Security.Cryptography;

namespace HelpDeskAPI;

// This class is responsible for configuring the application's services and HTTP request pipeline.
public class Startup
{
	private readonly IConfiguration _configuration;

	// The IConfiguration object is injected by the framework and provides access to app settings.
	public Startup(IConfiguration configuration)
	{
		_configuration = configuration;
	}

	// This method configures the HTTP request pipeline. It determines how the application handles incoming requests.
	public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
	{
		// Use a developer exception page for detailed error information in development environments.
		if (env.IsDevelopment())
			app.UseDeveloperExceptionPage();
		else
		{
			// In production, use a generic error handler and HSTS for security.
			app.UseExceptionHandler("/ErrorResponse");
			app.UseHsts();
		}

		// Enable routing to match incoming requests to endpoints.
		app.UseRouting();

		// Enable Cross-Origin Resource Sharing (CORS) based on the "CorsPolicy" policy.
		app.UseCors("CorsPolicy");

		// Enable authentication middleware to validate user identity.
		app.UseAuthentication();

		// Enable authorization middleware to check if the user is allowed to access resources.
		app.UseAuthorization();

		// Configure the application's endpoints (e.g., controllers).
		app.UseEndpoints(e =>
		{
			// Map controller endpoints.
			e.MapControllers();
			// Map Swagger endpoints for API documentation.
			e.MapSwagger();
		});

		// Enable middleware to serve generated Swagger as a JSON endpoint.
		app.UseSwagger();
	}

	// This method adds services to the dependency injection container.
	public void ConfigureServices(IServiceCollection services)
	{
		var issuer = _configuration["JWTConfig:Issuer"];
		var audience = _configuration["JWTConfig:Audience"];
		var publicKeyPath = Path.Combine(Constants.JWTPath, Constants.JWTPublicKey); // e.g., "public_key.der"

		if (!string.IsNullOrEmpty(issuer) && !string.IsNullOrEmpty(audience) && File.Exists(publicKeyPath))
		{
			var publicKeyBytes = File.ReadAllBytes(publicKeyPath);

			services.AddSingleton(_ =>
			{
				var rsa = RSA.Create();

				try
				{
					rsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out int _);
				}
				catch (CryptographicException ex)
				{
					throw new Exception("Failed to import public key.", ex);
				}

				return new RsaSecurityKey(rsa);
			});

			services.AddSingleton<IPostConfigureOptions<JwtBearerOptions>, JWTBearerPostConfigure>();

			services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
				.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
				{
					options.IncludeErrorDetails = true;
					options.TokenValidationParameters = new TokenValidationParameters
					{
						ValidAudience = audience,
						ValidIssuer = issuer,
						RequireSignedTokens = true,
						RequireExpirationTime = true,
						ValidateLifetime = true,
						ValidateAudience = true,
						ValidateIssuer = true
					};
				});

		}

		var connectionString = DatabaseConfig.GetConnectionString();

		// Add the database context to the service container.
		services.AddDbContext<HelpDeskContext>(options => options.UseNpgsql(connectionString));

		// Add controllers and configure them to use Newtonsoft.Json for serialization.
		services.AddControllers().AddNewtonsoftJson(options =>
		{
			options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesExceptDictionaryContractResolver();
			options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
		});

		// Configure the CORS policy named "CorsPolicy" with allowed origins.
		services.AddCors(options =>
		{
			options.AddPolicy("CorsPolicy", builder =>
				builder
					.WithOrigins($"https://{Constants.Domain}", $"https://*.{Constants.Domain}", $"https://localhost:7000")
					.SetIsOriginAllowedToAllowWildcardSubdomains()
					.AllowAnyHeader()
					.AllowAnyMethod());
		});

		// Add HttpContextAccessor to the service container to allow access to the HTTP context.
		services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

		// Register application-specific services with a scoped lifetime.
		// A new instance will be created for each request.
		services.AddScoped<ILoginService, LoginService>();
		services.AddScoped<IRegisterService, RegisterService>();
		services.AddScoped<ITicketService, TicketService>();
		services.AddScoped<IUserService, UserService>();

		// Register the Swagger generator for API documentation.
		services.AddSwaggerGen(options =>
		{
			options.SwaggerDoc("v1", new OpenApiInfo { Title = "HelpDeskAPI", Version = "v1" });
		});

		// Add Newtonsoft.Json support for Swagger.
		services.AddSwaggerGenNewtonsoftSupport();

		// Add health check services.
		services.AddHealthChecks();
	}

	// This custom contract resolver ensures that dictionary keys are not camel-cased.
	private class CamelCasePropertyNamesExceptDictionaryContractResolver : CamelCasePropertyNamesContractResolver
	{
		protected override JsonDictionaryContract CreateDictionaryContract(Type objectType)
		{
			JsonDictionaryContract contract = base.CreateDictionaryContract(objectType);
			contract.DictionaryKeyResolver = propertyName => propertyName;
			return contract;
		}
	}

	public class JWTBearerPostConfigure : IPostConfigureOptions<JwtBearerOptions>
	{
		private readonly RsaSecurityKey _rsa;

		public JWTBearerPostConfigure(RsaSecurityKey rsa)
		{
			_rsa = rsa;
		}

		public void PostConfigure(string? name, JwtBearerOptions options)
		{
			if (name != JwtBearerDefaults.AuthenticationScheme) return;

			options.TokenValidationParameters.IssuerSigningKey = _rsa;
		}
	}
}