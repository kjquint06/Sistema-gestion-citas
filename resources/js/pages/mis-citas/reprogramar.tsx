import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type HorarioDisponible = {
    hora_inicio: string;
    hora_fin: string;
    disponible: boolean;
    motivo: string | null;
};

type Medico = {
    id: number;
    nombre: string;
    especialidad: string;
    duracion_cita: number;
    consultorio: string | null;
};

type Props = {
    cita: {
        id: number;
        medico_id: number;
        fecha: string;
        hora_inicio: string;
        motivo: string | null;
    };
    medicos: Medico[];
};
const obtenerFechaLocal = (fecha: Date): string => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
};

const formatearFecha = (fecha: string): string => {
    if (!fecha) return 'Selecciona una fecha';

    return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatearHora = (hora: string): string => {
    if (!hora) return '';

    const [horas, minutos] = hora.split(':');
    const fecha = new Date();
    fecha.setHours(Number(horas), Number(minutos));

    return fecha.toLocaleTimeString('es-HN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

export default function ReprogramarCita({ cita, medicos }: Props) {
    const medico = medicos.find((m) => m.id === cita.medico_id);

    const [mesActual, setMesActual] = useState(() => {
        const f = new Date(`${cita.fecha}T12:00:00`);

        return new Date(f.getFullYear(), f.getMonth(), 1);
    });
    const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const form = useForm({
        medico_id: cita.medico_id,
        fecha: cita.fecha,
        hora_inicio: '',
        motivo: cita.motivo ?? '',
    });

    const hoy = obtenerFechaLocal(new Date());

    // Consultar los horarios del médico para la fecha elegida
    useEffect(() => {
        const controlador = new AbortController();

        const consultar = async () => {
            setCargando(true);
            setError('');

            try {
                const parametros = new URLSearchParams({
                    medico_id: String(cita.medico_id),
                    fecha: form.data.fecha,
                });

                const respuesta = await fetch(
                    `/mis-citas/disponibilidad?${parametros.toString()}`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                        signal: controlador.signal,
                    },
                );

                if (!respuesta.ok) {
                    throw new Error('Error al consultar horarios');
                }

                const datos = await respuesta.json();
                setHorarios(datos.horarios ?? []);
            } catch (e) {
                if (e instanceof Error && e.name === 'AbortError') {
                    return;
                }

                setHorarios([]);
                setError('No se pudieron cargar los horarios.');
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        };

        void consultar();

        return () => controlador.abort();
    }, [cita.medico_id, form.data.fecha]);

    // Días del mes, comenzando por lunes
    const dias = useMemo(() => {
        const primero = new Date(
            mesActual.getFullYear(),
            mesActual.getMonth(),
            1,
        );
        const ultimo = new Date(
            mesActual.getFullYear(),
            mesActual.getMonth() + 1,
            0,
        );
        const lista: (Date | null)[] = Array((primero.getDay() + 6) % 7).fill(
            null,
        );

        for (let d = 1; d <= ultimo.getDate(); d++) {
            lista.push(
                new Date(mesActual.getFullYear(), mesActual.getMonth(), d),
            );
        }

        return lista;
    }, [mesActual]);

    const cambiarMes = (n: number) =>
        setMesActual((a) => new Date(a.getFullYear(), a.getMonth() + n, 1));

    const elegido = horarios.find(
        (h) => h.hora_inicio === form.data.hora_inicio,
    );

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/mis-citas/${cita.id}`);
    };

    return (
        <>
            <Head title="Reprogramar cita" />

            <div className="min-h-screen bg-slate-50/70 px-4 py-8">
                <form onSubmit={enviar} className="mx-auto max-w-4xl space-y-5">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            Reprogramar cita
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Cita actual: {formatearFecha(cita.fecha)} ·{' '}
                            {formatearHora(cita.hora_inicio)} h con{' '}
                            {medico?.nombre}
                            {medico?.consultorio &&
                                ` · Consultorio ${medico.consultorio}`}
                        </p>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h2 className="mb-4 text-sm font-semibold text-slate-800">
                            Elige la nueva fecha y hora
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Calendario */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => cambiarMes(-1)}
                                        disabled={
                                            mesActual.getFullYear() ===
                                                new Date().getFullYear() &&
                                            mesActual.getMonth() ===
                                                new Date().getMonth()
                                        }
                                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                        aria-label="Mes anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <span className="text-sm font-semibold text-slate-800 capitalize">
                                        {mesActual.toLocaleDateString('es-HN', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => cambiarMes(1)}
                                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                                        aria-label="Mes siguiente"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(
                                        (d, i) => (
                                            <div
                                                key={i}
                                                className="py-2 text-xs font-medium text-slate-400"
                                            >
                                                {d}
                                            </div>
                                        ),
                                    )}

                                    {dias.map((dia, i) => {
                                        if (!dia) {
                                            return <div key={`v-${i}`} />;
                                        }

                                        const fecha = obtenerFechaLocal(dia);
                                        const pasado = fecha < hoy;
                                        const activo =
                                            fecha === form.data.fecha;

                                        return (
                                            <button
                                                key={fecha}
                                                type="button"
                                                disabled={pasado}
                                                onClick={() => {
                                                    form.setData((d) => ({
                                                        ...d,
                                                        fecha,
                                                        hora_inicio: '',
                                                    }));
                                                }}
                                                className={`aspect-square rounded-md text-xs transition ${
                                                    activo
                                                        ? 'bg-teal-700 font-semibold text-white'
                                                        : pasado
                                                          ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                                          : 'text-slate-700 hover:bg-teal-50'
                                                }`}
                                            >
                                                {dia.getDate()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Horarios */}
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <CalendarDays
                                        size={16}
                                        className="text-teal-700"
                                    />
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        {formatearFecha(form.data.fecha)}
                                    </h3>
                                </div>

                                {cargando ? (
                                    <p className="py-5 text-sm text-slate-500">
                                        Consultando disponibilidad...
                                    </p>
                                ) : error ? (
                                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                ) : horarios.length === 0 ? (
                                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                                        No hay horarios registrados para este
                                        día.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {horarios.map((h) => (
                                            <button
                                                key={h.hora_inicio}
                                                type="button"
                                                disabled={!h.disponible}
                                                onClick={() =>
                                                    form.setData(
                                                        'hora_inicio',
                                                        h.hora_inicio,
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-xs transition ${
                                                    form.data.hora_inicio ===
                                                    h.hora_inicio
                                                        ? 'border-teal-700 bg-teal-700 text-white'
                                                        : h.disponible
                                                          ? 'border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-500'
                                                          : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                }`}
                                            >
                                                <span className="font-semibold">
                                                    {formatearHora(
                                                        h.hora_inicio,
                                                    )}{' '}
                                                    –{' '}
                                                    {formatearHora(h.hora_fin)}
                                                </span>
                                                <span>
                                                    {form.data.hora_inicio ===
                                                    h.hora_inicio
                                                        ? 'Seleccionado'
                                                        : h.disponible
                                                          ? 'Libre'
                                                          : 'Ocupado'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <label
                            htmlFor="motivo"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                            Motivo de la cita
                        </label>

                        <textarea
                            id="motivo"
                            value={form.data.motivo}
                            onChange={(e) =>
                                form.setData('motivo', e.target.value)
                            }
                            maxLength={255}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        />

                        {(
                            [
                                'motivo',
                                'hora_inicio',
                                'fecha',
                                'medico_id',
                            ] as const
                        ).map(
                            (campo) =>
                                form.errors[campo] && (
                                    <p
                                        key={campo}
                                        className="mt-2 text-xs text-red-600"
                                    >
                                        {form.errors[campo]}
                                    </p>
                                ),
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    !form.data.hora_inicio ||
                                    !form.data.motivo.trim() ||
                                    !elegido?.disponible
                                }
                                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Guardando...'
                                    : 'Confirmar nuevo horario'}
                            </button>

                            <Link
                                href="/dashboard"
                                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Volver a mis citas
                            </Link>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}
