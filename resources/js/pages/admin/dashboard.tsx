import React, { useState } from 'react';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';

import { ArrowRight, Info, Plus, Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { index as medicosRoute } from '@/routes/medicos';
import { index as usuariosRoute } from '@/routes/usuarios';
import { index as reportesRoute } from '@/routes/reportes';
import type { Auth } from '@/types';

type Medico = {
    id: number;
    numero_colegiado: string;
    duracion_cita: number;
    usuario: {
        name: string;
        email: string;
    } | null;
    especialidad: {
        id: number;
        nombre: string;
    } | null;
};

type Especialidad = {
    id: number;
    nombre: string;
    medicos_count: number;
};

type Usuario = {
    id: number;
    name: string;
    email: string;
    rol: string;
    telefono: string | null;
};

type Props = {
    totales: {
        medicos: number;
        especialidades: number;
        citas_hoy: number;
    };

    reporteCitas: {
        total: number;
        confirmadas: number;
        pendientes: number;
        atendidas: number;
        canceladas: number;
        inasistencias: number;
        por_profesional: Array<{
            nombre: string;
            citas_count: number;
        }>;
        desde: string;
        hasta: string;
    };

    medicos: Medico[];
    especialidadesLista: Especialidad[];
    usuarios: Usuario[];
};

// DASHBOARD ADMINISTRATIVO

export default function AdminDashboard({
    totales,
    medicos,
    especialidadesLista,
    usuarios,
    reporteCitas,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [rolFiltro, setRolFiltro] = useState('');

    // Estados para el rango de fechas
    const [desde, setDesde] = useState(reporteCitas.desde);
    const [hasta, setHasta] = useState(reporteCitas.hasta);

    // Formulario de especialidades
    const especialidadForm = useForm({
        nombre: '',
    });

    // FILTRAR MÉDICOS

    const medicosFiltrados = medicos.filter((medico) => {
        const nombre = medico.usuario?.name?.toLowerCase() ?? '';
        const correo = medico.usuario?.email?.toLowerCase() ?? '';
        const busqueda = searchTerm.toLowerCase();

        return nombre.includes(busqueda) || correo.includes(busqueda);
    });

    // FILTRAR USUARIOS

    const usuariosFiltrados = usuarios.filter((usuario) => {
        return rolFiltro === '' || usuario.rol === rolFiltro;
    });

    // TRADUCIR NOMBRES DE ROLES

    const nombreRol = (rol: string) => {
        const roles: Record<string, string> = {
            admin: 'Administrador',
            medico: 'Médico',
            paciente: 'Paciente',
            recepcionista: 'Recepcionista',
        };

        return roles[rol] ?? rol;
    };

    // CALCULAR PORCENTAJES DE CITAS

    const totalCitas = reporteCitas.total || 1;

    const pctConfirmadas = (reporteCitas.confirmadas / totalCitas) * 100;

    const pctPendientes = (reporteCitas.pendientes / totalCitas) * 100;

    const pctAtendidas = (reporteCitas.atendidas / totalCitas) * 100;

    const pctCanceladas = (reporteCitas.canceladas / totalCitas) * 100;

    const pctInasistencias = (reporteCitas.inasistencias / totalCitas) * 100;

    // CREAR ESPECIALIDAD

    const handleCreateSpecialty = (e: React.FormEvent) => {
        e.preventDefault();

        especialidadForm.post('/especialidades', {
            onSuccess: () => especialidadForm.reset(),
        });
    };

    // CONSULTAR REPORTE POR FECHAS
    const aplicarFechas = (e: React.FormEvent) => {
        e.preventDefault();

        if (!desde || !hasta || desde > hasta) {
            return;
        }

        router.get(
            window.location.pathname,
            {
                desde,
                hasta,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Administración de la clínica" />

            <div className="flex min-h-screen flex-col gap-7 bg-slate-50/50 p-6 lg:p-8">
                {/* ENCABEZADO PRINCIPAL */}

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Administración de la clínica
                    </h1>

                    <p className="text-sm text-slate-500">
                        Sesión de {auth.user.name} · Administrador · Acceso a
                        agenda, pacientes, expedientes, médicos, especialidades,
                        horarios, usuarios y reportes.
                    </p>
                </div>

                {/* TARJETAS DE ESTADÍSTICAS */}

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {/* Médicos */}

                    <div className="flex h-40 flex-col justify-between rounded-2xl bg-[#0f766e] p-6 text-white shadow-sm">
                        <span className="text-sm font-medium opacity-90">
                            Médicos registrados
                        </span>

                        <div>
                            <span className="text-4xl font-bold tracking-tight">
                                {totales.medicos}
                            </span>

                            <p className="mt-1 text-xs opacity-80">
                                Profesionales registrados en el sistema
                            </p>
                        </div>
                    </div>

                    {/* Especialidades */}

                    <div className="flex h-40 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <span className="text-sm font-medium text-slate-500">
                            Especialidades
                        </span>

                        <div>
                            <span className="text-4xl font-bold tracking-tight text-slate-900">
                                {totales.especialidades}
                            </span>

                            <p className="mt-1 text-xs text-slate-400">
                                Especialidades médicas registradas
                            </p>
                        </div>
                    </div>

                    {/* Citas */}

                    <div className="flex h-40 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <span className="text-sm font-medium text-slate-500">
                            Citas de hoy
                        </span>

                        <div>
                            <span className="text-4xl font-bold tracking-tight text-slate-900">
                                {totales.citas_hoy}
                            </span>

                            <p className="mt-1 text-xs text-slate-400">
                                Citas programadas, excepto canceladas
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABLA DE MÉDICOS */}

                <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Médicos
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Perfiles vinculados a una cuenta con rol
                                    médico.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href={medicosRoute()}
                                    className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e]"
                                >
                                    <Plus className="size-4" />
                                    Crear médico
                                </Link>

                                <div className="relative">
                                    <Search className="absolute top-3 left-3 size-4 text-slate-400" />

                                    <input
                                        type="text"
                                        placeholder="Buscar médico..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Médico / Usuario
                                        </th>

                                        <th className="px-4 py-3">Email</th>

                                        <th className="px-4 py-3">
                                            Especialidad
                                        </th>

                                        <th className="px-4 py-3">Colegiado</th>

                                        <th className="px-4 py-3">
                                            Duración de cita
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                            Controles
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {medicosFiltrados.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-6 text-center text-slate-500"
                                            >
                                                {medicos.length === 0
                                                    ? 'No hay médicos registrados.'
                                                    : 'No se encontraron médicos con esa búsqueda.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        medicosFiltrados.map((medico) => (
                                            <tr
                                                key={medico.id}
                                                className="hover:bg-slate-50/50"
                                            >
                                                <td className="px-4 py-4 font-semibold text-slate-900">
                                                    {medico.usuario?.name ??
                                                        'Sin usuario'}
                                                </td>

                                                <td className="px-4 py-4 text-slate-500">
                                                    {medico.usuario?.email ??
                                                        'Sin correo'}
                                                </td>

                                                <td className="px-4 py-4 text-slate-700">
                                                    {medico.especialidad
                                                        ?.nombre ??
                                                        'Sin especialidad'}
                                                </td>

                                                <td className="px-4 py-4 text-slate-500">
                                                    {medico.numero_colegiado}
                                                </td>

                                                <td className="px-4 py-4 text-slate-500">
                                                    {medico.duracion_cita}{' '}
                                                    minutos
                                                </td>

                                                <td className="space-x-2 px-4 py-4 text-right">
                                                    <Link
                                                        href={medicosRoute()}
                                                        className="text-xs font-medium text-[#0f766e] hover:underline"
                                                    >
                                                        Ver médicos
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* INFORMACIÓN DE GESTIÓN DE MÉDICOS */}

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-1 text-lg font-bold text-slate-900">
                        Gestión de perfiles médicos
                    </h3>

                    <p className="mb-5 text-xs text-slate-500">
                        Desde este apartado puedes acceder al módulo de médicos
                        para registrar y administrar los perfiles profesionales.
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="inline-block rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0f766e]">
                            Gestión de médicos
                        </span>

                        <Link
                            href={medicosRoute()}
                            className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e]"
                        >
                            Administrar médicos
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>

                {/* ESPECIALIDADES*/}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
                        <h2 className="mb-1 text-xl font-bold text-slate-900">
                            Especialidades
                        </h2>

                        <p className="mb-6 text-xs text-slate-500">
                            Catálogo de atención · Consulta y registra
                            especialidades médicas.
                        </p>

                        {/* Tabla de especialidades */}

                        <div className="mb-6 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Nombre</th>

                                        <th className="px-4 py-3">Médicos</th>

                                        <th className="px-4 py-3 text-right">
                                            Controles
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {especialidadesLista.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-6 text-center text-slate-500"
                                            >
                                                No hay especialidades
                                                registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        especialidadesLista.map((esp) => (
                                            <tr
                                                key={esp.id}
                                                className="hover:bg-slate-50/50"
                                            >
                                                <td className="px-4 py-4 font-semibold text-slate-900">
                                                    {esp.nombre}
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {esp.medicos_count}
                                                </td>

                                                <td className="px-4 py-4 text-right text-xs">
                                                    <Link
                                                        href="/especialidades"
                                                        className="font-medium text-[#0f766e] hover:underline"
                                                    >
                                                        Administrar
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Formulario para crear especialidad */}

                        <form onSubmit={handleCreateSpecialty}>
                            <label className="mb-2 block text-xs font-semibold text-slate-700">
                                Nombre de especialidad
                            </label>

                            <div className="flex flex-wrap gap-4">
                                <input
                                    type="text"
                                    placeholder="Nueva especialidad..."
                                    value={especialidadForm.data.nombre}
                                    onChange={(e) =>
                                        especialidadForm.setData(
                                            'nombre',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                                />

                                <button
                                    type="submit"
                                    disabled={especialidadForm.processing}
                                    className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e] disabled:opacity-50"
                                >
                                    <Plus className="size-4" />

                                    {especialidadForm.processing
                                        ? 'Guardando...'
                                        : 'Crear especialidad'}
                                </button>
                            </div>

                            {especialidadForm.errors.nombre && (
                                <p className="mt-2 text-xs text-red-500">
                                    {especialidadForm.errors.nombre}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Confirmación informativa */}

                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div>
                            <h3 className="mb-3 text-lg font-bold text-slate-900">
                                Administración segura
                            </h3>

                            <span className="mb-4 inline-block rounded-md bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-900">
                                Confirmación requerida
                            </span>

                            <p className="text-xs leading-relaxed text-slate-500">
                                Antes de eliminar un médico, usuario o
                                especialidad, es necesario revisar sus
                                relaciones y confirmar la operación para
                                proteger la información registrada.
                            </p>
                        </div>

                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Las operaciones de eliminación deben realizarse
                                desde los módulos correspondientes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* USUARIOS */}

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-xl font-bold text-slate-900">
                        Usuarios
                    </h2>

                    <p className="mb-6 text-xs text-slate-500">
                        Consulta de usuarios registrados y sus respectivos
                        roles.
                    </p>

                    {/* Filtros de usuarios */}

                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <Link
                            href={usuariosRoute()}
                            className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e]"
                        >
                            <Plus className="size-4" />
                            Crear usuario
                        </Link>

                        <select
                            value={rolFiltro}
                            onChange={(e) => setRolFiltro(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                        >
                            <option value="">Todos los roles</option>

                            <option value="paciente">Paciente</option>

                            <option value="medico">Médico</option>

                            <option value="recepcionista">Recepcionista</option>

                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {/* Tabla de usuarios */}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Usuario</th>

                                    <th className="px-4 py-3">Email</th>

                                    <th className="px-4 py-3">Teléfono</th>

                                    <th className="px-4 py-3">Rol</th>

                                    <th className="px-4 py-3 text-right">
                                        Controles
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-6 text-center text-slate-500"
                                        >
                                            {usuarios.length === 0
                                                ? 'No hay usuarios registrados.'
                                                : 'No hay usuarios con el rol seleccionado.'}
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map((usr) => (
                                        <tr
                                            key={usr.id}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="px-4 py-4 font-semibold text-slate-900">
                                                {usr.name}
                                            </td>

                                            <td className="px-4 py-4 text-slate-500">
                                                {usr.email}
                                            </td>

                                            <td className="px-4 py-4 text-slate-500">
                                                {usr.telefono ??
                                                    'No registrado'}
                                            </td>

                                            <td className="px-4 py-4 text-slate-700">
                                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                                                    {nombreRol(usr.rol)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right text-xs">
                                                <Link
                                                    href={usuariosRoute()}
                                                    className="font-medium text-[#0f766e] hover:underline"
                                                >
                                                    Administrar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-6 text-xs text-slate-400">
                        Roles disponibles: paciente · médico · recepcionista ·
                        administrador.
                    </p>
                </div>

                {/* REPORTES BÁSICOS*/}

                <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Reportes básicos
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Estadísticas de citas según el período
                                    seleccionado.
                                </p>
                            </div>

                            <Link
                                href={reportesRoute()}
                                className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d655e]"
                            >
                                <ArrowRight className="size-4" />
                                Ver reporte
                            </Link>
                        </div>

                        {/* Filtro de fechas */}

                        <form
                            onSubmit={aplicarFechas}
                            className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                    Desde
                                </label>

                                <input
                                    type="date"
                                    value={desde}
                                    max={hasta}
                                    onChange={(e) => setDesde(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                    Hasta
                                </label>

                                <input
                                    type="date"
                                    value={hasta}
                                    min={desde}
                                    onChange={(e) => setHasta(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={!desde || !hasta || desde > hasta}
                                    className="rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0d655e] disabled:opacity-50"
                                >
                                    Consultar reporte
                                </button>
                            </div>
                        </form>

                        {/* Distribución y profesionales */}

                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                            {/* Distribución de citas */}

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                                <h3 className="mb-2 text-sm font-bold text-slate-800">
                                    Distribución de las {reporteCitas.total}{' '}
                                    citas
                                </h3>

                                <p className="mb-6 text-xs leading-relaxed text-slate-500">
                                    {reporteCitas.confirmadas} confirmadas ·
                                    {` ${reporteCitas.pendientes} pendientes · `}
                                    {reporteCitas.atendidas} atendidas ·
                                    {` ${reporteCitas.canceladas} canceladas · `}
                                    {reporteCitas.inasistencias} inasistencias.
                                </p>

                                {/* Barra de porcentajes */}

                                <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-slate-200/60">
                                    <div
                                        className="bg-[#0f766e]"
                                        style={{ width: `${pctConfirmadas}%` }}
                                        title="Confirmadas"
                                    />

                                    <div
                                        className="bg-slate-300"
                                        style={{ width: `${pctPendientes}%` }}
                                        title="Pendientes"
                                    />

                                    <div
                                        className="bg-indigo-900/60"
                                        style={{ width: `${pctAtendidas}%` }}
                                        title="Atendidas"
                                    />

                                    <div
                                        className="bg-amber-500"
                                        style={{ width: `${pctCanceladas}%` }}
                                        title="Canceladas"
                                    />

                                    <div
                                        className="bg-red-500"
                                        style={{
                                            width: `${pctInasistencias}%`,
                                        }}
                                        title="Inasistencias"
                                    />
                                </div>

                                {/* Referencias de colores */}

                                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-[#0f766e]" />
                                        Confirmadas
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-slate-300" />
                                        Pendientes
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-indigo-900/60" />
                                        Atendidas
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-amber-500" />
                                        Canceladas
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-red-500" />
                                        Inasistencias
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de profesionales */}

                            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Profesional
                                            </th>

                                            <th className="px-4 py-3 text-right">
                                                Citas
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {reporteCitas.por_profesional.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="py-4 text-center text-xs text-slate-500"
                                                >
                                                    No hay registros de citas
                                                    por profesional.
                                                </td>
                                            </tr>
                                        ) : (
                                            reporteCitas.por_profesional.map(
                                                (prof, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-slate-50/50"
                                                    >
                                                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                                                            {prof.nombre}
                                                        </td>

                                                        <td className="px-4 py-3.5 text-right font-medium text-[#0f766e]">
                                                            {prof.citas_count}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-100/80 p-4 text-sm text-slate-600">
                    <Info className="mt-0.5 size-5 shrink-0 text-slate-500" />

                    <p>
                        <strong>Acceso administrativo:</strong> El administrador
                        puede consultar la información de médicos,
                        especialidades, usuarios y reportes de citas desde este
                        panel de control.
                    </p>
                </div>
            </div>
        </>
    );
}
