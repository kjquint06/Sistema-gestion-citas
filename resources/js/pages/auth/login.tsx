import { Form, Head } from '@inertiajs/react';
import {
    Check,
    CalendarDays,
    ChevronRight,
    Settings,
    HeartPulse,
    Stethoscope,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
type Props = {
    status?: string;
    canResetPassword: boolean;
};
const perfiles = [
    {
        id: 'medico',
        titulo: 'Médico',
        desc: 'Agenda y expedientes',
        icono: Stethoscope,
    },
    {
        id: 'paciente',
        titulo: 'Paciente',
        desc: 'Citas e historial',
        icono: Users,
    },
    {
        id: 'recepcion',
        titulo: 'Recepción',
        desc: 'Agenda general',
        icono: CalendarDays,
    },
    {
        id: 'administrador',
        titulo: 'Administrador',
        desc: 'Gestión y reportes',
        icono: Settings,
    },
];

const estadisticas = [
    { valor: '100%', etiqueta: 'Confidencial' },
    { valor: '24/7', etiqueta: 'Disponible' },
    { valor: '4', etiqueta: 'Perfiles de acceso' },
];

export default function Login({ status }: Props) {
    const [perfil, setPerfil] = useState('medico');
    const [verPassword, setVerPassword] = useState(false);
    const perfilActual = perfiles.find((p) => p.id === perfil)!;

    return (
        <>
            <Head title="Iniciar sesión" />
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Panel izquierdo */}
                <aside
                    className="relative hidden flex-col justify-between p-12 text-white lg:flex"
                    style={{
                        background:
                            'radial-gradient(circle at 25% 40%, rgba(13,148,136,0.25), transparent 55%), #020617',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-white text-teal-700">
                            <HeartPulse className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm leading-none font-bold">
                                Clinica Nueva Vida
                            </p>
                            <p className="mt-1 text-[10px] font-semibold tracking-widest text-teal-300 uppercase">
                                Gestión clínica
                            </p>
                        </div>
                    </div>

                    <div className="max-w-lg">
                        <h1 className="text-5xl leading-tight font-bold">
                            Cada paciente, mejor acompañado.
                        </h1>
                        <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-300">
                            Gestiona citas, expedientes e información clínica
                            desde un solo espacio diseñado para tu equipo.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {estadisticas.map((e) => (
                            <div
                                key={e.etiqueta}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                            >
                                <p className="text-lg font-bold">{e.valor}</p>
                                <p className="text-[10px] tracking-wide text-slate-400 uppercase">
                                    {e.etiqueta}
                                </p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Panel derecho */}
                <main className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <p className="text-[11px] font-bold tracking-widest text-teal-700 uppercase">
                            Bienvenido de nuevo
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                            Ingresa a tu cuenta
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Selecciona tu perfil para acceder a tu espacio de
                            trabajo.
                        </p>

                        {status && (
                            <div className="mt-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="mt-6 flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="perfil"
                                        value={perfil}
                                    />

                                    {/* Selector de perfil */}
                                    <div>
                                        <p className="mb-2 text-xs font-semibold text-slate-800">
                                            ¿Cómo deseas ingresar?
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {perfiles.map((p) => {
                                                const activo = perfil === p.id;
                                                const Icono = p.icono;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setPerfil(p.id)
                                                        }
                                                        className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                                            activo
                                                                ? 'border-teal-600 bg-teal-50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                                                activo
                                                                    ? 'bg-teal-700 text-white'
                                                                    : 'bg-slate-100 text-slate-500'
                                                            }`}
                                                        >
                                                            <Icono className="size-4" />
                                                        </span>
                                                        <span>
                                                            <span className="block text-sm font-semibold text-slate-900">
                                                                {p.titulo}
                                                            </span>
                                                            <span className="block text-[11px] text-slate-500">
                                                                {p.desc}
                                                            </span>
                                                        </span>
                                                        {activo && (
                                                            <Check className="absolute top-2 right-2 size-4 rounded-full bg-teal-700 p-0.5 text-white" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Correo */}
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-semibold text-slate-800"
                                        >
                                            Correo electrónico
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Contraseña */}
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-semibold text-slate-800"
                                        >
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={
                                                    verPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Tu contraseña"
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setVerPassword(!verPassword)
                                                }
                                                className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-teal-700"
                                            >
                                                {verPassword
                                                    ? 'Ocultar'
                                                    : 'Ver'}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Recordar + olvidaste */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs text-slate-600">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                tabIndex={3}
                                                className="size-4 rounded accent-teal-700"
                                            />
                                            Recordar mi sesión
                                        </label>
                                        <span className="text-xs font-semibold text-teal-700">
                                            ¿Olvidaste tu contraseña?
                                        </span>
                                    </div>

                                    {/* Botón */}
                                    <button
                                        type="submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 disabled:opacity-60"
                                    >
                                        {processing && <Spinner />}
                                        Ingresar como {perfilActual.titulo}
                                        {!processing && (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </button>
                                </>
                            )}
                        </Form>

                        <p className="mt-6 text-center text-xs text-slate-500">
                            ¿Eres paciente nuevo?{' '}
                            <span className="font-semibold text-teal-700">
                                Crea tu cuenta
                            </span>
                        </p>
                        <p className="mt-8 text-center text-[10px] text-slate-400">
                            Al ingresar aceptas nuestro Aviso de privacidad y
                            las políticas de protección de datos clínicos.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}

// Quita el layout de tarjeta centrada para usar pantalla completa
Login.layout = (page: React.ReactNode) => page;
