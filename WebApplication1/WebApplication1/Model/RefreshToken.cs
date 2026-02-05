using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Model
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Token { get; set; }

        [Required]
        public required string UserEmail { get; set; }

        [Required]
        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsRevoked { get; set; } = false;

        // Navigation property
        [ForeignKey("UserEmail")]
        public User User { get; set; } = null!;
    }
}