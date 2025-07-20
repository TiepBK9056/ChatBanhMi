using BanhMi.Application.Common.DTOs;
using MediatR;


namespace BanhMi.Application.Queries.Users
{
    public class SearchUserQuery : IRequest<List<UserSearchDto>>
    {
        public string PhoneNumber { get; set; } = string.Empty;
    }
}