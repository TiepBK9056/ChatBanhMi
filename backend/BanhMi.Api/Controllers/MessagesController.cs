using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BanhMi.Application.Queries.Messages;
using Ecommerce.Application.Interfaces.Services;
using System;
using System.Threading.Tasks;
using BanhMi.Application.Commands.Messages;

namespace BanhMi.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class MessagesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;

        public MessagesController(IMediator mediator, ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMessagesByConversationId([FromQuery] int conversationId)
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

                if (conversationId <= 0)
                {
                    return BadRequest(new { message = "Invalid conversation ID" });
                }

                var query = new GetMessagesByConversationQuery { ConversationId = conversationId, UserId = userId.Value };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching messages", details = ex.Message });
            }
        }

        

        [HttpPost("{messageId}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int messageId)
        {
            var command = new MarkMessageAsReadCommand { MessageId = messageId }; // Giả định có command này
            await _mediator.Send(command);
            return Ok();
        }

    }
}