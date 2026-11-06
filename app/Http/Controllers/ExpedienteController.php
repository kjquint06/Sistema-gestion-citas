<?php

namespace App\Http\Controllers;

use App\Models\Alergia;
use App\Models\Antecedente;
use App\Models\Consulta;
use App\Models\Paciente;
use App\Models\Receta;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ExpedienteController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // El paciente no ve lista: va directo a su propio expediente
        if ($user->tieneRol(User::ROL_PACIENTE)) {
            $propio = $user->paciente;
            abort_if($propio === null, 404);

            return redirect()->route('expedientes.show', $propio);
        }

        $pacientes = Paciente::with('usuario')
            ->get()
            ->map(fn (Paciente $paciente) => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
                'correo' => $paciente->usuario->email,
                'telefono' => $paciente->usuario->telefono,
                'fecha_nacimiento' => Carbon::parse($paciente->fecha_nacimiento)->format('d/m/Y'),
            ]);

        return Inertia::render('expedientes/index', [
            'pacientes' => $pacientes,
        ]);
    }

    public function show(Request $request, Paciente $paciente): Response
    {
        $user = $request->user();

        // Seguridad en el servidor: solo médico/admin, o el dueño del expediente
        $esPersonal = $user->tieneRol(User::ROL_MEDICO, User::ROL_ADMIN);
        $esDueno = $paciente->usuario_id === $user->id;

        abort_unless(
            $esPersonal || $esDueno,
            403,
            'No tienes permiso para ver este expediente.'
        );

        $paciente->load(['usuario', 'antecedentes', 'alergias']);

        $consultas = Consulta::with(['cita', 'recetas'])
            ->whereHas('cita', fn ($query) => $query->where('paciente_id', $paciente->id))
            ->get()
            ->sortByDesc(fn (Consulta $consulta) => Carbon::parse($consulta->cita->inicia_en)->getTimestamp())
            ->values();

        $recetas = $consultas->flatMap(
            fn (Consulta $consulta) => $consulta->recetas->map(fn (Receta $receta) => [
                'id' => $receta->id,
                'fecha' => Carbon::parse($consulta->cita->inicia_en)->format('d/m/Y'),
                'medicamento' => $receta->medicamento,
                'dosis' => $receta->dosis,
                'frecuencia' => $receta->frecuencia,
                'duracion' => $receta->duracion,
            ])
        )->values();

        return Inertia::render('expedientes/show', [
            'puede_ver_lista' => $esPersonal,
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
                'correo' => $paciente->usuario->email,
                'telefono' => $paciente->usuario->telefono,
                'fecha_nacimiento' => Carbon::parse($paciente->fecha_nacimiento)->format('d/m/Y'),
                'sexo' => $paciente->sexo,
                'direccion' => $paciente->direccion,
                'contacto_emergencia' => $paciente->contacto_emergencia,
            ],
            'antecedentes' => $paciente->antecedentes->map(fn (Antecedente $antecedente) => [
                'id' => $antecedente->id,
                'tipo' => $antecedente->tipo,
                'descripcion' => $antecedente->descripcion,
                'fecha' => $antecedente->fecha
                    ? Carbon::parse($antecedente->fecha)->format('d/m/Y')
                    : null,
            ])->values(),
            'alergias' => $paciente->alergias->map(fn (Alergia $alergia) => [
                'id' => $alergia->id,
                'alergeno' => $alergia->alergeno,
                'gravedad' => $alergia->gravedad,
                'reaccion' => $alergia->reaccion,
            ])->values(),
            'consultas' => $consultas->map(fn (Consulta $consulta) => [
                'id' => $consulta->id,
                'fecha' => Carbon::parse($consulta->cita->inicia_en)->format('d/m/Y H:i'),
                'motivo' => $consulta->cita->motivo,
                'sintomas' => $consulta->sintomas,
                'diagnostico' => $consulta->diagnostico,
                'notas' => $consulta->notas,
                'signos_vitales' => $consulta->signos_vitales,
            ])->values(),
            'recetas' => $recetas,
        ]);
    }
}
