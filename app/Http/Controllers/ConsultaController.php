<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita;
use App\Models\Alergia;
use App\Models\Antecedente;
use Inertia\Inertia;

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

        if (! in_array($cita->estado, $iniciables, true)) {
            return back()->withErrors(['estado' => 'Esta cita ya no se puede iniciar.']);
        }

        $cita->update(['estado' => Cita::ESTADO_EN_CONSULTA]);

        return to_route('consultas.show', $cita);
    }

    public function show(Request $request, Cita $cita): Response
    {
        $this->autorizarMedico($request, $cita);

        $cita->load('paciente.usuario', 'paciente.alergias', 'paciente.antecedentes');

        return Inertia::render('consultas/show', [
            'cita' => [
                'id' => $cita->id,
                'estado' => $cita->estado,
                'motivo' => $cita->motivo,
                'hora' => $cita->inicia_en->format('H:i'),
            ],
            'paciente' => [
                'id' => $cita->paciente->id,
                'nombre' => $cita->paciente->usuario->name,
                'edad' => $cita->paciente->fecha_nacimiento?->age,
                'sexo' => $cita->paciente->sexo,
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
        ]);
    }

    private function autorizarMedico(Request $request, Cita $cita): void
    {
        abort_if($cita->medico_id !== $request->user()->medico?->id, 403);
    }
}
