from datetime import datetime
from config import (
    COMEDOR_DESCUENTA_MINUTOS,
    HORA_ENTRADA_OFICIAL,
    MARGEN_TARDIA_MIN,
    MINUTOS_ESPERADOS_EN_FALTA_CERO,
)
from attendance_utils import (
    calc_descuento_comedor,
    calcular_marcaje,
    combine_time,
    evaluar_llegada,
    evaluar_salida,
    is_laborable,
    obs_permiso_parcial,
    overlap_minutes,
    parse_hora_config,
    permiso_window,
    shift_window,
)


def compute_row(fecha, user_row, punches_map, novelties_map, feriado_desc, comedor_marks_map, novelty_types_map):
    user_id, _nombre, t_hora, t_hora_salida, t_margen, t_dias_laborales, turno_id = user_row

    hora_config = str(t_hora) if t_hora else HORA_ENTRADA_OFICIAL
    margen_config = t_margen if t_margen is not None else MARGEN_TARDIA_MIN
    laborable = is_laborable(fecha, t_dias_laborales)

    stats = punches_map.get(user_id)
    info_novedad = novelties_map.get(user_id)
    entrada = stats[0] if stats else None
    salida = stats[1] if stats else None
    total = stats[2] if stats else 0

    # If there is only one punch, it is considered an entry and the exit is void.
    if total == 1:
        salida = None

    estado = "falta"
    observacion = ""
    llegada_slug = "sin_llegada"
    salida_slug = "sin_salida"
    es_incompleto = True
    estado_excepcion_slug = None

    minutos_trabajados = 0
    descuento_comedor = 0
    minutos_neto = 0
    minutos_esperados = 0
    saldo_minutos = 0
    minutos_debe = 0
    extras_informativas_min = 0
    permiso_parcial_min_aplicado = 0
    tardia = False

    shift_start_naive, shift_end_naive, expected_raw_min = shift_window(fecha, t_hora, t_hora_salida)

    if total > 0:
        tz_info = (entrada or salida).tzinfo if (entrada or salida) else None
        h, m, s = parse_hora_config(hora_config)
        limite_llegada = datetime.combine(fecha, datetime.min.time()).replace(hour=h, minute=m, second=s, tzinfo=tz_info)
        limite_salida = combine_time(fecha, t_hora_salida, tz_info) if t_hora_salida else None

        perm_start_tz, perm_end_tz, _ = permiso_window(fecha, info_novedad, tz_info)
        if perm_start_tz and perm_end_tz and perm_start_tz <= limite_llegada < perm_end_tz:
            limite_llegada_eval = perm_end_tz
        else:
            limite_llegada_eval = limite_llegada

        if perm_start_tz and perm_end_tz and limite_salida and perm_start_tz < limite_salida <= perm_end_tz:
            limite_salida_eval = perm_start_tz
        else:
            limite_salida_eval = limite_salida

        perm_start_naive, perm_end_naive, _ = permiso_window(fecha, info_novedad, None)
        permiso_parcial_min_aplicado = overlap_minutes(shift_start_naive, shift_end_naive, perm_start_naive, perm_end_naive)

        minutos_trabajados, es_incompleto, estado_calc = calcular_marcaje(entrada, salida)
        estado = estado_calc

        llegada_slug, tardia = evaluar_llegada(entrada, limite_llegada_eval, margen_config)
        salida_slug = evaluar_salida(salida, limite_salida_eval, margen_config, es_incompleto)

        if COMEDOR_DESCUENTA_MINUTOS and entrada and salida and not es_incompleto:
            descuento_comedor = calc_descuento_comedor(comedor_marks_map.get(user_id, []), entrada, salida)
            if descuento_comedor > 0:
                observacion = f"Comedor descontado: {descuento_comedor} min"
        minutos_neto = max(0, minutos_trabajados - descuento_comedor)

    elif not laborable:
        estado = "descanso"
        es_incompleto = False
        expected_raw_min = 0

    if info_novedad:
        tipo_nov = info_novedad.get("tipo", "novedad").lower()
        estado_excepcion = novelty_types_map.get(tipo_nov, "permiso")
        if info_novedad.get("es_dia_completo", True):
            estado = estado_excepcion
            estado_excepcion_slug = estado_excepcion
            entrada = None
            salida = None
            minutos_trabajados = 0
            descuento_comedor = 0
            minutos_neto = 0
            minutos_esperados = 0
            saldo_minutos = 0
            minutos_debe = 0
            extras_informativas_min = 0
            permiso_parcial_min_aplicado = 0
            tardia = False
            llegada_slug = "sin_llegada"
            salida_slug = "sin_salida"
            es_incompleto = False
            observacion = observacion or f"Justificado: {tipo_nov.capitalize()}"
        else:
            obs_perm = obs_permiso_parcial(fecha, hora_config, t_hora_salida, info_novedad)
            if obs_perm:
                observacion = f"{observacion} | {obs_perm}" if observacion else obs_perm

    elif feriado_desc:
        estado = "feriado"
        estado_excepcion_slug = "feriado"
        entrada = None
        salida = None
        minutos_trabajados = 0
        descuento_comedor = 0
        minutos_neto = 0
        minutos_esperados = 0
        saldo_minutos = 0
        minutos_debe = 0
        extras_informativas_min = 0
        permiso_parcial_min_aplicado = 0
        tardia = False
        llegada_slug = "sin_llegada"
        salida_slug = "sin_salida"
        es_incompleto = False
        observacion = f"{observacion} | Feriado: {feriado_desc}" if observacion else f"Feriado: {feriado_desc}"

    if expected_raw_min > 0 and estado_excepcion_slug is None and laborable:
        minutos_esperados = max(0, expected_raw_min - (permiso_parcial_min_aplicado or 0))
        if estado == "falta":
            if MINUTOS_ESPERADOS_EN_FALTA_CERO:
                minutos_esperados = 0
            saldo_minutos = -minutos_esperados
            minutos_debe = minutos_esperados
            extras_informativas_min = 0
        elif not es_incompleto:
            saldo_minutos = (minutos_neto or 0) - (minutos_esperados or 0)
            minutos_debe = max(0, -saldo_minutos)
            extras_informativas_min = max(0, saldo_minutos)
        else:
            minutos_esperados = 0
            saldo_minutos = 0
            minutos_debe = 0
            extras_informativas_min = 0
            permiso_parcial_min_aplicado = 0

    return (
        user_id,
        fecha,
        entrada,
        salida,
        minutos_trabajados,
        extras_informativas_min,
        minutos_esperados,
        minutos_debe,
        saldo_minutos,
        permiso_parcial_min_aplicado,
        minutos_neto,
        descuento_comedor,
        estado,
        tardia,
        observacion,
        llegada_slug,
        salida_slug,
        es_incompleto,
        estado_excepcion_slug,
    )

