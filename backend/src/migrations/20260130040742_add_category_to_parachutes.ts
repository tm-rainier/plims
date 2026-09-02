
export async function up(knex: any): Promise<void> {
    await knex.schema.alterTable("parachutes", (table: any) => {
        table.enum("category", ["main", "reserve"]).defaultTo("main");
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.alterTable("parachutes", (table: any) => {
        table.dropColumn("category");
    });
}
