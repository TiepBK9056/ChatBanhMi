using BanhMi.Application.Queries.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BanhMi.Api.Controllers
{
    
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> SearchUsers([FromQuery] string phoneNumber)
        {
            var query = new SearchUserQuery { PhoneNumber = phoneNumber };
            var users = await _mediator.Send(query);
            return Ok(users);
        }
    }
}