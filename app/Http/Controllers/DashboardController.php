<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Paciente\MisCitasController;
use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->user()->rol === User::ROL_ADMIN) {

            // Obtener médicos con su usuario y especialidad
            $medicos = Medico::with([
                'usuario:id,name,email',
                'especialidad:id,nombre',
            ])->get([
                'id',
                'usuario_id',
                'especialidad_id',
                'numero_colegiado',
                'duracion_cita',
            ]);

            // Obtener especialidades con cantidad de médicos
            $especialidadesLista = Especialidad::withCount('medicos')
                ->get(['id', 'nombre']);

            // Obtener usuarios registrados
            $usuarios = User::query()
                ->select('id', 'name', 'email', 'rol', 'telefono')
                ->latest()
                ->get();

            // Obtener rango de fechas
            $fechaInicio = $request->input(
                'desde',
                today()->toDateString()
            );

            $fechaFin = $request->input(
                'hasta',
                today()->toDateString()
            );

            // Consultar citas dentro del rango de fechas
            $citasQuery = Cita::whereDate('inicia_en', '>=', $fechaInicio)
                ->whereDate('inicia_en', '<=', $fechaFin);

            // Total de citas
            $totalCitas = (clone $citasQuery)->count();

            // Conteo de citas por estado
            $citasConfirmadas = (clone $citasQuery)
                ->where('estado', Cita::ESTADO_CONFIRMADA)
                ->count();

            $citasPendientes = (clone $citasQuery)
                ->where('estado', Cita::ESTADO_PENDIENTE)
                ->count();

            $citasAtendidas = (clone $citasQuery)
                ->where('estado', Cita::ESTADO_ATENDIDA)
                ->count();

            $citasCanceladas = (clone $citasQuery)
                ->where('estado', Cita::ESTADO_CANCELADA)
                ->count();

            $citasInasistencias = (clone $citasQuery)
                ->where('estado', Cita::ESTADO_INASISTENCIA)
                ->count();

            // Cantidad de citas por médico
            $citasPorProfesional = Medico::with('usuario')
                ->withCount([
                    'citas' => function ($query) use ($fechaInicio, $fechaFin) {
                        $query->whereDate('inicia_en', '>=', $fechaInicio)
                            ->whereDate('inicia_en', '<=', $fechaFin);
                    },
                ])
                ->get()
                ->map(function ($medico) {
                    return [
                        'nombre' => $medico->usuario->name ?? 'Sin nombre',
                        'citas_count' => $medico->citas_count,
                    ];
                });

            // Enviar información al dashboard
            return Inertia::render('admin/dashboard', [
                'totales' => [
                    'medicos' => Medico::count(),

                    'especialidades' => Especialidad::count(),

                    'citas_hoy' => Cita::whereDate('inicia_en', today())
                        ->where('estado', '!=', Cita::ESTADO_CANCELADA)
                        ->count(),
                ],

                'medicos' => $medicos,

                'usuarios' => $usuarios,

                'especialidadesLista' => $especialidadesLista,

                'reporteCitas' => [
                    'total' => $totalCitas,
                    'confirmadas' => $citasConfirmadas,
                    'pendientes' => $citasPendientes,
                    'atendidas' => $citasAtendidas,
                    'canceladas' => $citasCanceladas,
                    'inasistencias' => $citasInasistencias,
                    'por_profesional' => $citasPorProfesional,
                    'desde' => $fechaInicio,
                    'hasta' => $fechaFin,
                ],
            ]);
        }

        if ($request->user()->rol === User::ROL_PACIENTE) {
            return Inertia::render(
                'pacientes/mis-citas',
                app(MisCitasController::class)->datos($request)
            );
        }

        // Dashboard para usuarios que no son administradores
        return Inertia::render('dashboard');
    }
}
