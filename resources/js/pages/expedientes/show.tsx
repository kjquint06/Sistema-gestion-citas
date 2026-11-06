import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { index } from '@/routes/expedientes';

type Paciente = {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    fecha_nacimiento: string;
    sexo: string | null;
    direccion: string | null;
    contacto_emergencia: string | null;
};

type Antecedente = {
    id: number;
    tipo: string;
    descripcion: string;
    fecha: string | null;
};

type Alergia = {
    id: number;
    alergeno: string;
    gravedad: string | null;
    reaccion: string | null;
};

type Consulta = {
    id: number;
    fecha: string;
    motivo: string | null;
    sintomas: string | null;
    diagnostico: string | null;
    notas: string | null;
    signos_vitales: Record<string, string | number> | null;
};

type Receta = {
    id: number;
    fecha: string;
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
};

type Props = {
    puede_ver_lista: boolean;
    paciente: Paciente;
    antecedentes: Antecedente[];
    alergias: Alergia[];
    consultas: Consulta[];
    recetas: Receta[];
};

const PESTANAS = [
    'Datos',
    'Antecedentes',
    'Alergias',
    'Consultas',
    'Recetas',
] as const;

type Pestana = (typeof PESTANAS)[number];

function Campo({
    etiqueta,
    valor,
}: {
    etiqueta: string;
    valor: string | null;
}) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="font-medium">{valor ?? '-'}</dd>
        </div>
    );
}

function Vacio({ texto }: { texto: string }) {
    return (
        <p className="rounded-xl border p-4 text-center text-sm text-muted-foreground">
            {texto}
        </p>
    );
}

export default function ExpedientesShow({
    puede_ver_lista,
    paciente,
    antecedentes,
    alergias,
    consultas,
    recetas,
}: Props) {
    const [pestana, setPestana] = useState<Pestana>('Datos');

    const totales: Record<Pestana, number | null> = {
        Datos: null,
        Antecedentes: antecedentes.length,
        Alergias: alergias.length,
        Consultas: consultas.length,
        Recetas: recetas.length,
    };

    return (
        <>
            <Head title={`Expediente de ${paciente.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {paciente.nombre}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {paciente.correo}
                        </p>
                    </div>
                    {puede_ver_lista && (
                        <Link
                            href={index()}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Volver a la lista
                        </Link>
                    )}
                </div>

                <div role="tablist" className="flex flex-wrap gap-1 border-b">
                    {PESTANAS.map((nombre) => (
                        <button
                            key={nombre}
                            type="button"
                            role="tab"
                            aria-selected={pestana === nombre}
                            onClick={() => setPestana(nombre)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                                pestana === nombre
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {nombre}
                            {totales[nombre] !== null
                                ? ` (${totales[nombre]})`
                                : ''}
                        </button>
                    ))}
                </div>

                {pestana === 'Datos' && (
                    <dl className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                        <Campo etiqueta="Nombre" valor={paciente.nombre} />
                        <Campo etiqueta="Correo" valor={paciente.correo} />
                        <Campo etiqueta="Teléfono" valor={paciente.telefono} />
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
                    </dl>
                )}

                {pestana === 'Antecedentes' &&
                    (antecedentes.length === 0 ? (
                        <Vacio texto="No hay antecedentes registrados." />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Tipo
                                        </th>
                                        <th className="p-3 font-medium">
                                            Descripción
                                        </th>
                                        <th className="p-3 font-medium">
                                            Fecha
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {antecedentes.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="p-3">{a.tipo}</td>
                                            <td className="p-3">
                                                {a.descripcion}
                                            </td>
                                            <td className="p-3">
                                                {a.fecha ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                {pestana === 'Alergias' &&
                    (alergias.length === 0 ? (
                        <Vacio texto="No hay alergias registradas." />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Alérgeno
                                        </th>
                                        <th className="p-3 font-medium">
                                            Gravedad
                                        </th>
                                        <th className="p-3 font-medium">
                                            Reacción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alergias.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="p-3">
                                                {a.alergeno}
                                            </td>
                                            <td className="p-3">
                                                {a.gravedad ?? '-'}
                                            </td>
                                            <td className="p-3">
                                                {a.reaccion ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                {pestana === 'Consultas' &&
                    (consultas.length === 0 ? (
                        <Vacio texto="No hay consultas registradas." />
                    ) : (
                        <div className="flex flex-col gap-3">
                            {consultas.map((c) => (
                                <div
                                    key={c.id}
                                    className="rounded-xl border p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-medium">
                                            {c.fecha}
                                        </h3>
                                        <span className="text-sm text-muted-foreground">
                                            {c.motivo ??
                                                'Sin motivo registrado'}
                                        </span>
                                    </div>
                                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                        <Campo
                                            etiqueta="Síntomas"
                                            valor={c.sintomas}
                                        />
                                        <Campo
                                            etiqueta="Diagnóstico"
                                            valor={c.diagnostico}
                                        />
                                        <Campo
                                            etiqueta="Notas"
                                            valor={c.notas}
                                        />
                                        <Campo
                                            etiqueta="Signos vitales"
                                            valor={
                                                c.signos_vitales
                                                    ? Object.entries(
                                                          c.signos_vitales,
                                                      )
                                                          .map(
                                                              ([
                                                                  clave,
                                                                  valor,
                                                              ]) =>
                                                                  `${clave}: ${String(valor)}`,
                                                          )
                                                          .join(', ')
                                                    : null
                                            }
                                        />
                                    </dl>
                                </div>
                            ))}
                        </div>
                    ))}

                {pestana === 'Recetas' &&
                    (recetas.length === 0 ? (
                        <Vacio texto="No hay recetas registradas." />
                    ) : (
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Fecha
                                        </th>
                                        <th className="p-3 font-medium">
                                            Medicamento
                                        </th>
                                        <th className="p-3 font-medium">
                                            Dosis
                                        </th>
                                        <th className="p-3 font-medium">
                                            Frecuencia
                                        </th>
                                        <th className="p-3 font-medium">
                                            Duración
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recetas.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="p-3">{r.fecha}</td>
                                            <td className="p-3">
                                                {r.medicamento}
                                            </td>
                                            <td className="p-3">{r.dosis}</td>
                                            <td className="p-3">
                                                {r.frecuencia}
                                            </td>
                                            <td className="p-3">
                                                {r.duracion}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
            </div>
        </>
    );
}

ExpedientesShow.layout = {
    breadcrumbs: [
        {
            title: 'Expedientes',
            href: index(),
        },
    ],
};
