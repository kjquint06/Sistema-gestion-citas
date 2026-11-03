import { Form, Head } from '@inertiajs/react';
import { ChevronRight, HeartPulse, Info } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const estadisticas = [
    { valor: '100%', etiqueta: 'Confidencial' },
    { valor: '24/7', etiqueta: 'Disponible' },
    { valor: '4', etiqueta: 'Perfiles de acceso' },
];

export default function Login({ status, canResetPassword }: Props) {
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
                <main className="flex items-center justify-center bg-white p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <h2 className="text-4xl font-medium text-slate-800">
                            Iniciar sesión
                        </h2>
                        <p className="mt-3 text-sm text-slate-500">
                            Accede con el correo asociado a tu cuenta.
                        </p>

                        {status && (
                            <div className="mt-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="mt-8 flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
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
                                            placeholder="nombre@example.com"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-semibold text-slate-800"
                                        >
                                            Contraseña
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Introduce tu contraseña"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs text-slate-500">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                tabIndex={3}
                                                className="size-4 rounded accent-teal-700"
                                            />
                                            Recordar mi correo
                                        </label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                tabIndex={5}
                                                className="text-xs font-semibold text-teal-700 no-underline"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                        className="flex w-fit items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 disabled:opacity-60"
                                    >
                                        {processing && <Spinner />}
                                        Iniciar sesión
                                        {!processing && (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-8 flex gap-3 rounded-xl bg-slate-100 p-4">
                            <Info className="mt-0.5 size-4 shrink-0 text-slate-500" />
                            <div>
                                <p className="text-xs font-semibold text-slate-600">
                                    El acceso depende de tu cuenta
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    El rol se asigna previamente. El personal de
                                    la clínica no se registra como médico o
                                    administrador desde esta página.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
                            ¿Es tu primera vez?{' '}
                            <span className="font-semibold text-teal-700">
                                Crear cuenta de paciente →
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

// Quita el layout de tarjeta centrada para usar pantalla completa
Login.layout = (page: React.ReactNode) => page;
