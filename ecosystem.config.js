module.exports = {
  apps : [
    {
      name: "biometrico-realtime",
      script: "./scripts/sync/live_monitor.py",
      interpreter: "python", // Asegúrate que 'python' funcione en tu CMD
      restart_delay: 10000,  // Espera 10 seg antes de reiniciar si falla
      autorestart: true,     // Reinicia automáticamente si el script muere
      watch: false,          // No reiniciar por cambios en archivos (evita bucles)
      env: {
        NODE_ENV: "development",
      }
    },
    {
      name: "asistencia-scheduler",
      script: "./scripts/sync/summarizer.py",
      interpreter: "python",
      // Configuración de Cron (cada 10 minutos según tu imagen)
      cron_restart: "*/10 * * * *", 
      autorestart: false, // Importante: evita que se ejecute en bucle infinito
      out_file: "./logs/cron_out.log",
      error_file: "./logs/cron_err.log"
    },
    {
      name: "asistencia-sync-full",
      script: "./scripts/sync/run.py", // Script refactorizado
      interpreter: "python",
      cron_restart: "0 * * * *", // Se ejecuta al minuto 0 de cada hora
      autorestart: false,
      out_file: "./logs/sync_full_out.log",
      error_file: "./logs/sync_full_err.log"
    },
    {
      name: "comedor-sync",
      script: "./scripts/sync/run_comedor.py",
      interpreter: "python",
      cron_restart: "5 * * * *", // Ejecuta al minuto 5 de cada hora, después de asistencia
      autorestart: false,
      out_file: "./logs/comedor_sync_out.log",
      error_file: "./logs/comedor_sync_err.log"
    }

  ]
};
