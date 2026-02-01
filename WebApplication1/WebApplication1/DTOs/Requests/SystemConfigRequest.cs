using WebApplication1.Model;

namespace WebApplication1.DTOs.Requests
{
    /// <summary>
    /// System configuration update request DTO
    /// </summary>
    public class UpdateSystemConfigRequest
    {
        public string Key { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// System backup request DTO
    /// </summary>
    public class CreateSystemBackupRequest
    {
        public string BackupName { get; set; }
        public string Description { get; set; }
        public bool IncludeData { get; set; } = true;
        public bool IncludeSettings { get; set; } = true;
    }

    /// <summary>
    /// System configuration bulk update request DTO
    /// </summary>
    public class BulkUpdateSystemConfigRequest
    {
        public List<UpdateSystemConfigRequest> Configurations { get; set; } = new();
    }
}
