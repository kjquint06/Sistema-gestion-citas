import { Head } from '@inertiajs/react';
import { index } from '@/routes/usuarios';
import { Users, Mail, Phone } from 'lucide-react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    rol: string;
    telefono: string | null;
};

export default function UsuariosIndex({ usuarios }: { usuarios: Usuario[] }) {
    const nombreRol = (rol: string) => {
        const roles: Record<string, string> = {
            admin: 'Administrador',
            medico: 'Médico',
            paciente: 'Paciente',
            recepcionista: 'Recepcionista',
        };

        return roles[rol] ?? rol;
    };

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                            <Users size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Gestión de usuarios
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Consulta y visualiza los usuarios registrados en
                                el sistema.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total de usuarios */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total de usuarios
                            </p>
                            <p className="mt-1 text-3xl font-bold">
                                {usuarios.length}
                            </p>
                        </div>

                        <div className="rounded-full bg-teal-50 p-3 text-teal-700">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">Usuarios registrados</h2>
                        <p className="text-sm text-muted-foreground">
                            Información general de las cuentas del sistema.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 font-medium">Usuario</th>
                                    <th className="p-4 font-medium">
                                        Correo electrónico
                                    </th>
                                    <th className="p-4 font-medium">
                                        Teléfono
                                    </th>
                                    <th className="p-4 font-medium">Rol</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    usuarios.map((usuario) => (
                                        <tr
                                            key={usuario.id}
                                            className="border-t transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-4">
                                                <div className="font-medium">
                                                    {usuario.name}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail
                                                        size={15}
                                                        className="text-muted-foreground"
                                                    />
                                                    {usuario.email}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone
                                                        size={15}
                                                        className="text-muted-foreground"
                                                    />
                                                    {usuario.telefono ||
                                                        'No registrado'}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                                                    {nombreRol(usuario.rol)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

UsuariosIndex.layout = {
    breadcrumbs: [{ title: 'Usuarios', href: index() }],
};
