import { Head, Link } from '@inertiajs/react';
import { Pencil, User } from 'lucide-react';
import type { DatosPaciente } from '@/components/formulario-paciente';
import { Button } from '@/components/ui/button';
import { edit, index } from '@/routes/pacientes';

type Props = {
    paciente: DatosPaciente & { id: number; citas_count: number };
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
    return (
        <div>
            <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
            <dd className="mt-1 font-medium">{valor || '-'}</dd>
        </div>
    );
}

export default function PacientesShow({ paciente }: Props) {
    return (
        <>
            <Head title={paciente.nombre} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                            <User size={25} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {paciente.nombre}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Ficha administrativa · {paciente.citas_count}{' '}
                                {paciente.citas_count === 1 ? 'cita' : 'citas'}
                            </p>
                        </div>
                    </div>

                    <Button asChild>
                        <Link href={edit(paciente.id)}>
                            <Pencil size={16} />
                            Editar
                        </Link>
                    </Button>
                </div>

                <dl className="grid max-w-3xl gap-6 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-2">
                    <Dato etiqueta="Documento" valor={paciente.documento} />
                    <Dato etiqueta="Teléfono" valor={paciente.telefono} />
                    <Dato etiqueta="Correo" valor={paciente.correo} />
                    <Dato
                        etiqueta="Fecha de nacimiento"
                        valor={paciente.fecha_nacimiento}
                    />
                    <Dato etiqueta="Sexo" valor={paciente.sexo} />
                    <Dato etiqueta="Dirección" valor={paciente.direccion} />
                    <Dato
                        etiqueta="Contacto de emergencia"
                        valor={paciente.contacto_emergencia}
                    />
                </dl>
            </div>
        </>
    );
}

PacientesShow.layout = {
    breadcrumbs: [
        { title: 'Pacientes', href: index() },
        { title: 'Ficha del paciente', href: '#' },
    ],
};
