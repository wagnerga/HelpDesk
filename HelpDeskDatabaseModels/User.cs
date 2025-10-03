using System;
using System.Collections.Generic;

namespace HelpDeskDatabaseModels;

public partial class User
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Username { get; set; } = null!;

    public virtual ICollection<Comment> Comment { get; set; } = new List<Comment>();

    public virtual ICollection<Ticket> Ticket { get; set; } = new List<Ticket>();
}
