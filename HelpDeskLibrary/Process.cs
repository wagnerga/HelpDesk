using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace HelpDeskLibrary;

public class Process
{
	public static async Task<string> ExecuteAndWait(string workingDirectory, string fileName, bool executeThenTerminate, string arguments, ILogger? logger, Dictionary<string, string>? environmentVariables = null, bool stream = false, bool redirectStandardError = true)
	{
		var psi = new ProcessStartInfo
		{
			WorkingDirectory = workingDirectory,
			FileName = fileName,
			Arguments = executeThenTerminate ? RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
				? $"/C \"{arguments}\""
				: $"-c \"{arguments}\"" : arguments,
			UseShellExecute = false,
			CreateNoWindow = true,
			RedirectStandardOutput = true,
			RedirectStandardError = redirectStandardError
		};

		if (environmentVariables != null)
			foreach (var keyValuePair in environmentVariables)
			{
				psi.EnvironmentVariables[keyValuePair.Key] = keyValuePair.Value;
			}

		var cmdLine = $"{psi.FileName} {psi.Arguments}";

		logger?.LogInformation("Executing '{cmdLine}'.", cmdLine);

		var p = new System.Diagnostics.Process
		{
			StartInfo = psi,
			EnableRaisingEvents = true
		};

		var output = string.Empty;
		var error = string.Empty;

		try
		{
			p = System.Diagnostics.Process.Start(psi);

			if (p != null)
			{
				if (stream)
				{
					if (redirectStandardError)
					{
						var outputTask = ReadStreamAsync(p.StandardOutput, logger);
						var errorTask = ReadStreamAsync(p.StandardError, logger);

						await Task.WhenAll(outputTask, errorTask);
					}
					else
						await ReadStreamAsync(p.StandardOutput, logger);
				}

				output = await p.StandardOutput.ReadToEndAsync();

				if (redirectStandardError)
					error = await p.StandardError.ReadToEndAsync();

				await p.WaitForExitAsync();

				if (!stream)
				{
					if (!string.IsNullOrEmpty(output))
						logger?.LogInformation("{output}", output);

					if (redirectStandardError && !string.IsNullOrEmpty(error))
						logger?.LogInformation("{error}", error);
				}

				logger?.LogInformation("Successfully executed '{cmdLine}'", cmdLine);
			}
			else
				logger?.LogError("Failed to execute '{cmdLine}'", cmdLine);
		}
		catch (Exception ex)
		{
			logger?.LogError("Exception thrown executing '{cmdLine}': {ex}", cmdLine, ex);
		}
		finally
		{
			p?.Close();
		}

		return $"{output}{error}";
	}

	public static bool Execute(string workingDirectory, string fileName, string arguments, ILogger logger, Dictionary<string, string>? environmentVariables = null)
	{
		var psi = new ProcessStartInfo
		{
			WorkingDirectory = workingDirectory,
			FileName = fileName,
			Arguments = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
				? $"/C \"{arguments}\""
				: $"-c \"{arguments}\"",
			UseShellExecute = false,
			CreateNoWindow = true,
			RedirectStandardOutput = false,
			RedirectStandardError = false
		};

		if (environmentVariables != null)
			foreach (var keyValuePair in environmentVariables)
			{
				psi.EnvironmentVariables[keyValuePair.Key] = keyValuePair.Value;
			}

		var cmdLine = $"{psi.FileName} {psi.Arguments}";

		logger.LogInformation("Executing '{cmdLine}'.", cmdLine);

		var p = new System.Diagnostics.Process
		{
			StartInfo = psi,
			EnableRaisingEvents = true
		};

		try
		{
			p = System.Diagnostics.Process.Start(psi);

			if (p != null)
			{
				logger.LogInformation("Successfully executed '{cmdLine}'", cmdLine);

				return true;
			}
			else
				logger.LogError("Failed to execute '{cmdLine}'", cmdLine);
		}
		catch (Exception ex)
		{
			logger.LogError("Exception thrown executing '{cmdLine}': {ex}", cmdLine, ex);
		}
		finally
		{
			p?.Close();
		}

		return false;
	}

	public static async Task<bool> AreAnyPortsListening(List<int> ports, ILogger logger)
	{
		foreach (var port in ports)
		{
			if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
			{
				var output = await ExecuteAndWait("c:\\", "cmd.exe", true, $"netstat -ano | findstr :{port}", logger);

				if (!string.IsNullOrEmpty(output))
				{
					var lines = output.Split("\r\n");

					foreach (var line in lines)
					{
						if (line.Contains("LISTENING"))
							return true;
					}
				}
			}
			else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
			{
				var output = await ExecuteAndWait("/", "/usr/bin/bash", true, $"lsof -t -i:{port}", logger);

				if (!string.IsNullOrEmpty(output))
				{
					var lines = output.Split("\n");

					foreach (var line in lines)
					{
						if (line.Contains("LISTEN"))
							return true;
					}
				}
			}
		}

		return false;
	}

	public static async Task KillPorts(List<int> ports, ILogger logger)
	{
		foreach (var port in ports)
		{
			if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
			{
				var output = await ExecuteAndWait("c:\\", "cmd.exe", true, $"netstat -ano | findstr :{port}", logger);

				if (!string.IsNullOrEmpty(output))
				{
					var lines = output.Split("\r\n");

					var pids = new List<int>();

					foreach (var line in lines)
					{
						var match = Regex.Match(line, @"(\d+)$");

						if (match.Success)
							if (int.TryParse(match.Groups[1].Value, out var pid))
								if (!pids.Contains(pid) && line.Contains("LISTENING"))
									pids.Add(pid);
					}

					foreach (var pid in pids)
					{
						await ExecuteAndWait("c:\\", "cmd.exe", true, $"taskkill /PID {pid} /F", logger);
					}
				}
			}
			else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
			{
				var output = await ExecuteAndWait("/", "/usr/bin/bash", true, $"lsof -t -i :{port}", logger);

				if (!string.IsNullOrEmpty(output))
				{
					var pids = output.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
										 .Select(pidString => int.Parse(pidString.Trim()))
										 .ToList();

					foreach (var pid in pids)
					{
						await ExecuteAndWait("/", "/usr/bin/bash", true, $"kill {pid}", logger);
					}
				}
			}
		}
	}

	private static async Task ReadStreamAsync(StreamReader streamReader, ILogger? logger)
	{
		string? line;
		while ((line = await streamReader.ReadLineAsync()) != null)
		{
			logger?.LogInformation("{line}", line);
		}
	}
}