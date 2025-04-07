import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import React, { useEffect } from 'react';
import { HTMLAttributes } from 'react';
import { toggleTheme, getTheme, setTheme } from "@/helpers/theme_helpers";
import { ThemeMode } from '@/types/theme-mode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import StorageBar from '@/components/StorageBar';
import { Input } from '@/components/ui/input';
import { Slider } from "@/components/ui/slider"
import { SliderWithInput } from '@/components/ui/slider-with-input';

export default function MiscPage({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const [themeNow, setThemeNow] = React.useState<ThemeMode | null>(null);
  const [storageC, setStorageC] = React.useState({
    diskPath: '',
    free: 0,
    size: 0
  });
  const [storageD, setStorageD] = React.useState({
    diskPath: '',
    free: 0,
    size: 0
  });
  const [storageThreshold, setStorageThreshold] = React.useState(50);

  useEffect(() => {
    (async () => {
      setThemeNow(await getTheme());
      window.disk.disk_get('D:/').then((result: any) => setStorageD({
        diskPath: result.diskPath,
        free: result.free,
        size: result.size
      }));
      window.disk.disk_get('C:/').then((result: any) => setStorageC({
        diskPath: result.diskPath,
        free: result.free,
        size: result.size
      }));
      window.sqlite.get_storage_treshold().then((result: any) => {
       setStorageThreshold(parseInt(result.treshold))
      });
    })();
  }, []);

  const tabs: { value: ThemeMode; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Misc. Settings</CardTitle>
        <CardDescription>Configure your settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="connection-type">Display Mode</Label>
          <div className='flex items-center space-x-2'>
            <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} {...props}>
              {tabs.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value)
                    setThemeNow(value);
                  }}
                  className={cn(
                    'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                    themeNow === value
                      ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                  )}
                >
                  <Icon className="-ml-1 h-4 w-4" />
                  <span className="ml-1.5 text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Label htmlFor="storage">Storage</Label>
        <StorageBar storage={storageC} />
        <StorageBar storage={storageD} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="treshold">Storage Treshold (%)</Label>
            <Input id="treshold" placeholder="80" value={storageThreshold} type='number' min={50} max={100} onChange={(e:any) => {
              setStorageThreshold(e.target.value)
              window.sqlite.create_storage_treshold(e.target.value)
            }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
