using FluentValidation;

namespace WebApplication1.DTOs
{
    public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
    {
        public CreateProductRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Product name is required.")
                .Length(2, 100).WithMessage("Product name must be between 2 and 100 characters.");

            RuleFor(x => x.Sku)
                .NotEmpty().WithMessage("SKU is required.")
                .Length(3, 50).WithMessage("SKU must be between 3 and 50 characters.");

            RuleFor(x => x.CategoryName)
                .MaximumLength(50).WithMessage("Category name must not exceed 50 characters.");

            RuleFor(x => x.Quantity)
                .GreaterThanOrEqualTo(0).WithMessage("Quantity must be non-negative.");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be non-negative.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
        }
    }
}