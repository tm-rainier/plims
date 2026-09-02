import { db } from "../index";
import { Inventory } from "./Inventory";
import { LaborMatrix } from "./LaborMatrix";

export class Feasibility {
    static async checkEventFeasibility(eventId: string): Promise<{
        feasible: boolean;
        reason?: string;
        required: number;
        available: number;
        readyParachutes?: number;
        laborCapacity?: number;
        totalRequiredOnDrawDate?: number;
    }> {
        const event = await db("events").where({ id: eventId }).first();
        if (!event) throw new Error("Event not found");

        const required = event.quantity_required;
        const today = new Date();
        const drawDate = new Date(event.draw_date);

        if (drawDate < today) {
            return { feasible: false, reason: "Draw date is in the past", required, available: 0 };
        }

        const packLimit = event.surge_mode ? 15 : 12;
        const laborCapacity = await LaborMatrix.getRangeCapacity(today.toISOString().split('T')[0], event.draw_date, packLimit);

        const readyCount = await Inventory.getReadyCountAtDate(event.draw_date);

        const drawDateStr = event.draw_date;
        const otherEventsOnSameDay = await db("events")
            .where("draw_date", drawDateStr)
            .where("id", "!=", eventId)
            .sum("quantity_required as total")
            .first();

        const totalRequiredOnDrawDate = required + (parseInt(otherEventsOnSameDay?.total as string || "0"));

        const drawDateCapacity = await LaborMatrix.getDailyCapacity(drawDateStr, packLimit);

        const laborFeasible = laborCapacity >= required;
        const drawDateLaborFeasible = drawDateCapacity > 0;
        const inventoryFeasible = readyCount >= required;
        const totalInventoryFeasible = readyCount >= totalRequiredOnDrawDate;

        if (laborFeasible && drawDateLaborFeasible && inventoryFeasible && totalInventoryFeasible) {
            return {
                feasible: true,
                required,
                available: Math.min(laborCapacity, readyCount),
                readyParachutes: readyCount,
                laborCapacity,
                totalRequiredOnDrawDate
            };
        } else {
            const reasons = [];

            if (!laborFeasible) {
                reasons.push("insufficient labor capacity for packing period");
            }
            if (!drawDateLaborFeasible) {
                reasons.push("no available riggers on draw date");
            }
            if (!inventoryFeasible) {
                reasons.push("insufficient ready parachutes for this event");
            }
            if (!totalInventoryFeasible) {
                reasons.push(`insufficient ready parachutes (${totalRequiredOnDrawDate} needed on ${drawDateStr}, only ${readyCount} available)`);
            }

            return {
                feasible: false,
                reason: "Logistically Unfeasible: " + reasons.join("; "),
                required,
                available: Math.min(laborCapacity, readyCount),
                readyParachutes: readyCount,
                laborCapacity,
                totalRequiredOnDrawDate
            };
        }
    }
}
