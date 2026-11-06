import { Head, Link } from '@inertiajs/react';
import { index, show } from '@/routes/expedientes';

type Paciente = {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    fecha_nacimiento: string;
};

export default function ExpedientesIndex({
    pacientes,
}: {
    pacientes: Paciente[];
}) {
    return (
        <>
            <Head title="Expedientes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Expedientes</h1>

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
                                <th className="p-3 font-medium">Expediente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
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
                                        <td className="p-3">
                                            <Link
                                                href={show(paciente.id)}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                Ver expediente
                                            </Link>
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

ExpedientesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expedientes',
            href: index(),
        },
    ],
};
