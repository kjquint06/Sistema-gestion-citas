import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import MedicoController from '@/actions/App/Http/Controllers/MedicoController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index } from '@/routes/medicos';

type Especialidad = {
    id: number;
    nombre: string;
};

type UsuarioDisponible = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    especialidades: Especialidad[];
    usuarios_disponibles: UsuarioDisponible[];
};

const claseSelect =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-background [&>option]:text-foreground';

export default function MedicosCreate({
    especialidades,
    usuarios_disponibles,
}: Props) {
    const [modo, setModo] = useState<'existente' | 'nuevo'>(
        usuarios_disponibles.length > 0 ? 'existente' : 'nuevo',
    );

    return (
        <>
            <Head title="Nuevo médico" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Nuevo médico</h1>
                    <p className="text-sm text-muted-foreground">
                        Vincula un usuario con rol médico o crea uno nuevo.
                    </p>
                </div>

                <Form
                    {...MedicoController.store.form()}
                    className="max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="modo_usuario"
                                value={modo}
                            />

                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium">
                                    Usuario del médico
                                </legend>

                                <div className="flex flex-wrap gap-6 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={modo === 'existente'}
                                            onChange={() =>
                                                setModo('existente')
                                            }
                                        />
                                        Usar un usuario existente
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={modo === 'nuevo'}
                                            onChange={() => setModo('nuevo')}
                                        />
                                        Crear un usuario nuevo
                                    </label>
                                </div>
                            </fieldset>

                            {modo === 'existente' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="usuario_id">Usuario</Label>

                                    {usuarios_disponibles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No hay usuarios con rol médico sin
                                            vincular. Crea uno nuevo.
                                        </p>
                                    ) : (
                                        <select
                                            id="usuario_id"
                                            name="usuario_id"
                                            defaultValue=""
                                            className={claseSelect}
                                        >
                                            <option value="" disabled>
                                                Selecciona un usuario
                                            </option>
                                            {usuarios_disponibles.map(
                                                (usuario) => (
                                                    <option
                                                        key={usuario.id}
                                                        value={usuario.id}
                                                    >
                                                        {usuario.name} (
                                                        {usuario.email})
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    )}

                                    <InputError message={errors.usuario_id} />
                                </div>
                            )}

                            {modo === 'nuevo' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="off"
                                            placeholder="Nombre completo"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Correo</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="off"
                                            placeholder="correo@clinica.test"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="telefono">
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="telefono"
                                            name="telefono"
                                            autoComplete="off"
                                            placeholder="99999999"
                                        />
                                        <InputError message={errors.telefono} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Contraseña
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder="Contraseña"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="especialidad_id">
                                        Especialidad
                                    </Label>
                                    <select
                                        id="especialidad_id"
                                        name="especialidad_id"
                                        defaultValue=""
                                        className={claseSelect}
                                    >
                                        <option value="" disabled>
                                            Selecciona una especialidad
                                        </option>
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
                                        placeholder="CMH-0000"
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
                                        defaultValue={30}
                                    />
                                    <InputError
                                        message={errors.duracion_cita}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Guardar
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

MedicosCreate.layout = {
    breadcrumbs: [
        { title: 'Médicos', href: index() },
        { title: 'Nuevo médico', href: create() },
    ],
};
