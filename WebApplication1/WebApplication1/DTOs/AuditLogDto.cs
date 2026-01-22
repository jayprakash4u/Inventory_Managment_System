namespace WebApplication1.DTOs
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; }
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string? Entity { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public string Severity { get; set; } = "low";
        public DateTime CreatedAt { get; set; }
    }
}