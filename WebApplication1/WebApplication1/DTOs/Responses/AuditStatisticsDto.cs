namespace WebApplication1.DTOs
{
    public class AuditStatisticsDto
    {
        public int TotalLogs { get; set; }
        public int TodayActivities { get; set; }
        public int Warnings { get; set; }
        public int Errors { get; set; }
        public int CriticalEvents { get; set; }
    }
}