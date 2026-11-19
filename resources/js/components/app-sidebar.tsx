import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Clock,
    FileText,
    LayoutGrid,
    Stethoscope,
    TrendingUp,
    Users,
    HeartPulse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as agenda } from '@/routes/agenda';
import { index as consultas } from '@/routes/consultas';
import { index as disponibilidad } from '@/routes/disponibilidad';
import { index as expedientes } from '@/routes/expedientes';
import { index as medicos } from '@/routes/medicos';
import { index as misPacientes } from '@/routes/mis-pacientes';
import { index as especialidades } from '@/routes/especialidades';
import { index as pacientes } from '@/routes/pacientes';
import { index as usuarios } from '@/routes/usuarios';

import { index as reportes } from '@/routes/reportes';
import type { Auth, NavItem } from '@/types';

// IMPORTANTE: estos valores deben ser iguales a las constantes ROL_* de app/Models/User.php
const ROL = {
    paciente: 'paciente',
    medico: 'medico',
    recepcionista: 'recepcionista',
    admin: 'admin',
};

type ItemConRoles = NavItem & { roles?: string[] };

// Si un item no tiene "roles", lo ven todos. Debe coincidir con routes/web.php
const todosLosItems: ItemConRoles[] = [
    {
        title: 'Panel General',
        href: dashboard(),
        icon: LayoutGrid,
        roles: [ROL.paciente, ROL.recepcionista, ROL.admin],
    },
    // Menú del médico (en este orden): Agenda semanal, Consultas, Mis pacientes, Mis horarios
    {
        title: 'Agenda semanal',
        href: agenda(),
        icon: CalendarDays,
        roles: [ROL.medico],
    },
    {
        title: 'Consultas',
        href: consultas(),
        icon: ClipboardList,
        roles: [ROL.medico],
    },
    {
        title: 'Mis pacientes',
        href: misPacientes(),
        icon: Users,
        roles: [ROL.medico],
    },
    {
        title: 'Mis horarios',
        href: disponibilidad(),
        icon: Clock,
        roles: [ROL.medico],
    },
    {
        title: 'Agenda de Citas',
        href: agenda(),
        icon: CalendarDays,
        roles: [ROL.recepcionista, ROL.admin],
    },
    {
        title: 'Pacientes',
        href: pacientes(),
        icon: Users,
        roles: [ROL.recepcionista, ROL.admin],
    },
    {
        title: 'Agendar Cita',
        href: '/mis-citas/crear',
        icon: CalendarDays,
        roles: [ROL.paciente],
    },
    {
        title: 'Mi Expediente',
        href: '/mi-expediente',
        icon: FileText,
        roles: [ROL.paciente],
    },
    {
        title: 'Expedientes clinicos',
        href: expedientes(),
        icon: FileText,
        roles: [ROL.admin],
    },
    {
        title: 'Médicos',
        href: medicos(),
        icon: Stethoscope,
        roles: [ROL.admin],
    },
    {
        title: 'Especialidades',
        href: especialidades(),
        icon: HeartPulse,
        roles: [ROL.admin],
    },
    {
        title: 'Disponibilidad',
        href: disponibilidad(),
        icon: Clock,
        roles: [ROL.admin],
    },
    {
        title: 'Usuarios',
        href: usuarios(),
        icon: Users,
        roles: [ROL.admin],
    },
    {
        title: 'Reportes',
        href: reportes(),
        icon: TrendingUp,
        roles: [ROL.recepcionista, ROL.admin],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const items = todosLosItems.filter(
        (item) => !item.roles || item.roles.includes(auth.user.rol),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
