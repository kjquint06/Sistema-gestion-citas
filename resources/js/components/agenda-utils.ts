export type DiaSemana = {
    fecha: string;
    dia_semana: number;
    citas: number;
    atiende: boolean;
};

export type MedicoColumna = {
    id: number;
    nombre: string;
    iniciales: string;
    especialidad: string;
    consultorio: string | null;
    duracion_cita: number;
    horarios: { inicio: string; fin: string }[];
};

export type CitaAgenda = {
    id: number;
    medico_id: number;
    medico: string | null;
    consultorio: string | null;
    fecha: string;
    inicio: string;
    fin: string;
    duracion: number;
    hora_llegada: string | null;
    estado: string;
    motivo: string | null;
    paciente: {
        id: number;
        nombre: string;
        iniciales: string;
        expediente: string;
        edad: number | null;
    };
};

export type AgendaProps = {
    rol: string;
    puedeGestionar: boolean;
    fecha: string;
    hoy: string;
    filtros: { medico_id: number | null };
    medicosFiltro: { id: number; nombre: string }[];
    semana: DiaSemana[];
    medicos: MedicoColumna[];
    citas: CitaAgenda[];
    resumen: {
        citas: number;
        medicos: number;
        bloque_minutos: number | null;
        bloques_totales: number;
        bloques_libres: number;
    };
    horas: { inicio: number; fin: number };
};

export const ALTO_HORA = 80;

export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const ESTADOS: Record<
    string,
    { etiqueta: string; bloque: string; punto: string }
> = {
    pendiente: {
        etiqueta: 'Pendiente',
        bloque: 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
        punto: 'bg-amber-500',
    },
    confirmada: {
        etiqueta: 'Confirmada',
        bloque: 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
        punto: 'bg-blue-500',
    },
    en_espera: {
        etiqueta: 'En espera',
        bloque: 'border-orange-500 bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
        punto: 'bg-orange-500',
    },
    en_consulta: {
        etiqueta: 'En consulta',
        bloque: 'border-violet-500 bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100',
        punto: 'bg-violet-500',
    },
    atendida: {
        etiqueta: 'Atendida',
        bloque: 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100',
        punto: 'bg-green-500',
    },
    cancelada: {
        etiqueta: 'Cancelada',
        bloque: 'border-red-500 bg-red-100 text-red-900 opacity-70 dark:bg-red-900/40 dark:text-red-100',
        punto: 'bg-red-500',
    },
    inasistencia: {
        etiqueta: 'Inasistencia',
        bloque: 'border-gray-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        punto: 'bg-gray-500',
    },
};

export const ORDEN_LEYENDA = [
    'confirmada',
    'en_espera',
    'en_consulta',
    'pendiente',
    'cancelada',
    'atendida',
    'inasistencia',
];

export function aFecha(valor: string): Date {
    const [anio, mes, dia] = valor.split('-').map(Number);

    return new Date(anio, mes - 1, dia);
}

export function aTexto(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(valor: string, dias: number): string {
    const fecha = aFecha(valor);
    fecha.setDate(fecha.getDate() + dias);

    return aTexto(fecha);
}

export function aMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);

    return horas * 60 + minutos;
}

export function mayuscula(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function tituloAgenda(rol: string): string {
    if (rol === 'admin') {
        return 'Administración · Agenda general';
    }

    if (rol === 'recepcionista') {
        return 'Recepción · Agenda general';
    }

    return 'Mi agenda';
}
