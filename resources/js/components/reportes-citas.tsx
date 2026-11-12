import { router, usePage } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import {
    GraficaBarras,
    GraficaEstados,
    GraficaMeses,
} from '@/components/reportes-graficas';
import {
    ESTADOS_REPORTE,
    etiquetaMes,
    finDeAnio,
    finDeMes,
    formatearFecha,
    inicioDeAnio,
    inicioDeMes,
    tituloReportes,
} from '@/components/reportes-utils';
import type { ReportesProps } from '@/components/reportes-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/reportes';

export type { ReportesProps } from '@/components/reportes-utils';

function Seccion({
    titulo,
    descripcion,
    children,
}: {
    titulo: string;
    descripcion: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{titulo}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{descripcion}</p>
            {children}
        </section>
    );
}

export default function ReportesCitas({
    rol,
    filtros,
    total,
    porEstado,
    porMedico,
    porEspecialidad,
    porMes,
}: ReportesProps) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [desde, setDesde] = useState(filtros.desde);
    const [hasta, setHasta] = useState(filtros.hasta);
    const [cargando, setCargando] = useState(false);

    const consultar = (rango: { desde: string; hasta: string }) => {
        setDesde(rango.desde);
        setHasta(rango.hasta);

        router.get(index().url, rango, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setCargando(true),
            onFinish: () => setCargando(false),
        });
    };

    const generar = (evento: FormEvent) => {
        evento.preventDefault();
        consultar({ desde, hasta });
    };

    const porcentaje = (valor: number) =>
        total === 0 ? 0 : Math.round((valor / total) * 100);

    const periodo =
        filtros.desde === filtros.hasta
            ? formatearFecha(filtros.desde)
            : `${formatearFecha(filtros.desde)} al ${formatearFecha(filtros.hasta)}`;

    const datosMes = porMes.map((fila) => ({
        etiqueta: etiquetaMes(fila.mes),
        total: fila.total,
    }));
    const datosEstado = ESTADOS_REPORTE.map((estado) => ({
        etiqueta: estado.etiqueta,
        valor: porEstado[estado.clave],
        fill: estado.color,
    })).filter((dato) => dato.valor > 0);
    const datosMedico = porMedico.map((medico) => ({
        nombre: medico.nombre,
        total: medico.total,
    }));

    return (
        <div className="flex h-full flex-1 flex-col gap-5 p-6">
            <div>
                <h1 className="text-2xl font-bold">{tituloReportes(rol)}</h1>
                <p className="text-sm text-muted-foreground">
                    Actividad de la agenda por período: citas por mes,
                    especialidad, médico y estado.
                </p>
            </div>

            <form
                onSubmit={generar}
                className="rounded-xl border bg-card p-5 shadow-sm"
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                    <div className="grid gap-2">
                        <Label htmlFor="desde">Desde</Label>
                        <Input
                            id="desde"
                            type="date"
                            value={desde}
                            onChange={(evento) => setDesde(evento.target.value)}
                            required
                        />
                        <InputError message={errors.desde} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hasta">Hasta</Label>
                        <Input
                            id="hasta"
                            type="date"
                            value={hasta}
                            min={desde}
                            onChange={(evento) => setHasta(evento.target.value)}
                            required
                        />
                        <InputError message={errors.hasta} />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button type="submit" disabled={cargando}>
                        <BarChart3 className="size-4" />
                        {cargando ? 'Generando…' : 'Generar reporte'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={cargando}
                        onClick={() =>
                            consultar({
                                desde: inicioDeMes(),
                                hasta: finDeMes(),
                            })
                        }
                    >
                        Este mes
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={cargando}
                        onClick={() =>
                            consultar({
                                desde: inicioDeAnio(),
                                hasta: finDeAnio(),
                            })
                        }
                    >
                        Este año
                    </Button>
                </div>
            </form>

            <p className="text-sm text-muted-foreground">
                Resultados del {periodo} · Todos los médicos
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-primary p-4 text-primary-foreground shadow-sm">
                    <p className="text-sm">Citas del período</p>
                    <p className="mt-2 text-3xl font-semibold">{total}</p>
                </div>

                {ESTADOS_REPORTE.map((estado) => (
                    <div
                        key={estado.clave}
                        className="rounded-xl border bg-card p-4 shadow-sm"
                    >
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: estado.color }}
                            />
                            {estado.etiqueta}
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {porEstado[estado.clave]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {porcentaje(porEstado[estado.clave])}% del total
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Seccion
                    titulo="Citas por mes"
                    descripcion="Cantidad de citas de cada mes del período."
                >
                    <GraficaMeses datos={datosMes} />
                </Seccion>

                <Seccion
                    titulo="Citas por estado"
                    descripcion="Cómo se reparten las citas según su estado."
                >
                    <GraficaEstados datos={datosEstado} />
                </Seccion>

                <Seccion
                    titulo="Citas por especialidad"
                    descripcion="Cantidad de citas de cada especialidad."
                >
                    <GraficaBarras datos={porEspecialidad} color="#3b82f6" />
                </Seccion>

                <Seccion
                    titulo="Citas por médico"
                    descripcion="Cantidad de citas de cada médico."
                >
                    <GraficaBarras datos={datosMedico} color="#8b5cf6" />
                </Seccion>
            </div>

            <Seccion
                titulo="Detalle por médico"
                descripcion="Citas de cada médico según su estado."
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase">
                            <tr>
                                <th className="px-3 py-2">Médico</th>
                                <th className="px-3 py-2">Especialidad</th>
                                {ESTADOS_REPORTE.map((estado) => (
                                    <th
                                        key={estado.clave}
                                        className="px-3 py-2 text-right"
                                    >
                                        {estado.etiqueta}
                                    </th>
                                ))}
                                <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {porMedico.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={ESTADOS_REPORTE.length + 3}
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
                                        <td className="px-3 py-3 font-semibold">
                                            {medico.nombre}
                                        </td>
                                        <td className="px-3 py-3 text-muted-foreground">
                                            {medico.especialidad}
                                        </td>
                                        {ESTADOS_REPORTE.map((estado) => (
                                            <td
                                                key={estado.clave}
                                                className="px-3 py-3 text-right"
                                            >
                                                {medico[estado.clave]}
                                            </td>
                                        ))}
                                        <td className="px-3 py-3 text-right font-semibold">
                                            {medico.total}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Seccion>
        </div>
    );
}
