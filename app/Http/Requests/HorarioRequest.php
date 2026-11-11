<?php

namespace App\Http\Requests;

use App\Models\Horario;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class HorarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->tieneRol(User::ROL_ADMIN) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'medico_id' => ['required', 'integer', Rule::exists('medicos', 'id')],
            'dia_semana' => ['required', 'integer', 'between:1,7'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ];
    }

    /**
     * Un médico no puede tener dos bloques que se crucen el mismo día.
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

                $cruce = Horario::query()
                    ->where('medico_id', $this->integer('medico_id'))
                    ->where('dia_semana', $this->integer('dia_semana'))
                    ->when($this->route('horario'), fn ($query, $horario) => $query->where('id', '!=', $horario->id))
                    ->where('hora_inicio', '<', $this->input('hora_fin').':00')
                    ->where('hora_fin', '>', $this->input('hora_inicio').':00')
                    ->first();

                if ($cruce !== null) {
                    $validator->errors()->add(
                        'hora_inicio',
                        'Se cruza con otro bloque del médico de '
                            .substr((string) $cruce->hora_inicio, 0, 5).' a '
                            .substr((string) $cruce->hora_fin, 0, 5).'.'
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'medico_id.required' => 'Debes elegir un médico.',
            'medico_id.exists' => 'El médico elegido no existe.',
            'dia_semana.required' => 'Debes elegir un día.',
            'dia_semana.between' => 'El día elegido no es válido.',
            'hora_inicio.required' => 'La hora de inicio es obligatoria.',
            'hora_inicio.date_format' => 'Escribe la hora de inicio con formato HH:MM.',
            'hora_fin.required' => 'La hora de fin es obligatoria.',
            'hora_fin.date_format' => 'Escribe la hora de fin con formato HH:MM.',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
        ];
    }
}