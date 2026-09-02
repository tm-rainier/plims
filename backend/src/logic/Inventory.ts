import { db } from "../index";

export class Inventory {
    static async getExpirationStatus(category?: string) {
        let query = db("parachutes").select('*');

        if (category) {
            query = query.where('category', category);
        }

        const chutes = await query;

        const results = chutes.map(chute => {
            if (!chute.last_pack_date) {
                return {
                    ...chute,
                    expiration_date: null,
                    days_until_expiration: null,
                    status: 'unpacked'
                };
            }
            const packDate = new Date(chute.last_pack_date);
            const expirationDate = new Date(packDate);
            expirationDate.setDate(packDate.getDate() + 180);

            const today = new Date();
            const diffTime = expirationDate.getTime() - today.getTime();
            const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...chute,
                expiration_date: expirationDate.toISOString().split('T')[0],
                days_until_expiration: daysUntilExpiration,
                status: daysUntilExpiration <= 0 ? 'expired' : chute.status
            };
        });

        return results;
    }

    static async getReadyCountAtDate(targetDate: string): Promise<number> {
        const result = await db("parachutes")
            .where("status", "ready")
            .whereNotNull("last_pack_date")
            .whereRaw("last_pack_date + INTERVAL '180 days' >= ?::date", [targetDate])
            .count("serial_number as count")
            .first();
        return parseInt(result?.count as string || "0");
    }

    static async syncExpiredStatuses(): Promise<number> {
        const updated = await db("parachutes")
            .where("status", "ready")
            .whereNotNull("last_pack_date")
            .whereRaw("last_pack_date < NOW() - INTERVAL '180 days'")
            .update({ status: "expired" });
        return updated;
    }
}
