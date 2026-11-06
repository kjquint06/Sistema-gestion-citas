import { Head } from '@inertiajs/react';
import { index, update } from '@/routes/usuarios';
import FormularioUsuario from './formulario';
import type { Usuario } from './formulario';

export default function UsuariosEdit({
    usuario,
    esPropio,
}: {
    usuario: Usuario;
    esPropio: boolean;
}) {
    return (
        <>
            <Head title="Editar usuario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-semibold">Editar usuario</h1>
                    <p className="mt-1 text-muted-foreground">
                        Modifica los datos de {usuario.name}.
                    </p>
                </div>

                <div className="max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
                    <FormularioUsuario
                        accion={update.form(usuario.id)}
                        usuario={usuario}
                        esPropio={esPropio}
                        textoBoton="Guardar cambios"
                    />
                </div>
            </div>
        </>
    );
}

UsuariosEdit.layout = {
    breadcrumbs: [
        { title: 'Usuarios', href: index() },
        { title: 'Editar usuario', href: index() },
    ],
};
