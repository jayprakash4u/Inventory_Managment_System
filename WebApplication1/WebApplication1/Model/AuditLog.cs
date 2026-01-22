using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Model
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

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

        [Required]
        [StringLength(20)]
        public string Severity { get; set; } = "low"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}