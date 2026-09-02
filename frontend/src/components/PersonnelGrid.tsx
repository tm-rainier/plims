import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfDay, isToday, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getPersonnel, getAvailabilityMatrix, setAvailability as setAvailabilityData, addPersonnel } from '@/lib/mockData';
import type { Personnel, Availability } from '@/lib/mockData';

type StatusKey = 'available' | 'school' | 'range' | 'leave' | 'sick' | 'other';

const STATUS_CONFIG: Record<StatusKey, { label: string; bg: string; text: string; border: string; dot: string; abbr: string }> = {
  available: { label: 'Available', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500', abbr: '' },
  school:    { label: 'School',    bg: 'bg-sky-100',     text: 'text-sky-800',     border: 'border-sky-200',     dot: 'bg-sky-500',     abbr: 'SCH' },
  range:     { label: 'Range',     bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500',   abbr: 'RAN' },
  leave:     { label: 'Leave',     bg: 'bg-violet-100',  text: 'text-violet-800',  border: 'border-violet-200',  dot: 'bg-violet-500',  abbr: 'LEA' },
  sick:      { label: 'Sick',      bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-200',     dot: 'bg-red-500',     abbr: 'SIC' },
  other:     { label: 'Other',     bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',   abbr: 'OTH' },
};

const ROLE_CONFIG: Record<string, { label: string; dot: string }> = {
  rigger:           { label: 'Rigger',         dot: 'bg-emerald-500' },
  inspector:        { label: 'Inspector',      dot: 'bg-amber-500' },
  senior_inspector: { label: 'Sr. Inspector',  dot: 'bg-indigo-500' },
};

const DAY_ABBRS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function StatusCell({ status, isWknd, note }: { status: StatusKey; isWknd: boolean; note?: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  return (
    <div
      className={`h-full w-full flex items-center justify-center rounded-sm border transition-all
        ${cfg.bg} ${cfg.border} ${isWknd ? 'opacity-60' : ''}`}
      title={note ? `${cfg.label} - ${note}` : cfg.label}
    >
      {cfg.abbr && (
        <span className={`text-[10px] font-semibold leading-none ${cfg.text}`}>
          {cfg.abbr}
        </span>
      )}
    </div>
  );
}

export function PersonnelGrid() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [availability, setAvailability] = useState<Record<string, Record<string, Availability>>>({});
  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()));
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [newRigger, setNewRigger] = useState({ rank: '', name: '', role: 'rigger' });
  const [open, setOpen] = useState(false);
  const [otherNotes, setOtherNotes] = useState<Record<string, string>>({});

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const fetchData = () => {
    setPersonnel(getPersonnel());
    const matrix = getAvailabilityMatrix();
    const map: Record<string, Record<string, Availability>> = {};
    matrix.forEach(item => {
      if (!map[item.user_id]) map[item.user_id] = {};
      const dateStr = item.date.split('T')[0];
      map[item.user_id][dateStr] = item;
    });
    setAvailability(map);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = (userId: string, date: string, newStatus: string, note?: string) => {
    setAvailabilityData(userId, date, newStatus, note);
    setAvailability(prev => {
      const newUserMap = { ...(prev[userId] || {}) };
      newUserMap[date] = { user_id: userId, date, status: newStatus, note };
      return { ...prev, [userId]: newUserMap };
    });
  };

  const handleAddRigger = () => {
    addPersonnel(newRigger);
    setOpen(false);
    setNewRigger({ rank: '', name: '', role: 'rigger' });
    fetchData();
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Personnel Tracker</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Personnel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Personnel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rank</label>
                <Input value={newRigger.rank} onChange={e => setNewRigger({ ...newRigger, rank: e.target.value })} placeholder="e.g. SGT" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={newRigger.name} onChange={e => setNewRigger({ ...newRigger, name: e.target.value })} placeholder="Doe, John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newRigger.role}
                  onChange={e => setNewRigger({ ...newRigger, role: e.target.value })}
                >
                  <option value="rigger">Rigger</option>
                  <option value="inspector">Inspector</option>
                  <option value="senior_inspector">Senior Inspector</option>
                </select>
              </div>
              <Button onClick={handleAddRigger} className="w-full">Save User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold min-w-[150px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{days.length} days</span>
      </div>

      <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `160px repeat(${days.length}, minmax(32px, 1fr))`,
            minWidth: `${160 + days.length * 32}px`,
          }}
        >
          <div className="sticky left-0 z-20 bg-card border-b border-r px-4 py-2 flex items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</span>
          </div>
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const wknd = isWeekend(day);
            const _today = isToday(day);
            return (
              <div
                key={key}
                className={`border-b border-r border-border/50 py-1.5 flex flex-col items-center justify-center
                  ${wknd ? 'bg-muted/40' : ''}
                  ${_today ? 'bg-blue-50' : ''}
                  ${hoveredDay === key ? 'bg-muted/60' : ''}
                `}
                onMouseEnter={() => setHoveredDay(key)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <span className="text-[9px] font-medium leading-none text-muted-foreground">
                  {DAY_ABBRS[day.getDay()]}
                </span>
                <span className={`text-xs font-bold mt-0.5 leading-none
                  ${_today ? 'text-blue-600' : wknd ? 'text-muted-foreground' : 'text-foreground'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}

          {personnel.map((p, pi) => (
            <div key={p.id} style={{ display: 'contents' }}>
              <div
                className={`sticky left-0 z-10 bg-card border-r px-4 flex items-center gap-2
                  ${pi < personnel.length - 1 ? 'border-b' : ''}`}
                style={{ height: 44 }}
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {p.name[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground leading-none">{p.rank}</span>
                    {ROLE_CONFIG[p.role] && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ROLE_CONFIG[p.role].dot}`} title={ROLE_CONFIG[p.role].label} />
                    )}
                  </div>
                  <div className="text-sm font-semibold leading-snug truncate">{p.name}</div>
                </div>
              </div>
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const statusObj = availability[p.id]?.[dateStr];
                const currentStatus = (statusObj?.status ?? 'available') as StatusKey;
                const wknd = isWeekend(day);
                return (
                  <div
                    key={`${p.id}-${dateStr}`}
                    className={`border-r border-border/50 p-0.5
                      ${pi < personnel.length - 1 ? 'border-b' : ''}
                      ${hoveredDay === dateStr ? 'brightness-95' : ''}
                    `}
                    style={{ height: 44 }}
                    onMouseEnter={() => setHoveredDay(dateStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full h-full rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
                          <StatusCell status={currentStatus} isWknd={wknd} note={statusObj?.note} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="p-3 border-b bg-muted/20">
                          <div className="font-semibold text-sm">{format(day, 'PPP')}</div>
                          <div className="text-xs text-muted-foreground">{p.rank} {p.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3">
                          {(['available', 'school', 'range', 'leave', 'sick'] as StatusKey[]).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(p.id, dateStr, s)}
                              className={`px-3 py-2 text-xs font-semibold rounded-md border text-center capitalize transition-colors
                                ${currentStatus === s
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'hover:bg-muted'
                                }`}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                          {(() => {
                            const cellKey = `${p.id}-${dateStr}`;
                            const noteVal = otherNotes[cellKey] ?? '';
                            const isEmpty = noteVal.trim().length === 0;
                            return (
                              <div className="col-span-2 mt-1 pt-2 border-t flex gap-2">
                                <button
                                  onClick={() => {
                                    if (!isEmpty) {
                                      updateStatus(p.id, dateStr, 'other', noteVal.trim());
                                      setOtherNotes(prev => ({ ...prev, [cellKey]: '' }));
                                    }
                                  }}
                                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md border text-center capitalize transition-colors
                                    ${isEmpty ? 'opacity-50 cursor-not-allowed bg-slate-100' :
                                      currentStatus === 'other' ? 'bg-slate-800 text-white border-slate-800' : 'hover:bg-muted bg-slate-100'}`}
                                >
                                  Other
                                </button>
                                <Input
                                  className="h-8 text-xs flex-[2]"
                                  placeholder="Reason required..."
                                  value={noteVal}
                                  onChange={e => setOtherNotes(prev => ({ ...prev, [cellKey]: e.target.value }))}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground shrink-0">
        {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${cfg.dot}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
        <span className="w-px h-4 bg-border self-center" />
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
