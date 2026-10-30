import { Head } from '@inertiajs/react';
import { index } from '@/routes/medicos';

type Medico = {
    id: number;
    nombre: string;
    especialidad: string;
    numero_colegiado: string;
    duracion_cita: number;
};

export default function MedicosIndex({ medicos }: { medicos: Medico[] }) {
    return (
        <>
            <Head title="Médicos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Médicos</h1>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Nombre</th>
                                <th className="p-3 font-medium">
                                    Especialidad
                                </th>
                                <th className="p-3 font-medium">
                                    N.º de colegiado
                                </th>
                                <th className="p-3 font-medium">
                                    Duración de cita
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No hay médicos registrados.
                                    </td>
                                </tr>
                            ) : (
                                medicos.map((medico) => (
                                    <tr
                                        key={medico.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">{medico.nombre}</td>
                                        <td className="p-3">
                                            {medico.especialidad}
                                        </td>
                                        <td className="p-3">
                                            {medico.numero_colegiado}
                                        </td>
                                        <td className="p-3">
                                            {medico.duracion_cita} min
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
MedicosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Médicos',
            href: index(),
        },
    ],
};
