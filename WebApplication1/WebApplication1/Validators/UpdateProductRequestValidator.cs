using FluentValidation;
using WebApplication1.DTOs;

namespace WebApplication1.Validators
{
    public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
    {
        public UpdateProductRequestValidator()
        {
            RuleFor(x => x.Name).MaximumLength(100).When(x => x.Name != null);
            RuleFor(x => x.Sku).MaximumLength(50).When(x => x.Sku != null);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).When(x => x.Quantity.HasValue);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0).When(x => x.Price.HasValue);
            RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        }
    }
}