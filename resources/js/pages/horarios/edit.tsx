import { Form, Head, Link } from '@inertiajs/react';
import HorarioController from '@/actions/App/Http/Controllers/HorarioController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/horarios';

type MedicoOpcion = {
    id: number;
    nombre: string;
};

type DiaOpcion = {
    valor: number;
    etiqueta: string;
};

type Horario = {
    id: number;
    medico_id: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
};

const claseSelect =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

export default function HorariosEdit({
    horario,
    medicos,
    dias,
}: {
    horario: Horario;
    medicos: MedicoOpcion[];
    dias: DiaOpcion[];
}) {
    return (
        <>
            <Head title="Editar horario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar horario</h1>
                    <p className="text-sm text-muted-foreground">
                        Cambia el médico, el día o las horas del bloque de
                        atención.
                    </p>
                </div>

                <Form
                    {...HorarioController.update.form(horario.id)}
                    className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="medico_id">Médico</Label>
                                    <select
                                        id="medico_id"
                                        name="medico_id"
                                        defaultValue={horario.medico_id}
                                        className={claseSelect}
                                    >
                                        {medicos.map((medico) => (
                                            <option
                                                key={medico.id}
                                                value={medico.id}
                                            >
                                                {medico.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.medico_id} />
                                </div>

                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="dia_semana">Día</Label>
                                    <select
                                        id="dia_semana"
                                        name="dia_semana"
                                        defaultValue={horario.dia_semana}
                                        className={claseSelect}
                                    >
                                        {dias.map((dia) => (
                                            <option
                                                key={dia.valor}
                                                value={dia.valor}
                                            >
                                                {dia.etiqueta}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.dia_semana} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hora_inicio">
                                        Hora de inicio
                                    </Label>
                                    <Input
                                        id="hora_inicio"
                                        name="hora_inicio"
                                        type="time"
                                        defaultValue={horario.hora_inicio}
                                    />
                                    <InputError message={errors.hora_inicio} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hora_fin">
                                        Hora de fin
                                    </Label>
                                    <Input
                                        id="hora_fin"
                                        name="hora_fin"
                                        type="time"
                                        defaultValue={horario.hora_fin}
                                    />
                                    <InputError message={errors.hora_fin} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Guardar cambios
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href={index()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

HorariosEdit.layout = {
    breadcrumbs: [
        { title: 'Horarios', href: index() },
        { title: 'Editar horario', href: '#' },
    ],
};
