import { Head } from '@inertiajs/react';
import ReportesCitas from '@/components/reportes-citas';
import type { ReportesProps } from '@/components/reportes-citas';
import { index } from '@/routes/reportes';

export default function ReportesIndex(props: ReportesProps) {
    return (
        <>
            <Head title="Reportes" />
            <ReportesCitas {...props} />
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