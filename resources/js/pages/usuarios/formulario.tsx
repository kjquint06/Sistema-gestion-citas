import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { index } from '@/routes/usuarios';

export type Rol = 'paciente' | 'medico' | 'recepcionista' | 'admin';

export type Usuario = {
    id: number;
    name: string;
    email: string;
    telefono: string | null;
    rol: Rol;
};

export const ROLES: { valor: Rol; etiqueta: string }[] = [
    { valor: 'paciente', etiqueta: 'Paciente' },
    { valor: 'medico', etiqueta: 'Médico' },
    { valor: 'recepcionista', etiqueta: 'Recepcionista' },
    { valor: 'admin', etiqueta: 'Administrador' },
];

type Props = {
    accion: {
        action: string;
        method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    };
    usuario?: Usuario;
    esPropio?: boolean;
    textoBoton: string;
    /** Una sola columna, para el panel lateral de la lista */
    compacto?: boolean;
};

const claseCampo = 'h-11';

const claseSelect =
    'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30';

export default function FormularioUsuario({
    accion,
    usuario,
    esPropio = false,
    textoBoton,
    compacto = false,
}: Props) {
    const editando = usuario !== undefined;

    return (
        <Form
            {...accion}
            options={{ preserveScroll: true }}
            resetOnSuccess={!editando}
            className="space-y-5"
        >
            {({ processing, errors }) => (
                <>
                    <div
                        className={cn(
                            'grid gap-5',
                            !compacto && 'md:grid-cols-2',
                        )}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${usuario?.id ?? 'nuevo'}`}>
                                Nombre completo *
                            </Label>
                            <Input
                                id={`name-${usuario?.id ?? 'nuevo'}`}
                                name="name"
                                defaultValue={usuario?.name}
                                required
                                autoComplete="off"
                                placeholder="Ej. Irene Salas"
                                className={claseCampo}
                                aria-invalid={Boolean(errors.name)}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`email-${usuario?.id ?? 'nuevo'}`}>
                                Correo electrónico *
                            </Label>
                            <Input
                                id={`email-${usuario?.id ?? 'nuevo'}`}
                                name="email"
                                type="email"
                                defaultValue={usuario?.email}
                                required
                                autoComplete="off"
                                placeholder="correo@clinica.test"
                                className={claseCampo}
                                aria-invalid={Boolean(errors.email)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor={`telefono-${usuario?.id ?? 'nuevo'}`}
                            >
                                Teléfono
                            </Label>
                            <Input
                                id={`telefono-${usuario?.id ?? 'nuevo'}`}
                                name="telefono"
                                type="tel"
                                defaultValue={usuario?.telefono ?? ''}
                                autoComplete="off"
                                placeholder="Ej. 9999-0000"
                                className={claseCampo}
                                aria-invalid={Boolean(errors.telefono)}
                            />
                            <InputError message={errors.telefono} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`rol-${usuario?.id ?? 'nuevo'}`}>
                                Rol *
                            </Label>
                            <select
                                id={`rol-${usuario?.id ?? 'nuevo'}`}
                                name={esPropio ? undefined : 'rol'}
                                defaultValue={usuario?.rol ?? ''}
                                required
                                disabled={esPropio}
                                className={claseSelect}
                                aria-invalid={Boolean(errors.rol)}
                            >
                                <option value="" disabled>
                                    Selecciona un rol
                                </option>
                                {ROLES.map((rol) => (
                                    <option key={rol.valor} value={rol.valor}>
                                        {rol.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {esPropio && (
                                <>
                                    <input
                                        type="hidden"
                                        name="rol"
                                        value="admin"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        No puedes quitarte tu propio rol de
                                        administrador.
                                    </p>
                                </>
                            )}
                            <InputError message={errors.rol} />
                        </div>

                        <div
                            className={cn(
                                'grid gap-2',
                                !compacto && 'md:col-span-2',
                            )}
                        >
                            <Label
                                htmlFor={`password-${usuario?.id ?? 'nuevo'}`}
                            >
                                {editando ? 'Contraseña' : 'Contraseña *'}
                                {editando && (
                                    <span className="font-normal text-muted-foreground">
                                        {' '}
                                        (déjala vacía para no cambiarla)
                                    </span>
                                )}
                            </Label>
                            <PasswordInput
                                id={`password-${usuario?.id ?? 'nuevo'}`}
                                name="password"
                                required={!editando}
                                autoComplete="new-password"
                                placeholder={
                                    editando
                                        ? 'Nueva contraseña (opcional)'
                                        : 'Mínimo 8 caracteres'
                                }
                                className={claseCampo}
                                aria-invalid={Boolean(errors.password)}
                            />
                            <InputError message={errors.password} />
                        </div>
                    </div>

                    <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                        Si el rol es <strong>Médico</strong>, aquí solo se crea
                        la cuenta. Su perfil se completa en la sección Médicos.
                    </p>

                    <div
                        className={cn(
                            'flex items-center gap-3',
                            compacto ? 'flex-col-reverse' : 'justify-end',
                        )}
                    >
                        {!compacto && (
                            <Button variant="outline" asChild>
                                <Link href={index()}>Cancelar</Link>
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={processing}
                            className={cn(
                                'h-11 bg-teal-700 text-white hover:bg-teal-800',
                                compacto && 'w-full',
                            )}
                        >
                            {processing ? 'Guardando…' : textoBoton}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
