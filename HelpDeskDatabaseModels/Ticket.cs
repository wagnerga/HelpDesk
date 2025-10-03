using System;
using System.Collections.Generic;

namespace HelpDeskDatabaseModels;

public partial class Ticket
{
    public Guid Id { get; set; }

    public Guid? AssignedUserId { get; set; }

    public long CreatedAt { get; set; }

    public string Description { get; set; } = null!;

    public string Status { get; set; } = null!;

    public long? UpdatedAt { get; set; }

    public virtual User? AssignedUser { get; set; }

    public virtual ICollection<Comment> Comment { get; set; } = new List<Comment>();
}
