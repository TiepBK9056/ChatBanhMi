using BanhMi.Application.Commands.Contacts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace BanhMi.Api.Controllers
{
    [Route("api/contacts")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ContactsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddContact([FromBody] AddContactRequest request)
        {
            var command = new AddContactCommand { FriendId = request.FriendId };
            var result = await _mediator.Send(command);
            if (result.Contains("successfully"))
            {
                return Ok(result);
            }
            return BadRequest(result);
        }

        [HttpPost("accept")]
        [Authorize]
        public async Task<IActionResult> AcceptContact([FromBody] AcceptContactRequest request)
        {
            var command = new AcceptContactCommand { FriendId = request.FriendId };
            var result = await _mediator.Send(command);
            if (result.Contains("successfully"))
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }

    public class AddContactRequest
    {
        public int FriendId { get; set; }
    }

    public class AcceptContactRequest
    {
        public int FriendId { get; set; }
    }
}