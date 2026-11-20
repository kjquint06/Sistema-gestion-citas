import { Head, Link } from '@inertiajs/react';

import { Card, CardContent } from '@/components/ui/card';
import { index as consultas } from '@/routes/consultas';
import { show as expedienteShow } from '@/routes/expedientes';

type Alergia = {
    id: number;
    alergeno: string;
    gravedad: string | null;
    reaccion: string | null;
};

type Props = {
    cita: {
        id: number;
        estado: string;
        motivo: string | null;
        fecha: string;
        inicia: string;
        termina: string;
        hora_llegada: string | null;
    };
    paciente: {
        id: number;
        nombre: string;
        edad: number | null;
        sexo: string | null;
    };
    medico: {
        nombre: string;
        especialidad: string | null;
        consultorio: string | null;
        duracion: number;
    };
    alergias: Alergia[];
    ultimaConsulta: {
        fecha: string;
        diagnostico: string | null;
        signos_vitales: {
            presion?: string;
            pulso?: number;
            peso?: number;
        } | null;
    } | null;
};

export default function ConsultaShow({
    cita,
    paciente,
    medico,
    alergias,
    ultimaConsulta,
}: Props) {
    return (
        <>
            <Head title={`Consulta de ${paciente.nombre}`} />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">
                        Consulta de {paciente.nombre}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {paciente.edad !== null && `${paciente.edad} años · `}
                        {medico.especialidad && `${medico.especialidad} · `}
                        Cita del {cita.fecha}, {cita.inicia}–{cita.termina} h
                    </p>
                </div>

                {alergias.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <p className="font-semibold">Alergias registradas</p>
                        <ul className="mt-1 list-disc pl-5">
                            {alergias.map((alergia) => (
                                <li key={alergia.id}>
                                    {alergia.alergeno}
                                    {alergia.reaccion && ` · ${alergia.reaccion}`}
                                    {alergia.gravedad &&
                                        ` · Gravedad: ${alergia.gravedad}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Registro de atención
                            </h2>
                            <p className="text-sm text-slate-500">
                                Aquí irá el formulario.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card className="rounded-2xl border border-teal-100 bg-teal-50/60 shadow-sm">
                            <CardContent className="flex flex-col gap-2 p-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Contexto de la cita
                                </h2>

                                <span className="w-fit rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 capitalize">
                                    {cita.estado.replace('_', ' ')}
                                    {cita.hora_llegada &&
                                        ` · Llegada ${cita.hora_llegada}`}
                                </span>

                                <p className="text-xl font-bold text-[#0f766e]">
                                    {cita.inicia}–{cita.termina} h
                                </p>

                                <p className="text-sm text-slate-600">
                                    {cita.motivo ?? 'Sin motivo'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {medico.nombre}
                                    {medico.consultorio &&
                                        ` · ${medico.consultorio}`}
                                    {` · ${medico.duracion} min`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="flex flex-col gap-2 p-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Último registro
                                </h2>

                                {ultimaConsulta === null ? (
                                    <p className="text-sm text-slate-500">
                                        Es la primera consulta de este paciente.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-xs text-slate-500">
                                            {ultimaConsulta.fecha}
                                        </p>

                                        {ultimaConsulta.signos_vitales && (
                                            <p className="text-sm text-slate-700">
                                                {ultimaConsulta.signos_vitales.presion &&
                                                    `${ultimaConsulta.signos_vitales.presion} mmHg`}
                                                {ultimaConsulta.signos_vitales.pulso &&
                                                    ` · ${ultimaConsulta.signos_vitales.pulso} lpm`}
                                                {ultimaConsulta.signos_vitales.peso &&
                                                    ` · ${ultimaConsulta.signos_vitales.peso} kg`}
                                            </p>
                                        )}

                                        <p className="text-sm text-slate-700">
                                            {ultimaConsulta.diagnostico ??
                                                'Sin diagnóstico'}
                                        </p>

                                        <Link
                                            href={expedienteShow(paciente.id)}
                                            className="text-sm font-medium text-[#0f766e] hover:underline"
                                        >
                                            Ver expediente previo →
                                        </Link>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ConsultaShow.layout = {
    breadcrumbs: [
        {
            title: 'Consultas',
            href: consultas(),
        },
    ],
};