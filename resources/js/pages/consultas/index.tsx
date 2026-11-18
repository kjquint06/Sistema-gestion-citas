import { Head } from '@inertiajs/react';
import { index as consultas } from '@/routes/consultas';

export default function ConsultasIndex() {
    return (
        <>
            <Head title="Consultas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Consultas</h1>
                <p className="text-muted-foreground">
                    Aquí se mostrarán las consultas del día.
                </p>
            </div>
        </>
    );
}

ConsultasIndex.layout = {
    breadcrumbs: [
        {
            title: 'Consultas',
            href: consultas(),
        },
    ],
};
