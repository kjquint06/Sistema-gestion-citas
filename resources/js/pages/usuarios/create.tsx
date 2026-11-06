import { Head } from '@inertiajs/react';
import { create, index, store } from '@/routes/usuarios';
import FormularioUsuario from './formulario';

export default function UsuariosCreate() {
    return (
        <>
            <Head title="Nuevo usuario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-semibold">Nuevo usuario</h1>
                    <p className="mt-1 text-muted-foreground">
                        Completa los datos de la cuenta. Los campos con * son obligatorios.
                    </p>
                </div>

                <div className="max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
                    <FormularioUsuario
                        accion={store.form()}
                        textoBoton="Crear usuario"
                    />
                </div>
            </div>
        </>
    );
}

UsuariosCreate.layout = {
    breadcrumbs: [
        { title: 'Usuarios', href: index() },
        { title: 'Nuevo usuario', href: create() },
    ],
};
