import { Head,router } from '@inertiajs/react';

import { Card, CardContent } from '@/components/ui/card';
import { index as consultas, iniciar } from '@/routes/consultas';

type CitaHoy = {
    id: number;
    hora: string;
    paciente: string;
    motivo: string | null;
    estado: string;
};

type Props = {
    citasHoy: CitaHoy[];
};

const estados: Record<string, { texto: string; clase: string }> = {
    pendiente: { texto: 'Pendiente', clase: 'bg-slate-100 text-slate-700' },
    confirmada: { texto: 'Confirmada', clase: 'bg-teal-50 text-teal-700' },
    en_espera: { texto: 'En espera', clase: 'bg-amber-100 text-amber-800' },
    en_consulta: { texto: 'En consulta', clase: 'bg-indigo-100 text-indigo-800' },
    atendida: { texto: 'Atendida', clase: 'bg-green-100 text-green-800' },
    inasistencia: { texto: 'Inasistencia', clase: 'bg-orange-100 text-orange-800' },
};

const ESTADOS_INICIABLES = [
    'pendiente',
    'confirmada',
    'en_espera',
    'en_consulta',
];


export default function ConsultasIndex({ citasHoy }: Props) {
    return (
        <>
            <Head title="Consultas" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">Consultas</h1>
                    <p className="text-muted-foreground">
                        Citas de hoy. Elige una para empezar la consulta.
                    </p>
                </div>

                <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        {citasHoy.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No tienes citas programadas para hoy.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {citasHoy.map((cita) => (
                                    <li
                                        key={cita.id}
                                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-[#0f766e]">
                                                {cita.hora}
                                            </span>

                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {cita.paciente}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {cita.motivo ?? 'Sin motivo'}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                                estados[cita.estado]?.clase ??
                                                'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {estados[cita.estado]?.texto ??
                                                cita.estado}
                                        </span>

                                        <button
                                                type="button"
                                                disabled={!ESTADOS_INICIABLES.includes(cita.estado)}
                                                onClick={() => router.patch(iniciar.url(cita.id))}
                                                className="rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-[#0d655e] disabled:cursor-not-allowed disabled:bg-slate-300"
                                            >
                                                Iniciar consulta
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ConsultasIndex.layout = {
    breadcrumbs: [
        {
            title: 'Consultas',
            href: consultas(),
        },
    ],
};