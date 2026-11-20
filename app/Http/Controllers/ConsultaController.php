<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita;
use App\Models\Alergia;
use App\Models\Antecedente;
use App\Models\Paciente;
use App\Models\Medico;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\GuardarConsultaRequest;

class ConsultaController extends Controller
{
    public function index(Request $request)
    {
        $medico = $request->user()->medico;

        abort_if($medico === null, 403);

        $citasHoy = $medico->citas()
            ->with('paciente.usuario')
            ->whereBetween('inicia_en', [now()->startOfDay(), now()->endOfDay()])
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->orderBy('inicia_en')
            ->get()
            ->map(fn (Cita $cita) => [
                'id' => $cita->id,
                'hora' => $cita->inicia_en->format('H:i'),
                'paciente' => $cita->paciente->usuario->name,
                'motivo' => $cita->motivo,
                'estado' => $cita->estado,
            ]);

        return Inertia::render('consultas/index', [
        'citasHoy' => $citasHoy,
        ]);
    }

    public function iniciar(Request $request, Cita $cita): RedirectResponse
    {
        $this->autorizarMedico($request, $cita);

        
        $iniciables = [
            Cita::ESTADO_PENDIENTE,
            Cita::ESTADO_CONFIRMADA,
            Cita::ESTADO_EN_ESPERA,
            Cita::ESTADO_EN_CONSULTA,
        ];

        if ($cita->estado !== Cita::ESTADO_EN_ESPERA) {
            return back()->withErrors([
                'estado' => 'Solo se puede iniciar una cita cuyo paciente esté en espera.',
            ]);
        }
        $cita->update(['estado' => Cita::ESTADO_EN_CONSULTA]);

        return to_route('consultas.show', $cita);
    }

    public function show(Request $request, Cita $cita): Response|RedirectResponse
    {
        $this->autorizarMedico($request, $cita);
        
        if ($cita->estado !== Cita::ESTADO_EN_CONSULTA) {
            return to_route('consultas.index');
        }


        $cita->load(
            'paciente.usuario',
            'paciente.alergias',
            'paciente.antecedentes',
            'medico.usuario',
            'medico.especialidad',
        );

        $ultimaConsulta = $cita->paciente->consultas()
            ->where('consultas.cita_id', '!=', $cita->id)
            ->with('cita')
            ->latest('consultas.created_at')
            ->first();

        return Inertia::render('consultas/show', [
            'cita' => [
                'id' => $cita->id,
                'estado' => $cita->estado,
                'motivo' => $cita->motivo,
                'fecha' => $cita->inicia_en->format('d/m/Y'),
                'inicia' => $cita->inicia_en->format('H:i'),
                'termina' => $cita->termina_en->format('H:i'),
                'hora_llegada' => $cita->hora_llegada?->format('H:i'),
            ],
            'paciente' => [
                'id' => $cita->paciente->id,
                'nombre' => $cita->paciente->usuario->name,
                'edad' => $cita->paciente->fecha_nacimiento?->age,
                'sexo' => $cita->paciente->sexo,
            ],
            'medico' => [
                'nombre' => $cita->medico->usuario->name,
                'especialidad' => $cita->medico->especialidad?->nombre,
                'consultorio' => $cita->medico->consultorio,
                'duracion' => $cita->medico->duracion_cita,
            ],
            'alergias' => $cita->paciente->alergias->map(fn (Alergia $alergia) => [
                'id' => $alergia->id,
                'alergeno' => $alergia->alergeno,
                'gravedad' => $alergia->gravedad,
                'reaccion' => $alergia->reaccion,
            ]),
            'antecedentes' => $cita->paciente->antecedentes->map(fn (Antecedente $antecedente) => [
                'id' => $antecedente->id,
                'tipo' => $antecedente->tipo,
                'descripcion' => $antecedente->descripcion,
                'fecha' => $antecedente->fecha?->format('d/m/Y'),
            ]),
            'ultimaConsulta' => $ultimaConsulta === null ? null : [
                'fecha' => $ultimaConsulta->cita->inicia_en->format('d/m/Y'),
                'diagnostico' => $ultimaConsulta->diagnostico,
                'signos_vitales' => $ultimaConsulta->signos_vitales,
            ],
        ]);
    }

    private function autorizarMedico(Request $request, Cita $cita): void
    {
        abort_if($cita->medico_id !== $request->user()->medico?->id, 403);
    }

    public function guardar(GuardarConsultaRequest $request, Cita $cita): RedirectResponse
    {
        if ($cita->estado !== Cita::ESTADO_EN_CONSULTA) {
            return back()->withErrors(['estado' => 'Primero debes iniciar la consulta.']);
        }

        $datos = $request->validated();

        DB::transaction(function () use ($cita, $datos) {
            $consulta = $cita->consulta()->create(
                Arr::only($datos, ['sintomas', 'diagnostico', 'notas', 'signos_vitales'])
            );

            $consulta->recetas()->createMany($datos['recetas'] ?? []);

            $cita->paciente->antecedentes()->createMany($datos['antecedentes_nuevos'] ?? []);
            $cita->paciente->alergias()->createMany($datos['alergias_nuevas'] ?? []);

            $cita->update(['estado' => Cita::ESTADO_ATENDIDA]);
        });

        return to_route('consultas.index');
    }
}
