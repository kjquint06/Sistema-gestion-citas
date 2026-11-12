import { Head } from '@inertiajs/react';
import AgendaCitas from '@/components/agenda-citas';
import type { AgendaProps } from '@/components/agenda-citas';
import { index } from '@/routes/agenda';

export default function AgendaIndex(props: AgendaProps) {
    return (
        <>
            <Head title="Agenda" />
            <AgendaCitas {...props} />
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
