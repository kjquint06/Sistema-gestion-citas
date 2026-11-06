import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Stethoscope, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import EspecialidadController from '@/actions/App/Http/Controllers/EspecialidadController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { create, edit, index } from '@/routes/especialidades';

type Especialidad = {
    id: number;
    nombre: string;
    medicos_count: number;
};

function EliminarEspecialidad({
    especialidad,
}: {
    especialidad: Especialidad;
}) {
    const [abierto, setAbierto] = useState(false);

    return (
        <Dialog open={abierto} onOpenChange={setAbierto}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 size={14} />
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>¿Eliminar la especialidad?</DialogTitle>
                <DialogDescription>
                    Se eliminará la especialidad{' '}
                    <strong>{especialidad.nombre}</strong>. Esta acción no se
                    puede deshacer.
                </DialogDescription>

                <Form
                    {...EspecialidadController.destroy.form(especialidad.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setAbierto(false)}
                    className="space-y-4"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <InputError message={errors.eliminar} />

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => resetAndClearErrors()}
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Eliminar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function EspecialidadesIndex({
    especialidades,
}: {
    especialidades: Especialidad[];
}) {
    return (
        <>
            <Head title="Especialidades" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                            <Stethoscope size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Gestión de especialidades
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Crea, edita y elimina las especialidades médicas
                                del sistema.
                            </p>
                        </div>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus size={16} />
                            Nueva especialidad
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
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

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Especialidades registradas
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Una especialidad con médicos asignados no se puede
                            eliminar.
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
                                    <th className="p-4 text-right font-medium">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {especialidades.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
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

                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit(
                                                                especialidad.id,
                                                            )}
                                                        >
                                                            <Pencil size={14} />
                                                            Editar
                                                        </Link>
                                                    </Button>

                                                    <EliminarEspecialidad
                                                        especialidad={
                                                            especialidad
                                                        }
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
            </div>
        </>
    );
}

EspecialidadesIndex.layout = {
    breadcrumbs: [{ title: 'Especialidades', href: index() }],
};
