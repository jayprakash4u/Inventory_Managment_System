using FluentValidation;
using WebApplication1.DTOs;

namespace WebApplication1.Validators
{
    public class UpdateSupplierOrderRequestValidator : AbstractValidator<UpdateSupplierOrderRequest>
    {
        public UpdateSupplierOrderRequestValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().MaximumLength(50);
            RuleFor(x => x.SupplierName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.OrderDate).NotEmpty();
            RuleFor(x => x.Items).NotEmpty();
            RuleFor(x => x.TotalValue).GreaterThan(0);
            RuleFor(x => x.Status).NotEmpty().MaximumLength(20);
        }
    }
}