import { Head } from '@inertiajs/react';
import { index } from '@/routes/agenda';

type EstadoCita =
    | 'pendiente'
    | 'confirmada'
    | 'atendida'
    | 'cancelada'
    | 'inasistencia';

type Cita = {
    id: number;
    paciente: string;
    medico: string;
    fecha: string;
    hora: string;
    estado: EstadoCita;
};

const ESTADOS: Record<EstadoCita, { etiqueta: string; clases: string }> = {
    pendiente: {
        etiqueta: 'Pendiente',
        clases: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    confirmada: {
        etiqueta: 'Confirmada',
        clases: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
    atendida: {
        etiqueta: 'Atendida',
        clases: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    },
    cancelada: {
        etiqueta: 'Cancelada',
        clases: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    },
    inasistencia: {
        etiqueta: 'Inasistencia',
        clases: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
};

function EstadoBadge({ estado }: { estado: EstadoCita }) {
    const info = ESTADOS[estado] ?? {
        etiqueta: estado,
        clases: 'bg-muted text-muted-foreground',
    };

    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${info.clases}`}
        >
            {info.etiqueta}
        </span>
    );
}

export default function AgendaIndex({ citas }: { citas: Cita[] }) {
    return (
        <>
            <Head title="Agenda" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Agenda</h1>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Paciente</th>
                                <th className="p-3 font-medium">Médico</th>
                                <th className="p-3 font-medium">Fecha</th>
                                <th className="p-3 font-medium">Hora</th>
                                <th className="p-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No hay citas registradas.
                                    </td>
                                </tr>
                            ) : (
                                citas.map((cita) => (
                                    <tr
                                        key={cita.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">{cita.paciente}</td>
                                        <td className="p-3">{cita.medico}</td>
                                        <td className="p-3">{cita.fecha}</td>
                                        <td className="p-3">{cita.hora}</td>
                                        <td className="p-3">
                                            <EstadoBadge estado={cita.estado} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
