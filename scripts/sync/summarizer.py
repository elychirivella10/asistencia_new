from datetime import datetime
from config import DB_URL
from db_repository import DBRepository
from attendance_summary_builder import compute_row


class AttendanceSummarizer:
    def __init__(self, db_repo):
        self.db_repo = db_repo

    def process_summary(self):
        print(f"🔍 [{datetime.now().strftime('%H:%M:%S')}] Iniciando procesamiento de resumen...")
        fechas = self.db_repo.get_unprocessed_dates()
        if not fechas:
            print("💤 Todo al día.")
            return

        usuarios = self.db_repo.get_users_with_shifts()
        novelty_types_map = self.db_repo.get_novelty_types_map()
        print(f"👥 Usuarios activos cargados: {len(usuarios)}")
        print(f"📋 Tipos de novedades cargados: {len(novelty_types_map)}")

        for fecha in fechas:
            print(f"⚙️ Analizando fecha: {fecha}")
            punches_map = self.db_repo.get_all_punches_for_date(fecha)
            novelties_map = self.db_repo.get_all_novelties_for_date(fecha)
            feriado_desc = self.db_repo.get_holiday_for_date(fecha)
            comedor_marks_map = self.db_repo.get_all_comedor_marks_for_date(fecha)

            batch_records = [
                compute_row(
                    fecha=fecha,
                    user_row=u,
                    punches_map=punches_map,
                    novelties_map=novelties_map,
                    feriado_desc=feriado_desc,
                    comedor_marks_map=comedor_marks_map,
                    novelty_types_map=novelty_types_map,
                )
                for u in usuarios
            ]
            if batch_records:
                self.db_repo.batch_upsert_daily_summary(batch_records)
                print(f"   💾 Guardados {len(batch_records)} registros para {fecha}")

        print("✅ Procesamiento finalizado exitosamente.")


if __name__ == "__main__":
    db_repo = DBRepository(DB_URL)
    AttendanceSummarizer(db_repo).process_summary()
