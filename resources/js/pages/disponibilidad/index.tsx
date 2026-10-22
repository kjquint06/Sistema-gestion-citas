import { Head } from '@inertiajs/react';
import { index } from '@/routes/disponibilidad';

export default function DisponibilidadIndex() {
    return (
        <>
            <Head title="Disponibilidad" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Disponibilidad</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

DisponibilidadIndex.layout = {
    breadcrumbs: [
        {
            title: 'Disponibilidad',
            href: index(),
        },
    ],
};
