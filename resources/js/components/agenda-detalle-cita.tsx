import { Link } from '@inertiajs/react';
import { CalendarClock, FileText, Pencil } from 'lucide-react';
import CitaController from '@/actions/App/Http/Controllers/CitaController';
import { aFecha, ESTADOS, mayuscula } from '@/components/agenda-utils';
import type { CitaAgenda } from '@/components/agenda-utils';
import ConfirmarEliminar from '@/components/confirmar-eliminar';
import { Button } from '@/components/ui/button';
import { edit } from '@/routes/citas';
import { show } from '@/routes/expedientes';

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
    const puedeCancelar =
        puedeGestionar &&
        cita.estado !== 'cancelada' &&
        cita.estado !== 'atendida';
    const puedeVerFicha = rol === 'admin' || rol === 'medico';
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
                <Fila etiqueta="Profesional" valor={cita.medico ?? 'Sin dato'} />
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
                {puedeVerFicha && (
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={show(cita.paciente.id)}>
                            <FileText size={14} />
                            Abrir ficha administrativa
                        </Link>
                    </Button>
                )}

                {puedeGestionar && (
                    <>
                        <Button size="sm" asChild>
                            <Link href={edit(cita.id)}>
                                <CalendarClock size={14} />
                                Reprogramar
                            </Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={edit(cita.id)}>
                                <Pencil size={14} />
                                Editar
                            </Link>
                        </Button>
                    </>
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