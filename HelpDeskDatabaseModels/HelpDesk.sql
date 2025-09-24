-- Step 1: Create Tables
CREATE TABLE "Ticket" (
	"Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"AssignedUserId" UUID NULL,
	"CreatedAt" BIGINT NOT NULL,
	"Description" VARCHAR(3000) NOT NULL,
	"Status" VARCHAR(50) NOT NULL,
	"UpdatedAt" BIGINT NULL
);

CREATE TABLE "User" (
	"Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"FirstName" VARCHAR(50) NOT NULL,
	"LastName" VARCHAR(50) NOT NULL,
	"Password" VARCHAR(50) NOT NULL,
	"Username" VARCHAR(50) NOT NULL
);

-- Step 2: Create Foreign Keys
ALTER TABLE "Ticket"
ADD CONSTRAINT "FK_Ticket_User"
FOREIGN KEY ("AssignedUserId") REFERENCES "User" ("Id");

-- Step 3: Create Notify Functions
CREATE OR REPLACE FUNCTION NotifyDeleteTicket() RETURNS trigger AS $BODY$ BEGIN PERFORM pg_notify('delete_ticket', row_to_json(OLD) :: text); RETURN OLD; END; $BODY$ LANGUAGE plpgsql VOLATILE COST 100;
CREATE OR REPLACE FUNCTION NotifyDeleteUser() RETURNS trigger AS $BODY$ BEGIN PERFORM pg_notify('delete_user', row_to_json(OLD) :: text); RETURN OLD; END; $BODY$ LANGUAGE plpgsql VOLATILE COST 100;

CREATE OR REPLACE FUNCTION NotifyUpdateTicket() RETURNS trigger AS $BODY$ BEGIN PERFORM pg_notify('update_ticket', row_to_json(NEW) :: text); RETURN NEW; END; $BODY$ LANGUAGE plpgsql VOLATILE COST 100;
CREATE OR REPLACE FUNCTION NotifyUpdateUser() RETURNS trigger AS $BODY$ BEGIN PERFORM pg_notify('update_user', row_to_json(NEW) :: text); RETURN NEW; END; $BODY$ LANGUAGE plpgsql VOLATILE COST 100;

-- Step 4: Create Triggers
CREATE OR REPLACE TRIGGER "NotifyDeleteTicket" AFTER DELETE ON "Ticket" FOR EACH ROW EXECUTE PROCEDURE NotifyDeleteTicket();
CREATE OR REPLACE TRIGGER "NotifyDeleteUser" AFTER DELETE ON "User" FOR EACH ROW EXECUTE PROCEDURE NotifyDeleteUser();

CREATE OR REPLACE TRIGGER "NotifyUpdateTicket" AFTER INSERT OR UPDATE ON "Ticket" FOR EACH ROW EXECUTE PROCEDURE NotifyUpdateTicket();
CREATE OR REPLACE TRIGGER "NotifyUpdateUser" AFTER INSERT OR UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE NotifyUpdateUser();

-- Step 5: Manage Permissions
ALTER DATABASE "HelpDesk" OWNER TO hdadmin;

REVOKE CONNECT ON DATABASE "HelpDesk" FROM PUBLIC;

GRANT CONNECT ON DATABASE "HelpDesk" TO hdadmin;

-- grant execute privileges to functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO hdadmin;

-- grant privileges that allows the user to access objects (like tables, views, and functions) that are stored within the schema
GRANT USAGE ON SCHEMA public TO hdadmin;

-- grant privileges for all CRUD operations
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hdadmin;

-- grant privileges to allow selecting next value for auto-incrementing columns
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hdadmin;