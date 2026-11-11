export type Estado =
    | 'pendiente'
    | 'confirmada'
    | 'en_espera'
    | 'en_consulta'
    | 'atendida'
    | 'cancelada'
    | 'inasistencia';

export type FilaMedico = {
    id: number;
    nombre: string;
    especialidad: string;
    total: number;
} & Record<Estado, number>;

export type ReportesProps = {
    rol: string;
    filtros: { desde: string; hasta: string };
    total: number;
    porEstado: Record<Estado, number>;
    porMedico: FilaMedico[];
    porEspecialidad: { nombre: string; total: number }[];
    porMes: { mes: string; total: number }[];
};

export const COLOR_PRINCIPAL = '#0d9488';

export const ESTADOS_REPORTE: { clave: Estado; etiqueta: string; color: string }[] = [
    { clave: 'pendiente', etiqueta: 'Pendientes', color: '#f59e0b' },
    { clave: 'confirmada', etiqueta: 'Confirmadas', color: '#3b82f6' },
    { clave: 'en_espera', etiqueta: 'En espera', color: '#f97316' },
    { clave: 'en_consulta', etiqueta: 'En consulta', color: '#8b5cf6' },
    { clave: 'atendida', etiqueta: 'Atendidas', color: '#22c55e' },
    { clave: 'cancelada', etiqueta: 'Canceladas', color: '#ef4444' },
    { clave: 'inasistencia', etiqueta: 'Inasistencias', color: '#6b7280' },
];

export function formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');

    return `${dia}/${mes}/${anio}`;
}

function aTexto(fecha: Date): string {
    return fecha.toLocaleDateString('en-CA');
}

export function inicioDeMes(): string {
    const hoy = new Date();

    return aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}

export function finDeMes(): string {
    const hoy = new Date();

    return aTexto(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
}

export function inicioDeAnio(): string {
    return aTexto(new Date(new Date().getFullYear(), 0, 1));
}

export function finDeAnio(): string {
    return aTexto(new Date(new Date().getFullYear(), 11, 31));
}

export function etiquetaMes(mes: string): string {
    const [anio, numero] = mes.split('-').map(Number);

    return new Date(anio, numero - 1, 1).toLocaleDateString('es', {
        month: 'short',
        year: '2-digit',
    });
}

export function tituloReportes(rol: string): string {
    if (rol === 'admin') {
        return 'Administración · Reportes';
    }

    if (rol === 'recepcionista') {
        return 'Recepción · Reportes';
    }

    return 'Reportes';
}