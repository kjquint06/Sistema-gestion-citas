import { Head } from '@inertiajs/react';
import { index } from '@/routes/pacientes';

export default function PacientesIndex() {
    return (
        <>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Pacientes</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

PacientesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pacientes',
            href: index(),
        },
    ],
};
