import { Form, Head } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    HeartPulse,
    Info,
    ShieldCheck,
    ClipboardList,
} from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';

export default function Register() {
    return (
        <>
            <Head title="Registro de pacientes" />

            <div className="grid min-h-screen lg:grid-cols-[0.8fr_1.2fr]">

                {/* Panel izquierdo */}
                <aside
                    className="relative hidden flex-col justify-between p-12 text-white lg:flex"
                    style={{
                        background:
                            'radial-gradient(circle at 25% 40%, rgba(13,148,136,0.25), transparent 55%), #020617',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-white text-teal-700">
                            <HeartPulse className="size-6" />
                        </div>

                        <div>
                            <p className="text-sm font-bold">
                                Clínica Nueva Vida
                            </p>
                            <p className="mt-1 text-[10px] font-semibold tracking-widest text-teal-300 uppercase">
                                Gestión clínica
                            </p>
                        </div>
                    </div>

                    <div className="max-w-lg">
                        <h1 className="text-5xl leading-tight font-bold">
                            Tu salud merece atención.
                        </h1>

                        <p className="mt-6 text-sm leading-relaxed text-slate-300">
                            Crea tu cuenta y disfruta de una experiencia
                            más sencilla para gestionar tu atención médica.
                        </p>

                        <div className="mt-10 space-y-6">
                            <div className="flex gap-4">
                                <CalendarDays className="size-6 shrink-0 text-teal-300" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        Gestiona tus citas
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Organiza tus próximas consultas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <ClipboardList className="size-6 shrink-0 text-teal-300" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        Consulta tu información
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Mantén organizada tu información médica.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <ShieldCheck className="size-6 shrink-0 text-teal-300" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        Información protegida
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Tu información es de carácter privado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">
                        Clínica Nueva Vida · Gestión clínica
                    </p>
                </aside>

                {/* Panel del formulario */}
                <main className="flex justify-center bg-slate-50 px-5 py-10 sm:px-10">
                    <div className="my-auto w-full max-w-2xl">

                        <div className="mb-8">
                            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">
                                Registro de pacientes
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold text-slate-800">
                                Crear mi cuenta
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Completa tus datos para registrarte en nuestra clínica.
                            </p>
                        </div>

                        <Form
                            action="/register"
                            method="post"
                            resetOnSuccess={['password', 'password_confirmation']}
                            className="space-y-7"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Datos de acceso */}
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Crear mi cuenta
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Información de acceso y contacto.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <div className="grid gap-2">
                                                <label htmlFor="name" className="text-xs font-semibold text-slate-700">
                                                    Nombre completo *
                                                </label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Tu nombre completo"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <label htmlFor="telefono" className="text-xs font-semibold text-slate-700">
                                                    Teléfono
                                                </label>
                                                <input
                                                    id="telefono"
                                                    name="telefono"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    placeholder="Tu número de teléfono"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.telefono} />
                                            </div>

                                            <div className="grid gap-2 sm:col-span-2">
                                                <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                                                    Correo electrónico *
                                                </label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="nombre@correo.com"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.email} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="border-t border-slate-200" />

                                    {/* Información personal */}
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Información personal
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Datos necesarios para tu ficha de paciente.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <div className="grid gap-2">
                                                <label htmlFor="fecha_nacimiento" className="text-xs font-semibold text-slate-700">
                                                    Fecha de nacimiento *
                                                </label>
                                                <input
                                                    id="fecha_nacimiento"
                                                    name="fecha_nacimiento"
                                                    type="date"
                                                    required
                                                    max={new Date().toLocaleDateString('en-CA')}
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.fecha_nacimiento} />
                                            </div>

                                            <div className="grid gap-2">
                                                <label htmlFor="sexo" className="text-xs font-semibold text-slate-700">
                                                    Sexo *
                                                </label>
                                                <select
                                                    id="sexo"
                                                    name="sexo"
                                                    required
                                                    defaultValue=""
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                >
                                                    <option value="" disabled>
                                                        Selecciona una opción
                                                    </option>
                                                    <option value="Femenino">Femenino</option>
                                                    <option value="Masculino">Masculino</option>
                                                </select>
                                                <InputError message={errors.sexo} />
                                            </div>

                                            <div className="grid gap-2 sm:col-span-2">
                                                <label htmlFor="direccion" className="text-xs font-semibold text-slate-700">
                                                    Dirección
                                                </label>
                                                <textarea
                                                    id="direccion"
                                                    name="direccion"
                                                    rows={2}
                                                    placeholder="Colonia, ciudad y departamento"
                                                    className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.direccion} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="border-t border-slate-200" />

                                    {/* Contacto de emergencia */}
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Contacto de emergencia
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Persona a quien contactar en caso de emergencia.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <label htmlFor="contacto_emergencia_nombre" className="text-xs font-semibold text-slate-700">
                                                    Nombre y relación
                                                </label>
                                                <input
                                                    id="contacto_emergencia_nombre"
                                                    name="contacto_emergencia_nombre"
                                                    type="text"
                                                    placeholder="Nombre y parentesco"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.contacto_emergencia_nombre} />
                                            </div>

                                            <div className="grid gap-2">
                                                <label htmlFor="contacto_emergencia_telefono" className="text-xs font-semibold text-slate-700">
                                                    Teléfono de emergencia
                                                </label>
                                                <input
                                                    id="contacto_emergencia_telefono"
                                                    name="contacto_emergencia_telefono"
                                                    type="tel"
                                                    placeholder="Número de contacto"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.contacto_emergencia_telefono} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="border-t border-slate-200" />

                                    {/* Seguridad */}
                                    <section className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Seguridad de la cuenta
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Crea una contraseña para proteger tu cuenta.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                                                    Contraseña *
                                                </label>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="Crear contraseña"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700">
                                                    Confirmar contraseña *
                                                </label>
                                                <input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type="password"
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="Repetir contraseña"
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Privacidad */}
                                    <div className="space-y-2">
                                        <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-600">
                                            <input
                                                type="checkbox"
                                                name="privacidad"
                                                value="1"
                                                required
                                                className="mt-0.5 size-4 shrink-0 accent-teal-700"
                                            />
                                            <span>
                                                He leído y acepto las políticas de privacidad y el tratamiento de mis datos personales.
                                            </span>
                                        </label>
                                        <InputError message={errors.privacidad} />
                                    </div>

                                    {/* Información */}
                                    <div className="flex gap-3 rounded-xl bg-teal-50 p-4">
                                        <Info className="mt-0.5 size-4 shrink-0 text-teal-700" />
                                        <p className="text-xs leading-relaxed text-teal-900">
                                            El registro público crea únicamente cuentas de pacientes.
                                            Los perfiles del personal de la clínica son administrados internamente.
                                        </p>
                                    </div>

                                    {/* Botón */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 disabled:opacity-60"
                                    >
                                        {processing && <Spinner />}
                                        Crear cuenta de paciente
                                        {!processing && (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink
                                href="/login"
                                className="font-semibold text-teal-700 no-underline"
                            >
                                Inicia sesión
                            </TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

// Utilizar pantalla completa, igual que el inicio de sesión.
Register.layout = (page: React.ReactNode) => page;
