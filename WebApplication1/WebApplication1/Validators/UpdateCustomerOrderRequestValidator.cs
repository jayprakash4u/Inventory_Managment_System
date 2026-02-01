using FluentValidation;
using WebApplication1.DTOs;

namespace WebApplication1.Validators
{
    public class UpdateCustomerOrderRequestValidator : AbstractValidator<UpdateCustomerOrderRequest>
    {
        public UpdateCustomerOrderRequestValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().MaximumLength(50);
            RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.OrderDate).NotEmpty();
            RuleFor(x => x.Items).NotEmpty();
            RuleFor(x => x.TotalValue).GreaterThan(0);
            RuleFor(x => x.Status).NotEmpty().MaximumLength(20);
        }
    }
}