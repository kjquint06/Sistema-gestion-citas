import { Form, Head, Link } from '@inertiajs/react';
import MedicoController from '@/actions/App/Http/Controllers/MedicoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/medicos';

type Especialidad = {
    id: number;
    nombre: string;
};

type Medico = {
    id: number;
    nombre: string;
    correo: string;
    especialidad_id: number;
    numero_colegiado: string;
    duracion_cita: number;
};

const claseSelect =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

export default function MedicosEdit({
    medico,
    especialidades,
}: {
    medico: Medico;
    especialidades: Especialidad[];
}) {
    return (
        <>
            <Head title="Editar médico" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar médico</h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza la especialidad, el colegiado y la duración de
                        las citas.
                    </p>
                </div>

                <Form
                    {...MedicoController.update.form(medico.id)}
                    className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                                <p className="font-medium">{medico.nombre}</p>
                                <p className="text-muted-foreground">
                                    {medico.correo}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="especialidad_id">
                                        Especialidad
                                    </Label>
                                    <select
                                        id="especialidad_id"
                                        name="especialidad_id"
                                        defaultValue={medico.especialidad_id}
                                        className={claseSelect}
                                    >
                                        {especialidades.map((especialidad) => (
                                            <option
                                                key={especialidad.id}
                                                value={especialidad.id}
                                            >
                                                {especialidad.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.especialidad_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="numero_colegiado">
                                        N.º de colegiado
                                    </Label>
                                    <Input
                                        id="numero_colegiado"
                                        name="numero_colegiado"
                                        defaultValue={medico.numero_colegiado}
                                    />
                                    <InputError
                                        message={errors.numero_colegiado}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="duracion_cita">
                                        Duración de cita (minutos)
                                    </Label>
                                    <Input
                                        id="duracion_cita"
                                        name="duracion_cita"
                                        type="number"
                                        min={5}
                                        max={240}
                                        defaultValue={medico.duracion_cita}
                                    />
                                    <InputError
                                        message={errors.duracion_cita}
                                    />
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

MedicosEdit.layout = {
    breadcrumbs: [{ title: 'Médicos', href: index() }],
};
