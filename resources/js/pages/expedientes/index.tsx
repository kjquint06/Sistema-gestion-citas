import { Head } from '@inertiajs/react';
import { index } from '@/routes/expedientes';

export default function ExpedientesIndex() {
    return (
        <>
            <Head title="Expedientes" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Expedientes</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

ExpedientesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expedientes',
            href: index(),
        },
    ],
};
