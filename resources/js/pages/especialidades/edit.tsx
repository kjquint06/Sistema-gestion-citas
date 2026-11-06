import { Form, Head, Link } from '@inertiajs/react';
import EspecialidadController from '@/actions/App/Http/Controllers/EspecialidadController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/especialidades';

type Especialidad = {
    id: number;
    nombre: string;
};

export default function EspecialidadesEdit({
    especialidad,
}: {
    especialidad: Especialidad;
}) {
    return (
        <>
            <Head title="Editar especialidad" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar especialidad</h1>
                    <p className="text-sm text-muted-foreground">
                        Cambia el nombre de la especialidad.
                    </p>
                </div>

                <Form
                    {...EspecialidadController.update.form(especialidad.id)}
                    className="max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    defaultValue={especialidad.nombre}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.nombre} />
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

EspecialidadesEdit.layout = {
    breadcrumbs: [{ title: 'Especialidades', href: index() }],
};
