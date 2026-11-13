<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class MedicoRequest extends FormRequest
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
        $reglas = [
            'especialidad_id' => ['required', 'integer', Rule::exists('especialidades', 'id')],
            'numero_colegiado' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medicos', 'numero_colegiado')->ignore($this->route('medico')),
            ],
            'duracion_cita' => ['required', 'integer', 'min:5', 'max:240'],
            'consultorio' => ['nullable', 'string', 'max:50'],
        ];

        // El usuario vinculado solo se elige al crear; al editar no cambia
        if ($this->isMethod('post')) {
            $reglas['modo_usuario'] = ['required', Rule::in(['existente', 'nuevo'])];

            if ($this->input('modo_usuario') === 'nuevo') {
                $reglas['name'] = ['required', 'string', 'max:255'];
                $reglas['email'] = ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')];
                $reglas['telefono'] = ['nullable', 'string', 'max:20'];
                $reglas['password'] = ['required', 'string', Password::defaults()];
            } else {
                $reglas['usuario_id'] = [
                    'required',
                    'integer',
                    Rule::exists('users', 'id')->where('rol', User::ROL_MEDICO),
                    Rule::unique('medicos', 'usuario_id'),
                ];
            }
        }

        return $reglas;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'especialidad_id.required' => 'Debes elegir una especialidad.',
            'especialidad_id.exists' => 'La especialidad elegida no existe.',
            'numero_colegiado.required' => 'El número de colegiado es obligatorio.',
            'numero_colegiado.unique' => 'Ese número de colegiado ya está registrado.',
            'duracion_cita.required' => 'La duración de la cita es obligatoria.',
            'duracion_cita.min' => 'La duración mínima es de 5 minutos.',
            'duracion_cita.max' => 'La duración máxima es de 240 minutos.',
            'consultorio.max' => 'El consultorio no puede pasar de 50 caracteres.',
            'usuario_id.required' => 'Debes elegir un usuario con rol médico.',
            'usuario_id.exists' => 'El usuario elegido no tiene rol médico.',
            'usuario_id.unique' => 'Ese usuario ya está vinculado a otro médico.',
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Escribe un correo válido.',
            'email.unique' => 'Ese correo ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
        ];
    }
}
