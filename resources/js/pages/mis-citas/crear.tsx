import { Head, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Info,
    Stethoscope,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Especialidad = {
    id: number;
    nombre: string;
    medicos_count: number;
};

type Medico = {
    id: number;
    nombre: string;
    especialidad_id: number;
    especialidad: string;
    duracion_cita: number;
    consultorio: string | null;
};

type HorarioDisponible = {
    hora_inicio: string;
    hora_fin: string;
    disponible: boolean;
    motivo: string | null;
};

type Props = {
    especialidades: Especialidad[];
    medicos: Medico[];
    valores: {
        fecha: string;
        medico_id: number | null;
        hora_inicio: string | null;
    };
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

export default function CrearCita({ especialidades, medicos, valores }: Props) {
    const medicoInicial = medicos.find(
        (medico) => medico.id === valores.medico_id,
    );

    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<
        number | null
    >(medicoInicial?.especialidad_id ?? null);

    const [mesActual, setMesActual] = useState(() => {
        const fecha = new Date(`${valores.fecha}T12:00:00`);
        return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    });

    const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [errorHorarios, setErrorHorarios] = useState('');

    const form = useForm({
        medico_id: valores.medico_id,
        fecha: valores.fecha,
        hora_inicio: valores.hora_inicio ?? '',
        motivo: '',
    });

    const medicoSeleccionado = useMemo(
        () => medicos.find((medico) => medico.id === form.data.medico_id),
        [medicos, form.data.medico_id],
    );
    const especialidadCompletada = especialidadSeleccionada !== null;

    const medicoCompletado = !!form.data.medico_id;

    const fechaCompletada = !!form.data.fecha;

    const horarioCompletado = !!form.data.hora_inicio;

    const medicosFiltrados = useMemo(
        () =>
            medicos.filter(
                (medico) => medico.especialidad_id === especialidadSeleccionada,
            ),
        [medicos, especialidadSeleccionada],
    );

    // Consultar disponibilidad real en Laravel.
    useEffect(() => {
        if (!form.data.medico_id || !form.data.fecha) {
            setHorarios([]);
            return;
        }

        const controlador = new AbortController();

        const consultarHorarios = async () => {
            setCargandoHorarios(true);
            setErrorHorarios('');

            try {
                const parametros = new URLSearchParams({
                    medico_id: String(form.data.medico_id),
                    fecha: form.data.fecha,
                });

                const respuesta = await fetch(
                    `/mis-citas/disponibilidad?${parametros.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                        credentials: 'same-origin',
                        signal: controlador.signal,
                    },
                );

                if (!respuesta.ok) {
                    throw new Error('No fue posible consultar los horarios.');
                }

                const datos = await respuesta.json();

                setHorarios(datos.horarios ?? []);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                setHorarios([]);
                setErrorHorarios(
                    'No se pudieron cargar los horarios. Intenta nuevamente.',
                );
            } finally {
                if (!controlador.signal.aborted) {
                    setCargandoHorarios(false);
                }
            }
        };

        void consultarHorarios();

        return () => controlador.abort();
    }, [form.data.medico_id, form.data.fecha]);

    // Crear los días del calendario comenzando por lunes.
    const diasCalendario = useMemo(() => {
        const primerDia = new Date(
            mesActual.getFullYear(),
            mesActual.getMonth(),
            1,
        );

        const ultimoDia = new Date(
            mesActual.getFullYear(),
            mesActual.getMonth() + 1,
            0,
        );

        const espaciosIniciales = (primerDia.getDay() + 6) % 7;

        const dias: (Date | null)[] = Array(espaciosIniciales).fill(null);

        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            dias.push(
                new Date(mesActual.getFullYear(), mesActual.getMonth(), dia),
            );
        }

        return dias;
    }, [mesActual]);

    const hoy = obtenerFechaLocal(new Date());

    const cambiarEspecialidad = (id: number) => {
        setEspecialidadSeleccionada(id);
        form.setData('medico_id', null);
        form.setData('hora_inicio', '');
        setHorarios([]);
    };

    const cambiarMedico = (medico: Medico) => {
        form.setData('medico_id', medico.id);
        form.setData('hora_inicio', '');
        setHorarios([]);
    };

    const cambiarFecha = (fecha: string) => {
        form.setData('fecha', fecha);
        form.setData('hora_inicio', '');
    };

    const cambiarMes = (cantidad: number) => {
        setMesActual(
            (actual) =>
                new Date(actual.getFullYear(), actual.getMonth() + cantidad, 1),
        );
    };

    const enviarFormulario = (evento: React.FormEvent) => {
        evento.preventDefault();

        form.post('/mis-citas');
    };

    const nombreMes = mesActual.toLocaleDateString('es-HN', {
        month: 'long',
        year: 'numeric',
    });

    const horarioSeleccionado = horarios.find(
        (horario) => horario.hora_inicio === form.data.hora_inicio,
    );

    return (
        <>
            <Head title="Agendar una cita" />

            <div className="min-h-screen bg-slate-50/70 px-4 py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                            Agendar una cita
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Elige un horario libre y revisa el motivo antes de
                            solicitar tu reserva.
                        </p>
                    </div>

                    {/* Indicadores de pasos */}
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {[
                            {
                                nombre: '1. Especialidad',
                                completado: especialidadCompletada,
                            },
                            {
                                nombre: '2. Profesional',
                                completado: medicoCompletado,
                            },
                            {
                                nombre: '3. Fecha y hora',
                                completado:
                                    fechaCompletada && horarioCompletado,
                            },
                            {
                                nombre: '4. Revisar y confirmar',
                                completado:
                                    medicoCompletado &&
                                    fechaCompletada &&
                                    horarioCompletado &&
                                    !!form.data.motivo.trim(),
                            },
                        ].map((paso) => (
                            <div
                                key={paso.nombre}
                                className={`rrounded-lg border px-3 py-3 text-xs font-semibold transition-all duration-300 ${
                                    paso.completado
                                        ? 'border-teal-600 bg-teal-700 text-white shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-400'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {paso.completado ? (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-teal-700">
                                            ✓
                                        </span>
                                    ) : (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            o
                                        </span>
                                    )}
                                    {paso.nombre}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={enviarFormulario}
                        className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
                    >
                        <div className="space-y-5">
                            {/* Especialidades */}
                            <section className="rounded-xl border border-slate-200 bg-white p-5">
                                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                                    1. Especialidad
                                </h2>

                                {especialidades.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No hay especialidades registradas.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {especialidades.map((especialidad) => (
                                            <button
                                                key={especialidad.id}
                                                type="button"
                                                onClick={() =>
                                                    cambiarEspecialidad(
                                                        especialidad.id,
                                                    )
                                                }
                                                className={`rounded-lg border p-3 text-left transition ${
                                                    especialidadSeleccionada ===
                                                    especialidad.id
                                                        ? 'border-teal-600 bg-teal-50'
                                                        : 'border-slate-200 hover:border-teal-400'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {especialidad.nombre}
                                                    </span>

                                                    {especialidadSeleccionada ===
                                                        especialidad.id && (
                                                        <span className="text-teal-700">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {especialidad.medicos_count}{' '}
                                                    {especialidad.medicos_count ===
                                                    1
                                                        ? 'profesional'
                                                        : 'profesionales'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Médicos */}
                            <section className="rounded-xl border border-slate-200 bg-white p-5">
                                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                                    2. Profesional
                                </h2>

                                {!especialidadSeleccionada ? (
                                    <p className="text-sm text-slate-500">
                                        Primero selecciona una especialidad.
                                    </p>
                                ) : medicosFiltrados.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No hay profesionales registrados en esta
                                        especialidad.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {medicosFiltrados.map((medico) => (
                                            <button
                                                key={medico.id}
                                                type="button"
                                                onClick={() =>
                                                    cambiarMedico(medico)
                                                }
                                                className={`rounded-lg border p-3 text-left transition ${
                                                    form.data.medico_id ===
                                                    medico.id
                                                        ? 'border-teal-600 bg-teal-50'
                                                        : 'border-slate-200 hover:border-teal-400'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope
                                                        size={16}
                                                        className="text-teal-700"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {medico.nombre}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-xs text-slate-500">
                                                    {medico.consultorio
                                                        ? `Consultorio ${medico.consultorio}`
                                                        : 'Consultorio no asignado'}
                                                    {' · '}
                                                    Citas de{' '}
                                                    {medico.duracion_cita} min
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Calendario y horarios */}
                            <section className="rounded-xl border border-slate-200 bg-white p-5">
                                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                                    3. Fecha y horario disponible
                                </h2>

                                {!medicoSeleccionado ? (
                                    <p className="text-sm text-slate-500">
                                        Selecciona un profesional para consultar
                                        sus horarios.
                                    </p>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                                        {/* Calendario */}
                                        <div>
                                            <div className="mb-4 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarMes(-1)
                                                    }
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
                                                    {nombreMes}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarMes(1)
                                                    }
                                                    className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                                                    aria-label="Mes siguiente"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-7 gap-1 text-center">
                                                {[
                                                    'L',
                                                    'M',
                                                    'X',
                                                    'J',
                                                    'V',
                                                    'S',
                                                    'D',
                                                ].map((dia, indice) => (
                                                    <div
                                                        key={indice}
                                                        className="py-2 text-xs font-medium text-slate-400"
                                                    >
                                                        {dia}
                                                    </div>
                                                ))}

                                                {diasCalendario.map(
                                                    (dia, indice) => {
                                                        if (!dia) {
                                                            return (
                                                                <div
                                                                    key={`vacio-${indice}`}
                                                                />
                                                            );
                                                        }

                                                        const fecha =
                                                            obtenerFechaLocal(
                                                                dia,
                                                            );

                                                        const pasado =
                                                            fecha < hoy;

                                                        const seleccionado =
                                                            fecha ===
                                                            form.data.fecha;

                                                        return (
                                                            <button
                                                                key={fecha}
                                                                type="button"
                                                                disabled={
                                                                    pasado
                                                                }
                                                                onClick={() =>
                                                                    cambiarFecha(
                                                                        fecha,
                                                                    )
                                                                }
                                                                className={`aspect-square rounded-md text-xs transition ${
                                                                    seleccionado
                                                                        ? 'bg-teal-700 font-semibold text-white'
                                                                        : pasado
                                                                          ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                                                          : 'text-slate-700 hover:bg-teal-50'
                                                                }`}
                                                            >
                                                                {dia.getDate()}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            <p className="mt-3 text-xs text-slate-400">
                                                Selecciona una fecha para
                                                consultar sus horarios.
                                            </p>
                                        </div>

                                        {/* Horarios */}
                                        <div>
                                            <div className="mb-3 flex items-center gap-2">
                                                <CalendarDays
                                                    size={16}
                                                    className="text-teal-700"
                                                />
                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    {formatearFecha(
                                                        form.data.fecha,
                                                    )}
                                                </h3>
                                            </div>

                                            {cargandoHorarios ? (
                                                <p className="py-5 text-sm text-slate-500">
                                                    Consultando
                                                    disponibilidad...
                                                </p>
                                            ) : errorHorarios ? (
                                                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                                    {errorHorarios}
                                                </p>
                                            ) : horarios.length === 0 ? (
                                                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                                                    No hay horarios registrados
                                                    para este día.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {horarios.map((horario) => (
                                                        <button
                                                            key={
                                                                horario.hora_inicio
                                                            }
                                                            type="button"
                                                            disabled={
                                                                !horario.disponible
                                                            }
                                                            onClick={() =>
                                                                form.setData(
                                                                    'hora_inicio',
                                                                    horario.hora_inicio,
                                                                )
                                                            }
                                                            className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-xs transition ${
                                                                form.data
                                                                    .hora_inicio ===
                                                                horario.hora_inicio
                                                                    ? 'border-teal-700 bg-teal-700 text-white'
                                                                    : horario.disponible
                                                                      ? 'border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-500'
                                                                      : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                            }`}
                                                        >
                                                            <span className="font-semibold">
                                                                {formatearHora(
                                                                    horario.hora_inicio,
                                                                )}
                                                                {' – '}
                                                                {formatearHora(
                                                                    horario.hora_fin,
                                                                )}
                                                            </span>

                                                            <span>
                                                                {form.data
                                                                    .hora_inicio ===
                                                                horario.hora_inicio
                                                                    ? 'Seleccionado'
                                                                    : horario.disponible
                                                                      ? 'Libre'
                                                                      : 'Ocupado'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                                    <Info
                                        size={16}
                                        className="mt-0.5 shrink-0 text-slate-500"
                                    />
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Los horarios se calculan según la
                                        jornada del profesional y las citas
                                        registradas en el sistema.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Resumen y confirmación */}
                        <aside className="space-y-4 lg:sticky lg:top-5">
                            <section className="rounded-xl border border-teal-100 bg-teal-50 p-5">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    4. Revisión de la reserva
                                </h2>

                                <p className="mt-4 text-xs font-medium text-teal-700">
                                    Propuesta · Sin confirmar
                                </p>

                                <p className="mt-3 text-xl font-semibold text-teal-700 capitalize">
                                    {formatearFecha(form.data.fecha)}
                                </p>

                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <Clock size={16} />
                                    {horarioSeleccionado
                                        ? `${formatearHora(horarioSeleccionado.hora_inicio)}–${formatearHora(horarioSeleccionado.hora_fin)} h`
                                        : 'Selecciona un horario'}
                                </p>

                                <div className="mt-4 space-y-1 text-xs leading-relaxed text-slate-600">
                                    <p>
                                        {medicoSeleccionado
                                            ? medicoSeleccionado.nombre
                                            : 'Profesional no seleccionado'}
                                    </p>
                                    <p>
                                        {medicoSeleccionado?.especialidad ??
                                            'Especialidad no seleccionada'}
                                    </p>
                                    <p>
                                        {medicoSeleccionado?.consultorio
                                            ? `Consultorio ${medicoSeleccionado.consultorio}`
                                            : ''}
                                    </p>
                                </div>

                                <p className="mt-4 border-t border-teal-100 pt-3 text-xs text-slate-500">
                                    {medicoSeleccionado
                                        ? `Duración: ${medicoSeleccionado.duracion_cita} minutos.`
                                        : 'La duración dependerá del profesional.'}
                                </p>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5">
                                <label
                                    htmlFor="motivo"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Motivo de la cita
                                    <span className="text-red-500"> *</span>
                                </label>

                                <textarea
                                    id="motivo"
                                    value={form.data.motivo}
                                    onChange={(evento) =>
                                        form.setData(
                                            'motivo',
                                            evento.target.value,
                                        )
                                    }
                                    maxLength={255}
                                    rows={4}
                                    placeholder="Describe brevemente el motivo de tu visita..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm transition outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />

                                {form.errors.motivo && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.motivo}
                                    </p>
                                )}

                                {form.errors.hora_inicio && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {form.errors.hora_inicio}
                                    </p>
                                )}

                                {form.errors.medico_id && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {form.errors.medico_id}
                                    </p>
                                )}

                                {form.errors.fecha && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {form.errors.fecha}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !form.data.medico_id ||
                                        !form.data.fecha ||
                                        !form.data.hora_inicio ||
                                        !form.data.motivo.trim() ||
                                        !horarioSeleccionado?.disponible
                                    }
                                    className="mt-4 w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Enviando solicitud...'
                                        : 'Confirmar solicitud'}
                                </button>

                                <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
                                    La disponibilidad se volverá a validar al
                                    enviar tu solicitud.
                                </p>
                            </section>
                        </aside>
                    </form>
                </div>
            </div>
        </>
    );
}
