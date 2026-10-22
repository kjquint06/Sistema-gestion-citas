import { Head } from '@inertiajs/react';
import { index } from '@/routes/medicos';

export default function MedicosIndex() {
    return (
        <>
            <Head title="Médicos" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Médicos</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

MedicosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Médicos',
            href: index(),
        },
    ],
};
