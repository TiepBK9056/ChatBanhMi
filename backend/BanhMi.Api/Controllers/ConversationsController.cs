using BanhMi.Application.Commands.Conversations;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Queries;
using BanhMi.Application.Queries.Conversations;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BanhMi.Api.Controllers
{
    [Route("api/conversations")]
    [ApiController]

    public class ConversationsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public ConversationsController(IMediator mediator, ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllConversations()
        {
            try
            {
                var query = new GetConversationsQuery();
                var conversations = await _mediator.Send(query);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching all conversations", details = ex.Message });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserConversations()
        {
            try
            {
                if (!_currentUserService.IsAuthenticated())
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var userId = _currentUserService.GetUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid user ID in token" });
                }

                var query = new GetUserConversationsQuery { UserId = userId.Value };
                var conversations = await _mediator.Send(query);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching user conversations", details = ex.Message });
            }
        }
        [HttpPost("direct")]
        public async Task<IActionResult> CreateDirectConversation([FromBody] CreateDirectConversationDto dto)
        {
            var command = new CreateDirectConversationCommand { TargetUserId = dto.TargetUserId };
            var conversationId = await _mediator.Send(command);
            return Ok(conversationId);
        }
    }
}
