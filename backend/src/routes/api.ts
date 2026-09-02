import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../index';
import { Feasibility } from '../logic/Feasibility';
import { Inventory } from '../logic/Inventory';
import { LaborMatrix } from '../logic/LaborMatrix';

const router = Router();

// --- EVENTS ---
router.get('/events', async (req, res) => {
    const events = await db('events').select('*');
    res.json(events);
});

router.post('/events', async (req, res) => {
    try {
        const { name, jump_date, draw_date, quantity_required, surge_mode } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'name is required' });
        }
        if (!jump_date || !draw_date) {
            return res.status(400).json({ error: 'jump_date and draw_date are required' });
        }
        if (!quantity_required || typeof quantity_required !== 'number' || quantity_required <= 0) {
            return res.status(400).json({ error: 'quantity_required must be a positive number' });
        }
        if (new Date(draw_date) > new Date(jump_date)) {
            return res.status(400).json({ error: 'draw_date must be on or before jump_date' });
        }

        const [event] = await db('events')
            .insert({ name: name.trim(), jump_date, draw_date, quantity_required, surge_mode: !!surge_mode })
            .returning('*');
        const check = await Feasibility.checkEventFeasibility(event.id);
        res.json({ ...event, feasibility: check });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

router.get('/events/:id/feasibility', async (req, res) => {
    try {
        const result = await Feasibility.checkEventFeasibility(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(404).json({ error: 'Event not found' });
    }
});

router.put('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, jump_date, draw_date, quantity_required, surge_mode } = req.body;

        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            return res.status(400).json({ error: 'name must be a non-empty string' });
        }
        if (quantity_required !== undefined && (typeof quantity_required !== 'number' || quantity_required <= 0)) {
            return res.status(400).json({ error: 'quantity_required must be a positive number' });
        }
        const effectiveDrawDate = draw_date || (await db('events').where({ id }).select('draw_date').first())?.draw_date;
        const effectiveJumpDate = jump_date || (await db('events').where({ id }).select('jump_date').first())?.jump_date;
        if (effectiveDrawDate && effectiveJumpDate && new Date(effectiveDrawDate) > new Date(effectiveJumpDate)) {
            return res.status(400).json({ error: 'draw_date must be on or before jump_date' });
        }

        const [event] = await db('events')
            .where({ id })
            .update({ name: name?.trim(), jump_date, draw_date, quantity_required, surge_mode })
            .returning('*');

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const check = await Feasibility.checkEventFeasibility(event.id);
        res.json({ ...event, feasibility: check });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db('events').where({ id }).delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// --- PERSONNEL ---
router.get('/personnel', async (req, res) => {
    const users = await db('users').select('*');
    res.json(users);
});

router.post('/personnel', async (req, res) => {
    try {
        const { rank, name, role } = req.body;
        if (!rank || !name || !role) {
            return res.status(400).json({ error: 'rank, name, and role are required' });
        }
        const [user] = await db('users')
            .insert({ rank, name, role })
            .returning('*');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create personnel' });
    }
});

router.put('/personnel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rank, name, role, is_active } = req.body;
        const [user] = await db('users')
            .where({ id })
            .update({ rank, name, role, is_active })
            .returning('*');
        if (!user) {
            return res.status(404).json({ error: 'Personnel not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update personnel' });
    }
});

router.delete('/personnel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db('users').where({ id }).delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Personnel not found' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete personnel' });
    }
});

router.post('/personnel/availability', async (req, res) => {
    try {
        const { user_id, date, status, note } = req.body;
        if (!user_id || !date || !status) {
            return res.status(400).json({ error: 'user_id, date, and status are required' });
        }
        await db('user_availability')
            .insert({ user_id, date, status, note })
            .onConflict(['user_id', 'date'])
            .merge();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update availability' });
    }
});

router.get('/personnel/matrix', async (req, res) => {
    const availability = await db('user_availability').select('*');
    res.json(availability);
});

// --- INVENTORY ---
router.get('/parachutes', async (req, res) => {
    await Inventory.syncExpiredStatuses();
    const category = req.query.category as string;
    const chutes = await Inventory.getExpirationStatus(category);
    res.json(chutes);
});

router.post('/parachutes', async (req, res) => {
    try {
        const { serial_number, model, last_pack_date, category } = req.body;
        if (!serial_number || !model) {
            return res.status(400).json({ error: 'serial_number and model are required' });
        }
        const [chute] = await db('parachutes')
            .insert({
                serial_number,
                model,
                last_pack_date: last_pack_date || null,
                category: category || 'main',
                status: last_pack_date ? 'ready' : 'unpacked'
            })
            .returning('*');
        res.json(chute);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add parachute' });
    }
});

router.put('/parachutes/:serial_number', async (req, res) => {
    try {
        const { serial_number } = req.params;
        const { model, last_pack_date, category, status } = req.body;
        const [chute] = await db('parachutes')
            .where({ serial_number })
            .update({ model, last_pack_date, category, status })
            .returning('*');
        if (!chute) {
            return res.status(404).json({ error: 'Parachute not found' });
        }
        res.json(chute);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update parachute' });
    }
});

router.delete('/parachutes/:serial_number', async (req, res) => {
    try {
        const { serial_number } = req.params;
        const deleted = await db('parachutes').where({ serial_number }).delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Parachute not found' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete parachute' });
    }
});

router.post('/parachutes/bulk', async (req, res) => {
    try {
        const { count, model, category, last_pack_date, serial_prefix } = req.body;

        if (!count || count <= 0 || count > 1000) {
            return res.status(400).json({ error: 'Count must be between 1 and 1000' });
        }

        const batchId = crypto.randomUUID().slice(0, 8);
        const parachutes = [];
        for (let i = 0; i < count; i++) {
            const serial = serial_prefix
                ? `${serial_prefix}-${batchId}-${i}`
                : `AUTO-${batchId}-${i}`;

            parachutes.push({
                serial_number: serial,
                model: model || 'T-11',
                last_pack_date: last_pack_date || null,
                category: category || 'main',
                status: last_pack_date ? 'ready' : 'unpacked'
            });
        }

        const inserted = await db('parachutes').insert(parachutes).returning('*');
        res.json({ success: true, count: inserted.length, parachutes: inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to bulk add parachutes' });
    }
});

router.get('/dashboard/stats', async (req, res) => {
    await Inventory.syncExpiredStatuses();

    const totalRiggers = await db('users').where('role', 'rigger').count('id as count').first();
    const activeRiggers = await db('users').where('role', 'rigger').andWhere('is_active', true).count('id as count').first();

    const totalChutes = await db('parachutes').count('serial_number as count').first();
    const readyChutes = await db('parachutes')
        .where('status', 'ready')
        .whereNotNull('last_pack_date')
        .whereRaw("last_pack_date >= NOW() - INTERVAL '180 days'")
        .count('serial_number as count')
        .first();

    const totalCount = Number(totalChutes?.count || 0);
    const readyCount = Number(readyChutes?.count || 0);
    const missionReadyPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

    const today = new Date().toISOString().split('T')[0];
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    const capacity = await LaborMatrix.getRangeCapacity(today, next30.toISOString().split('T')[0]);

    const upcomingEvents = await db('events')
        .where('jump_date', '>=', today)
        .orderBy('jump_date', 'asc')
        .select('*');

    const recentActivity = await db('daily_logs')
        .join('users', 'daily_logs.user_id', 'users.id')
        .where('daily_logs.date', '>=', db.raw("NOW() - INTERVAL '7 days'"))
        .orderBy('daily_logs.date', 'desc')
        .select('users.rank', 'users.name', 'daily_logs.pack_count', 'daily_logs.date')
        .limit(10);

    res.json({
        mission_ready_percent: missionReadyPercent,
        riggers_on_floor: Number(activeRiggers?.count || 0),
        next_30_day_capacity: capacity,
        total_riggers: Number(totalRiggers?.count || 0),
        ready_chutes: readyCount,
        total_chutes: totalCount,
        upcoming_events: upcomingEvents,
        recent_activity: recentActivity,
    });
});

export default router;
