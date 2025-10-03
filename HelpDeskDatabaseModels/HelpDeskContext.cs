using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskDatabaseModels;

public partial class HelpDeskContext : DbContext
{
    public HelpDeskContext()
    {
    }

    public HelpDeskContext(DbContextOptions<HelpDeskContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Comment> Comment { get; set; }

    public virtual DbSet<Ticket> Ticket { get; set; }

    public virtual DbSet<User> User { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("Comment_pkey");

            entity.Property(e => e.CommentId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Message).HasMaxLength(150);

            entity.HasOne(d => d.Ticket).WithMany(p => p.Comment)
                .HasForeignKey(d => d.TicketId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comment_Ticket");

            entity.HasOne(d => d.User).WithMany(p => p.Comment)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comment_User");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Ticket_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Description).HasMaxLength(3000);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.AssignedUser).WithMany(p => p.Ticket)
                .HasForeignKey(d => d.AssignedUserId)
                .HasConstraintName("FK_Ticket_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("User_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Password).HasMaxLength(50);
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
