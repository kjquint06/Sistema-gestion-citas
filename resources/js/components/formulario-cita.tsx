import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/agenda';

export type PacienteOpcion = {
    id: number;
    nombre: string;
};

export type MedicoOpcion = {
    id: number;
    nombre: string;
    especialidad: string;
    duracion_cita: number;
    consultorio: string | null;
};

export type ValoresCita = {
    paciente_id: number | null;
    medico_id: number | null;
    fecha: string;
    hora_inicio: string | null;
    hora_llegada: string | null;
    estado: string;
    motivo: string | null;
};

const ETIQUETAS_ESTADO: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    en_espera: 'En espera',
    en_consulta: 'En consulta',
    atendida: 'Atendida',
    cancelada: 'Cancelada',
    inasistencia: 'Inasistencia',
};

const claseSelect =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

type Props = {
    accion: Pick<ComponentProps<typeof Form>, 'action' | 'method'>;
    valores: ValoresCita;
    pacientes: PacienteOpcion[];
    medicos: MedicoOpcion[];
    estados?: string[];
    textoBoton: string;
};

export default function FormularioCita({
    accion,
    valores,
    pacientes,
    medicos,
    estados,
    textoBoton,
}: Props) {
    const [medicoId, setMedicoId] = useState(
        valores.medico_id ? String(valores.medico_id) : '',
    );
    const medico = medicos.find((item) => String(item.id) === medicoId);

    return (
        <Form
            {...accion}
            className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="paciente_id">Paciente</Label>
                            <select
                                id="paciente_id"
                                name="paciente_id"
                                defaultValue={valores.paciente_id ?? ''}
                                className={claseSelect}
                            >
                                <option value="" disabled>
                                    Elige un paciente
                                </option>
                                {pacientes.map((paciente) => (
                                    <option
                                        key={paciente.id}
                                        value={paciente.id}
                                    >
                                        {paciente.nombre}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.paciente_id} />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="medico_id">Médico</Label>
                            <select
                                id="medico_id"
                                name="medico_id"
                                value={medicoId}
                                onChange={(evento) =>
                                    setMedicoId(evento.target.value)
                                }
                                className={claseSelect}
                            >
                                <option value="" disabled>
                                    Elige un médico
                                </option>
                                {medicos.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre} ({item.especialidad})
                                    </option>
                                ))}
                            </select>
                            {medico && (
                                <p className="text-xs text-muted-foreground">
                                    Duración de la cita: {medico.duracion_cita}{' '}
                                    min
                                    {medico.consultorio
                                        ? ` · ${medico.consultorio}`
                                        : ''}
                                </p>
                            )}
                            <InputError message={errors.medico_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fecha">Fecha</Label>
                            <Input
                                id="fecha"
                                name="fecha"
                                type="date"
                                defaultValue={valores.fecha}
                            />
                            <InputError message={errors.fecha} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hora_inicio">Hora de la cita</Label>
                            <Input
                                id="hora_inicio"
                                name="hora_inicio"
                                type="time"
                                defaultValue={valores.hora_inicio ?? ''}
                            />
                            <InputError message={errors.hora_inicio} />
                        </div>

                        {estados && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        defaultValue={valores.estado}
                                        className={claseSelect}
                                    >
                                        {estados.map((estado) => (
                                            <option key={estado} value={estado}>
                                                {ETIQUETAS_ESTADO[estado] ??
                                                    estado}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.estado} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hora_llegada">
                                        Hora de llegada del paciente
                                    </Label>
                                    <Input
                                        id="hora_llegada"
                                        name="hora_llegada"
                                        type="time"
                                        defaultValue={
                                            valores.hora_llegada ?? ''
                                        }
                                    />
                                    <InputError message={errors.hora_llegada} />
                                </div>
                            </>
                        )}

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="motivo">Motivo de la consulta</Label>
                            <Input
                                id="motivo"
                                name="motivo"
                                defaultValue={valores.motivo ?? ''}
                                placeholder="Ej. Control general"
                            />
                            <InputError message={errors.motivo} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {textoBoton}
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={index()}>Cancelar</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}