import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import DetalleCita from '@/components/agenda-detalle-cita';
import {
    ALTO_HORA,
    DIAS_CORTOS,
    ESTADOS,
    ORDEN_LEYENDA,
    aFecha,
    aMinutos,
    mayuscula,
    sumarDias,
    tituloAgenda,
} from '@/components/agenda-utils';
import type { AgendaProps, CitaAgenda } from '@/components/agenda-utils';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/agenda';
import { create } from '@/routes/citas';

export type { AgendaProps } from '@/components/agenda-utils';

const claseSelect =
    'flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

function BloqueCita({
    cita,
    top,
    alto,
    activa,
    onClick,
}: {
    cita: CitaAgenda;
    top: number;
    alto: number;
    activa: boolean;
    onClick: () => void;
}) {
    const info = ESTADOS[cita.estado];
    const clases = [
        'absolute inset-x-1 overflow-hidden rounded-md border-l-4 p-1 text-left text-[11px] leading-tight shadow-sm transition hover:brightness-95',
        info?.bloque ?? '',
        activa ? 'ring-2 ring-primary' : '',
    ].join(' ');

    return (
        <button
            type="button"
            onClick={onClick}
            style={{ top, height: alto }}
            className={clases}
        >
            <p className="truncate font-semibold">
                {cita.inicio} · {cita.paciente.nombre}
            </p>
            <p className="truncate">{info?.etiqueta ?? cita.estado}</p>
        </button>
    );
}

export default function AgendaCitas({
    rol,
    puedeGestionar,
    fecha,
    hoy,
    filtros,
    medicosFiltro,
    semana,
    medicos,
    citas,
    resumen,
    horas,
}: AgendaProps) {
    const [seleccionada, setSeleccionada] = useState<number | null>(null);
    const citaActual = citas.find((cita) => cita.id === seleccionada) ?? null;

    const ir = (
        nuevaFecha: string,
        medicoId: number | null = filtros.medico_id,
    ) => {
        router.get(
            index().url,
            {
                fecha: nuevaFecha,
                ...(medicoId ? { medico_id: medicoId } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const horasLista = Array.from(
        { length: horas.fin - horas.inicio },
        (_, i) => horas.inicio + i,
    );
    const altoTotal = horasLista.length * ALTO_HORA;
    const topDe = (hora: string) =>
        ((aMinutos(hora) - horas.inicio * 60) * ALTO_HORA) / 60;
    const altoDe = (minutos: number) => (minutos * ALTO_HORA) / 60;

    const fechaObjeto = aFecha(fecha);
    const mesAnio = mayuscula(
        fechaObjeto.toLocaleDateString('es', {
            month: 'long',
            year: 'numeric',
        }),
    );
    const fechaLarga = mayuscula(
        fechaObjeto.toLocaleDateString('es', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),
    );

    const queryNueva = {
        fecha,
        ...(filtros.medico_id ? { medico_id: filtros.medico_id } : {}),
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{tituloAgenda(rol)}</h1>
                    <p className="text-sm text-muted-foreground">
                        Citas del día organizadas por médico, con su estado y
                        disponibilidad.
                    </p>
                </div>

                {puedeGestionar && (
                    <Button asChild>
                        <Link href={create({ query: queryNueva })}>
                            <Plus size={16} />
                            Nueva reserva
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => ir(hoy)}>
                    Hoy
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Día anterior"
                    onClick={() => ir(sumarDias(fecha, -1))}
                >
                    <ChevronLeft size={16} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Día siguiente"
                    onClick={() => ir(sumarDias(fecha, 1))}
                >
                    <ChevronRight size={16} />
                </Button>
                <span className="px-2 text-sm font-semibold">{mesAnio}</span>

                {puedeGestionar && (
                    <select
                        value={filtros.medico_id ?? ''}
                        onChange={(evento) =>
                            ir(
                                fecha,
                                evento.target.value === ''
                                    ? null
                                    : Number(evento.target.value),
                            )
                        }
                        className={claseSelect}
                    >
                        <option value="">Todos los médicos</option>
                        {medicosFiltro.map((medico) => (
                            <option key={medico.id} value={medico.id}>
                                {medico.nombre}
                            </option>
                        ))}
                    </select>
                )}

                <div className="ml-auto flex overflow-hidden rounded-md border text-sm">
                    <span className="bg-primary px-3 py-1.5 font-medium text-primary-foreground">
                        Día
                    </span>
                    <span
                        className="px-3 py-1.5 text-muted-foreground"
                        title="Próximamente"
                    >
                        Semana
                    </span>
                    <span
                        className="px-3 py-1.5 text-muted-foreground"
                        title="Próximamente"
                    >
                        Mes
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {semana.map((dia) => {
                    const activo = dia.fecha === fecha;
                    const claseDia = activo
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-muted';
                    const claseTexto = activo
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground';
                    const atiende = dia.atiende || dia.citas > 0;

                    return (
                        <button
                            key={dia.fecha}
                            type="button"
                            onClick={() => ir(dia.fecha)}
                            className={`rounded-lg border p-2 text-center transition ${claseDia}`}
                        >
                            <p className="text-xs">
                                {DIAS_CORTOS[dia.dia_semana - 1]}
                            </p>
                            <p className="text-lg font-semibold">
                                {Number(dia.fecha.split('-')[2])}
                            </p>
                            <p className={`text-[11px] ${claseTexto}`}>
                                {atiende
                                    ? `${dia.citas} ${dia.citas === 1 ? 'cita' : 'citas'}`
                                    : 'Sin atención'}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border bg-card p-3 text-sm">
                        <span className="font-semibold">{fechaLarga}</span>
                        <span>
                            <strong>{resumen.citas}</strong>{' '}
                            {resumen.citas === 1 ? 'cita' : 'citas'}
                        </span>
                        <span>
                            <strong>{resumen.medicos}</strong>{' '}
                            {resumen.medicos === 1 ? 'médico' : 'médicos'}
                        </span>
                        <span>
                            Bloque estándar:{' '}
                            <strong>
                                {resumen.bloque_minutos
                                    ? `${resumen.bloque_minutos} min`
                                    : 'variable'}
                            </strong>
                        </span>
                        <span>
                            Disponibilidad calculada:{' '}
                            <strong>
                                {resumen.bloques_libres} de{' '}
                                {resumen.bloques_totales} espacios libres
                            </strong>
                        </span>
                    </div>

                    {medicos.length === 0 ? (
                        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                            No hay médicos con atención ni citas este día.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border bg-card">
                            <div className="flex w-max min-w-full">
                                <div className="w-16 shrink-0 border-r">
                                    <div className="h-20 border-b" />
                                    {horasLista.map((hora) => (
                                        <div
                                            key={hora}
                                            style={{ height: ALTO_HORA }}
                                            className="pt-1 pr-2 text-right text-xs text-muted-foreground"
                                        >
                                            {String(hora).padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                {medicos.map((medico) => (
                                    <div
                                        key={medico.id}
                                        className="min-w-[14rem] flex-1 border-r last:border-r-0"
                                    >
                                        <div className="flex h-20 items-center gap-2 border-b p-2">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                                {medico.iniciales}
                                            </div>
                                            <div className="min-w-0 text-xs">
                                                <p className="truncate text-sm font-semibold">
                                                    {medico.nombre}
                                                </p>
                                                <p className="truncate text-muted-foreground">
                                                    {medico.especialidad}
                                                </p>
                                                <p className="truncate text-muted-foreground">
                                                    {medico.consultorio ??
                                                        'Sin consultorio'}{' '}
                                                    · {medico.duracion_cita} min
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className="relative bg-muted/50"
                                            style={{ height: altoTotal }}
                                        >
                                            {medico.horarios.map((horario) => (
                                                <div
                                                    key={horario.inicio}
                                                    className="absolute inset-x-0 bg-background"
                                                    style={{
                                                        top: topDe(
                                                            horario.inicio,
                                                        ),
                                                        height: altoDe(
                                                            aMinutos(
                                                                horario.fin,
                                                            ) -
                                                                aMinutos(
                                                                    horario.inicio,
                                                                ),
                                                        ),
                                                    }}
                                                />
                                            ))}

                                            {horasLista.map((hora, i) => (
                                                <div
                                                    key={hora}
                                                    className="pointer-events-none absolute inset-x-0 border-t"
                                                    style={{
                                                        top: i * ALTO_HORA,
                                                    }}
                                                />
                                            ))}

                                            {citas
                                                .filter(
                                                    (cita) =>
                                                        cita.medico_id ===
                                                        medico.id,
                                                )
                                                .map((cita) => (
                                                    <BloqueCita
                                                        key={cita.id}
                                                        cita={cita}
                                                        top={topDe(cita.inicio)}
                                                        alto={Math.max(
                                                            24,
                                                            altoDe(
                                                                cita.duracion,
                                                            ) - 2,
                                                        )}
                                                        activa={
                                                            seleccionada ===
                                                            cita.id
                                                        }
                                                        onClick={() =>
                                                            setSeleccionada(
                                                                cita.id,
                                                            )
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                        {ORDEN_LEYENDA.map((estado) => (
                            <span
                                key={estado}
                                className="inline-flex items-center gap-1.5"
                            >
                                <span
                                    className={`size-2.5 rounded-full ${ESTADOS[estado].punto}`}
                                />
                                {ESTADOS[estado].etiqueta}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="h-fit rounded-xl border bg-card p-4">
                    {citaActual ? (
                        <DetalleCita
                            cita={citaActual}
                            rol={rol}
                            puedeGestionar={puedeGestionar}
                        />
                    ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Selecciona una cita para ver su detalle.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
