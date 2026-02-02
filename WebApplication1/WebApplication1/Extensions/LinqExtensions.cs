namespace WebApplication1.Extensions;

/// <summary>
/// LINQ extension methods for common operations
/// </summary>
public static class LinqExtensions
{
    /// <summary>
    /// Paginates a queryable collection
    /// </summary>
    public static IQueryable<T> Paginate<T>(this IQueryable<T> source, int pageNumber, int pageSize)
    {
        if (pageNumber < 1)
            pageNumber = 1;
        if (pageSize < 1)
            pageSize = 10;

        return source.Skip((pageNumber - 1) * pageSize).Take(pageSize);
    }

    /// <summary>
    /// Paginates a list collection
    /// </summary>
    public static List<T> Paginate<T>(this List<T> source, int pageNumber, int pageSize)
    {
        if (pageNumber < 1)
            pageNumber = 1;
        if (pageSize < 1)
            pageSize = 10;

        return source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
    }

    /// <summary>
    /// Checks if collection is null or empty
    /// </summary>
    public static bool IsNullOrEmpty<T>(this IEnumerable<T>? source)
    {
        return source == null || !source.Any();
    }
}
