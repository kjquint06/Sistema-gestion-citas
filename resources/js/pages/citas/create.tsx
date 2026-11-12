import { Head } from '@inertiajs/react';
import CitaController from '@/actions/App/Http/Controllers/CitaController';
import FormularioCita from '@/components/formulario-cita';
import type {
    MedicoOpcion,
    PacienteOpcion,
} from '@/components/formulario-cita';
import { index } from '@/routes/agenda';

export default function CitasCreate({
    pacientes,
    medicos,
    valores,
}: {
    pacientes: PacienteOpcion[];
    medicos: MedicoOpcion[];
    valores: {
        fecha: string;
        medico_id: number | null;
        hora_inicio: string | null;
    };
}) {
    return (
        <>
            <Head title="Nueva reserva" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Nueva reserva</h1>
                    <p className="text-sm text-muted-foreground">
                        Agenda una cita. No se puede cruzar con otra cita del
                        médico ni quedar fuera de su horario de atención.
                    </p>
                </div>

                <FormularioCita
                    accion={CitaController.store.form()}
                    valores={{
                        paciente_id: null,
                        medico_id: valores.medico_id,
                        fecha: valores.fecha,
                        hora_inicio: valores.hora_inicio,
                        hora_llegada: null,
                        estado: 'pendiente',
                        motivo: null,
                    }}
                    pacientes={pacientes}
                    medicos={medicos}
                    textoBoton="Guardar cita"
                />
            </div>
        </>
    );
}

CitasCreate.layout = {
    breadcrumbs: [
        { title: 'Agenda', href: index() },
        { title: 'Nueva reserva', href: '#' },
    ],
};
