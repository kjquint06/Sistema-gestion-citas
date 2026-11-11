import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { COLOR_PRINCIPAL } from '@/components/reportes-utils';

const estiloTooltip = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 12,
    color: 'var(--card-foreground)',
};
const cursor = { fill: 'rgba(128, 128, 128, 0.15)' };
const tick = { fill: 'currentColor', fontSize: 12 };
const tickMes = { fill: 'currentColor', fontSize: 11 };

function SinDatos() {
    return (
        <p className="py-10 text-center text-sm text-muted-foreground">
            No hay citas en el período.
        </p>
    );
}

export function GraficaMeses({
    datos,
}: {
    datos: { etiqueta: string; total: number }[];
}) {
    if (datos.every((dato) => dato.total === 0)) {
        return <SinDatos />;
    }

    return (
        <div className="h-64 w-full text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={datos}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="currentColor"
                        strokeOpacity={0.2}
                    />
                    <XAxis
                        dataKey="etiqueta"
                        interval={0}
                        tick={tickMes}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={tick}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip contentStyle={estiloTooltip} cursor={cursor} />
                    <Bar
                        dataKey="total"
                        name="Citas"
                        fill={COLOR_PRINCIPAL}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function GraficaBarras({
    datos,
    color = COLOR_PRINCIPAL,
}: {
    datos: { nombre: string; total: number }[];
    color?: string;
}) {
    if (datos.every((dato) => dato.total === 0)) {
        return <SinDatos />;
    }

    const alto = Math.max(180, datos.length * 44 + 40);

    return (
        <div
            className="w-full text-muted-foreground"
            style={{ height: alto }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={datos}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="currentColor"
                        strokeOpacity={0.2}
                    />
                    <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={tick}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="nombre"
                        width={140}
                        tick={tick}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip contentStyle={estiloTooltip} cursor={cursor} />
                    <Bar
                        dataKey="total"
                        name="Citas"
                        fill={color}
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function GraficaEstados({
    datos,
}: {
    datos: { etiqueta: string; valor: number; fill: string }[];
}) {
    if (datos.length === 0) {
        return <SinDatos />;
    }

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={datos}
                            dataKey="valor"
                            nameKey="etiqueta"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {datos.map((dato) => (
                                <Cell key={dato.etiqueta} fill={dato.fill} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={estiloTooltip} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <ul className="grid w-full gap-2 text-sm">
                {datos.map((dato) => (
                    <li
                        key={dato.etiqueta}
                        className="flex items-center justify-between gap-3"
                    >
                        <span className="inline-flex items-center gap-2">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: dato.fill }}
                            />
                            {dato.etiqueta}
                        </span>
                        <strong>{dato.valor}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}