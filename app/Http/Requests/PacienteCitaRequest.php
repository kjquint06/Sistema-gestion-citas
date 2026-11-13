<?php

namespace App\Http\Requests;

use App\Models\Cita;
use App\Models\Medico;
use App\Models\User;
use App\Services\DisponibilidadCitas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PacienteCitaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $usuario = $this->user();

        return $usuario !== null
            && $usuario->tieneRol(User::ROL_PACIENTE)
            && $usuario->paciente !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'medico_id' => [
                'required',
                'integer',
                Rule::exists('medicos', 'id'),
            ],
            'fecha' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],
            'hora_inicio' => [
                'required',
                'date_format:H:i',
            ],
            'motivo' => [
                'required',
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $cita = $this->route('cita');

                $medico = Medico::find($this->integer('medico_id'));

                if (! $medico) {
                    return;
                }

                $inicio = $this->inicio();
                $duracion = $medico->duracion_cita ?? 30;
                $fin = $inicio->copy()->addMinutes($duracion);

                if ($inicio->isPast()) {
                    $validator->errors()->add(
                        'hora_inicio',
                        'No puedes reservar una cita en una fecha u hora pasada.'
                    );

                    return;
                }

                $motivo = app(DisponibilidadCitas::class)->motivo(
                    $medico->id,
                    $inicio,
                    $fin,
                    $cita instanceof Cita ? $cita->id : null,
                );

                if ($motivo !== null) {
                    $validator->errors()->add('hora_inicio', $motivo);
                }
            },
        ];
    }

    public function inicio(): Carbon
    {
        return Carbon::createFromFormat(
            'Y-m-d H:i',
            $this->input('fecha').' '.$this->input('hora_inicio')
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function datosCita(): array
    {
        $medico = Medico::query()->whereKey($this->integer('medico_id'))->firstOrFail();

        $inicio = $this->inicio();
        $duracion = $medico->duracion_cita ?? 30;

        return [
            'paciente_id' => $this->user()->paciente->id,
            'medico_id' => $medico->id,
            'inicia_en' => $inicio,
            'termina_en' => $inicio->copy()->addMinutes($duracion),
            'motivo' => $this->input('motivo') ?: null,
        ];
    }
}
