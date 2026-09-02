import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Package, AlertTriangle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    accent?: 'green' | 'amber' | 'red';
}

function accentRing(accent?: 'green' | 'amber' | 'red') {
    if (accent === 'green') return 'border-l-4 border-l-green-500';
    if (accent === 'amber') return 'border-l-4 border-l-amber-500';
    if (accent === 'red') return 'border-l-4 border-l-red-500';
    return '';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, description, accent }) => (
    <Card className={accentRing(accent)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </CardContent>
    </Card>
);

interface UpcomingEvent {
    id: string;
    name: string;
    jump_date: string;
    draw_date: string;
    quantity_required: number;
}

interface RecentActivity {
    rank: string;
    name: string;
    pack_count: number;
    date: string;
}

interface DashboardStats {
    mission_ready_percent: number;
    riggers_on_floor: number;
    next_30_day_capacity: number;
    total_riggers: number;
    ready_chutes: number;
    total_chutes: number;
    upcoming_events: UpcomingEvent[];
    recent_activity: RecentActivity[];
}

function readinessAccent(pct: number): 'green' | 'amber' | 'red' {
    if (pct >= 75) return 'green';
    if (pct >= 50) return 'amber';
    return 'red';
}

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
                </div>
            </div>
        );
    }

    const readyPct = stats?.mission_ready_percent ?? 0;
    const upcoming = stats?.upcoming_events ?? [];
    const activity = stats?.recent_activity ?? [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* KPI row */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Mission Ready"
                    value={`${readyPct}%`}
                    icon={<Package className="h-4 w-4 text-muted-foreground" />}
                    description={`${stats?.ready_chutes ?? 0} of ${stats?.total_chutes ?? 0} chutes`}
                    accent={readinessAccent(readyPct)}
                />
                <KPICard
                    title="Riggers"
                    value={stats?.riggers_on_floor || 0}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description={`${(stats?.total_riggers || 0) - (stats?.riggers_on_floor || 0)} unavailable`}
                />
                <KPICard
                    title="30-Day Cap."
                    value={(stats?.next_30_day_capacity || 0).toLocaleString()}
                    icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                    description="Packs achievable"
                />
                <KPICard
                    title="Events"
                    value={upcoming.length}
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    description={upcoming[0]
                        ? `Next: ${upcoming[0].name} (${format(new Date(upcoming[0].jump_date), 'd MMM')})`
                        : 'None scheduled'}
                />
            </div>

            {/* Bottom section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Upcoming events list */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events scheduled.</p>
                        ) : (
                            <div className="space-y-2">
                                {upcoming.slice(0, 6).map(event => (
                                    <div key={event.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                                        <div className="flex flex-col items-center leading-none bg-muted rounded-md px-2 py-1.5 min-w-[44px]">
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                                {format(new Date(event.jump_date), 'MMM')}
                                            </span>
                                            <span className="text-base font-bold">
                                                {format(new Date(event.jump_date), 'd')}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{event.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {event.quantity_required.toLocaleString()} chutes - Draw {format(new Date(event.draw_date), 'd MMM')}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory breakdown + recent activity */}
                <div className="space-y-4">
                    {/* Inventory snapshot */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Inventory Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Ready</span>
                                    <span className="font-semibold text-green-700">{stats?.ready_chutes ?? 0}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${(stats?.total_chutes || 0) > 0 ? ((stats?.ready_chutes || 0) / (stats?.total_chutes || 1)) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total chutes</span>
                                    <span className="font-semibold">{stats?.total_chutes ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Not ready</span>
                                    <span className="font-semibold text-amber-600">
                                        {(stats?.total_chutes ?? 0) - (stats?.ready_chutes ?? 0)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activity.length > 0 ? (
                                <div className="space-y-3">
                                    {activity.map((entry, i) => (
                                        <div key={i} className="flex items-center text-sm">
                                            <span className="font-medium">{entry.rank} {entry.name}</span>
                                            <span className="ml-2 text-muted-foreground">packed {entry.pack_count}</span>
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {format(new Date(entry.date), 'd MMM')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground py-2 text-center">
                                    No packing activity logged this week.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
