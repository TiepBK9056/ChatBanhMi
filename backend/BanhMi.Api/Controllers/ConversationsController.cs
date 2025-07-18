using BanhMi.Application.Queries.Conversations;
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

        public ConversationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetConversations()
        {
            var query = new GetConversationsQuery();
            var conversations = await _mediator.Send(query);
            return Ok(conversations);
        }
    }
}