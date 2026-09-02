
export async function up(knex: any): Promise<void> {
    await knex.schema.alterTable("events", (table: any) => {
        table.boolean("surge_mode").defaultTo(false);
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.alterTable("events", (table: any) => {
        table.dropColumn("surge_mode");
    });
}
