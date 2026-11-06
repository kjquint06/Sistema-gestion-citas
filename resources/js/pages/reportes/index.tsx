import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/reportes';

type Estado =
    | 'pendiente'
    | 'confirmada'
    | 'atendida'
    | 'cancelada'
    | 'inasistencia';

type FilaMedico = {
    id: number;
    nombre: string;
    especialidad: string;
    total: number;
} & Record<Estado, number>;

type Props = {
    filtros: { desde: string; hasta: string };
    total: number;
    porEstado: Record<Estado, number>;
    porMedico: FilaMedico[];
};

const ESTADOS: {
    clave: Estado;
    etiqueta: string;
    detalle: string;
    color: string;
}[] = [
    {
        clave: 'confirmada',
        etiqueta: 'Confirmadas',
        detalle: 'Pendientes de atención',
        color: 'text-teal-700 dark:text-teal-400',
    },
    {
        clave: 'pendiente',
        etiqueta: 'Pendientes',
        detalle: 'Por confirmar',
        color: 'text-slate-500 dark:text-slate-400',
    },
    {
        clave: 'atendida',
        etiqueta: 'Atendidas',
        detalle: 'Consultas realizadas',
        color: 'text-blue-700 dark:text-blue-400',
    },
    {
        clave: 'cancelada',
        etiqueta: 'Canceladas',
        detalle: 'Anuladas en el período',
        color: 'text-amber-700 dark:text-amber-400',
    },
];

function formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');

    return `${dia}/${mes}/${anio}`;
}

function inicioDeMes(): string {
    const hoy = new Date();

    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        .toLocaleDateString('en-CA');
}

function finDeMes(): string {
    const hoy = new Date();

    return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
        .toLocaleDateString('en-CA');
}

export default function ReportesIndex({
    filtros,
    total,
    porEstado,
    porMedico,
}: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [desde, setDesde] = useState(filtros.desde);
    const [hasta, setHasta] = useState(filtros.hasta);
    const [cargando, setCargando] = useState(false);

    const consultar = (rango: { desde: string; hasta: string }) => {
        router.get(index().url, rango, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setCargando(true),
            onFinish: () => setCargando(false),
        });
    };

    const generar = (e: FormEvent) => {
        e.preventDefault();
        consultar({ desde, hasta });
    };

    const restablecer = () => {
        const rango = { desde: inicioDeMes(), hasta: finDeMes() };
        setDesde(rango.desde);
        setHasta(rango.hasta);
        consultar(rango);
    };

    const porcentaje = (valor: number) =>
        total === 0 ? 0 : Math.round((valor / total) * 100);

    const periodo =
        filtros.desde === filtros.hasta
            ? formatearFecha(filtros.desde)
            : `${formatearFecha(filtros.desde)} al ${formatearFecha(filtros.hasta)}`;

    return (
        <>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-3xl font-semibold">Reportes</h1>
                    <p className="mt-1 text-muted-foreground">
                        Consulta la actividad de la agenda por período.
                    </p>
                </div>

                {/* Configurar reporte */}
                <form
                    onSubmit={generar}
                    className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                    <h2 className="text-xl font-semibold">
                        Configurar reporte
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Actividad de citas · Selecciona el período de la
                        consulta
                    </p>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:max-w-2xl">
                        <div className="grid gap-2">
                            <Label htmlFor="desde">Desde *</Label>
                            <Input
                                id="desde"
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                required
                                className="h-11"
                            />
                            <InputError message={errors.desde} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hasta">Hasta *</Label>
                            <Input
                                id="hasta"
                                type="date"
                                value={hasta}
                                min={desde}
                                onChange={(e) => setHasta(e.target.value)}
                                required
                                className="h-11"
                            />
                            <InputError message={errors.hasta} />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Button
                            type="submit"
                            disabled={cargando}
                            className="h-11 bg-teal-700 text-white hover:bg-teal-800"
                        >
                            <BarChart3 className="size-4" />
                            {cargando ? 'Generando…' : 'Generar reporte'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11"
                            onClick={restablecer}
                            disabled={cargando}
                        >
                            Restablecer filtros
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Período completo: 00:00–23:59 de cada día
                        </span>
                    </div>
                </form>

                {/* Resultados */}
                <div>
                    <h2 className="text-2xl font-semibold">
                        Resultados del reporte
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        {periodo} · Todos los médicos
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl bg-teal-700 p-6 text-white shadow-sm">
                        <p>Citas del período</p>
                        <p className="mt-3 text-4xl font-semibold">{total}</p>
                        <p className="mt-3 text-sm text-teal-100">
                            Total de la agenda
                        </p>
                    </div>

                    {ESTADOS.map((estado) => (
                        <div
                            key={estado.clave}
                            className="rounded-2xl border bg-card p-6 shadow-sm"
                        >
                            <p className="text-muted-foreground">
                                {estado.etiqueta}
                            </p>
                            <p
                                className={`mt-3 text-4xl font-semibold ${estado.color}`}
                            >
                                {porEstado[estado.clave]}
                            </p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {porcentaje(porEstado[estado.clave])}% ·{' '}
                                {estado.detalle}
                            </p>
                        </div>
                    ))}
                </div>

                {porEstado.inasistencia > 0 && (
                    <p className="-mt-2 text-sm text-muted-foreground">
                        Además hay {porEstado.inasistencia}{' '}
                        {porEstado.inasistencia === 1
                            ? 'inasistencia'
                            : 'inasistencias'}{' '}
                        en el período, incluidas en el total.
                    </p>
                )}

                {/* Citas por médico */}
                <section className="rounded-2xl border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold">Citas por médico</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Cantidad de citas de cada médico en el período.
                    </p>

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Médico</th>
                                    <th className="px-4 py-3">Especialidad</th>
                                    {ESTADOS.map((estado) => (
                                        <th
                                            key={estado.clave}
                                            className="px-4 py-3 text-right"
                                        >
                                            {estado.etiqueta}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right">
                                        Inasistencias
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {porMedico.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={ESTADOS.length + 4}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No hay médicos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    porMedico.map((medico) => (
                                        <tr
                                            key={medico.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-4 font-semibold">
                                                {medico.nombre}
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {medico.especialidad}
                                            </td>
                                            {ESTADOS.map((estado) => (
                                                <td
                                                    key={estado.clave}
                                                    className="px-4 py-4 text-right"
                                                >
                                                    {medico[estado.clave]}
                                                </td>
                                            ))}
                                            <td className="px-4 py-4 text-right">
                                                {medico.inasistencia}
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold">
                                                {medico.total}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}

ReportesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reportes',
            href: index(),
        },
    ],
};
