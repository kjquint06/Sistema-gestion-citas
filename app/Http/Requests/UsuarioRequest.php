<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UsuarioRequest extends FormRequest
{
    public const ROLES = [
        User::ROL_PACIENTE,
        User::ROL_MEDICO,
        User::ROL_RECEPCIONISTA,
        User::ROL_ADMIN,
    ];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $usuario = $this->usuarioEditado();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($usuario?->id),
            ],
            'telefono' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', Rule::in(self::ROLES)],
            // Al crear la contraseña es obligatoria; al editar es opcional
            'password' => [$usuario ? 'nullable' : 'required', 'string', Password::default()],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $usuario = $this->usuarioEditado();

                // El administrador no puede quitarse su propio rol
                if ($usuario !== null
                    && $usuario->is($this->user())
                    && $this->input('rol') !== User::ROL_ADMIN) {
                    $validator->errors()->add('rol', 'No puedes quitarte tu propio rol de administrador.');
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo',
            'telefono' => 'teléfono',
            'rol' => 'rol',
            'password' => 'contraseña',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Escribe un correo válido.',
            'email.max' => 'El correo no puede tener más de 255 caracteres.',
            'email.unique' => 'Ya existe un usuario con este correo.',
            'telefono.max' => 'El teléfono no puede tener más de 20 caracteres.',
            'rol.required' => 'Selecciona un rol.',
            'rol.in' => 'El rol seleccionado no es válido.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos :min caracteres.',
        ];
    }

    private function usuarioEditado(): ?User
    {
        $usuario = $this->route('usuario');

        return $usuario instanceof User ? $usuario : null;
    }
}
