import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    FileText,
    LayoutGrid,
    Stethoscope,
    TrendingUp,
    Users,
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
import { index as disponibilidad } from '@/routes/disponibilidad';
import { index as expedientes } from '@/routes/expedientes';
import { index as medicos } from '@/routes/medicos';
import { index as pacientes } from '@/routes/pacientes';
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
    { title: 'Resumen', href: dashboard(), icon: LayoutGrid },
    { title: 'Agenda', href: agenda(), icon: CalendarDays },
    {
        title: 'Pacientes',
        href: pacientes(),
        icon: Users,
        roles: [ROL.medico, ROL.recepcionista, ROL.admin],
    },
    {
        title: 'Expedientes',
        href: expedientes(),
        icon: FileText,
        roles: [ROL.medico, ROL.paciente],
    },
    {
        title: 'Disponibilidad',
        href: disponibilidad(),
        icon: Clock,
        roles: [ROL.medico, ROL.admin],
    },
    {
        title: 'Médicos',
        href: medicos(),
        icon: Stethoscope,
        roles: [ROL.admin],
    },
    {
        title: 'Reportes',
        href: reportes(),
        icon: TrendingUp,
        roles: [ROL.medico, ROL.recepcionista, ROL.admin],
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
