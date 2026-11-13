<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Valida y crea un usuario con rol paciente y su ficha de paciente.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'telefono' => ['nullable', 'string', 'max:20'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'sexo' => ['required', Rule::in(['Femenino', 'Masculino'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:255'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:20'],
            'privacidad' => ['required', 'accepted'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $usuario = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'telefono' => $input['telefono'] ?? null,
                'password' => $input['password'],
                'rol' => User::ROL_PACIENTE,
            ]);

            $usuario->markEmailAsVerified();

            Paciente::create([
                'usuario_id' => $usuario->id,
                'fecha_nacimiento' => $input['fecha_nacimiento'],
                'sexo' => $input['sexo'],
                'direccion' => $input['direccion'] ?? null,
                'contacto_emergencia_nombre' => $input['contacto_emergencia_nombre'] ?? null,
                'contacto_emergencia_telefono' => $input['contacto_emergencia_telefono'] ?? null,
            ]);

            return $usuario;
        });
    }
}
