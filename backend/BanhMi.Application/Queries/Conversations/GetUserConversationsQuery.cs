using BanhMi.Application.Common.DTOs;
using MediatR;

namespace BanhMi.Application.Queries;

public class GetUserConversationsQuery : IRequest<List<ConversationDto>>
{
    public int UserId { get; set; }
}