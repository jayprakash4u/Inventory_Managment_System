namespace WebApplication1.DTOs
{
    public class AuditLogFilterRequest
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? User { get; set; }
        public string? Action { get; set; }
        public string? Module { get; set; }
        public string? Severity { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 25;
        public string SortBy { get; set; } = "Timestamp";
        public string SortDirection { get; set; } = "desc";
    }
}