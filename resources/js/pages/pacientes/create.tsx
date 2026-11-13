import { Form, Head, Link } from '@inertiajs/react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import FormularioPaciente from '@/components/formulario-paciente';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/pacientes';

export default function PacientesCreate() {
    return (
        <>
            <Head title="Nuevo paciente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Nuevo paciente</h1>
                    <p className="text-sm text-muted-foreground">
                        Registra los datos administrativos del paciente.
                    </p>
                </div>

                <Form
                    {...PacienteController.store.form()}
                    className="max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormularioPaciente errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Guardar
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

PacientesCreate.layout = {
    breadcrumbs: [
        { title: 'Pacientes', href: index() },
        { title: 'Nuevo paciente', href: create() },
    ],
};
