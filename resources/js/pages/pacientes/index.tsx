import { Head } from '@inertiajs/react';
import { index } from '@/routes/pacientes';

type Paciente = {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    fecha_nacimiento: string;
};

export default function PacientesIndex({
    pacientes,
}: {
    pacientes: Paciente[];
}) {
    return (
        <>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Pacientes</h1>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Nombre</th>
                                <th className="p-3 font-medium">Correo</th>
                                <th className="p-3 font-medium">Teléfono</th>
                                <th className="p-3 font-medium">
                                    Fecha de nacimiento
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No hay pacientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                pacientes.map((paciente) => (
                                    <tr
                                        key={paciente.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">
                                            {paciente.nombre}
                                        </td>
                                        <td className="p-3">
                                            {paciente.correo}
                                        </td>
                                        <td className="p-3">
                                            {paciente.telefono ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {paciente.fecha_nacimiento}
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

PacientesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pacientes',
            href: index(),
        },
    ],
};
