import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    Lock,
    UserCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    aFecha,
    aMinutos,
    DIAS_CORTOS,
    ESTADOS,
    mayuscula,
} from '@/components/agenda-utils';
import { Button } from '@/components/ui/button';
import { index as agenda } from '@/routes/agenda';
import { index as consultas } from '@/routes/consultas';
import { index as disponibilidad } from '@/routes/disponibilidad';
import { show as expedienteMedico } from '@/routes/expediente-medico';

type CitaSemana = {
    id: number;
    fecha: string;
    inicio: string;
    fin: string;
    estado: string;
    motivo: string | null;
    hora_llegada: string | null;
    paciente: { id: number; nombre: string };
};

type BloqueoSemana = {
    id: number;
    fecha: string;
    inicio: string;
    fin: string;
    motivo: string | null;
};

type HorarioDia = { dia: number; inicio: string; fin: string };

type PacienteAtendido = {
    id: number;
    nombre: string;
    ultima_visita: string;
    visitas: number;
};

type Props = {
    medico: {
        nombre: string;
        consultorio: string | null;
        especialidad: string;
        duracion_cita: number;
    };
    horarios: HorarioDia[];
    semana: {
        inicio: string;
        fin: string;
        anterior: string;
        siguiente: string;
        dias: string[];
    };
    hoy: string;
    ahora: string;
    tarjetas: {
        citas_hoy: number;
        en_espera: number;
        confirmadas: number;
        en_espera_detalle: { nombre: string; llegada: string | null } | null;
        proxima_confirmada: { nombre: string; hora: string } | null;
    };
    citas: CitaSemana[];
    bloqueos: BloqueoSemana[];
    horas: { inicio: number; fin: number };
    pacientesAtendidos: PacienteAtendido[];
};

// Alto en píxeles de cada media hora del calendario
const ALTO_MEDIA_HORA = 64;
const ALTO_HORA = ALTO_MEDIA_HORA * 2;

function horaActual(): string {
    const fecha = new Date();

    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

function saludo(hora: string): string {
    const h = Number(hora.slice(0, 2));

    if (h < 12) {
        return 'Buenos días';
    }

    return h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function primerNombre(nombre: string): string {
    return nombre.split(' ')[0] ?? nombre;
}

function tituloSemana(inicio: string, fin: string): string {
    const desde = aFecha(inicio);
    const hasta = aFecha(fin);
    const mes = (fecha: Date) =>
        fecha.toLocaleDateString('es', { month: 'long' });

    if (desde.getMonth() === hasta.getMonth()) {
        return `${desde.getDate()}–${hasta.getDate()} de ${mes(hasta)} de ${hasta.getFullYear()}`;
    }

    return `${desde.getDate()} de ${mes(desde)} – ${hasta.getDate()} de ${mes(hasta)} de ${hasta.getFullYear()}`;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{etiqueta}</span>
            <span className="text-right font-medium">{valor}</span>
        </div>
    );
}

export default function AgendaMedico({
    medico,
    horarios,
    semana,
    hoy,
    ahora,
    tarjetas,
    citas,
    bloqueos,
    horas,
    pacientesAtendidos,
}: Props) {
    const [seleccionada, setSeleccionada] = useState<CitaSemana | null>(null);
    const [hora, setHora] = useState(ahora);

    // La línea de la hora actual se mueve cada minuto
    useEffect(() => {
        const intervalo = setInterval(() => setHora(horaActual()), 60_000);

        return () => clearInterval(intervalo);
    }, []);

    const totalMedias = (horas.fin - horas.inicio) * 2;
    const altoCalendario = totalMedias * ALTO_MEDIA_HORA;
    const marcas = Array.from({ length: totalMedias }, (_, i) => {
        const minutos = horas.inicio * 60 + i * 30;

        return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${minutos % 60 === 0 ? '00' : '30'}`;
    });

    const posicion = (inicio: string, fin: string) => ({
        top: ((aMinutos(inicio) - horas.inicio * 60) / 60) * ALTO_HORA,
        height: Math.max(
            ((aMinutos(fin) - aMinutos(inicio)) / 60) * ALTO_HORA - 4,
            28,
        ),
    });

    const horarioDelDia = (fecha: string) => {
        const dia = ((aFecha(fecha).getDay() + 6) % 7) + 1;
        const bloques = horarios.filter((h) => h.dia === dia);

        return bloques.length === 0
            ? null
            : `${bloques[0].inicio}–${bloques[bloques.length - 1].fin}`;
    };

    const minutosAhora = aMinutos(hora);
    const lineaVisible =
        semana.dias.includes(hoy) &&
        minutosAhora >= horas.inicio * 60 &&
        minutosAhora <= horas.fin * 60;
    const lineaTop = ((minutosAhora - horas.inicio * 60) / 60) * ALTO_HORA;

    const fechaHoy = aFecha(hoy);
    const fechaLarga = mayuscula(
        fechaHoy.toLocaleDateString('es', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),
    );

    const puedeIrAConsultas =
        seleccionada !== null &&
        seleccionada.fecha === hoy &&
        seleccionada.estado !== 'cancelada' &&
        seleccionada.estado !== 'atendida';

    return (
        <>
            <Head title="Agenda semanal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Saludo */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            {saludo(hora)}, {medico.nombre}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tu agenda de {medico.especialidad.toLowerCase()} ·{' '}
                            {fechaLarga} · {hora} h
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={disponibilidad()}>Mis horarios</Link>
                    </Button>
                </div>

                {/* Tarjetas */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-teal-700 p-5 text-white shadow-sm">
                        <p className="text-sm text-teal-50">Tus citas de hoy</p>
                        <p className="mt-3 text-4xl font-semibold">
                            {tarjetas.citas_hoy}
                        </p>
                        <p className="mt-3 text-xs text-teal-50">
                            {tarjetas.citas_hoy > 0
                                ? `${fechaHoy.toLocaleDateString('es', { day: 'numeric', month: 'short' })} · Todas de ${medico.duracion_cita} min`
                                : 'No tienes citas hoy'}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            En espera
                        </p>
                        <p className="mt-3 text-4xl font-semibold">
                            {tarjetas.en_espera}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {tarjetas.en_espera_detalle
                                ? `${tarjetas.en_espera_detalle.nombre}${tarjetas.en_espera_detalle.llegada ? ` · Llegada ${tarjetas.en_espera_detalle.llegada}` : ''}`
                                : 'Nadie en sala de espera'}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Confirmadas
                        </p>
                        <p className="mt-3 text-4xl font-semibold">
                            {tarjetas.confirmadas}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {tarjetas.proxima_confirmada
                                ? `Próxima: ${primerNombre(tarjetas.proxima_confirmada.nombre)} · ${tarjetas.proxima_confirmada.hora} h`
                                : 'Sin próximas confirmadas'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
                    <section className="flex flex-col gap-4">
                        {/* Navegación de semanas */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" asChild>
                                    <Link href={agenda()}>Hoy</Link>
                                </Button>
                                <Link
                                    href={agenda({
                                        query: { semana: semana.anterior },
                                    })}
                                    aria-label="Semana anterior"
                                    className="rounded p-1 hover:bg-muted"
                                >
                                    <ChevronLeft size={20} />
                                </Link>
                                <h2 className="text-xl font-semibold">
                                    {tituloSemana(semana.inicio, semana.fin)}
                                </h2>
                                <Link
                                    href={agenda({
                                        query: { semana: semana.siguiente },
                                    })}
                                    aria-label="Semana siguiente"
                                    className="rounded p-1 hover:bg-muted"
                                >
                                    <ChevronRight size={20} />
                                </Link>
                            </div>
                            <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                                Semana · Solo mi agenda
                            </span>
                        </div>

                        {/* Calendario */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b bg-muted/30">
                                        <div />
                                        {semana.dias.map((dia, i) => {
                                            const horario = horarioDelDia(dia);
                                            const esHoy = dia === hoy;

                                            return (
                                                <div
                                                    key={dia}
                                                    className={`border-l p-3 text-sm ${
                                                        esHoy
                                                            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200'
                                                            : ''
                                                    }`}
                                                >
                                                    <p className="font-semibold">
                                                        {DIAS_CORTOS[i]}{' '}
                                                        {aFecha(dia).getDate()}
                                                        {esHoy ? ' · Hoy' : ''}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {horario ??
                                                            'Sin atención'}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                                        <div
                                            className="relative"
                                            style={{ height: altoCalendario }}
                                        >
                                            {marcas.map((marca, i) => (
                                                <span
                                                    key={marca}
                                                    className="absolute left-2 text-xs text-muted-foreground"
                                                    style={{
                                                        top:
                                                            i *
                                                                ALTO_MEDIA_HORA +
                                                            4,
                                                    }}
                                                >
                                                    {marca}
                                                </span>
                                            ))}
                                        </div>

                                        {semana.dias.map((dia) => (
                                            <div
                                                key={dia}
                                                className={`relative border-l ${
                                                    horarioDelDia(dia) === null
                                                        ? 'bg-muted/40'
                                                        : ''
                                                } ${dia === hoy ? 'bg-teal-50/40 dark:bg-teal-900/10' : ''}`}
                                                style={{
                                                    height: altoCalendario,
                                                }}
                                            >
                                                {marcas.map((marca, i) => (
                                                    <div
                                                        key={marca}
                                                        className="absolute inset-x-0 border-t border-muted"
                                                        style={{
                                                            top:
                                                                i *
                                                                ALTO_MEDIA_HORA,
                                                        }}
                                                    />
                                                ))}

                                                {bloqueos
                                                    .filter(
                                                        (b) => b.fecha === dia,
                                                    )
                                                    .map((bloqueo) => (
                                                        <div
                                                            key={`${bloqueo.id}-${dia}`}
                                                            className="absolute inset-x-1 mt-0.5 flex items-start gap-1 overflow-hidden rounded-md border border-dashed border-gray-400 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.06)_6px,rgba(0,0,0,0.06)_12px)] p-1.5 text-xs text-muted-foreground"
                                                            style={posicion(
                                                                bloqueo.inicio,
                                                                bloqueo.fin,
                                                            )}
                                                            title={
                                                                bloqueo.motivo ??
                                                                'Bloqueado'
                                                            }
                                                        >
                                                            <Lock
                                                                size={12}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            {bloqueo.motivo ??
                                                                'Bloqueado'}
                                                        </div>
                                                    ))}

                                                {citas
                                                    .filter(
                                                        (c) => c.fecha === dia,
                                                    )
                                                    .map((cita) => (
                                                        <button
                                                            key={cita.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSeleccionada(
                                                                    cita,
                                                                )
                                                            }
                                                            className={`absolute inset-x-1.5 mt-0.5 overflow-hidden rounded-md border p-1.5 text-left text-xs transition hover:brightness-95 ${
                                                                ESTADOS[
                                                                    cita.estado
                                                                ]?.bloque ??
                                                                'bg-muted'
                                                            } ${
                                                                seleccionada?.id ===
                                                                cita.id
                                                                    ? 'ring-2 ring-teal-600'
                                                                    : ''
                                                            }`}
                                                            style={posicion(
                                                                cita.inicio,
                                                                cita.fin,
                                                            )}
                                                        >
                                                            <p className="leading-tight font-medium">
                                                                {cita.inicio}–
                                                                {cita.fin} ·{' '}
                                                                {ESTADOS[
                                                                    cita.estado
                                                                ]?.etiqueta ??
                                                                    cita.estado}
                                                            </p>
                                                            <p className="truncate font-semibold">
                                                                {
                                                                    cita
                                                                        .paciente
                                                                        .nombre
                                                                }
                                                            </p>
                                                        </button>
                                                    ))}

                                                {lineaVisible &&
                                                    dia === hoy && (
                                                        <div
                                                            className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-red-500"
                                                            style={{
                                                                top: lineaTop,
                                                            }}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 border-t p-4 text-xs text-muted-foreground">
                                {Object.entries(ESTADOS).map(
                                    ([clave, info]) => (
                                        <span
                                            key={clave}
                                            className="inline-flex items-center gap-1.5"
                                        >
                                            <span
                                                className={`size-2.5 rounded-full ${info.punto}`}
                                            />
                                            {info.etiqueta}
                                        </span>
                                    ),
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Lock size={12} />
                                    Bloqueo
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Detalle de la cita seleccionada */}
                    <aside className="rounded-xl border bg-card p-5 shadow-sm">
                        {seleccionada === null ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                                <CalendarDays size={28} />
                                Toca una cita del calendario para ver su
                                detalle.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Detalle de la cita
                                    </h2>
                                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                                        <span
                                            className={`size-2.5 rounded-full ${
                                                ESTADOS[seleccionada.estado]
                                                    ?.punto ?? 'bg-muted'
                                            }`}
                                        />
                                        {ESTADOS[seleccionada.estado]
                                            ?.etiqueta ?? seleccionada.estado}
                                    </span>
                                </div>

                                <p className="font-medium">
                                    {seleccionada.paciente.nombre}
                                </p>

                                <div className="space-y-2">
                                    <Fila
                                        etiqueta="Fecha"
                                        valor={mayuscula(
                                            aFecha(
                                                seleccionada.fecha,
                                            ).toLocaleDateString('es', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                            }),
                                        )}
                                    />
                                    <Fila
                                        etiqueta="Hora"
                                        valor={`${seleccionada.inicio} a ${seleccionada.fin}`}
                                    />
                                    <Fila
                                        etiqueta="Motivo"
                                        valor={
                                            seleccionada.motivo ?? 'Sin motivo'
                                        }
                                    />
                                    <Fila
                                        etiqueta="Llegada"
                                        valor={
                                            seleccionada.hora_llegada ??
                                            'Aún no llega'
                                        }
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {puedeIrAConsultas && (
                                        <Button size="sm" asChild>
                                            <Link href={consultas()}>
                                                <ClipboardList size={14} />
                                                Ir a Consultas
                                            </Link>
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={expedienteMedico(
                                                seleccionada.paciente.id,
                                            )}
                                        >
                                            <FileText size={14} />
                                            Ver expediente
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>

                {/* Pacientes atendidos */}
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Pacientes atendidos previamente
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Acceso al expediente de solo lectura.
                        </p>
                    </div>

                    {pacientesAtendidos.length === 0 ? (
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Todavía no has atendido pacientes.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="p-4 font-medium">
                                            Paciente
                                        </th>
                                        <th className="p-4 font-medium">
                                            Última visita
                                        </th>
                                        <th className="p-4 font-medium">
                                            Visitas
                                        </th>
                                        <th className="p-4 text-right font-medium">
                                            Expediente
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pacientesAtendidos.map((paciente) => (
                                        <tr
                                            key={paciente.id}
                                            className="border-t"
                                        >
                                            <td className="p-4 font-medium">
                                                <span className="inline-flex items-center gap-2">
                                                    <UserCheck
                                                        size={14}
                                                        className="text-teal-700"
                                                    />
                                                    {paciente.nombre}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {paciente.ultima_visita}
                                            </td>
                                            <td className="p-4">
                                                {paciente.visitas}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={expedienteMedico(
                                                            paciente.id,
                                                        )}
                                                    >
                                                        <FileText size={14} />
                                                        Ver expediente
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AgendaMedico.layout = {
    breadcrumbs: [{ title: 'Agenda semanal', href: agenda() }],
};
