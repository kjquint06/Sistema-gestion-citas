import { Head } from '@inertiajs/react';
import CitaController from '@/actions/App/Http/Controllers/CitaController';
import FormularioCita from '@/components/formulario-cita';
import type {
    MedicoOpcion,
    PacienteOpcion,
    ValoresCita,
} from '@/components/formulario-cita';
import { index } from '@/routes/agenda';

export default function CitasEdit({
    cita,
    pacientes,
    medicos,
    estados,
}: {
    cita: ValoresCita & { id: number };
    pacientes: PacienteOpcion[];
    medicos: MedicoOpcion[];
    estados: string[];
}) {
    return (
        <>
            <Head title="Editar cita" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar cita</h1>
                    <p className="text-sm text-muted-foreground">
                        Cambia la fecha o la hora para reprogramar, o actualiza
                        el estado y la hora de llegada del paciente.
                    </p>
                </div>

                <FormularioCita
                    accion={CitaController.update.form(cita.id)}
                    valores={cita}
                    pacientes={pacientes}
                    medicos={medicos}
                    estados={estados}
                    textoBoton="Guardar cambios"
                />
            </div>
        </>
    );
}

CitasEdit.layout = {
    breadcrumbs: [
        { title: 'Agenda', href: index() },
        { title: 'Editar cita', href: '#' },
    ],
};
