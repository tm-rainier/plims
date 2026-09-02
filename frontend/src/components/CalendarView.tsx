import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Plus, Calendar as CalendarIcon, Edit2, Trash2, Zap, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { format, eachMonthOfInterval, addYears, isBefore, startOfMonth } from 'date-fns';
import { getEvents, addEvent, updateEvent, deleteEvent, getEventFeasibility } from '@/lib/mockData';
import type { PLIMSEvent, FeasibilityStatus } from '@/lib/mockData';

const currentYear = new Date().getFullYear();
const START = new Date(currentYear, 0, 1);
const END = addYears(START, 2);
const ALL_MONTHS = eachMonthOfInterval({ start: START, end: END });
const YEARS = [...new Set(ALL_MONTHS.map(m => m.getFullYear()))];

function getEventsForMonth(events: PLIMSEvent[], month: Date) {
  return events.filter(e => {
    const d = new Date(e.jump_date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });
}

function EventChip({ event, feasible, onClick }: { event: PLIMSEvent; feasible: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg p-2.5 border transition-all relative
        ${feasible
          ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
          : 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'}
        ${event.surge_mode ? 'ring-1 ring-orange-400 ring-offset-1' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={`text-xs font-semibold leading-snug truncate ${feasible ? 'text-green-900' : 'text-red-900'}`}>
          {event.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {event.surge_mode && <Zap className="w-3 h-3 text-orange-500" />}
          {feasible
            ? <CheckCircle2 className="w-3 h-3 text-green-500" />
            : <AlertTriangle className="w-3 h-3 text-red-500" />}
        </div>
      </div>
      <div className={`text-[10px] mt-0.5 ${feasible ? 'text-green-700' : 'text-red-700'}`}>
        {format(new Date(event.jump_date), 'MMM d')} - {event.quantity_required.toLocaleString()} chutes
      </div>
    </button>
  );
}

function MonthCard({ month, events, feasibility, onEventClick, isPast }: {
  month: Date;
  events: PLIMSEvent[];
  feasibility: Record<string, FeasibilityStatus>;
  onEventClick: (e: PLIMSEvent) => void;
  isPast: boolean;
}) {
  const hasEvents = events.length > 0;
  const hasIssues = events.some(e => feasibility[e.id]?.feasible === false);

  return (
    <div className={`rounded-xl border p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2 min-h-[100px] md:min-h-[130px] transition-all
      ${isPast ? 'opacity-50' : ''}
      ${hasEvents
        ? hasIssues
          ? 'bg-red-50/40 border-red-200'
          : 'bg-green-50/40 border-green-200'
        : 'bg-background border-border'}
    `}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
          {format(month, 'MMMM')}
        </span>
        {hasIssues && (
          <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">
            {events.filter(e => feasibility[e.id]?.feasible === false).length} issue{events.filter(e => feasibility[e.id]?.feasible === false).length > 1 ? 's' : ''}
          </span>
        )}
        {hasEvents && !hasIssues && (
          <span className="text-[10px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5">
            {events.length}
          </span>
        )}
      </div>
      {hasEvents ? (
        <div className="flex flex-col gap-1.5">
          {events.map(e => (
            <EventChip
              key={e.id}
              event={e}
              feasible={feasibility[e.id]?.feasible !== false}
              onClick={() => onEventClick(e)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[11px] text-muted-foreground/40 font-medium">No events</span>
        </div>
      )}
    </div>
  );
}

export function CalendarView() {
  const [events, setEvents] = useState<PLIMSEvent[]>([]);
  const [feasibility, setFeasibility] = useState<Record<string, FeasibilityStatus>>({});
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ name: '', jump_date: '', draw_date: '', quantity_required: 0, surge_mode: false });
  const [selectedEvent, setSelectedEvent] = useState<PLIMSEvent | null>(null);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

  const fetchEvents = () => {
    const data = getEvents();
    setEvents(data);
    const feasibilityData: Record<string, FeasibilityStatus> = {};
    for (const event of data) {
      feasibilityData[event.id] = getEventFeasibility(event.id);
    }
    setFeasibility(feasibilityData);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = () => {
    addEvent(newEvent);
    setOpen(false);
    setNewEvent({ name: '', jump_date: '', draw_date: '', quantity_required: 0, surge_mode: false });
    fetchEvents();
  };

  const handleEditEvent = () => {
    if (!editingId) return;
    updateEvent(editingId, newEvent);
    setOpen(false);
    setEditingId(null);
    setNewEvent({ name: '', jump_date: '', draw_date: '', quantity_required: 0, surge_mode: false });
    fetchEvents();
  };

  const startEdit = (event: PLIMSEvent) => {
    setEditingId(event.id);
    setNewEvent({
      name: event.name,
      jump_date: event.jump_date,
      draw_date: event.draw_date,
      quantity_required: event.quantity_required,
      surge_mode: event.surge_mode || false
    });
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleDelete = (event: PLIMSEvent) => {
    deleteEvent(event.id);
    setSelectedEvent(null);
    fetchEvents();
  };

  const toggleYear = (year: number) => {
    setCollapsedYears(prev => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  const totalEvents = events.length;
  const issueCount = events.filter(e => feasibility[e.id]?.feasible === false).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Long-Range Forecast</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">2-year operational timeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-background border rounded-full px-2.5 py-1 text-foreground">
            <CalendarIcon className="w-3.5 h-3.5" />
            {totalEvents}
          </span>
          {issueCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 border border-red-200 rounded-full px-2.5 py-1 text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {issueCount}
            </span>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Event' : 'Add New Event'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Name</label>
                  <Input value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g. Airborne School Jump" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jump Date</label>
                  <Input type="date" value={newEvent.jump_date} onChange={e => setNewEvent({ ...newEvent, jump_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Draw Date</label>
                  <Input type="date" value={newEvent.draw_date} onChange={e => setNewEvent({ ...newEvent, draw_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity Required</label>
                  <Input type="number" value={newEvent.quantity_required} onChange={e => setNewEvent({ ...newEvent, quantity_required: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="surge" checked={newEvent.surge_mode} onChange={e => setNewEvent({ ...newEvent, surge_mode: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="surge" className="text-sm font-medium">Surge Mode (15 packs/day)</label>
                </div>
                <Button onClick={editingId ? handleEditEvent : handleAddEvent} className="w-full">
                  {editingId ? 'Save Changes' : 'Add Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {YEARS.map(year => {
        const yearMonths = ALL_MONTHS.filter(m => m.getFullYear() === year);
        const yearEvents = events.filter(e => new Date(e.jump_date).getFullYear() === year);
        const yearIssues = yearEvents.filter(e => feasibility[e.id]?.feasible === false).length;
        const isCollapsed = collapsedYears.has(year);

        return (
          <div key={year} className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <button
              onClick={() => toggleYear(year)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">{year}</span>
                <span className="text-xs text-muted-foreground">{yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''}</span>
                {yearIssues > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                    {yearIssues} issue{yearIssues !== 1 ? 's' : ''}
                  </span>
                )}
                {yearEvents.length > 0 && yearIssues === 0 && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    All feasible
                  </span>
                )}
              </div>
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </button>

            {!isCollapsed && (() => {
              const now = startOfMonth(new Date());
              const visibleMonths = yearMonths.filter(month => {
                if (!isBefore(month, now)) return true;
                return getEventsForMonth(events, month).length > 0;
              });
              const hiddenCount = yearMonths.length - visibleMonths.length;
              return (
                <div className="p-3 md:p-4 border-t space-y-2">
                  {hiddenCount > 0 && (
                    <p className="text-[11px] text-muted-foreground">{hiddenCount} past month{hiddenCount > 1 ? 's' : ''} with no events hidden</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {visibleMonths.map(month => (
                      <MonthCard
                        key={month.toString()}
                        month={month}
                        events={getEventsForMonth(events, month)}
                        feasibility={feasibility}
                        onEventClick={setSelectedEvent}
                        isPast={isBefore(month, now)}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Feasible</div>
        <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Not Feasible</div>
        <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-orange-500" /> Surge Mode</div>
      </div>

      {selectedEvent && (() => {
        const fStatus = feasibility[selectedEvent.id];
        const isFeasible = fStatus?.feasible !== false;
        return (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className={`h-5 w-5 ${isFeasible ? 'text-green-600' : 'text-red-600'}`} />
                  {selectedEvent.name}
                  {selectedEvent.surge_mode && <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5"><Zap className="w-3 h-3" /> Surge</span>}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {fStatus && (
                  <div className={`rounded-xl p-3 border ${isFeasible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isFeasible ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className={`text-sm font-semibold ${isFeasible ? 'text-green-900' : 'text-red-900'}`}>
                        {isFeasible ? 'Feasible' : 'Not Feasible'}
                      </span>
                    </div>
                    {!isFeasible && fStatus.reason && <p className="text-xs text-red-700 mt-1">{fStatus.reason}</p>}
                    <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Labor Capacity</div>
                        <div className="font-semibold">{fStatus.laborCapacity || 0} packs</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ready Chutes</div>
                        <div className="font-semibold">{fStatus.readyParachutes || 0}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Jump Date</div>
                    <div className="font-semibold">{format(new Date(selectedEvent.jump_date), 'PPP')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Draw Date</div>
                    <div className="font-semibold">{format(new Date(selectedEvent.draw_date), 'PPP')}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Quantity Required</div>
                  <div className={`text-2xl font-bold ${isFeasible ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedEvent.quantity_required.toLocaleString()} parachutes
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button className="flex-1" variant="outline" onClick={() => startEdit(selectedEvent)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button className="flex-1" variant="destructive" onClick={() => handleDelete(selectedEvent)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
