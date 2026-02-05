using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService service, ILogger<ProductsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts([FromQuery] string? category = null, [FromQuery] decimal? minPrice = null, [FromQuery] decimal? maxPrice = null, [FromQuery] string? status = null)
        {
            _logger.LogInformation("Retrieving products with filters - Category: {Category}, MinPrice: {MinPrice}, MaxPrice: {MaxPrice}, Status: {Status}",
                category, minPrice, maxPrice, status);
            var products = await _service.GetAllProductsAsync(category, minPrice, maxPrice, status);
            _logger.LogInformation("Retrieved {Count} products", products.Count());
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            _logger.LogInformation("Retrieving product with ID: {ProductId}", id);
            var product = await _service.GetProductByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product not found with ID: {ProductId}", id);
                throw new NotFoundException("Product", id);
            }
            _logger.LogInformation("Product retrieved successfully: {ProductName}", product.Name);
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
        {
            _logger.LogInformation("Creating new product: {ProductName}", request.Name);
            var product = new Product
            {
                Name = request.Name,
                Sku = request.Sku,
                CategoryName = request.CategoryName,
                Quantity = request.Quantity,
                Price = request.Price,
                Description = request.Description
            };
            await _service.AddProductAsync(product);
            _logger.LogInformation("Product created successfully with ID: {ProductId}", product.Id);
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
        {
            var product = await _service.GetProductByIdAsync(id);
            if (product == null)
            {
                throw new NotFoundException("Product", id);
            }

            if (request.Name != null) product.Name = request.Name;
            if (request.Sku != null) product.Sku = request.Sku;
            if (request.CategoryName != null) product.CategoryName = request.CategoryName;
            if (request.Quantity.HasValue) product.Quantity = request.Quantity.Value;
            if (request.Price.HasValue) product.Price = request.Price.Value;
            if (request.Description != null) product.Description = request.Description;

            await _service.UpdateProductAsync(product);
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _service.GetProductByIdAsync(id);
            if (product == null)
            {
                throw new NotFoundException("Product", id);
            }

            await _service.DeleteProductAsync(id);
            return NoContent();
        }

        [HttpGet("chart/category")]
        public async Task<IActionResult> GetProductsByCategory()
        {
            var data = await _service.GetProductsByCategoryAsync();
            return Ok(data);
        }

        [HttpGet("chart/stock-levels")]
        public async Task<IActionResult> GetStockLevels()
        {
            var data = await _service.GetStockLevelsAsync();
            return Ok(data);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var data = await _service.GetSummaryAsync();
            return Ok(data);
        }
    }
}
