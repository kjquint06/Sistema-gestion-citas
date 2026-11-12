import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import type { ChangeEvent } from 'react';
import HorarioController from '@/actions/App/Http/Controllers/HorarioController';
import ConfirmarEliminar from '@/components/confirmar-eliminar';
import { Button } from '@/components/ui/button';
import { create, edit, index } from '@/routes/horarios';

type Horario = {
    id: number;
    medico: string;
    dia: string;
    hora_inicio: string;
    hora_fin: string;
};

type MedicoOpcion = {
    id: number;
    nombre: string;
};

export default function HorariosIndex({
    horarios,
    medicos,
    filtros,
}: {
    horarios: Horario[];
    medicos: MedicoOpcion[];
    filtros: { medico_id: number | null };
}) {
    const cambiarMedico = (evento: ChangeEvent<HTMLSelectElement>) => {
        const valor = evento.target.value;

        router.get(index().url, valor === '' ? {} : { medico_id: valor }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Horarios" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Horarios</h1>
                        <p className="text-sm text-muted-foreground">
                            Bloques de atención de cada médico. Un horario con
                            citas asignadas no se puede eliminar.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus size={16} />
                            Nuevo horario
                        </Link>
                    </Button>
                </div>

                <div className="flex max-w-xl items-center gap-2">
                    <select
                        value={filtros.medico_id ?? ''}
                        onChange={cambiarMedico}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    >
                        <option value="">Todos los médicos</option>
                        {medicos.map((medico) => (
                            <option key={medico.id} value={medico.id}>
                                {medico.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Médico</th>
                                <th className="p-3 font-medium">Día</th>
                                <th className="p-3 font-medium">
                                    Hora de inicio
                                </th>
                                <th className="p-3 font-medium">Hora de fin</th>
                                <th className="p-3 text-right font-medium">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
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
                                        <td className="p-3 font-medium">
                                            {horario.medico}
                                        </td>
                                        <td className="p-3">{horario.dia}</td>
                                        <td className="p-3">
                                            {horario.hora_inicio}
                                        </td>
                                        <td className="p-3">
                                            {horario.hora_fin}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(horario.id)}
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </Link>
                                                </Button>

                                                <ConfirmarEliminar
                                                    titulo="¿Eliminar el horario?"
                                                    descripcion={
                                                        <>
                                                            Se eliminará el
                                                            bloque de{' '}
                                                            <strong>
                                                                {horario.dia}{' '}
                                                                {
                                                                    horario.hora_inicio
                                                                }{' '}
                                                                a{' '}
                                                                {
                                                                    horario.hora_fin
                                                                }
                                                            </strong>{' '}
                                                            de {horario.medico}.
                                                            Esta acción no se
                                                            puede deshacer.
                                                        </>
                                                    }
                                                    accion={HorarioController.destroy.form(
                                                        horario.id,
                                                    )}
                                                />
                                            </div>
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

HorariosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Horarios',
            href: index(),
        },
    ],
};
