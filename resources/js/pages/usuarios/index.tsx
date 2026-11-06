import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { create, destroy, edit, index, store } from '@/routes/usuarios';
import type { Auth } from '@/types';
import FormularioUsuario, { ROLES } from './formulario';
import type { Rol, Usuario } from './formulario';

function nombreRol(rol: Rol): string {
    return ROLES.find((r) => r.valor === rol)?.etiqueta ?? rol;
}

function iniciales(nombre: string): string {
    return nombre
        .replace(/^(Dra?\.)\s+/i, '')
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join('');
}

export default function UsuariosIndex({
    usuarios,
    filtros,
}: {
    usuarios: Usuario[];
    filtros: { rol: string };
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [aEliminar, setAEliminar] = useState<Usuario | null>(null);
    const [busqueda, setBusqueda] = useState('');

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        if (texto === '') {
            return usuarios;
        }

        return usuarios.filter(
            (u) =>
                u.name.toLowerCase().includes(texto) ||
                u.email.toLowerCase().includes(texto),
        );
    }, [usuarios, busqueda]);

    const filtrarPorRol = (rol: string) => {
        router.get(index().url, rol ? { rol } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold">Usuarios</h1>
                        <p className="mt-1 text-muted-foreground">
                            Gestiona las cuentas y los roles desde un único
                            lugar.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-teal-700 text-white hover:bg-teal-800 xl:hidden"
                    >
                        <Link href={create()}>Crear usuario</Link>
                    </Button>
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Cuentas de usuario */}
                    <section className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold">
                            Cuentas de usuario
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {visibles.length}{' '}
                            {visibles.length === 1
                                ? 'cuenta visible'
                                : 'cuentas visibles'}{' '}
                            ·{' '}
                            {filtros.rol
                                ? nombreRol(filtros.rol as Rol)
                                : 'Todos los roles'}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <div className="relative min-w-56 flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    placeholder="Buscar nombre o correo..."
                                    className="h-11 pl-9"
                                    aria-label="Buscar usuario"
                                />
                            </div>
                            <select
                                value={filtros.rol}
                                onChange={(e) => filtrarPorRol(e.target.value)}
                                aria-label="Filtrar por rol"
                                className="h-11 rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                            >
                                <option value="">Todos los roles</option>
                                {ROLES.map((rol) => (
                                    <option key={rol.valor} value={rol.valor}>
                                        {rol.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Usuario / Correo
                                        </th>
                                        <th className="px-4 py-3">Rol</th>
                                        <th className="px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="p-6 text-center text-muted-foreground"
                                            >
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibles.map((usuario) => (
                                            <tr
                                                key={usuario.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                                            {iniciales(
                                                                usuario.name,
                                                            )}
                                                        </span>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {usuario.name}
                                                                {usuario.id ===
                                                                    auth.user
                                                                        .id && (
                                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                                        (tú)
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {usuario.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
                                                        {nombreRol(usuario.rol)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                                                        <Link
                                                            href={edit(
                                                                usuario.id,
                                                            )}
                                                            className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
                                                        >
                                                            Editar
                                                        </Link>
                                                        {usuario.id !==
                                                            auth.user.id && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setAEliminar(
                                                                        usuario,
                                                                    )
                                                                }
                                                                className="text-xs text-muted-foreground hover:text-red-600 hover:underline"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Nuevo usuario */}
                    <section className="hidden rounded-2xl border bg-card p-6 shadow-sm xl:block">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold">
                                Nuevo usuario
                            </h2>
                        </div>
                        <p className="mt-3 mb-6 text-sm text-muted-foreground">
                            Completa los datos de la cuenta. Los campos con *
                            son obligatorios.
                        </p>
                        <FormularioUsuario
                            accion={store.form()}
                            textoBoton="Crear usuario"
                            compacto
                        />
                    </section>
                </div>
            </div>

            {/* Confirmación de eliminación */}
            <Dialog
                open={aEliminar !== null}
                onOpenChange={(abierto) => !abierto && setAEliminar(null)}
            >
                <DialogContent>
                    <DialogTitle>¿Eliminar este usuario?</DialogTitle>
                    <DialogDescription>
                        Se eliminará la cuenta de{' '}
                        <strong>{aEliminar?.name}</strong> ({aEliminar?.email}
                        ). Esta acción no se puede deshacer.
                    </DialogDescription>

                    {aEliminar && (
                        <Form
                            {...destroy.form(aEliminar.id)}
                            options={{ preserveScroll: true }}
                            onFinish={() => setAEliminar(null)}
                        >
                            {({ processing }) => (
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Eliminando…'
                                            : 'Sí, eliminar'}
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

UsuariosIndex.layout = {
    breadcrumbs: [{ title: 'Usuarios', href: index() }],
};
