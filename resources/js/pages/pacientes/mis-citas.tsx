import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { show as expedienteShow } from '@/routes/expedientes';
import { index as miExpediente } from '@/routes/mi-expediente';

type Cita = {
    id: number;
    inicia_en: string;
    termina_en: string;
    duracion: number;
    estado: string;
    motivo: string | null;
    hora_llegada: string | null;
    medico: string;
    especialidad: string;
    consultorio: string | null;
    consulta_id: number | null;
};

type Receta = {
    id: number;
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    fecha: string;
};

type Props = {
    paciente: {
        id: number;
        nombre: string;
        expediente: string;
        edad: number | null;
    };
    proximaCita: Cita | null;
    proximas: Cita[];
    pasadas: Cita[];
    ultimaReceta: Receta | null;
};

// AYUDAS DE FORMATO

const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-HN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

const fechaLarga = (iso: string) => {
    const fecha = new Date(iso);

    const texto = fecha.toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const esHoy = fecha.toDateString() === new Date().toDateString();

    return esHoy ? `Hoy, ${texto}` : texto;
};

const fechaCorta = (iso: string) =>
    new Date(iso)
        .toLocaleDateString('es-HN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        .replace(/\./g, '');

const saludo = () => {
    const h = new Date().getHours();

    if (h < 12) {
        return 'Buenos días';
    }

    return h < 19 ? 'Buenas tardes' : 'Buenas noches';
};

const estados: Record<string, { texto: string; clase: string }> = {
    pendiente: {
        texto: 'Pendiente',
        clase: 'bg-slate-100 text-slate-700',
    },
    confirmada: {
        texto: 'Confirmada',
        clase: 'bg-teal-50 text-teal-700',
    },
    en_espera: {
        texto: 'En espera',
        clase: 'bg-amber-100 text-amber-800',
    },
    en_consulta: {
        texto: 'En consulta',
        clase: 'bg-indigo-100 text-indigo-800',
    },
    atendida: {
        texto: 'Atendida',
        clase: 'bg-green-100 text-green-800',
    },
    cancelada: {
        texto: 'Cancelada',
        clase: 'bg-red-100 text-red-800',
    },
    inasistencia: {
        texto: 'Inasistencia',
        clase: 'bg-orange-100 text-orange-800',
    },
};

// PANEL GENERAL DEL PACIENTE

export default function MisCitas({
    paciente,
    proximaCita,
    proximas,
    pasadas,
    ultimaReceta,
}: Props) {
    const cancelarCita = (citaId: number) => {
        if (
            !window.confirm(
                '¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.',
            )
        ) {
            return;
        }

        router.patch(
            `/mis-citas/${citaId}/cancelar`,
            {},
            {
                preserveScroll: true,
                onError: (errores) => window.alert(Object.values(errores)[0]),
            },
        );
    };

    // Reprogramar y cancelar solo si la cita aún no empezó su atención
    const puedeModificar =
        proximaCita !== null &&
        ['pendiente', 'confirmada'].includes(proximaCita.estado);

    return (
        <>
            <Head title="Mis citas" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50/50 p-6 lg:p-8">
                {/* ENCABEZADO */}

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {saludo()}, {paciente.nombre.split(' ')[0]}
                        </h1>

                        <p className="text-sm text-slate-500">
                            Tu espacio de paciente · Consulta tus citas y tu
                            información, sin editar el expediente clínico.
                        </p>
                    </div>

                    {/* Cuando exista la pantalla de agendar, aquí va su ruta */}
                    <Link
                        href="/mis-citas/crear"
                        className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e]"
                    >
                        <Plus className="size-4" />
                        Reservar una cita
                    </Link>
                </div>

                {/* PRÓXIMA CITA + INFORMACIÓN */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="rounded-2xl border border-teal-100 bg-teal-50/60 shadow-sm lg:col-span-2">
                        <CardContent className="p-6">
                            <h2 className="mb-3 text-lg font-bold text-slate-900">
                                Tu próxima cita
                            </h2>

                            {proximaCita === null ? (
                                <p className="text-sm text-slate-500">
                                    No tienes citas programadas. Puedes reservar
                                    una cuando lo necesites.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        <span
                                            className={`rounded-md px-2.5 py-1 font-medium ${
                                                estados[proximaCita.estado]
                                                    ?.clase ??
                                                'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {estados[proximaCita.estado]
                                                ?.texto ?? proximaCita.estado}
                                        </span>

                                        {proximaCita.hora_llegada && (
                                            <span>
                                                Llegada registrada ·{' '}
                                                {proximaCita.hora_llegada} h
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-2xl font-semibold text-[#0f766e]">
                                        {fechaLarga(proximaCita.inicia_en)}
                                    </p>

                                    <p className="text-xl font-bold text-slate-900">
                                        {hora(proximaCita.inicia_en)}–
                                        {hora(proximaCita.termina_en)} h
                                    </p>

                                    <p className="text-sm text-slate-600">
                                        {proximaCita.medico} ·{' '}
                                        {proximaCita.especialidad}
                                        {proximaCita.consultorio &&
                                            ` · ${proximaCita.consultorio}`}
                                        {proximaCita.motivo &&
                                            ` · ${proximaCita.motivo}`}
                                        {` · Duración: ${proximaCita.duracion} minutos`}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            href={`/mis-citas/${proximaCita.id}/reprogramar`}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                                                puedeModificar
                                                    ? 'bg-[#0f766e] hover:bg-[#0d655e]'
                                                    : 'pointer-events-none bg-slate-300'
                                            }`}
                                            aria-disabled={!puedeModificar}
                                            onClick={(e) => {
                                                if (!puedeModificar)
                                                    e.preventDefault();
                                            }}
                                        >
                                            Reprogramar
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                cancelarCita(proximaCita.id)
                                            }
                                            disabled={!puedeModificar}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancelar cita
                                        </button>
                                    </div>

                                    {proximaCita !== null &&
                                        !puedeModificar && (
                                            <p className="text-xs text-slate-500">
                                                Esta cita ya no se puede
                                                modificar desde este apartado.
                                                Para obtener ayuda, comunícate
                                                con recepción.
                                            </p>
                                        )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="flex flex-col gap-4 p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Tu información a mano
                            </h2>

                            <p className="text-sm text-slate-500">
                                {paciente.nombre} · {paciente.expediente}
                                {paciente.edad !== null &&
                                    ` · ${paciente.edad} años`}
                            </p>

                            <Link
                                href={miExpediente()}
                                className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                            >
                                Ver mi expediente →
                            </Link>

                            <p className="text-xs text-slate-500">
                                Consulta tu historial, documentos y recetas en
                                modo de solo lectura.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* PRÓXIMAS CITAS */}

                <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Próximas citas
                        </h2>

                        <p className="mb-4 text-xs text-slate-500">
                            Solo se muestran tus reservas.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Fecha y hora
                                        </th>
                                        <th className="px-4 py-3">
                                            Profesional
                                        </th>
                                        <th className="px-4 py-3">Motivo</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {proximas.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-6 text-center text-slate-500"
                                            >
                                                No tienes citas próximas.
                                            </td>
                                        </tr>
                                    ) : (
                                        proximas.map((cita) => (
                                            <tr
                                                key={cita.id}
                                                className="hover:bg-slate-50/50"
                                            >
                                                <td className="px-4 py-4 font-semibold text-slate-900">
                                                    {fechaCorta(cita.inicia_en)}{' '}
                                                    · {hora(cita.inicia_en)}–
                                                    {hora(cita.termina_en)}
                                                </td>

                                                <td className="px-4 py-4 text-slate-700">
                                                    {cita.medico}
                                                </td>

                                                <td className="px-4 py-4 text-slate-500">
                                                    {cita.motivo ??
                                                        'Sin motivo'}
                                                </td>

                                                <td className="px-4 py-4 text-xs font-medium text-[#0f766e]">
                                                    {estados[cita.estado]
                                                        ?.texto ?? cita.estado}
                                                    {cita.hora_llegada &&
                                                        ` · Llegada ${cita.hora_llegada}`}
                                                </td>

                                                <td className="px-4 py-4">
                                                    {[
                                                        'pendiente',
                                                        'confirmada',
                                                    ].includes(cita.estado) ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            <Link
                                                                href={`/mis-citas/${cita.id}/reprogramar`}
                                                                className="text-xs font-semibold text-teal-700"
                                                            >
                                                                Reprogramar
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    cancelarCita(
                                                                        cita.id,
                                                                    )
                                                                }
                                                                className="text-xs font-semibold text-red-600"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            No disponible
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* CITAS PASADAS + ÚLTIMA RECETA */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Citas pasadas
                            </h2>

                            <p className="mb-4 text-xs text-slate-500">
                                Consultas propias ya realizadas.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">
                                                Consulta
                                            </th>
                                            <th className="px-4 py-3">
                                                Profesional
                                            </th>
                                            <th className="px-4 py-3">
                                                Acceso
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {pasadas.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-6 text-center text-slate-500"
                                                >
                                                    Aún no tienes consultas
                                                    realizadas.
                                                </td>
                                            </tr>
                                        ) : (
                                            pasadas.map((cita) => (
                                                <tr
                                                    key={cita.id}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <td className="px-4 py-4 font-semibold text-slate-900">
                                                        {fechaCorta(
                                                            cita.inicia_en,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-700">
                                                        {cita.motivo ??
                                                            cita.especialidad}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-500">
                                                        {cita.medico}
                                                    </td>

                                                    <td className="px-4 py-4 text-xs">
                                                        {cita.consulta_id ? (
                                                            <Link
                                                                href={expedienteShow(
                                                                    paciente.id,
                                                                )}
                                                                className="font-medium text-[#0f766e] hover:underline"
                                                            >
                                                                Ver expediente →
                                                            </Link>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                Sin consulta
                                                                registrada
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="flex flex-col gap-3 p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Última receta
                            </h2>

                            <p className="text-xs text-slate-500">
                                Registro histórico · Solo lectura
                            </p>

                            {ultimaReceta === null ? (
                                <p className="text-sm text-slate-500">
                                    Aún no tienes recetas registradas.
                                </p>
                            ) : (
                                <>
                                    <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {ultimaReceta.fecha}
                                    </span>

                                    <p className="text-xl font-bold text-[#0f766e]">
                                        {ultimaReceta.medicamento}
                                    </p>

                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Dosis: {ultimaReceta.dosis} ·{' '}
                                        {ultimaReceta.frecuencia}
                                        {' · '}Duración: {ultimaReceta.duracion}
                                    </p>

                                    <Link
                                        href={expedienteShow(paciente.id)}
                                        className="text-sm font-medium text-[#0f766e] hover:underline"
                                    >
                                        Consultar recetas →
                                    </Link>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
