using System.Web;
using System.Text.RegularExpressions;

namespace WebApplication1.Extensions;

/// <summary>
/// String extension methods for security and validation
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Sanitizes HTML content to prevent XSS attacks
    /// </summary>
    public static string SanitizeHtml(this string? input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        return HttpUtility.HtmlEncode(input)
            .Replace("&amp;", "&")
            .Trim();
    }

    /// <summary>
    /// Removes special characters, keeping only alphanumeric and spaces
    /// </summary>
    public static string RemoveSpecialCharacters(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        return Regex.Replace(input, "[^a-zA-Z0-9 -]", "");
    }

    /// <summary>
    /// Validates if the string is a valid email format
    /// </summary>
    public static bool IsValidEmail(this string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Validates password strength (min 8 chars, upper, lower, digit, special char)
    /// </summary>
    public static bool IsStrongPassword(this string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return false;

        return Regex.IsMatch(password, @"[a-z]") &&      // lowercase
               Regex.IsMatch(password, @"[A-Z]") &&      // uppercase
               Regex.IsMatch(password, @"[0-9]") &&      // digit
               Regex.IsMatch(password, @"[!@#$%^&*]");   // special char
    }

    /// <summary>
    /// Validates phone number format (10 digits)
    /// </summary>
    public static bool IsValidPhoneNumber(this string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var digitsOnly = Regex.Replace(phone, @"\D", "");
        return digitsOnly.Length == 10 && Regex.IsMatch(digitsOnly, @"^\d+$");
    }

    /// <summary>
    /// Truncates string to max length and adds ellipsis
    /// </summary>
    public static string Truncate(this string input, int maxLength)
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
            return input;

        return input.Substring(0, maxLength) + "...";
    }
}
