using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs
{
    public class CreateAuditLogRequest
    {
        [Required]
        [StringLength(100)]
        public string User { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Module { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Entity { get; set; }

        [StringLength(1000)]
        public string? Details { get; set; }

        [StringLength(45)]
        public string? IpAddress { get; set; }

        [StringLength(20)]
        public string Severity { get; set; } = "low";
    }
}