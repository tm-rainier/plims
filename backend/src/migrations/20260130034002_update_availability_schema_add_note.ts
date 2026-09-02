
export async function up(knex: any): Promise<void> {
    // Add 'other' to the status enum check constraint if it exists, or just allow it.
    // Since knex .enum is loose in some configs but strict in others, we'll try to just update the column.
    // But adding a value to an existing enum/check in PG is specific.
    // Simplest approach for MVP dev: drop the check constraint and re-add it with new values.

    await knex.schema.alterTable("user_availability", (table: any) => {
        table.string("note").nullable();
        // We can't easily "alter" the enum values via Knex schema builder in a cross-db way.
        // For Postgres, we can do raw SQL to drop constraint.
    });

    // Drop the old check constraint. The name is usually "table_column_check".
    await knex.raw(`ALTER TABLE "user_availability" DROP CONSTRAINT IF EXISTS "user_availability_status_check"`);

    // Add new check constraint
    await knex.raw(`ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_status_check" CHECK (status IN ('available', 'school', 'range', 'leave', 'sick', 'other'))`);
}

export async function down(knex: any): Promise<void> {
    await knex.schema.alterTable("user_availability", (table: any) => {
        table.dropColumn("note");
    });

    await knex.raw(`ALTER TABLE "user_availability" DROP CONSTRAINT IF EXISTS "user_availability_status_check"`);
    await knex.raw(`ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_status_check" CHECK (status IN ('available', 'school', 'range', 'leave', 'sick'))`);
}
