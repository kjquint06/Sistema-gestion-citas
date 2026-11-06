import { Form, Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import MedicoController from '@/actions/App/Http/Controllers/MedicoController';
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
import { Input } from '@/components/ui/input';
import { create, edit, index } from '@/routes/medicos';

type Medico = {
    id: number;
    nombre: string;
    correo: string;
    especialidad: string;
    numero_colegiado: string;
    duracion_cita: number;
};

function EliminarMedico({ medico }: { medico: Medico }) {
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
                <DialogTitle>¿Eliminar al médico?</DialogTitle>
                <DialogDescription>
                    Se eliminará la ficha de médico de{' '}
                    <strong>{medico.nombre}</strong>. Esta acción no se puede
                    deshacer.
                </DialogDescription>

                <Form
                    {...MedicoController.destroy.form(medico.id)}
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

export default function MedicosIndex({
    medicos,
    filtros,
}: {
    medicos: Medico[];
    filtros: { buscar: string };
}) {
    const [buscar, setBuscar] = useState(filtros.buscar);

    const enviarBusqueda = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        const texto = buscar.trim();

        router.get(index().url, texto === '' ? {} : { buscar: texto }, {
            preserveState: true,
            replace: true,
        });
    };

    const limpiarBusqueda = () => {
        setBuscar('');
        router.get(index().url, {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Médicos" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Médicos</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona los médicos de la clínica. Un médico con
                            citas registradas no se puede eliminar.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={create()}>
                            <Plus size={16} />
                            Nuevo médico
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={enviarBusqueda}
                    className="flex max-w-xl items-center gap-2"
                >
                    <Input
                        name="buscar"
                        value={buscar}
                        onChange={(evento) => setBuscar(evento.target.value)}
                        placeholder="Buscar médico por nombre"
                    />
                    <Button type="submit" variant="secondary">
                        <Search size={16} />
                        Buscar
                    </Button>
                    {filtros.buscar !== '' && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={limpiarBusqueda}
                        >
                            Limpiar
                        </Button>
                    )}
                </form>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Médico</th>
                                <th className="p-3 font-medium">Correo</th>
                                <th className="p-3 font-medium">
                                    Especialidad
                                </th>
                                <th className="p-3 font-medium">
                                    N.º de colegiado
                                </th>
                                <th className="p-3 font-medium">
                                    Duración de cita
                                </th>
                                <th className="p-3 text-right font-medium">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        {filtros.buscar !== ''
                                            ? 'No se encontraron médicos con ese nombre.'
                                            : 'No hay médicos registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                medicos.map((medico) => (
                                    <tr
                                        key={medico.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3 font-medium">
                                            {medico.nombre}
                                        </td>
                                        <td className="p-3">{medico.correo}</td>
                                        <td className="p-3">
                                            {medico.especialidad}
                                        </td>
                                        <td className="p-3">
                                            {medico.numero_colegiado}
                                        </td>
                                        <td className="p-3">
                                            {medico.duracion_cita} min
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(medico.id)}
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </Link>
                                                </Button>

                                                <EliminarMedico
                                                    medico={medico}
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

MedicosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Médicos',
            href: index(),
        },
    ],
};
