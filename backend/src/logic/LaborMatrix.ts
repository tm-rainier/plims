import { db } from "../index";

export class LaborMatrix {
    private static PACK_LIMIT = 12;

    static async getDailyCapacity(date: string, packLimit: number = LaborMatrix.PACK_LIMIT): Promise<number> {
        const totalRiggers = await db("users")
            .where("role", "rigger")
            .andWhere("is_active", true)
            .count("id as count")
            .first();

        const riggerCount = Number(totalRiggers?.count || 0);

        const unavailable = await db("user_availability")
            .where("date", date)
            .whereIn("status", ["school", "range", "leave", "sick", "other"])
            .count("user_id as count")
            .first();

        const unavailableCount = Number(unavailable?.count || 0);
        const activeRiggers = Math.max(0, riggerCount - unavailableCount);

        return activeRiggers * packLimit;
    }

    static async getRangeCapacity(startDate: string, endDate: string, packLimit: number = LaborMatrix.PACK_LIMIT): Promise<number> {
        const totalRiggers = await db("users")
            .where("role", "rigger")
            .andWhere("is_active", true)
            .count("id as count")
            .first();

        const riggerCount = Number(totalRiggers?.count || 0);

        const weekdayCount = await db.raw(`
            SELECT COUNT(*) as cnt FROM generate_series(?::date, ?::date, '1 day'::interval) d
            WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
        `, [startDate, endDate]);
        const totalWeekdays = Number(weekdayCount.rows[0]?.cnt || 0);

        const unavailableDays = await db.raw(`
            SELECT COUNT(*) as cnt
            FROM user_availability ua
            JOIN generate_series(?::date, ?::date, '1 day'::interval) d ON ua.date = d::date
            WHERE ua.status IN ('school', 'range', 'leave', 'sick', 'other')
              AND EXTRACT(DOW FROM d) NOT IN (0, 6)
        `, [startDate, endDate]);
        const totalUnavailableDays = Number(unavailableDays.rows[0]?.cnt || 0);

        const totalRiggerDays = (riggerCount * totalWeekdays) - totalUnavailableDays;
        return Math.max(0, totalRiggerDays) * packLimit;
    }
}
