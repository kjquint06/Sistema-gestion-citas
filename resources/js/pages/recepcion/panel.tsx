import { Head, Link } from '@inertiajs/react';
import { CalendarClock, CalendarDays, Clock, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ESTADOS } from '@/components/agenda-utils';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as agenda } from '@/routes/agenda';
import { index as pacientes, show as fichaPaciente } from '@/routes/pacientes';

type CitaPanel = {
    id: number;
    fecha: string;
    hora: string;
    paciente: string;
    paciente_id: number;
    medico: string;
    estado: string;
};

type PacienteNuevo = {
    id: number;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    registrado: string | null;
};

type Props = {
    totales: {
        citas_hoy: number;
        pendientes: number;
        pacientes_nuevos: number;
    };
    citasHoy: CitaPanel[];
    pendientes: CitaPanel[];
    pacientesNuevos: PacienteNuevo[];
};

function Tarjeta({
    titulo,
    valor,
    icono,
}: {
    titulo: string;
    valor: number;
    icono: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div>
                <p className="text-sm text-muted-foreground">{titulo}</p>
                <p className="mt-1 text-3xl font-bold">{valor}</p>
            </div>
            <div className="rounded-full bg-teal-50 p-3 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                {icono}
            </div>
        </div>
    );
}

function Estado({ estado }: { estado: string }) {
    const info = ESTADOS[estado];

    return (
        <span className="inline-flex items-center gap-2 text-xs font-medium">
            <span
                className={`size-2 rounded-full ${info?.punto ?? 'bg-gray-400'}`}
            />
            {info?.etiqueta ?? estado}
        </span>
    );
}

function Seccion({
    titulo,
    descripcion,
    accion,
    children,
}: {
    titulo: string;
    descripcion: string;
    accion?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-5">
                <div>
                    <h2 className="font-semibold">{titulo}</h2>
                    <p className="text-sm text-muted-foreground">
                        {descripcion}
                    </p>
                </div>
                {accion}
            </div>
            {children}
        </div>
    );
}

function Vacio({ texto }: { texto: string }) {
    return (
        <p className="p-6 text-center text-sm text-muted-foreground">{texto}</p>
    );
}

export default function PanelRecepcion({
    totales,
    citasHoy,
    pendientes,
    pacientesNuevos,
}: Props) {
    return (
        <>
            <Head title="Panel general" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Panel general</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen del día para recepción.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Tarjeta
                        titulo="Citas de hoy"
                        valor={totales.citas_hoy}
                        icono={<CalendarDays size={24} />}
                    />
                    <Tarjeta
                        titulo="Pendientes por confirmar"
                        valor={totales.pendientes}
                        icono={<Clock size={24} />}
                    />
                    <Tarjeta
                        titulo="Pacientes nuevos (7 días)"
                        valor={totales.pacientes_nuevos}
                        icono={<UserPlus size={24} />}
                    />
                </div>

                <Seccion
                    titulo="Citas de hoy"
                    descripcion="Ordenadas por hora. No incluye las canceladas."
                    accion={
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={agenda()}>
                                <CalendarClock size={14} />
                                Ver agenda
                            </Link>
                        </Button>
                    }
                >
                    {citasHoy.length === 0 ? (
                        <Vacio texto="No hay citas para hoy." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-4 font-medium">
                                            Hora
                                        </th>
                                        <th className="p-4 font-medium">
                                            Paciente
                                        </th>
                                        <th className="p-4 font-medium">
                                            Médico
                                        </th>
                                        <th className="p-4 font-medium">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {citasHoy.map((cita) => (
                                        <tr key={cita.id} className="border-t">
                                            <td className="p-4 font-medium">
                                                {cita.hora}
                                            </td>
                                            <td className="p-4">
                                                <Link
                                                    href={fichaPaciente(
                                                        cita.paciente_id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {cita.paciente}
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                {cita.medico}
                                            </td>
                                            <td className="p-4">
                                                <Estado estado={cita.estado} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccion>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Seccion
                        titulo="Pendientes por confirmar"
                        descripcion="Próximas citas que aún no se confirman."
                    >
                        {pendientes.length === 0 ? (
                            <Vacio texto="No hay citas pendientes por confirmar." />
                        ) : (
                            <ul className="divide-y">
                                {pendientes.map((cita) => (
                                    <li
                                        key={cita.id}
                                        className="flex items-center justify-between gap-4 p-4 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {cita.paciente}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {cita.medico}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {cita.fecha}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {cita.hora}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Seccion>

                    <Seccion
                        titulo="Pacientes nuevos"
                        descripcion="Registrados en los últimos 7 días."
                        accion={
                            <Button variant="secondary" size="sm" asChild>
                                <Link href={pacientes()}>Ver todos</Link>
                            </Button>
                        }
                    >
                        {pacientesNuevos.length === 0 ? (
                            <Vacio texto="No hay pacientes nuevos esta semana." />
                        ) : (
                            <ul className="divide-y">
                                {pacientesNuevos.map((paciente) => (
                                    <li
                                        key={paciente.id}
                                        className="flex items-center justify-between gap-4 p-4 text-sm"
                                    >
                                        <div>
                                            <Link
                                                href={fichaPaciente(
                                                    paciente.id,
                                                )}
                                                className="font-medium hover:underline"
                                            >
                                                {paciente.nombre}
                                            </Link>
                                            <p className="text-muted-foreground">
                                                {paciente.documento ??
                                                    'Sin documento'}
                                            </p>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {paciente.registrado}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Seccion>
                </div>
            </div>
        </>
    );
}

PanelRecepcion.layout = {
    breadcrumbs: [{ title: 'Panel general', href: dashboard() }],
};
