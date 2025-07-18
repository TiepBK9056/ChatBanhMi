// BanhMi.Application/Queries/Conversations/GetConversationsQuery.cs
using BanhMi.Application.Common.DTOs;
using MediatR;

namespace BanhMi.Application.Queries.Conversations
{
    public class GetConversationsQuery : IRequest<List<ConversationDto>>
    {
        public int UserId { get; set; }
    }
}