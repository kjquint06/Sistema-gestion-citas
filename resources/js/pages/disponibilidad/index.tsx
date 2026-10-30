import { Head } from '@inertiajs/react';
import { index } from '@/routes/disponibilidad';

type Horario = {
    id: number;
    medico: string;
    dia: string;
    hora_inicio: string;
    hora_fin: string;
};

export default function DisponibilidadIndex({
    horarios,
}: {
    horarios: Horario[];
}) {
    return (
        <>
            <Head title="Disponibilidad" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Disponibilidad</h1>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Médico</th>
                                <th className="p-3 font-medium">Día</th>
                                <th className="p-3 font-medium">
                                    Hora de inicio
                                </th>
                                <th className="p-3 font-medium">Hora de fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No hay horarios registrados.
                                    </td>
                                </tr>
                            ) : (
                                horarios.map((horario) => (
                                    <tr
                                        key={horario.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">
                                            {horario.medico}
                                        </td>
                                        <td className="p-3">{horario.dia}</td>
                                        <td className="p-3">
                                            {horario.hora_inicio}
                                        </td>
                                        <td className="p-3">
                                            {horario.hora_fin}
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

DisponibilidadIndex.layout = {
    breadcrumbs: [
        {
            title: 'Disponibilidad',
            href: index(),
        },
    ],
};
