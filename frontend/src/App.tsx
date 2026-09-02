import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { PersonnelGrid } from '@/components/PersonnelGrid';
import { CalendarView } from '@/components/CalendarView';
import { InventoryView } from '@/components/InventoryView';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Calendar, Package, RotateCcw } from 'lucide-react';
import { resetData } from '@/lib/mockData';

type View = 'dashboard' | 'personnel' | 'calendar' | 'inventory';

const NAV_ITEMS: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'personnel', label: 'Personnel', icon: Users },
  { key: 'calendar', label: 'Forecast', icon: Calendar },
  { key: 'inventory', label: 'Inventory', icon: Package },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    resetData();
    setResetKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      {/* Prototype banner */}
      <div className="bg-amber-500 text-amber-950 text-center text-xs font-semibold py-1.5 px-4">
        PROTOTYPE - Interactive demo with mock data (stored in your browser).
        <button
          onClick={handleReset}
          className="ml-2 inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-900"
        >
          <RotateCcw className="h-3 w-3" /> Reset data
        </button>
      </div>

      {/* Desktop top nav */}
      <div className="hidden md:block border-b sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <h1 className="text-base font-bold text-primary mr-8 tracking-tight">PLIMS</h1>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Button
                key={item.key}
                variant={view === item.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView(item.key)}
              >
                <item.icon className="h-4 w-4 mr-1.5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex h-14">
          {NAV_ITEMS.map(item => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${active ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 h-12 flex items-center">
        <h1 className="text-sm font-bold text-primary tracking-tight">PLIMS</h1>
      </div>

      {/* Main Content */}
      <main key={resetKey} className="p-4 md:p-6 lg:p-8">
        {view === 'dashboard' && <Dashboard />}
        {view === 'personnel' && <PersonnelGrid />}
        {view === 'calendar' && <CalendarView />}
        {view === 'inventory' && <InventoryView />}
      </main>
    </div>
  );
}

export default App;
