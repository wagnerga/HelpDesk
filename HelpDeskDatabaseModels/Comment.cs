using System;
using System.Collections.Generic;

namespace HelpDeskDatabaseModels;

public partial class Comment
{
    public Guid CommentId { get; set; }

    public Guid TicketId { get; set; }

    public Guid UserId { get; set; }

    public string Message { get; set; } = null!;

    public long CreatedAt { get; set; }

    public virtual Ticket Ticket { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
