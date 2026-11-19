import { Head } from '@inertiajs/react';
import { index as misPacientes } from '@/routes/mis-pacientes';

export default function MisPacientesIndex() {
    return (
        <>
            <Head title="Mis pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Mis pacientes</h1>
                <p className="text-muted-foreground">
                    Aquí se mostrarán los pacientes que ya atendiste.
                </p>
            </div>
        </>
    );
}

MisPacientesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Mis pacientes',
            href: misPacientes(),
        },
    ],
};
