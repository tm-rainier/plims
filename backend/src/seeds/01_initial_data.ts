import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("daily_logs").del();
    await knex("events").del();
    await knex("parachutes").del();
    await knex("user_availability").del();
    await knex("users").del();

    const today = new Date();
    const inDays = (n: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + n);
        return d.toISOString().split('T')[0];
    };

    await knex("users").insert([
        { rank: "SGT", name: "Doe, John", role: "rigger" },
        { rank: "SPC", name: "Smith, Jane", role: "rigger" },
        { rank: "SSG", name: "Adams, Mike", role: "inspector" },
        { rank: "SFC", name: "Baker, Tom", role: "senior_inspector" }
    ]).returning("*");

    await knex("parachutes").insert([
        { serial_number: "T11-001", model: "T-11", status: "expired", last_pack_date: "2023-01-01", category: "main" },
        { serial_number: "T11-002", model: "T-11", status: "ready", last_pack_date: inDays(-10), category: "main" },
        { serial_number: "MC6-001", model: "MC-6", status: "maintenance", last_pack_date: null, category: "main" }
    ]);

    await knex("events").insert([
        { name: "Op Toy Drop", jump_date: inDays(45), draw_date: inDays(40), quantity_required: 50 }
    ]);
}
