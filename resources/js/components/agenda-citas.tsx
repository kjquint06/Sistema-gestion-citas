import { Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    FileText,
    Pencil,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import CitaController from '@/actions/App/Http/Controllers/CitaController';
import ConfirmarEliminar from '@/components/confirmar-eliminar';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/agenda';
import { create, edit } from '@/routes/citas';
import { show } from '@/routes/expedientes';

type DiaSemana = {
    fecha: string;
    dia_semana: number;
    citas: number;
    atiende: boolean;
};

type MedicoColumna = {
    id: number;
    nombre: string;
    iniciales: string;
    especialidad: string;
    consultorio: string | null;
    duracion_cita: number;
    horarios: { inicio: string; fin: string }[];
};

type CitaAgenda = {
    id: number;
    medico_id: number;
    medico: string | null;
    consultorio: string | null;
    fecha: string;
    inicio: string;
    fin: string;
    duracion: number;
    hora_llegada: string | null;
    estado: string;
    motivo: string | null;
    paciente: {
        id: number;
        nombre: string;
        iniciales: string;
        expediente: string;
        edad: number | null;
    };
};

export type AgendaProps = {
    rol: string;
    puedeGestionar: boolean;
    fecha: string;
    hoy: string;
    filtros: { medico_id: number | null };
    medicosFiltro: { id: number; nombre: string }[];
    semana: DiaSemana[];
    medicos: MedicoColumna[];
    citas: CitaAgenda[];
    resumen: {
        citas: number;
        medicos: number;
        bloque_minutos: number | null;
        bloques_totales: number;
        bloques_libres: number;
    };
    horas: { inicio: number; fin: number };
};

const ALTO_HORA = 80;
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const ESTADOS: Record<
    string,
    { etiqueta: string; bloque: string; punto: string }
> = {
    pendiente: {
        etiqueta: 'Pendiente',
        bloque: 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
        punto: 'bg-amber-500',
    },
    confirmada: {
        etiqueta: 'Confirmada',
        bloque: 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
        punto: 'bg-blue-500',
    },
    en_espera: {
        etiqueta: 'En espera',
        bloque: 'border-orange-500 bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
        punto: 'bg-orange-500',
    },
    en_consulta: {
        etiqueta: 'En consulta',
        bloque: 'border-violet-500 bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100',
        punto: 'bg-violet-500',
    },
    atendida: {
        etiqueta: 'Atendida',
        bloque: 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100',
        punto: 'bg-green-500',
    },
    cancelada: {
        etiqueta: 'Cancelada',
        bloque: 'border-red-500 bg-red-100 text-red-900 opacity-70 dark:bg-red-900/40 dark:text-red-100',
        punto: 'bg-red-500',
    },
    inasistencia: {
        etiqueta: 'Inasistencia',
        bloque: 'border-gray-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        punto: 'bg-gray-500',
    },
};

const ORDEN_LEYENDA = [
    'confirmada',
    'en_espera',
    'en_consulta',
    'pendiente',
    'cancelada',
    'atendida',
    'inasistencia',
];

const claseSelect =
    'flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

function aFecha(valor: string): Date {
    const [anio, mes, dia] = valor.split('-').map(Number);

    return new Date(anio, mes - 1, dia);
}

function aTexto(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(valor: string, dias: number): string {
    const fecha = aFecha(valor);
    fecha.setDate(fecha.getDate() + dias);

    return aTexto(fecha);
}

function aMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);

    return horas * 60 + minutos;
}

function mayuscula(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function tituloAgenda(rol: string): string {
    if (rol === 'admin') {
        return 'Administración · Agenda general';
    }

    if (rol === 'recepcionista') {
        return 'Recepción · Agenda general';
    }

    return 'Mi agenda';
}

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

function DetalleCita({
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
                        aFecha(cita.fecha).toLocaleDateString('es', {
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
                                {aFecha(cita.fecha).toLocaleDateString('es')} a
                                las {cita.inicio}. La cita quedará marcada como
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

    const ir = (nuevaFecha: string, medicoId: number | null = filtros.medico_id) => {
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

    const fechaObjeto = aFecha(fecha);
    const mesAnio = mayuscula(
        fechaObjeto.toLocaleDateString('es', { month: 'long', year: 'numeric' }),
    );
    const fechaLarga = mayuscula(
        fechaObjeto.toLocaleDateString('es', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),
    );

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
                        <Link
                            href={create({
                                query: {
                                    fecha,
                                    ...(filtros.medico_id
                                        ? { medico_id: filtros.medico_id }
                                        : {}),
                                },
                            })}
                        >
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

                    return (
                        <button
                            key={dia.fecha}
                            type="button"
                            onClick={() => ir(dia.fecha)}
                            className={`rounded-lg border p-2 text-center transition ${
                                activo
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-card hover:bg-muted'
                            }`}
                        >
                            <p className="text-xs">
                                {DIAS_CORTOS[dia.dia_semana - 1]}
                            </p>
                            <p className="text-lg font-semibold">
                                {Number(dia.fecha.split('-')[2])}
                            </p>
                            <p
                                className={`text-[11px] ${
                                    activo
                                        ? 'text-primary-foreground/80'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {dia.atiende || dia.citas > 0
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
                            <div className="flex min-w-max">
                                <div className="w-16 shrink-0 border-r">
                                    <div className="h-20 border-b" />
                                    {horasLista.map((hora) => (
                                        <div
                                            key={hora}
                                            style={{ height: ALTO_HORA }}
                                            className="pr-2 pt-1 text-right text-xs text-muted-foreground"
                                        >
                                            {String(hora).padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                {medicos.map((medico) => (
                                    <div
                                        key={medico.id}
                                        className="w-56 shrink-0 border-r last:border-r-0"
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
                                                    key={`${horario.inicio}-${horario.fin}`}
                                                    className="absolute inset-x-0 bg-background"
                                                    style={{
                                                        top: topDe(horario.inicio),
                                                        height:
                                                            ((aMinutos(horario.fin) -
                                                                aMinutos(horario.inicio)) *
                                                                ALTO_HORA) /
                                                            60,
                                                    }}
                                                />
                                            ))}

                                            {horasLista.map((hora, i) => (
                                                <div
                                                    key={hora}
                                                    className="pointer-events-none absolute inset-x-0 border-t"
                                                    style={{ top: i * ALTO_HORA }}
                                                />
                                            ))}

                                            {citas
                                                .filter(
                                                    (cita) =>
                                                        cita.medico_id === medico.id,
                                                )
                                                .map((cita) => (
                                                    <button
                                                        key={cita.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setSeleccionada(cita.id)
                                                        }
                                                        style={{
                                                            top: topDe(cita.inicio),
                                                            height: Math.max(
                                                                24,
                                                                (cita.duracion *
                                                                    ALTO_HORA) /
                                                                    60 -
                                                                    2,
                                                            ),
                                                        }}
                                                        className={`absolute inset-x-1 overflow-hidden rounded-md border-l-4 p-1 text-left text-[11px] leading-tight shadow-sm transition hover:brightness-95 ${
                                                            ESTADOS[cita.estado]
                                                                ?.bloque ?? ''
                                                        } ${
                                                            seleccionada === cita.id
                                                                ? 'ring-2 ring-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        <p className="truncate font-semibold">
                                                            {cita.inicio} ·{' '}
                                                            {cita.paciente.nombre}
                                                        </p>
                                                        <p className="truncate">
                                                            {ESTADOS[cita.estado]
                                                                ?.etiqueta ??
                                                                cita.estado}
                                                        </p>
                                                    </button>
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