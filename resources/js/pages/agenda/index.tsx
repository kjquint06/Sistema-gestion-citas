import { Head } from '@inertiajs/react';
import { index } from '@/routes/agenda';

export default function AgendaIndex() {
    return (
        <>
            <Head title="Agenda" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Agenda</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

AgendaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Agenda',
            href: index(),
        },
    ],
};
