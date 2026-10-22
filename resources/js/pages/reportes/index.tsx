import { Head } from '@inertiajs/react';
import { index } from '@/routes/reportes';

export default function ReportesIndex() {
    return (
        <>
            <Head title="Reportes" />
            <div className="flex h-full flex-1 flex-col gap-2 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Reportes</h1>
                <p className="text-sm text-muted-foreground">
                    Sección en construcción.
                </p>
            </div>
        </>
    );
}

ReportesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reportes',
            href: index(),
        },
    ],
};
