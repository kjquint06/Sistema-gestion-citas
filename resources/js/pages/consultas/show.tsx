import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { guardar, index as consultas } from '@/routes/consultas';
import { show as expedienteShow } from '@/routes/expedientes';

type Alergia = {
    id: number;
    alergeno: string;
    gravedad: string | null;
    reaccion: string | null;
};

type Antecedente = {
    id: number;
    tipo: string;
    descripcion: string;
    fecha: string | null;
};

type AntecedenteFila = {
    tipo: string;
    fecha: string;
    descripcion: string;
};

type AlergiaFila = {
    alergeno: string;
    gravedad: string;
    reaccion: string;
};

const TIPOS_ANTECEDENTE = [
    { valor: 'personal', texto: 'Personal' },
    { valor: 'familiar', texto: 'Familiar' },
    { valor: 'quirurgico', texto: 'Quirúrgico' },
    { valor: 'habitos', texto: 'Hábitos' },
];

const GRAVEDADES = [
    { valor: 'por_evaluar', texto: 'Por evaluar' },
    { valor: 'leve', texto: 'Leve' },
    { valor: 'moderada', texto: 'Moderada' },
    { valor: 'grave', texto: 'Grave' },
];

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
    antecedentes: Antecedente[];
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

type RecetaFila = {
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
};

type FormularioConsulta = {
    sintomas: string;
    diagnostico: string;
    notas: string;
    signos_vitales: { presion: string; pulso: string; peso: string };
    recetas: RecetaFila[];
    antecedentes_nuevos: AntecedenteFila[];
    alergias_nuevas: AlergiaFila[];
};

const estiloCampo =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0f766e]';

function Etiqueta({
    texto,
    error,
    children,
}: {
    texto: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {texto}
            {children}
            {error && (
                <span className="text-xs font-normal text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

export default function ConsultaShow({
    cita,
    paciente,
    medico,
    alergias,
    antecedentes,
    ultimaConsulta,
}: Props) {
    const { data, setData, post, processing, errors } =
        useForm<FormularioConsulta>({
            sintomas: '',
            diagnostico: '',
            notas: '',
            signos_vitales: { presion: '', pulso: '', peso: '' },
            recetas: [],
            antecedentes_nuevos: [],
            alergias_nuevas: [],
        });

    const error = (clave: string) =>
        (errors as Record<string, string | undefined>)[clave];

    const agregarReceta = () =>
        setData('recetas', [
            ...data.recetas,
            { medicamento: '', dosis: '', frecuencia: '', duracion: '' },
        ]);

    const quitarReceta = (indice: number) =>
        setData(
            'recetas',
            data.recetas.filter((_, i) => i !== indice),
        );

    const cambiarReceta = (
        indice: number,
        campo: keyof RecetaFila,
        valor: string,
    ) =>
        setData(
            'recetas',
            data.recetas.map((fila, i) =>
                i === indice ? { ...fila, [campo]: valor } : fila,
            ),
        );

    const agregarAntecedente = () =>
        setData('antecedentes_nuevos', [
            ...data.antecedentes_nuevos,
            { tipo: 'personal', fecha: '', descripcion: '' },
        ]);

    const quitarAntecedente = (indice: number) =>
        setData(
            'antecedentes_nuevos',
            data.antecedentes_nuevos.filter((_, i) => i !== indice),
        );

    const cambiarAntecedente = (
        indice: number,
        campo: keyof AntecedenteFila,
        valor: string,
    ) =>
        setData(
            'antecedentes_nuevos',
            data.antecedentes_nuevos.map((fila, i) =>
                i === indice ? { ...fila, [campo]: valor } : fila,
            ),
        );

    const agregarAlergia = () =>
        setData('alergias_nuevas', [
            ...data.alergias_nuevas,
            { alergeno: '', gravedad: 'por_evaluar', reaccion: '' },
        ]);

    const quitarAlergia = (indice: number) =>
        setData(
            'alergias_nuevas',
            data.alergias_nuevas.filter((_, i) => i !== indice),
        );

    const cambiarAlergia = (
        indice: number,
        campo: keyof AlergiaFila,
        valor: string,
    ) =>
        setData(
            'alergias_nuevas',
            data.alergias_nuevas.map((fila, i) =>
                i === indice ? { ...fila, [campo]: valor } : fila,
            ),
        );

    const finalizar = (e: FormEvent) => {
        e.preventDefault();
        post(guardar.url(cita.id));
    };

    return (
        <>
            <Head title={`Consulta de ${paciente.nombre}`} />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                {/* ENCABEZADO */}

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

                {/* ALERTA DE ALERGIAS */}

                {alergias.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <p className="font-semibold">Alergias registradas</p>
                        <ul className="mt-1 list-disc pl-5">
                            {alergias.map((alergia) => (
                                <li key={alergia.id}>
                                    {alergia.alergeno}
                                    {alergia.reaccion &&
                                        ` · ${alergia.reaccion}`}
                                    {alergia.gravedad &&
                                        ` · Gravedad: ${alergia.gravedad}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* FORMULARIO */}

                    <form
                        id="formulario-consulta"
                        onSubmit={finalizar}
                        className="flex flex-col gap-6 lg:col-span-2"
                    >
                        {error('estado') && (
                            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                {error('estado')}
                            </p>
                        )}

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="flex flex-col gap-4 p-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Registro de atención
                                </h2>

                                <Etiqueta
                                    texto="Síntomas"
                                    error={error('sintomas')}
                                >
                                    <textarea
                                        rows={3}
                                        value={data.sintomas}
                                        onChange={(e) =>
                                            setData('sintomas', e.target.value)
                                        }
                                        placeholder="Síntomas referidos durante la consulta"
                                        className={estiloCampo}
                                    />
                                </Etiqueta>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Etiqueta
                                        texto="Presión arterial (mmHg)"
                                        error={error('signos_vitales.presion')}
                                    >
                                        <input
                                            value={data.signos_vitales.presion}
                                            onChange={(e) =>
                                                setData('signos_vitales', {
                                                    ...data.signos_vitales,
                                                    presion: e.target.value,
                                                })
                                            }
                                            placeholder="120/80"
                                            className={estiloCampo}
                                        />
                                    </Etiqueta>

                                    <Etiqueta
                                        texto="Pulso (lpm)"
                                        error={error('signos_vitales.pulso')}
                                    >
                                        <input
                                            type="number"
                                            value={data.signos_vitales.pulso}
                                            onChange={(e) =>
                                                setData('signos_vitales', {
                                                    ...data.signos_vitales,
                                                    pulso: e.target.value,
                                                })
                                            }
                                            className={estiloCampo}
                                        />
                                    </Etiqueta>

                                    <Etiqueta
                                        texto="Peso (kg)"
                                        error={error('signos_vitales.peso')}
                                    >
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.signos_vitales.peso}
                                            onChange={(e) =>
                                                setData('signos_vitales', {
                                                    ...data.signos_vitales,
                                                    peso: e.target.value,
                                                })
                                            }
                                            className={estiloCampo}
                                        />
                                    </Etiqueta>
                                </div>

                                <Etiqueta
                                    texto="Diagnóstico"
                                    error={error('diagnostico')}
                                >
                                    <input
                                        value={data.diagnostico}
                                        onChange={(e) =>
                                            setData(
                                                'diagnostico',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Registrar diagnóstico"
                                        className={estiloCampo}
                                    />
                                </Etiqueta>

                                <Etiqueta
                                    texto="Notas de consulta"
                                    error={error('notas')}
                                >
                                    <textarea
                                        rows={3}
                                        value={data.notas}
                                        onChange={(e) =>
                                            setData('notas', e.target.value)
                                        }
                                        placeholder="Observaciones y seguimiento"
                                        className={estiloCampo}
                                    />
                                </Etiqueta>
                            </CardContent>
                        </Card>

                        {/* NUEVA RECETA */}

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="flex flex-col gap-4 p-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Nueva receta
                                </h2>

                                {data.recetas.length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        Sin medicamentos. Añade uno si vas a
                                        recetar.
                                    </p>
                                )}

                                {data.recetas.map((fila, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                                    >
                                        <Etiqueta
                                            texto="Medicamento"
                                            error={error(
                                                `recetas.${i}.medicamento`,
                                            )}
                                        >
                                            <input
                                                value={fila.medicamento}
                                                onChange={(e) =>
                                                    cambiarReceta(
                                                        i,
                                                        'medicamento',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nombre"
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>

                                        <Etiqueta
                                            texto="Dosis"
                                            error={error(`recetas.${i}.dosis`)}
                                        >
                                            <input
                                                value={fila.dosis}
                                                onChange={(e) =>
                                                    cambiarReceta(
                                                        i,
                                                        'dosis',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Dosis / vía"
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>

                                        <Etiqueta
                                            texto="Frecuencia"
                                            error={error(
                                                `recetas.${i}.frecuencia`,
                                            )}
                                        >
                                            <input
                                                value={fila.frecuencia}
                                                onChange={(e) =>
                                                    cambiarReceta(
                                                        i,
                                                        'frecuencia',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Frecuencia"
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>

                                        <Etiqueta
                                            texto="Duración"
                                            error={error(
                                                `recetas.${i}.duracion`,
                                            )}
                                        >
                                            <input
                                                value={fila.duracion}
                                                onChange={(e) =>
                                                    cambiarReceta(
                                                        i,
                                                        'duracion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Duración"
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>

                                        <button
                                            type="button"
                                            onClick={() => quitarReceta(i)}
                                            aria-label="Quitar medicamento"
                                            className="mt-6 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={agregarReceta}
                                    className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                                >
                                    + Añadir medicamento
                                </button>
                            </CardContent>
                        </Card>
                    </form>

                    {/* COLUMNA DERECHA */}

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
                                                {ultimaConsulta.signos_vitales
                                                    .presion &&
                                                    `${ultimaConsulta.signos_vitales.presion} mmHg`}
                                                {ultimaConsulta.signos_vitales
                                                    .pulso &&
                                                    ` · ${ultimaConsulta.signos_vitales.pulso} lpm`}
                                                {ultimaConsulta.signos_vitales
                                                    .peso &&
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

                <section className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Antecedentes y alergias
                        </h2>
                        <p className="text-sm text-slate-500">
                            Gestión clínica del paciente atendido. Lo que añadas
                            se guarda al finalizar la consulta.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* ANTECEDENTES */}

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="flex flex-col gap-4 p-6">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Antecedentes
                                </h3>

                                {antecedentes.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Sin antecedentes registrados.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {antecedentes.map((antecedente) => (
                                            <li
                                                key={antecedente.id}
                                                className="text-sm"
                                            >
                                                <p className="font-semibold text-slate-800 capitalize">
                                                    {antecedente.tipo}
                                                    {antecedente.fecha &&
                                                        ` · ${antecedente.fecha}`}
                                                </p>
                                                <p className="text-slate-500">
                                                    {antecedente.descripcion}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {data.antecedentes_nuevos.map((fila, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4"
                                    >
                                        <div className="grid grid-cols-[1fr_1fr_auto] items-start gap-3">
                                            <Etiqueta
                                                texto="Tipo"
                                                error={error(
                                                    `antecedentes_nuevos.${i}.tipo`,
                                                )}
                                            >
                                                <select
                                                    value={fila.tipo}
                                                    onChange={(e) =>
                                                        cambiarAntecedente(
                                                            i,
                                                            'tipo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={estiloCampo}
                                                >
                                                    {TIPOS_ANTECEDENTE.map(
                                                        (tipo) => (
                                                            <option
                                                                key={tipo.valor}
                                                                value={
                                                                    tipo.valor
                                                                }
                                                            >
                                                                {tipo.texto}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </Etiqueta>

                                            <Etiqueta
                                                texto="Fecha"
                                                error={error(
                                                    `antecedentes_nuevos.${i}.fecha`,
                                                )}
                                            >
                                                <input
                                                    type="date"
                                                    value={fila.fecha}
                                                    onChange={(e) =>
                                                        cambiarAntecedente(
                                                            i,
                                                            'fecha',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={estiloCampo}
                                                />
                                            </Etiqueta>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    quitarAntecedente(i)
                                                }
                                                aria-label="Quitar antecedente"
                                                className="mt-6 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <Etiqueta
                                            texto="Descripción"
                                            error={error(
                                                `antecedentes_nuevos.${i}.descripcion`,
                                            )}
                                        >
                                            <textarea
                                                rows={2}
                                                value={fila.descripcion}
                                                onChange={(e) =>
                                                    cambiarAntecedente(
                                                        i,
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Describir nuevo antecedente..."
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={agregarAntecedente}
                                    className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                                >
                                    + Añadir antecedente
                                </button>
                            </CardContent>
                        </Card>

                        {/* ALERGIAS */}

                        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <CardContent className="flex flex-col gap-4 p-6">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Alergias
                                </h3>

                                {alergias.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Sin alergias registradas.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {alergias.map((alergia) => (
                                            <li
                                                key={alergia.id}
                                                className="text-sm"
                                            >
                                                <p className="font-semibold text-slate-800">
                                                    {alergia.alergeno}
                                                    {alergia.gravedad &&
                                                        ` · ${alergia.gravedad}`}
                                                </p>
                                                <p className="text-slate-500">
                                                    {alergia.reaccion ??
                                                        'Sin reacción indicada'}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {data.alergias_nuevas.map((fila, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4"
                                    >
                                        <div className="grid grid-cols-[1fr_1fr_auto] items-start gap-3">
                                            <Etiqueta
                                                texto="Alérgeno"
                                                error={error(
                                                    `alergias_nuevas.${i}.alergeno`,
                                                )}
                                            >
                                                <input
                                                    value={fila.alergeno}
                                                    onChange={(e) =>
                                                        cambiarAlergia(
                                                            i,
                                                            'alergeno',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Nombre del alérgeno"
                                                    className={estiloCampo}
                                                />
                                            </Etiqueta>

                                            <Etiqueta
                                                texto="Gravedad"
                                                error={error(
                                                    `alergias_nuevas.${i}.gravedad`,
                                                )}
                                            >
                                                <select
                                                    value={fila.gravedad}
                                                    onChange={(e) =>
                                                        cambiarAlergia(
                                                            i,
                                                            'gravedad',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={estiloCampo}
                                                >
                                                    {GRAVEDADES.map(
                                                        (gravedad) => (
                                                            <option
                                                                key={
                                                                    gravedad.valor
                                                                }
                                                                value={
                                                                    gravedad.valor
                                                                }
                                                            >
                                                                {gravedad.texto}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </Etiqueta>

                                            <button
                                                type="button"
                                                onClick={() => quitarAlergia(i)}
                                                aria-label="Quitar alergia"
                                                className="mt-6 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <Etiqueta
                                            texto="Reacción"
                                            error={error(
                                                `alergias_nuevas.${i}.reaccion`,
                                            )}
                                        >
                                            <textarea
                                                rows={2}
                                                value={fila.reaccion}
                                                onChange={(e) =>
                                                    cambiarAlergia(
                                                        i,
                                                        'reaccion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Describir reacción..."
                                                className={estiloCampo}
                                            />
                                        </Etiqueta>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={agregarAlergia}
                                    className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                                >
                                    + Añadir alergia
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* BARRA INFERIOR */}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        {cita.fecha} · {medico.nombre}
                    </p>

                    <button
                        type="submit"
                        form="formulario-consulta"
                        disabled={processing}
                        className="rounded-xl bg-[#0f766e] px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-[#0d655e] disabled:opacity-60"
                    >
                        Finalizar consulta
                    </button>
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
