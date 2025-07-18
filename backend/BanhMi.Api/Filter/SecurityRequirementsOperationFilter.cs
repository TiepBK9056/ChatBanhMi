using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BanhMi.API.Filters
{
    public class SecurityRequirementsOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Kiểm tra xem endpoint có [AllowAnonymous] không
            var hasAllowAnonymous = context.MethodInfo
            .GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any() ||
            (context.MethodInfo.DeclaringType?.GetCustomAttributes(true)
                .OfType<AllowAnonymousAttribute>()
                .Any() ?? false);

            if (hasAllowAnonymous)
            {
                // Nếu có [AllowAnonymous], không thêm yêu cầu bảo mật
                return;
            }

            var authAttributes = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AuthorizeAttribute>()
                .ToList();

            // Ghi log để debug
            Console.WriteLine($"Applying filter to {context.MethodInfo.Name}, Auth: {authAttributes.Any()}");

            if (authAttributes.Any())
            {
                // Thêm yêu cầu bảo mật Bearer
                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            new string[] { }
                        }
                    }
                };

                operation.Description = operation.Description ?? "";
                operation.Description += "\n\n**Yêu cầu siêu cấp dễ thương từ `TIEP_KHA_PHONG`! 😍**:\n";
                operation.Description += "- Phải có một token JWT xịn xò trong `Authorization` header nhé, kiểu như: `Bearer <token>` nha! 😎\n";

                var roles = authAttributes
                    .Where(a => !string.IsNullOrEmpty(a.Roles))
                    .Select(a => a.Roles)
                    .Distinct();
                var policies = authAttributes
                    .Where(a => !string.IsNullOrEmpty(a.Policy))
                    .Select(a => a.Policy)
                    .Distinct();

                if (roles.Any())
                {
                    operation.Description += $"- Cần có vai trò siêu ngầu: {string.Join(", ", roles)} nha! 🦸‍♂️\n";
                }

                if (policies.Any())
                {
                    operation.Description += "- Cần thỏa mãn các chính sách siêu đáng yêu sau đây:\n";
                    foreach (var policy in policies)
                    {
                        if (policy == "VerifiedUser")
                            operation.Description += $"  - {policy}: Phải có claim `IsVerified = true` mới chịu nha, không là giận đó! 😜\n";
                        else if (policy == "AdminOnly")
                            operation.Description += $"  - {policy}: Phải là `Admin` mới được nha, quyền cao lắm luôn á! 🧑‍💼\n";
                        else
                            operation.Description += $"  - {policy}: Chính sách này cũng quan trọng lắm nha! 😊\n";
                    }
                }
            }
        }
    }
}