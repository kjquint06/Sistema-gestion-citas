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

class CitaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->tieneRol(User::ROL_ADMIN, User::ROL_RECEPCIONISTA) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'paciente_id' => ['required', 'integer', Rule::exists('pacientes', 'id')],
            'medico_id' => ['required', 'integer', Rule::exists('medicos', 'id')],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_llegada' => ['nullable', 'date_format:H:i'],
            'estado' => ['sometimes', 'required', Rule::in(Cita::ESTADOS)],
            'motivo' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * La validación de cruces y de horario del médico vive en el servicio
     * DisponibilidadCitas, que también usa el paciente al agendar.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                if ($this->input('estado') === Cita::ESTADO_CANCELADA) {
                    return;
                }

                $cita = $this->route('cita');

                $motivo = app(DisponibilidadCitas::class)->motivo(
                    $this->integer('medico_id'),
                    $this->inicio(),
                    $this->fin(),
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
        return Carbon::createFromFormat('Y-m-d H:i', $this->input('fecha').' '.$this->input('hora_inicio'));
    }

    public function fin(): Carbon
    {
        $duracion = Medico::find($this->integer('medico_id'))?->duracion_cita ?? 30;

        return $this->inicio()->addMinutes($duracion);
    }

    /**
     * Datos listos para guardar en la tabla citas.
     *
     * @return array<string, mixed>
     */
    public function datosCita(): array
    {
        $datos = [
            'paciente_id' => $this->integer('paciente_id'),
            'medico_id' => $this->integer('medico_id'),
            'inicia_en' => $this->inicio(),
            'termina_en' => $this->fin(),
            'motivo' => $this->input('motivo') ?: null,
            'hora_llegada' => $this->filled('hora_llegada')
                ? Carbon::createFromFormat('Y-m-d H:i', $this->input('fecha').' '.$this->input('hora_llegada'))
                : null,
        ];

        if ($this->filled('estado')) {
            $datos['estado'] = $this->input('estado');
        }

        return $datos;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'paciente_id.required' => 'Debes elegir un paciente.',
            'paciente_id.exists' => 'El paciente elegido no existe.',
            'medico_id.required' => 'Debes elegir un médico.',
            'medico_id.exists' => 'El médico elegido no existe.',
            'fecha.required' => 'La fecha es obligatoria.',
            'fecha.date_format' => 'La fecha no es válida.',
            'hora_inicio.required' => 'La hora de la cita es obligatoria.',
            'hora_inicio.date_format' => 'Escribe la hora con formato HH:MM.',
            'hora_llegada.date_format' => 'Escribe la hora de llegada con formato HH:MM.',
            'estado.in' => 'El estado elegido no es válido.',
            'motivo.max' => 'El motivo no puede pasar de 255 caracteres.',
        ];
    }
}