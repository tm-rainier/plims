import { format, subDays, addDays, addMonths } from 'date-fns';

function uuid() {
  return crypto.randomUUID();
}

function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

function daysAgo(n: number) {
  return format(subDays(new Date(), n), 'yyyy-MM-dd');
}

function daysFromNow(n: number) {
  return format(addDays(new Date(), n), 'yyyy-MM-dd');
}

function monthsFromNow(n: number) {
  return format(addMonths(new Date(), n), 'yyyy-MM-dd');
}

export interface Personnel {
  id: string;
  rank: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface Availability {
  user_id: string;
  date: string;
  status: string;
  note?: string;
}

export interface Parachute {
  serial_number: string;
  model: string;
  category: 'main' | 'reserve';
  status: string;
  process_stage: string;
  last_pack_date: string | null;
  packer_id: string | null;
  days_until_expiration: number | null;
  expiration_date: string | null;
}

export interface PLIMSEvent {
  id: string;
  name: string;
  jump_date: string;
  draw_date: string;
  quantity_required: number;
  surge_mode: boolean;
}

export interface FeasibilityStatus {
  feasible: boolean;
  reason?: string;
  required: number;
  available: number;
  readyParachutes?: number;
  laborCapacity?: number;
  totalRequiredOnDrawDate?: number;
}

const STORAGE_KEY = 'plims_prototype';

interface StoreData {
  personnel: Personnel[];
  availability: Availability[];
  parachutes: Parachute[];
  events: PLIMSEvent[];
}

function computeExpiration(lastPackDate: string | null): { days_until_expiration: number | null; expiration_date: string | null } {
  if (!lastPackDate) return { days_until_expiration: null, expiration_date: null };
  const packed = new Date(lastPackDate + 'T00:00:00');
  const exp = new Date(packed);
  exp.setDate(exp.getDate() + 180);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    days_until_expiration: diff,
    expiration_date: format(exp, 'yyyy-MM-dd'),
  };
}

function makeChute(serial: string, model: string, category: 'main' | 'reserve', lastPackDate: string | null, packerId: string | null): Parachute {
  const exp = computeExpiration(lastPackDate);
  let status = 'maintenance';
  if (lastPackDate && exp.days_until_expiration !== null) {
    if (exp.days_until_expiration <= 0) status = 'expired';
    else status = 'ready';
  }
  return {
    serial_number: serial,
    model,
    category,
    status,
    process_stage: lastPackDate ? 'final_inspected' : 'unpacked',
    last_pack_date: lastPackDate,
    packer_id: packerId,
    ...exp,
  };
}

function createSeedData(): StoreData {
  const personnelIds = {
    riley: uuid(),
    chen: uuid(),
    park: uuid(),
    doe: uuid(),
    martinez: uuid(),
    vasquez: uuid(),
    garcia: uuid(),
    thompson: uuid(),
    kim: uuid(),
  };

  const personnel: Personnel[] = [
    { id: personnelIds.riley, rank: 'MSG', name: 'Riley', role: 'admin', is_active: true },
    { id: personnelIds.chen, rank: '1SG', name: 'Chen', role: 'senior_inspector', is_active: true },
    { id: personnelIds.park, rank: 'SFC', name: 'Park', role: 'senior_inspector', is_active: true },
    { id: personnelIds.doe, rank: 'SGT', name: 'Doe', role: 'rigger', is_active: true },
    { id: personnelIds.martinez, rank: 'SGT', name: 'Martinez', role: 'rigger', is_active: true },
    { id: personnelIds.vasquez, rank: 'CPL', name: 'Vasquez', role: 'inspector', is_active: true },
    { id: personnelIds.garcia, rank: 'SSG', name: 'Garcia', role: 'inspector', is_active: true },
    { id: personnelIds.thompson, rank: 'PFC', name: 'Thompson', role: 'rigger', is_active: true },
    { id: personnelIds.kim, rank: 'SPC', name: 'Kim', role: 'rigger', is_active: true },
  ];

  const availability: Availability[] = [];
  const statuses: string[] = ['available', 'school', 'range', 'leave', 'sick'];
  for (const p of personnel) {
    for (let i = -5; i <= 30; i++) {
      const d = format(addDays(new Date(), i), 'yyyy-MM-dd');
      const dayOfWeek = addDays(new Date(), i).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      let status = 'available';
      if (p.name === 'Park' && i >= 2 && i <= 16) status = 'leave';
      else if (p.name === 'Thompson' && i >= 5 && i <= 9) status = 'school';
      else if (p.name === 'Garcia' && i === 0) status = 'range';
      else if (p.name === 'Kim' && i >= -2 && i <= 1) status = 'sick';
      else {
        const rand = Math.random();
        if (rand < 0.08) status = statuses[Math.floor(Math.random() * statuses.length)];
      }

      if (status !== 'available') {
        availability.push({ user_id: p.id, date: d, status, note: status === 'other' ? 'Detail' : undefined });
      }
    }
  }

  const riggerIds = [personnelIds.doe, personnelIds.martinez, personnelIds.thompson, personnelIds.kim];
  const parachutes: Parachute[] = [];

  for (let i = 1; i <= 35; i++) {
    const serial = `AC-${2000 + i}`;
    const packDaysAgo = Math.floor(Math.random() * 160) + 5;
    const packerId = riggerIds[Math.floor(Math.random() * riggerIds.length)];
    parachutes.push(makeChute(serial, 'T-11', 'main', daysAgo(packDaysAgo), packerId));
  }

  for (let i = 1; i <= 8; i++) {
    const serial = `AC-${2100 + i}`;
    parachutes.push(makeChute(serial, 'T-11', 'main', null, null));
  }

  for (let i = 1; i <= 5; i++) {
    const serial = `AC-${2200 + i}`;
    parachutes.push(makeChute(serial, 'T-11', 'main', daysAgo(185), riggerIds[0]));
  }

  for (let i = 1; i <= 10; i++) {
    const serial = `RC-${1000 + i}`;
    const packDaysAgo = Math.floor(Math.random() * 140) + 10;
    parachutes.push(makeChute(serial, 'MC-6', 'reserve', daysAgo(packDaysAgo), riggerIds[1]));
  }

  for (let i = 1; i <= 3; i++) {
    const serial = `AC-${2300 + i}`;
    parachutes.push({
      serial_number: serial,
      model: 'T-11',
      category: 'main',
      status: 'in_process',
      process_stage: 'packed',
      last_pack_date: daysAgo(2),
      packer_id: riggerIds[2],
      days_until_expiration: 178,
      expiration_date: daysFromNow(178),
    });
  }

  for (let i = 1; i <= 2; i++) {
    const serial = `AC-${2400 + i}`;
    parachutes.push({
      serial_number: serial,
      model: 'T-11',
      category: 'main',
      status: 'in_process',
      process_stage: 'initial_inspected',
      last_pack_date: daysAgo(4),
      packer_id: riggerIds[0],
      days_until_expiration: 176,
      expiration_date: daysFromNow(176),
    });
  }

  const events: PLIMSEvent[] = [
    { id: uuid(), name: 'Op Falcon Strike', jump_date: daysFromNow(18), draw_date: daysFromNow(14), quantity_required: 24, surge_mode: false },
    { id: uuid(), name: 'Airborne Refresher', jump_date: daysFromNow(35), draw_date: daysFromNow(30), quantity_required: 48, surge_mode: false },
    { id: uuid(), name: 'Op Bayonet', jump_date: monthsFromNow(3), draw_date: daysFromNow(75), quantity_required: 96, surge_mode: false },
    { id: uuid(), name: 'Battalion Jump Day', jump_date: monthsFromNow(5), draw_date: monthsFromNow(4), quantity_required: 60, surge_mode: false },
    { id: uuid(), name: 'Night Jump Qual', jump_date: monthsFromNow(7), draw_date: monthsFromNow(6), quantity_required: 36, surge_mode: false },
    { id: uuid(), name: 'Op Cherokee', jump_date: monthsFromNow(10), draw_date: monthsFromNow(9), quantity_required: 120, surge_mode: true },
    { id: uuid(), name: 'Spring Airborne Ex', jump_date: monthsFromNow(14), draw_date: monthsFromNow(13), quantity_required: 72, surge_mode: false },
    { id: uuid(), name: 'Joint Readiness Jump', jump_date: monthsFromNow(18), draw_date: monthsFromNow(17), quantity_required: 84, surge_mode: false },
  ];

  return { personnel, availability, parachutes, events };
}

function loadStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt data - reseed
  }
  const seed = createSeedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveStore(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _store = loadStore();

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  _store = loadStore();
}

export function getPersonnel(): Personnel[] {
  return _store.personnel.filter(p => p.is_active);
}

export function addPersonnel(p: { rank: string; name: string; role: string }): Personnel {
  const person: Personnel = { id: uuid(), ...p, is_active: true };
  _store.personnel.push(person);
  saveStore(_store);
  return person;
}

export function getAvailabilityMatrix(): Availability[] {
  return _store.availability;
}

export function setAvailability(userId: string, date: string, status: string, note?: string) {
  const idx = _store.availability.findIndex(a => a.user_id === userId && a.date === date);
  const entry: Availability = { user_id: userId, date, status, note };
  if (idx >= 0) _store.availability[idx] = entry;
  else _store.availability.push(entry);
  saveStore(_store);
}

export function getParachutes(): Parachute[] {
  return _store.parachutes.map(p => {
    if (p.last_pack_date) {
      const exp = computeExpiration(p.last_pack_date);
      return { ...p, ...exp };
    }
    return p;
  });
}

export function addParachute(p: { serial_number: string; model: string; category: 'main' | 'reserve'; last_pack_date: string | null }) {
  const chute = makeChute(p.serial_number, p.model, p.category, p.last_pack_date, null);
  _store.parachutes.push(chute);
  saveStore(_store);
}

export function bulkAddParachutes(params: { count: number; model: string; category: 'main' | 'reserve'; last_pack_date: string | null; serial_prefix: string }) {
  const prefix = params.serial_prefix || `BATCH-${Date.now()}`;
  for (let i = 1; i <= Math.min(params.count, 1000); i++) {
    const serial = `${prefix}-${String(i).padStart(4, '0')}`;
    _store.parachutes.push(makeChute(serial, params.model, params.category, params.last_pack_date || null, null));
  }
  saveStore(_store);
}

export function getEvents(): PLIMSEvent[] {
  return _store.events;
}

export function addEvent(e: { name: string; jump_date: string; draw_date: string; quantity_required: number; surge_mode: boolean }): PLIMSEvent {
  const evt: PLIMSEvent = { id: uuid(), ...e };
  _store.events.push(evt);
  saveStore(_store);
  return evt;
}

export function updateEvent(id: string, e: { name: string; jump_date: string; draw_date: string; quantity_required: number; surge_mode: boolean }) {
  const idx = _store.events.findIndex(ev => ev.id === id);
  if (idx >= 0) {
    _store.events[idx] = { ..._store.events[idx], ...e };
    saveStore(_store);
  }
}

export function deleteEvent(id: string) {
  _store.events = _store.events.filter(e => e.id !== id);
  saveStore(_store);
}

export function getEventFeasibility(eventId: string): FeasibilityStatus {
  const event = _store.events.find(e => e.id === eventId);
  if (!event) return { feasible: false, reason: 'Event not found', required: 0, available: 0 };

  const readyChutes = _store.parachutes.filter(p => p.status === 'ready').length;
  const riggers = _store.personnel.filter(p => ['rigger', 'admin'].includes(p.role) && p.is_active);

  const drawDate = new Date(event.draw_date + 'T00:00:00');
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);
  let businessDays = 0;
  const cursor = new Date(nowDate);
  while (cursor < drawDate) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) businessDays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  const packLimit = event.surge_mode ? 15 : 12;
  const availableRiggers = riggers.length;
  const laborCapacity = availableRiggers * packLimit * Math.max(businessDays, 0);

  const sameDrawEvents = _store.events.filter(e => e.draw_date === event.draw_date);
  const totalRequired = sameDrawEvents.reduce((sum, e) => sum + e.quantity_required, 0);

  const inventoryOk = readyChutes >= totalRequired;
  const laborOk = laborCapacity >= totalRequired;

  const reasons: string[] = [];
  if (!laborOk) reasons.push(`Labor short: need ${totalRequired} packs, capacity is ${laborCapacity} (${availableRiggers} riggers x ${packLimit}/day x ${businessDays} days)`);
  if (!inventoryOk) reasons.push(`Inventory short: need ${totalRequired} ready chutes, only ${readyChutes} available`);

  return {
    feasible: inventoryOk && laborOk,
    reason: reasons.join('; ') || undefined,
    required: totalRequired,
    available: Math.min(readyChutes, laborCapacity),
    readyParachutes: readyChutes,
    laborCapacity,
    totalRequiredOnDrawDate: totalRequired,
  };
}

export function getDashboardStats() {
  const allParachutes = getParachutes();
  const readyChutes = allParachutes.filter(p => p.status === 'ready').length;
  const totalChutes = allParachutes.length;
  const readyPct = totalChutes > 0 ? Math.round((readyChutes / totalChutes) * 100) : 0;

  const allPersonnel = getPersonnel();
  const riggers = allPersonnel.filter(p => ['rigger', 'admin'].includes(p.role));
  const todayStr = today();
  const unavailToday = _store.availability.filter(a =>
    a.date === todayStr && a.status !== 'available' && riggers.some(r => r.id === a.user_id)
  );
  const riggersOnFloor = riggers.length - unavailToday.length;

  let capacity30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(new Date(), i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    capacity30 += riggersOnFloor * 12;
  }

  const events = getEvents()
    .filter(e => new Date(e.jump_date) >= new Date())
    .sort((a, b) => a.jump_date.localeCompare(b.jump_date));

  const recentActivity = riggers.slice(0, 4).map((r, i) => ({
    rank: r.rank,
    name: r.name,
    pack_count: Math.floor(Math.random() * 8) + 3,
    date: daysAgo(i),
  }));

  return {
    mission_ready_percent: readyPct,
    riggers_on_floor: riggersOnFloor,
    next_30_day_capacity: capacity30,
    total_riggers: riggers.length,
    ready_chutes: readyChutes,
    total_chutes: totalChutes,
    upcoming_events: events,
    recent_activity: recentActivity,
  };
}
