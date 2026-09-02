export async function up(knex: any): Promise<void> {
    // Drop the old constraint and add a new one with 'unpacked' included
    await knex.raw(`
        ALTER TABLE parachutes 
        DROP CONSTRAINT IF EXISTS parachutes_status_check;
    `);

    await knex.raw(`
        ALTER TABLE parachutes 
        ADD CONSTRAINT parachutes_status_check 
        CHECK (status IN ('ready', 'expired', 'maintenance', 'in_process', 'unpacked'));
    `);
}

export async function down(knex: any): Promise<void> {
    await knex.raw(`
        ALTER TABLE parachutes 
        DROP CONSTRAINT IF EXISTS parachutes_status_check;
    `);

    await knex.raw(`
        ALTER TABLE parachutes 
        ADD CONSTRAINT parachutes_status_check 
        CHECK (status IN ('ready', 'expired', 'maintenance', 'in_process'));
    `);
}
