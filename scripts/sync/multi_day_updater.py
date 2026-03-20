import os
from datetime import datetime, timedelta, date
import argparse
from db_repository import DBRepository
from config import DB_URL

class MultiDayUpdater:
    def __init__(self, db_repo):
        self.db_repo = db_repo

    def process_updates(self, process_date: date):
        """
        Calcula las horas para turnos multi-día y actualiza resumen_diario.
        """
        print(f"\n🚀 Iniciando actualización para turnos multi-día para la fecha: {process_date}")
        
        yesterday = process_date - timedelta(days=1)
        today = process_date

        users = self.db_repo.get_users_with_active_multi_day_shifts()
        print(f"👥 Encontrados {len(users)} usuarios con turnos multi-día activos.")

        for user_id, shift_start_time, shift_end_time in users:
            print(f"\n--- Procesando usuario: {user_id} ---")
            
            # 1. Obtener marcajes de ambos días
            punches_yesterday = self.db_repo.get_punches_for_user_on_date(user_id, yesterday)
            punches_today = self.db_repo.get_punches_for_user_on_date(user_id, today)

            if not punches_yesterday or not punches_today:
                print(f"   - ⚠️ No se encontraron marcajes para la sesión completa. Se omite.")
                continue

            # 2. Encontrar la primera entrada de ayer y la última salida de hoy
            first_entry = min([p[0] for p in punches_yesterday if p[1] == 'ENTRADA'], default=None)
            last_exit = max([p[0] for p in punches_today if p[1] == 'SALIDA'], default=None)

            if not first_entry or not last_exit:
                print(f"   - ⚠️ No se encontró la ENTRADA de ayer o la SALIDA de hoy. Se omite.")
                continue
            
            print(f"   - Entrada: {first_entry}")
            print(f"   - Salida: {last_exit}")

            # 3. Calcular duración total
            total_minutes_worked = (last_exit - first_entry).total_seconds() / 60
            if total_minutes_worked <= 0:
                continue

            # 4. Calcular minutos esperados (asumiendo 24h)
            total_minutes_expected = 24 * 60

            # 5. Distribuir minutos entre los dos días
            # Día 1 (ayer)
            end_of_yesterday = datetime.combine(yesterday, datetime.max.time()).replace(tzinfo=first_entry.tzinfo)
            minutes_yesterday = (end_of_yesterday - first_entry).total_seconds() / 60
            expected_yesterday = (end_of_yesterday.replace(hour=0, minute=0, second=0) - first_entry.replace(hour=shift_start_time.hour, minute=shift_start_time.minute, second=0)).total_seconds() / 60

            # Día 2 (hoy)
            start_of_today = datetime.combine(today, datetime.min.time()).replace(tzinfo=last_exit.tzinfo)
            minutes_today = (last_exit - start_of_today).total_seconds() / 60
            expected_today = (last_exit.replace(hour=shift_end_time.hour, minute=shift_end_time.minute, second=0) - start_of_today).total_seconds() / 60

            print(f"   - Ayer: {minutes_yesterday:.0f} min trabajados / {expected_yesterday:.0f} min esperados")
            print(f"   - Hoy:  {minutes_today:.0f} min trabajados / {expected_today:.0f} min esperados")

            # 6. Actualizar resumen_diario para ambos días
            self.db_repo.update_daily_summary_for_multi_day(user_id, yesterday, minutes_yesterday, expected_yesterday, first_entry, end_of_yesterday)
            self.db_repo.update_daily_summary_for_multi_day(user_id, today, minutes_today, expected_today, start_of_today, last_exit)
            
            print(f"   - ✅ Resumen diario actualizado para {yesterday} y {today}")

        print(f"\n✅ Proceso de actualización de turnos multi-día finalizado.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Actualiza el resumen diario para turnos que cruzan la medianoche.")
    parser.add_argument("--date", help="Fecha de referencia para el procesamiento (YYYY-MM-DD). Por defecto, hoy.")
    args = parser.parse_args()

    process_date = datetime.strptime(args.date, "%Y-%m-%d").date() if args.date else date.today()

    db_repo = DBRepository(DB_URL)
    updater = MultiDayUpdater(db_repo)
    updater.process_updates(process_date)
