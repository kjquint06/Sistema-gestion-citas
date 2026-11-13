import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import ConfirmarEliminar from '@/components/confirmar-eliminar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { create, edit, index, show } from '@/routes/pacientes';

type Paciente = {
    id: number;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    correo: string;
};

type Props = {
    pacientes: Paciente[];
    filtros: { buscar: string };
    puedeGestionar: boolean;
};

export default function PacientesIndex({
    pacientes,
    filtros,
    puedeGestionar,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar);

    function enviarBusqueda(evento: FormEvent) {
        evento.preventDefault();
        router.get(
            index.url(),
            buscar.trim() === '' ? {} : { buscar: buscar.trim() },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Pacientes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                            <Users size={25} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Pacientes</h1>
                            <p className="text-sm text-muted-foreground">
                                Registra, busca y actualiza los datos
                                administrativos de los pacientes.
                            </p>
                        </div>
                    </div>

                    {puedeGestionar && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus size={16} />
                                Nuevo paciente
                            </Link>
                        </Button>
                    )}
                </div>

                <form
                    onSubmit={enviarBusqueda}
                    className="flex max-w-md items-center gap-2"
                    role="search"
                >
                    <Input
                        name="buscar"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar por nombre…"
                        aria-label="Buscar paciente por nombre"
                    />
                    <Button type="submit" variant="secondary">
                        <Search size={16} />
                        Buscar
                    </Button>
                </form>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Pacientes registrados ({pacientes.length})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Un paciente con citas o expediente no se puede
                            eliminar.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 font-medium">Nombre</th>
                                    <th className="p-4 font-medium">
                                        Documento
                                    </th>
                                    <th className="p-4 font-medium">
                                        Teléfono
                                    </th>
                                    <th className="p-4 font-medium">Correo</th>
                                    {puedeGestionar && (
                                        <th className="p-4 text-right font-medium">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={puedeGestionar ? 5 : 4}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            {filtros.buscar
                                                ? `No hay pacientes que coincidan con "${filtros.buscar}".`
                                                : 'No hay pacientes registrados.'}
                                        </td>
                                    </tr>
                                ) : (
                                    pacientes.map((paciente) => (
                                        <tr
                                            key={paciente.id}
                                            className="border-t transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-4 font-medium">
                                                {paciente.nombre}
                                            </td>
                                            <td className="p-4">
                                                {paciente.documento ?? '-'}
                                            </td>
                                            <td className="p-4">
                                                {paciente.telefono ?? '-'}
                                            </td>
                                            <td className="p-4">
                                                {paciente.correo}
                                            </td>
                                            {puedeGestionar && (
                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show(
                                                                    paciente.id,
                                                                )}
                                                            >
                                                                <Eye
                                                                    size={14}
                                                                />
                                                                Ver
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={edit(
                                                                    paciente.id,
                                                                )}
                                                            >
                                                                <Pencil
                                                                    size={14}
                                                                />
                                                                Editar
                                                            </Link>
                                                        </Button>
                                                        <ConfirmarEliminar
                                                            titulo="¿Eliminar al paciente?"
                                                            descripcion={
                                                                <>
                                                                    Se eliminará
                                                                    a{' '}
                                                                    <strong>
                                                                        {
                                                                            paciente.nombre
                                                                        }
                                                                    </strong>
                                                                    . Esta
                                                                    acción no se
                                                                    puede
                                                                    deshacer.
                                                                </>
                                                            }
                                                            accion={PacienteController.destroy.form(
                                                                paciente.id,
                                                            )}
                                                        />
                                                    </div>
                                                </td>
                                            )}
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

PacientesIndex.layout = {
    breadcrumbs: [{ title: 'Pacientes', href: index() }],
};
