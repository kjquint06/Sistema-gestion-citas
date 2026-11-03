import { Head } from '@inertiajs/react';
import { index } from '@/routes/especialidades';
import { Stethoscope, Users } from 'lucide-react';

type Especialidad = {
    id: number;
    nombre: string;
    medicos_count: number;
};

export default function EspecialidadesIndex({
    especialidades,
}: {
    especialidades: Especialidad[];
}) {
    return (
        <>
            <Head title="Especialidades" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                            <Stethoscope size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Gestión de especialidades
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Consulta y visualiza las especialidades médicas
                                registradas en el sistema.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total de especialidades */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total de especialidades
                            </p>
                            <p className="mt-1 text-3xl font-bold">
                                {especialidades.length}
                            </p>
                        </div>

                        <div className="rounded-full bg-teal-50 p-3 text-teal-700">
                            <Stethoscope size={24} />
                        </div>
                    </div>
                </div>

                {/* Tabla de especialidades */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Especialidades registradas
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Información general de las especialidades médicas.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 font-medium">
                                        Especialidad
                                    </th>
                                    <th className="p-4 font-medium">
                                        Médicos asociados
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {especialidades.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No hay especialidades registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    especialidades.map((especialidad) => (
                                        <tr
                                            key={especialidad.id}
                                            className="border-t transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope
                                                        size={17}
                                                        className="text-teal-700"
                                                    />
                                                    <span className="font-medium">
                                                        {especialidad.nombre}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Users
                                                        size={16}
                                                        className="text-muted-foreground"
                                                    />
                                                    {especialidad.medicos_count}
                                                    {especialidad.medicos_count ===
                                                    1
                                                        ? ' médico'
                                                        : ' médicos'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

EspecialidadesIndex.layout = {
    breadcrumbs: [{ title: 'Especialidades', href: index() }],
};
