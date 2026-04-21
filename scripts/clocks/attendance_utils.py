from datetime import datetime, timedelta
from config import COMEDOR_MAX_DAILY_MIN, COMEDOR_MAX_SESSION_MIN


def is_laborable(fecha, dias_laborales):
    dias = dias_laborales or [1, 2, 3, 4, 5]
    weekday = fecha.weekday()
    if dias and min(dias) >= 1 and max(dias) <= 7:
        return (weekday + 1) in dias
    return weekday in dias


def combine_time(fecha, t, tzinfo=None):
    if not t:
        return None
    dt = datetime.combine(fecha, t)
    return dt.replace(tzinfo=tzinfo) if tzinfo is not None else dt


def parse_hora_config(hora_str):
    parts = str(hora_str).split(":")
    if len(parts) < 2:
        return 0, 0, 0
    h = int(parts[0])
    m = int(parts[1])
    s_raw = parts[2] if len(parts) > 2 else "0"
    s = int(str(s_raw).split(".")[0])
    return h, m, s


def shift_window(fecha, turno_entrada, turno_salida):
    if not turno_entrada or not turno_salida:
        return None, None, 0
    start = datetime.combine(fecha, turno_entrada)
    end = datetime.combine(fecha, turno_salida)
    if end <= start:
        end = end + timedelta(days=1)
    mins = int((end - start).total_seconds() / 60)
    return start, end, max(0, mins)


def permiso_window(fecha, info_novedad, tzinfo=None):
    if not info_novedad or info_novedad.get("es_dia_completo", True):
        return None, None, 0
    h_ini = info_novedad.get("hora_inicio")
    h_fin = info_novedad.get("hora_fin")
    if not h_ini or not h_fin:
        return None, None, 0
    start = combine_time(fecha, h_ini, tzinfo)
    end = combine_time(fecha, h_fin, tzinfo)
    if not start or not end:
        return None, None, 0
    if end <= start:
        end = end + timedelta(days=1)
    mins = int((end - start).total_seconds() / 60)
    return start, end, max(0, mins)


def overlap_minutes(a_start, a_end, b_start, b_end):
    if not a_start or not a_end or not b_start or not b_end:
        return 0
    start = a_start if a_start > b_start else b_start
    end = a_end if a_end < b_end else b_end
    if end <= start:
        return 0
    return int((end - start).total_seconds() / 60)


def calc_descuento_comedor(marks, entrada, salida):
    if not marks or not entrada or not salida:
        return 0
    desc = 0
    i = 0
    while i + 1 < len(marks):
        s = marks[i]
        e = marks[i + 1]
        i += 2
        if e <= entrada or s >= salida:
            continue
        if s < entrada:
            s = entrada
        if e > salida:
            e = salida
        minutes = int((e - s).total_seconds() / 60)
        if minutes > COMEDOR_MAX_SESSION_MIN:
            minutes = COMEDOR_MAX_SESSION_MIN
        if minutes > 0:
            desc += minutes
    if desc > COMEDOR_MAX_DAILY_MIN:
        desc = COMEDOR_MAX_DAILY_MIN
    return max(0, desc)


def calcular_marcaje(entrada, salida):
    if entrada and salida and salida > entrada:
        mins = int((salida - entrada).total_seconds() / 60)
        return max(0, mins), False, "presente"
    return 0, True, "incompleto"


def evaluar_llegada(entrada, limite_llegada, margen_min):
    if not entrada or not limite_llegada:
        return "sin_llegada", False
    if entrada.tzinfo is None and limite_llegada.tzinfo is not None:
        entrada = entrada.replace(tzinfo=limite_llegada.tzinfo)
    if entrada > (limite_llegada + timedelta(minutes=margen_min)):
        return "llegada_tardia", True
    return "llegada_puntual", False


def evaluar_salida(salida, limite_salida, margen_min, es_incompleto):
    if es_incompleto or not salida:
        return "sin_salida"
    if not limite_salida:
        return "salida_puntual"
    if salida < (limite_salida - timedelta(minutes=margen_min)):
        return "salida_temprana"
    return "salida_puntual"


def obs_permiso_parcial(fecha, hora_config, t_hora_salida, info_novedad):
    if not info_novedad or info_novedad.get("es_dia_completo", True):
        return ""
    tipo_nov = info_novedad.get("tipo", "novedad").lower()
    h_ini = info_novedad.get("hora_inicio")
    h_fin = info_novedad.get("hora_fin")
    str_ini = h_ini.strftime("%H:%M") if h_ini else "?"
    str_fin = h_fin.strftime("%H:%M") if h_fin else "?"
    perm_start, perm_end, perm_min = permiso_window(fecha, info_novedad, None)
    if not perm_start or not perm_end:
        return f"Permiso parcial: {tipo_nov} ({str_ini}-{str_fin})"
    h, m, s = parse_hora_config(hora_config)
    lim_llegada = datetime.combine(fecha, datetime.min.time()).replace(hour=h, minute=m, second=s)
    aplica_inicio = perm_start <= lim_llegada < perm_end
    aplica_fin = False
    if t_hora_salida:
        lim_salida = datetime.combine(fecha, t_hora_salida)
        aplica_fin = perm_start < lim_salida <= perm_end
    tag = "inicio" if aplica_inicio else ("salida" if aplica_fin else None)
    if perm_min > 0 and tag:
        return f"Permiso parcial: {tipo_nov} ({str_ini}-{str_fin}) | {perm_min} min | {tag}"
    if perm_min > 0:
        return f"Permiso parcial: {tipo_nov} ({str_ini}-{str_fin}) | {perm_min} min"
    return f"Permiso parcial: {tipo_nov} ({str_ini}-{str_fin})"

