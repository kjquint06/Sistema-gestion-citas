import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type DatosPaciente = {
    nombre: string;
    documento: string | null;
    telefono: string | null;
    correo: string;
    fecha_nacimiento: string | null;
    sexo: string;
    direccion: string | null;
    contacto_emergencia: string | null;
};

type Props = {
    paciente?: DatosPaciente;
    errors: Partial<Record<string, string>>;
};

function Campo({
    id,
    etiqueta,
    error,
    children,
}: {
    id: string;
    etiqueta: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{etiqueta}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
export default function FormularioPaciente({ paciente, errors }: Props) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="nombre" etiqueta="Nombre completo" error={errors.nombre}>
                <Input
                    id="nombre"
                    name="nombre"
                    required
                    autoFocus
                    defaultValue={paciente?.nombre}
                    placeholder="Ej.: Ana López"
                />
            </Campo>

            <Campo
                id="documento"
                etiqueta="Documento (DNI)"
                error={errors.documento}
            >
                <Input
                    id="documento"
                    name="documento"
                    required
                    defaultValue={paciente?.documento ?? ''}
                    placeholder="Ej.: 0501-1995-01234"
                />
            </Campo>

            <Campo id="telefono" etiqueta="Teléfono" error={errors.telefono}>
                <Input
                    id="telefono"
                    name="telefono"
                    required
                    defaultValue={paciente?.telefono ?? ''}
                    placeholder="Ej.: 9999-9999"
                />
            </Campo>

            <Campo id="correo" etiqueta="Correo" error={errors.correo}>
                <Input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    defaultValue={paciente?.correo}
                    placeholder="correo@ejemplo.com"
                />
            </Campo>

            <Campo
                id="fecha_nacimiento"
                etiqueta="Fecha de nacimiento"
                error={errors.fecha_nacimiento}
            >
                <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    required
                    defaultValue={paciente?.fecha_nacimiento ?? ''}
                />
            </Campo>

            <Campo id="sexo" etiqueta="Sexo" error={errors.sexo}>
                <select
                    id="sexo"
                    name="sexo"
                    required
                    defaultValue={paciente?.sexo ?? ''}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                >
                    <option value="" disabled>
                        Selecciona…
                    </option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                </select>
            </Campo>

            <Campo
                id="direccion"
                etiqueta="Dirección (opcional)"
                error={errors.direccion}
            >
                <Input
                    id="direccion"
                    name="direccion"
                    defaultValue={paciente?.direccion ?? ''}
                />
            </Campo>

            <Campo
                id="contacto_emergencia"
                etiqueta="Contacto de emergencia (opcional)"
                error={errors.contacto_emergencia}
            >
                <Input
                    id="contacto_emergencia"
                    name="contacto_emergencia"
                    defaultValue={paciente?.contacto_emergencia ?? ''}
                    placeholder="Nombre - teléfono"
                />
            </Campo>
        </div>
    );
}
