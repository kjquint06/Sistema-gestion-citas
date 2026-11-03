import { useEffect, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';

export function AppSidebarHeader() {
    const [fecha, setFecha] = useState(new Date());

    useEffect(() => {
        const intervalo = setInterval(() => {
            setFecha(new Date());
        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

    const fechaActual = fecha.toLocaleDateString('es-HN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const horaActual = fecha.toLocaleTimeString('es-HN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return (
        <header className="flex h-16 shrink-0 items-center justify-end gap-6 border-b px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="capitalize">{fechaActual}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{horaActual}</span>
            </div>
        </header>
    );
}
