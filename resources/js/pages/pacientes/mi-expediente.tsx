import { Head } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Paciente = {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    expediente: string;
    edad: number | null;
    fecha_nacimiento: string | null;
    sexo: string | null;
    direccion: string | null;
    contacto_emergencia: string | null;
};

type Alergia = {
    id: number;
    alergeno: string;
    gravedad: string | null;
    reaccion: string | null;
    registrada_en: string | null;
};

type Antecedente = {
    id: number;
    tipo: string;
    descripcion: string;
    fecha: string | null;
};

type Receta = {
    id: number;
    medicamento: string;
    dosis: string | null;
    frecuencia: string | null;
    duracion: string | null;
};

type Consulta = {
    id: number;
    fecha: string;
    medico: string;
    especialidad: string;
    motivo: string | null;
    sintomas: string | null;
    diagnostico: string | null;
    notas: string | null;
    signos_vitales: Record<string, string | number> | null;
    recetas: Receta[];
};

type Props = {
    paciente: Paciente;
    alergias: Alergia[];
    antecedentes: Antecedente[];
    consultas: Consulta[];
};

type IdPestana =
    | 'datos'
    | 'antecedentes'
    | 'alergias'
    | 'consultas'
    | 'recetas';

// Cada signo acepta varias llaves posibles por si el seeder las nombró distinto.
const SIGNOS = [
    { etiqueta: 'mmHg · Presión', claves: ['presion', 'presion_arterial'] },
    { etiqueta: 'lpm · Pulso', claves: ['pulso', 'frecuencia_cardiaca'] },
    { etiqueta: 'kg · Peso', claves: ['peso'] },
    { etiqueta: '°C · Temperatura', claves: ['temperatura'] },
];

function fechaCorta(iso: string): string {
    return new Date(iso).toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function mesYAnio(iso: string): string {
    return new Date(iso).toLocaleDateString('es-HN', {
        month: 'long',
        year: 'numeric',
    });
}

function iniciales(nombre: string): string {
    return nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
    return (
        <div>
            <p className="text-xs font-semibold">{etiqueta}</p>
            <p className="text-sm text-muted-foreground">
                {valor || 'No consignado'}
            </p>
        </div>
    );
}

export default function MiExpediente({
    paciente,
    alergias,
    antecedentes,
    consultas,
}: Props) {
    const [activa, setActiva] = useState<IdPestana>('datos');
    const [consultaId, setConsultaId] = useState<number | null>(
        consultas[0]?.id ?? null,
    );

    const totalRecetas = consultas.reduce(
        (total, c) => total + c.recetas.length,
        0,
    );

    const pestanas: {
        id: IdPestana;
        etiqueta: string;
        conteo: number | null;
    }[] = [
        { id: 'datos', etiqueta: 'Datos', conteo: null },
        {
            id: 'antecedentes',
            etiqueta: 'Antecedentes',
            conteo: antecedentes.length,
        },
        { id: 'alergias', etiqueta: 'Alergias', conteo: alergias.length },
        { id: 'consultas', etiqueta: 'Consultas', conteo: consultas.length },
        { id: 'recetas', etiqueta: 'Recetas', conteo: totalRecetas },
    ];

    const seleccionada =
        consultas.find((c) => c.id === consultaId) ?? consultas[0] ?? null;
    const esUltima =
        seleccionada !== null && seleccionada.id === consultas[0]?.id;
    const otras = consultas.filter((c) => c.id !== seleccionada?.id);

    const gruposAntecedentes = antecedentes.reduce<
        Record<string, Antecedente[]>
    >((acc, antecedente) => {
        (acc[antecedente.tipo] ??= []).push(antecedente);
        return acc;
    }, {});

    const signos = seleccionada?.signos_vitales
        ? SIGNOS.map((signo) => {
              const clave = signo.claves.find(
                  (c) =>
                      seleccionada.signos_vitales &&
                      c in seleccionada.signos_vitales,
              );
              return clave
                  ? {
                        etiqueta: signo.etiqueta,
                        valor: seleccionada.signos_vitales![clave],
                    }
                  : null;
          }).filter(
              (s): s is { etiqueta: string; valor: string | number } =>
                  s !== null,
          )
        : [];

    const consultasConRecetas = consultas.filter((c) => c.recetas.length > 0);

    return (
        <>
            <Head title="Mi expediente" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Mi expediente
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tu información clínica en un solo lugar · Acceso
                            exclusivo a tu propio expediente.
                        </p>
                    </div>
                    <Badge variant="outline">Solo lectura</Badge>
                </div>

                {/* Tarjeta del paciente */}
                <Card className="py-4">
                    <CardContent className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {iniciales(paciente.nombre)}
                        </div>
                        <div>
                            <p className="text-xl font-semibold">
                                {paciente.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {[
                                    paciente.expediente,
                                    paciente.sexo,
                                    paciente.edad !== null
                                        ? `${paciente.edad} años`
                                        : null,
                                    paciente.fecha_nacimiento,
                                    paciente.correo,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Pestañas */}
                <nav className="flex gap-6 overflow-x-auto border-b text-sm">
                    {pestanas.map((pestana) => (
                        <button
                            key={pestana.id}
                            type="button"
                            onClick={() => setActiva(pestana.id)}
                            className={
                                'border-b-2 pb-2 whitespace-nowrap ' +
                                (activa === pestana.id
                                    ? 'border-emerald-600 font-semibold text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent text-muted-foreground hover:text-foreground')
                            }
                        >
                            {pestana.etiqueta}
                            {pestana.conteo !== null && ` (${pestana.conteo})`}
                        </button>
                    ))}
                </nav>

                {/* Alerta de alergias (visible salvo en la pestaña Alergias) */}
                {alergias.length > 0 && activa !== 'alergias' && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="flex flex-col gap-1">
                            {alergias.map((alergia) => (
                                <div key={alergia.id}>
                                    <p className="text-sm font-semibold">
                                        Alergia registrada: {alergia.alergeno}
                                    </p>
                                    <p className="text-xs">
                                        {[
                                            alergia.reaccion
                                                ? `Reacción: ${alergia.reaccion}`
                                                : null,
                                            alergia.registrada_en
                                                ? `Registrada en ${mesYAnio(alergia.registrada_en)}`
                                                : null,
                                            `Gravedad: ${alergia.gravedad ?? 'por evaluar'}`,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ───────── DATOS ───────── */}
                {activa === 'datos' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos personales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 sm:grid-cols-2">
                            <Campo etiqueta="Nombre" valor={paciente.nombre} />
                            <Campo etiqueta="Correo" valor={paciente.correo} />
                            <Campo
                                etiqueta="Teléfono"
                                valor={paciente.telefono}
                            />
                            <Campo
                                etiqueta="Fecha de nacimiento"
                                valor={paciente.fecha_nacimiento}
                            />
                            <Campo etiqueta="Sexo" valor={paciente.sexo} />
                            <Campo
                                etiqueta="Dirección"
                                valor={paciente.direccion}
                            />
                            <Campo
                                etiqueta="Contacto de emergencia"
                                valor={paciente.contacto_emergencia}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* ───────── ANTECEDENTES ───────── */}
                {activa === 'antecedentes' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Antecedentes</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Información histórica conservada
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            {antecedentes.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No tienes antecedentes registrados.
                                </p>
                            )}
                            {Object.entries(gruposAntecedentes).map(
                                ([tipo, items]) => (
                                    <div key={tipo}>
                                        <p className="text-xs font-semibold capitalize">
                                            {tipo}
                                        </p>
                                        <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                                            {items.map((item) => (
                                                <li key={item.id}>
                                                    {item.descripcion}
                                                    {item.fecha
                                                        ? ` · ${item.fecha}`
                                                        : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ───────── ALERGIAS ───────── */}
                {activa === 'alergias' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Alergias</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {alergias.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No tienes alergias registradas.
                                </p>
                            )}
                            {alergias.map((alergia) => (
                                <div
                                    key={alergia.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {alergia.alergeno}
                                        </p>
                                        <Badge variant="outline">
                                            Gravedad:{' '}
                                            {alergia.gravedad ?? 'por evaluar'}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {alergia.reaccion
                                            ? `Reacción: ${alergia.reaccion}`
                                            : 'Reacción no consignada'}
                                    </p>
                                    {alergia.registrada_en && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Registrada en{' '}
                                            {mesYAnio(alergia.registrada_en)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* ───────── CONSULTAS ───────── */}
                {activa === 'consultas' && (
                    <>
                        {!seleccionada && (
                            <Card>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Todavía no tienes consultas registradas.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {seleccionada && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {esUltima
                                            ? 'Última consulta'
                                            : 'Consulta'}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {fechaCorta(seleccionada.fecha)} ·
                                        Atiende {seleccionada.medico} ·{' '}
                                        {seleccionada.especialidad}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <Campo
                                        etiqueta="Motivo"
                                        valor={seleccionada.motivo}
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Campo
                                            etiqueta="Síntomas"
                                            valor={seleccionada.sintomas}
                                        />
                                        <Campo
                                            etiqueta="Diagnóstico"
                                            valor={seleccionada.diagnostico}
                                        />
                                    </div>
                                    <Campo
                                        etiqueta="Notas"
                                        valor={seleccionada.notas}
                                    />

                                    {signos.length > 0 && (
                                        <div>
                                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
                                                {signos.map((signo) => (
                                                    <div key={signo.etiqueta}>
                                                        <p className="text-xl font-semibold">
                                                            {signo.valor}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {signo.etiqueta}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Signos registrados el{' '}
                                                {fechaCorta(seleccionada.fecha)}
                                                . No son mediciones de hoy.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {otras.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {esUltima
                                            ? 'Consultas anteriores'
                                            : 'Otras consultas'}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Haz clic en una fila para ver el
                                        detalle.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                                                <th className="px-3 py-2 font-medium">
                                                    FECHA
                                                </th>
                                                <th className="px-3 py-2 font-medium">
                                                    MOTIVO
                                                </th>
                                                <th className="px-3 py-2 font-medium">
                                                    AUTOR
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otras.map((consulta) => (
                                                <tr
                                                    key={consulta.id}
                                                    onClick={() =>
                                                        setConsultaId(
                                                            consulta.id,
                                                        )
                                                    }
                                                    className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                                                >
                                                    <td className="px-3 py-3 font-medium">
                                                        {fechaCorta(
                                                            consulta.fecha,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {consulta.motivo ??
                                                            'No consignado'}
                                                    </td>
                                                    <td className="px-3 py-3 text-emerald-700 dark:text-emerald-400">
                                                        {consulta.medico}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* ───────── RECETAS ───────── */}
                {activa === 'recetas' && (
                    <>
                        {consultasConRecetas.length === 0 && (
                            <Card>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        No tienes recetas registradas.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {consultasConRecetas.map((consulta) => (
                            <Card key={consulta.id}>
                                <CardHeader>
                                    <CardTitle>
                                        Receta del {fechaCorta(consulta.fecha)}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {consulta.medico} ·{' '}
                                        {consulta.especialidad}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                                                <th className="px-3 py-2 font-medium">
                                                    MEDICAMENTO
                                                </th>
                                                <th className="px-3 py-2 font-medium">
                                                    FRECUENCIA
                                                </th>
                                                <th className="px-3 py-2 font-medium">
                                                    DURACIÓN
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consulta.recetas.map((receta) => (
                                                <tr
                                                    key={receta.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-3 font-medium">
                                                        {[
                                                            receta.medicamento,
                                                            receta.dosis,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {receta.frecuencia ??
                                                            'No registrada'}
                                                    </td>
                                                    <td className="px-3 py-3 text-emerald-700 dark:text-emerald-400">
                                                        {receta.duracion ??
                                                            'No registrada'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        ))}

                        {consultasConRecetas.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Solo lectura · Registro histórico, no indicación
                                médica.
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
