using FluentValidation;
using WebApplication1.DTOs;

namespace WebApplication1.Validators
{
    public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
    {
        public CreateProductRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
            RuleFor(x => x.CategoryName).MaximumLength(100);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Price).GreaterThan(0);
            RuleFor(x => x.Description).MaximumLength(500);
        }
    }
}