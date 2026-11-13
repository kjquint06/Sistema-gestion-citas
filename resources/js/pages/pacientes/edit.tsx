import { Form, Head, Link } from '@inertiajs/react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import FormularioPaciente from '@/components/formulario-paciente';
import type { DatosPaciente } from '@/components/formulario-paciente';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/pacientes';

type Props = {
    paciente: DatosPaciente & { id: number };
};

export default function PacientesEdit({ paciente }: Props) {
    return (
        <>
            <Head title={`Editar ${paciente.nombre}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar paciente</h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza los datos administrativos de {paciente.nombre}
                        .
                    </p>
                </div>

                <Form
                    {...PacienteController.update.form(paciente.id)}
                    className="max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormularioPaciente
                                paciente={paciente}
                                errors={errors}
                            />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Guardar cambios
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href={index()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PacientesEdit.layout = {
    breadcrumbs: [
        { title: 'Pacientes', href: index() },
        { title: 'Editar paciente', href: '#' },
    ],
};
