import { Form, Link } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    FileText,
    LogIn,
    Pencil,
} from 'lucide-react';
import CitaController from '@/actions/App/Http/Controllers/CitaController';
import { aFecha, ESTADOS, mayuscula } from '@/components/agenda-utils';
import type { CitaAgenda } from '@/components/agenda-utils';
import ConfirmarEliminar from '@/components/confirmar-eliminar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { edit } from '@/routes/citas';
import { show } from '@/routes/expedientes';
import { show as fichaPaciente } from '@/routes/pacientes';

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{etiqueta}</span>
            <span className="text-right font-medium">{valor}</span>
        </div>
    );
}

function EstadoPunto({ estado }: { estado: string }) {
    const info = ESTADOS[estado];

    return (
        <span className="inline-flex items-center gap-2 text-sm font-medium">
            <span
                className={`size-2.5 rounded-full ${info?.punto ?? 'bg-muted-foreground'}`}
            />
            {info?.etiqueta ?? estado}
        </span>
    );
}

export default function DetalleCita({
    cita,
    rol,
    puedeGestionar,
}: {
    cita: CitaAgenda;
    rol: string;
    puedeGestionar: boolean;
}) {
    const esAdmin = rol === 'admin';
    const esRecepcion = rol === 'recepcionista';
    const esHoy = cita.fecha === new Date().toLocaleDateString('en-CA');

    // Cancelar y editar son exclusivos del administrador
    const puedeCancelar =
        esAdmin && cita.estado !== 'cancelada' && cita.estado !== 'atendida';
    const puedeVerFicha = esAdmin || esRecepcion || rol === 'medico';

    // Acciones de recepción (el administrador también puede hacerlas)
    const puedeConfirmar = puedeGestionar && cita.estado === 'pendiente';
    const puedeRegistrarLlegada =
        puedeGestionar &&
        esHoy &&
        (cita.estado === 'pendiente' || cita.estado === 'confirmada');
    const puedeReprogramar =
        puedeGestionar &&
        (cita.estado === 'pendiente' || cita.estado === 'confirmada');

    // Recepción abre la ficha administrativa (módulo Pacientes);
    // admin y médico abren el expediente clínico, como antes.
    const enlaceFicha = esRecepcion
        ? fichaPaciente(cita.paciente.id)
        : show(cita.paciente.id);
    const fechaTexto = aFecha(cita.fecha);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Detalle de la cita</h2>
                <EstadoPunto estado={cita.estado} />
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {cita.paciente.iniciales}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-medium">
                        {cita.paciente.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {cita.paciente.expediente}
                        {cita.paciente.edad !== null
                            ? ` · ${cita.paciente.edad} años`
                            : ''}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Fila
                    etiqueta="Fecha"
                    valor={mayuscula(
                        fechaTexto.toLocaleDateString('es', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        }),
                    )}
                />
                <Fila
                    etiqueta="Hora"
                    valor={`${cita.inicio} a ${cita.fin} (${cita.duracion} min)`}
                />
                <Fila
                    etiqueta="Profesional"
                    valor={cita.medico ?? 'Sin dato'}
                />
                <Fila
                    etiqueta="Consultorio"
                    valor={cita.consultorio ?? 'Sin asignar'}
                />
                <Fila etiqueta="Motivo" valor={cita.motivo ?? 'Sin motivo'} />
                <Fila
                    etiqueta="Hora de llegada"
                    valor={cita.hora_llegada ?? 'Aún no llega'}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {puedeRegistrarLlegada && (
                    <Form
                        {...CitaController.registrarLlegada.form(cita.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <Button size="sm" disabled={processing}>
                                    <LogIn size={14} />
                                    Registrar llegada
                                </Button>
                                <InputError message={errors.llegada} />
                            </>
                        )}
                    </Form>
                )}

                {puedeConfirmar && (
                    <Form
                        {...CitaController.confirmar.form(cita.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={processing}
                                >
                                    <CheckCircle2 size={14} />
                                    Confirmar
                                </Button>
                                <InputError message={errors.confirmar} />
                            </>
                        )}
                    </Form>
                )}

                {puedeReprogramar && (
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={edit(cita.id)}>
                            <CalendarClock size={14} />
                            Reprogramar
                        </Link>
                    </Button>
                )}

                {esAdmin && puedeGestionar && (
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={edit(cita.id)}>
                            <Pencil size={14} />
                            Editar
                        </Link>
                    </Button>
                )}

                {puedeVerFicha && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={enlaceFicha}>
                            <FileText size={14} />
                            Abrir ficha administrativa
                        </Link>
                    </Button>
                )}

                {puedeCancelar && (
                    <ConfirmarEliminar
                        titulo="¿Cancelar la cita?"
                        descripcion={
                            <>
                                Se cancelará la cita de{' '}
                                <strong>{cita.paciente.nombre}</strong> del{' '}
                                {fechaTexto.toLocaleDateString('es')} a las{' '}
                                {cita.inicio}. La cita quedará marcada como
                                cancelada.
                            </>
                        }
                        accion={CitaController.cancelar.form(cita.id)}
                        textoBoton="Cancelar cita"
                        textoConfirmar="Sí, cancelar"
                        textoCerrar="Volver"
                    />
                )}
            </div>
        </div>
    );
}
