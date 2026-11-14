@php
    $nombresEstado = [
        'pendiente' => 'Pendiente',
        'confirmada' => 'Confirmada',
        'en_espera' => 'En espera',
        'en_consulta' => 'En consulta',
        'atendida' => 'Atendida',
        'cancelada' => 'Cancelada',
        'inasistencia' => 'Inasistencia',
    ];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $titulo }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 20px; margin: 0 0 4px; color: #0f766e; }
        h2 { font-size: 14px; margin: 18px 0 6px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
        .muted { color: #6b7280; }
        .caja { border: 1px solid #d1d5db; padding: 8px 10px; margin-top: 10px; }
        .total { font-size: 16px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #d1d5db; padding: 5px 6px; text-align: left; }
        th { background: #f3f4f6; }
        td.num, th.num { text-align: right; }
        .vacio { color: #6b7280; font-style: italic; }
    </style>
</head>
<body>
    <h1>{{ $titulo }}</h1>
    <p class="muted">Clínica · Generado el {{ $generado }}</p>

    <div class="caja">
        <strong>Filtros usados:</strong>
        desde {{ $filtros['desde'] }} hasta {{ $filtros['hasta'] }} · Todos los médicos
        <br>
        <span class="total">Total de citas del período: {{ $total }}</span>
    </div>

    <h2>Citas por estado</h2>
    <table>
        <thead>
            <tr><th>Estado</th><th class="num">Citas</th></tr>
        </thead>
        <tbody>
            @foreach ($porEstado as $estado => $cantidad)
                <tr>
                    <td>{{ $nombresEstado[$estado] ?? $estado }}</td>
                    <td class="num">{{ $cantidad }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Citas por especialidad</h2>
    @if (count($porEspecialidad) === 0)
        <p class="vacio">No hay citas en el período.</p>
    @else
        <table>
            <thead>
                <tr><th>Especialidad</th><th class="num">Citas</th></tr>
            </thead>
            <tbody>
                @foreach ($porEspecialidad as $fila)
                    <tr>
                        <td>{{ $fila['nombre'] }}</td>
                        <td class="num">{{ $fila['total'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Citas por médico</h2>
    <table>
        <thead>
            <tr>
                <th>Médico</th>
                <th>Especialidad</th>
                <th class="num">Total</th>
                <th class="num">Atendidas</th>
                <th class="num">Canceladas</th>
                <th class="num">Inasistencias</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($porMedico as $medico)
                <tr>
                    <td>{{ $medico['nombre'] }}</td>
                    <td>{{ $medico['especialidad'] }}</td>
                    <td class="num">{{ $medico['total'] }}</td>
                    <td class="num">{{ $medico['atendida'] ?? 0 }}</td>
                    <td class="num">{{ $medico['cancelada'] ?? 0 }}</td>
                    <td class="num">{{ $medico['inasistencia'] ?? 0 }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="vacio">No hay médicos registrados.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Citas por mes</h2>
    <table>
        <thead>
            <tr><th>Mes</th><th class="num">Citas</th></tr>
        </thead>
        <tbody>
            @foreach ($porMes as $mes)
                <tr>
                    <td>{{ ucfirst(\Illuminate\Support\Carbon::parse($mes['mes'].'-01')->locale('es')->translatedFormat('F Y')) }}</td>
                    <td class="num">{{ $mes['total'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>