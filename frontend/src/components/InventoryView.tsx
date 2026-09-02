import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';

interface Parachute {
    serial_number: string;
    model: string;
    last_pack_date: string | null;
    status: string;
    category: 'main' | 'reserve';
    days_until_expiration: number | null;
    expiration_date: string | null;
}

export function InventoryView() {
    const [inventory, setInventory] = useState<Parachute[]>([]);
    const [open, setOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [newChute, setNewChute] = useState({ serial_number: '', model: '', last_pack_date: '', category: 'main' });
    const [bulkForm, setBulkForm] = useState({ count: 10, model: 'T-11', category: 'main', last_pack_date: '', serial_prefix: '' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        const res = await fetch('http://localhost:3000/api/parachutes');
        const data = await res.json();
        setInventory(data);
    };

    const handleAddChute = async () => {
        await fetch('http://localhost:3000/api/parachutes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newChute,
                last_pack_date: newChute.last_pack_date || null
            })
        });
        setOpen(false);
        setNewChute({ serial_number: '', model: '', last_pack_date: '', category: 'main' });
        fetchInventory();
    };

    const handleBulkAdd = async () => {
        await fetch('http://localhost:3000/api/parachutes/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...bulkForm,
                last_pack_date: bulkForm.last_pack_date || null
            })
        });
        setBulkOpen(false);
        setBulkForm({ count: 10, model: 'T-11', category: 'main', last_pack_date: '', serial_prefix: '' });
        fetchInventory();
    };

    const getStatusColor = (status: string, days: number | null) => {
        if (status === 'expired') return 'bg-red-100 text-red-800 border-red-200';
        if (status === 'unpacked') return 'bg-gray-100 text-gray-800 border-gray-200';
        if (status === 'maintenance') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (days !== null && days < 30) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const StatusBadge = ({ status, days }: { status: string; days: number | null }) => (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(status, days)}`}>
            {status}
        </span>
    );

    const MobileCard = ({ item }: { item: Parachute }) => (
        <div className="rounded-lg border p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.serial_number}</span>
                    <StatusBadge status={item.status} days={item.days_until_expiration} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                    {item.model}
                    {item.last_pack_date
                        ? ` - Packed ${new Date(item.last_pack_date).toLocaleDateString()}`
                        : ' - Unpacked'}
                    {item.days_until_expiration !== null && item.days_until_expiration > 0
                        ? ` - ${item.days_until_expiration}d left`
                        : ''}
                </div>
            </div>
        </div>
    );

    const DesktopTable = ({ items }: { items: Parachute[] }) => (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Serial #</th>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Last Packed</th>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th>
                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {items.length === 0 && (
                            <tr className="border-b">
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">No inventory found.</td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.serial_number} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-3 font-medium">{item.serial_number}</td>
                                <td className="p-3">{item.model}</td>
                                <td className="p-3">{item.last_pack_date ? new Date(item.last_pack_date).toLocaleDateString() : 'Unpacked'}</td>
                                <td className="p-3">
                                    {item.expiration_date
                                        ? new Date(item.expiration_date).toLocaleDateString()
                                        : '-'}
                                    {item.days_until_expiration !== null && item.days_until_expiration > 0 && item.days_until_expiration <= 30 && (
                                        <span className="ml-1.5 text-[10px] font-semibold text-orange-600">{item.days_until_expiration}d</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <StatusBadge status={item.status} days={item.days_until_expiration} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const InventoryList = ({ items }: { items: Parachute[] }) => (
        <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
                {items.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No inventory found.</p>
                ) : (
                    items.map(item => <MobileCard key={item.serial_number} item={item} />)
                )}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block">
                <DesktopTable items={items} />
            </div>
        </>
    );

    const mains = inventory.filter(i => i.category === 'main');
    const reserves = inventory.filter(i => i.category === 'reserve');

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Parachute Inventory</h2>
                <div className="flex gap-2">
                    <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Plus className="mr-1.5 h-4 w-4" /> Bulk Add</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk Add Parachutes</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quantity</label>
                                    <Input type="number" value={bulkForm.count} onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) || 0 })} placeholder="10" />
                                    <p className="text-xs text-muted-foreground">Max 1000 parachutes</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Model</label>
                                    <Input value={bulkForm.model} onChange={(e) => setBulkForm({ ...bulkForm, model: e.target.value })} placeholder="e.g. T-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={bulkForm.category}
                                        onChange={(e) => setBulkForm({ ...bulkForm, category: e.target.value as 'main' | 'reserve' })}
                                    >
                                        <option value="main">Main</option>
                                        <option value="reserve">Reserve</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Serial Prefix (Optional)</label>
                                    <Input value={bulkForm.serial_prefix} onChange={(e) => setBulkForm({ ...bulkForm, serial_prefix: e.target.value })} placeholder="e.g. BATCH-A" />
                                    <p className="text-xs text-muted-foreground">Auto-generated if blank</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Pack Date (Optional)</label>
                                    <Input type="date" value={bulkForm.last_pack_date} onChange={(e) => setBulkForm({ ...bulkForm, last_pack_date: e.target.value })} />
                                    <p className="text-xs text-muted-foreground">Leave blank for unpacked status</p>
                                </div>
                                <Button onClick={handleBulkAdd} className="w-full">Add {bulkForm.count} Parachutes</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Parachute</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Parachute</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Serial Number</label>
                                    <Input value={newChute.serial_number} onChange={(e) => setNewChute({ ...newChute, serial_number: e.target.value })} placeholder="e.g. 49281" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Model</label>
                                    <Input value={newChute.model} onChange={(e) => setNewChute({ ...newChute, model: e.target.value })} placeholder="e.g. T-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newChute.category}
                                        onChange={(e) => setNewChute({ ...newChute, category: e.target.value as 'main' | 'reserve' })}
                                    >
                                        <option value="main">Main</option>
                                        <option value="reserve">Reserve</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Pack Date (Optional)</label>
                                    <Input type="date" value={newChute.last_pack_date} onChange={(e) => setNewChute({ ...newChute, last_pack_date: e.target.value })} />
                                    <p className="text-xs text-muted-foreground">Leave blank if unpacked.</p>
                                </div>
                                <Button onClick={handleAddChute} className="w-full">Add to Inventory</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="main" className="space-y-3">
                <TabsList>
                    <TabsTrigger value="main">Mains ({mains.length})</TabsTrigger>
                    <TabsTrigger value="reserve">Reserves ({reserves.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="main">
                    <InventoryList items={mains} />
                </TabsContent>
                <TabsContent value="reserve">
                    <InventoryList items={reserves} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
