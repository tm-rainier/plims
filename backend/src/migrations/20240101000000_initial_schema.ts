
export async function up(knex: any): Promise<void> {
    // Users Table
    await knex.schema.createTable("users", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("rank").notNullable();
        table.string("name").notNullable();
        table.enum("role", ["rigger", "inspector", "senior_inspector", "admin"]).notNullable();
        table.boolean("is_active").defaultTo(true);
        table.timestamps(true, true);
    });

    // User Availability (for Personnel Tracker)
    await knex.schema.createTable("user_availability", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.date("date").notNullable(); // Specific date for Schools/Range
        table.enum("status", ["available", "school", "range", "leave", "sick"]).notNullable();
        table.unique(["user_id", "date"]);
    });

    // Parachutes Table
    await knex.schema.createTable("parachutes", (table: any) => {
        table.string("serial_number").primary();
        table.string("model").notNullable(); // T-11, MC-6
        table.date("last_pack_date").nullable();
        table.enum("status", ["ready", "expired", "maintenance", "in_process"]).defaultTo("maintenance"); // 'in_process' for packing flow
        table.enum("process_stage", ["unpacked", "packed", "initial_inspected", "final_inspected"]).defaultTo("unpacked");
        table.uuid("packer_id").references("id").inTable("users");
        table.timestamps(true, true);
    });

    // Events Table
    await knex.schema.createTable("events", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name").notNullable();
        table.date("jump_date").notNullable();
        table.date("draw_date").notNullable(); // When chutes are pulled
        table.integer("quantity_required").notNullable();
        table.timestamps(true, true);
    });

    // Daily Logs (Production Counter)
    await knex.schema.createTable("daily_logs", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").references("id").inTable("users");
        table.date("date").notNullable();
        table.integer("pack_count").defaultTo(0);
        table.unique(["user_id", "date"]);
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.dropTableIfExists("daily_logs");
    await knex.schema.dropTableIfExists("events");
    await knex.schema.dropTableIfExists("parachutes");
    await knex.schema.dropTableIfExists("user_availability");
    await knex.schema.dropTableIfExists("users");
}
