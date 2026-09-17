package com.planttrack.v2;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Puente Capacitor -> Widget. La web llama:
 *   WidgetBridge.actualizar({ plantas, proximo, estado })
 * y el widget del escritorio se refresca al instante con esos datos.
 * En web/no-nativo el llamado simplemente no hace nada (silencioso).
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void actualizar(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences sp =
                context.getSharedPreferences(WidgetPlantTrack.PREFS, Context.MODE_PRIVATE);

            Integer plantasObj = call.getInt("plantas");
            int plantas = plantasObj == null ? 0 : plantasObj;
            String proximo = call.getString("proximo", "");
            String estado = call.getString("estado", "");

            sp.edit()
                .putInt("plantas", plantas)
                .putString("proximo", proximo == null ? "" : proximo)
                .putString("estado", estado == null ? "" : estado)
                .apply();

            pintar(context, sp);

            JSObject ret = new JSObject();
            ret.put("ok", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("widget error: " + e.getMessage());
        }
    }

    /** Redibuja todos los widgets de PlantTrack con los datos guardados. */
    static void pintar(Context context, SharedPreferences sp) {
        int plantas = sp.getInt("plantas", -1);
        String proximo = sp.getString("proximo", "");
        String estado = sp.getString("estado", "");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_planttrack);

        if (plantas < 0) {
            // Nunca se ha abierto la app con datos: estado inicial amigable
            views.setTextViewText(R.id.widget_contador, "PlantTrack");
            views.setTextViewText(R.id.widget_proximo, "Abre la app para empezar");
        } else {
            views.setTextViewText(R.id.widget_contador,
                plantas + (plantas == 1 ? " planta " : " plantas ") + "\uD83C\uDF31");
            String linea2;
            if (proximo != null && !proximo.isEmpty()) {
                linea2 = "\uD83D\uDCA7 " + proximo;
            } else if (estado != null && !estado.isEmpty()) {
                linea2 = estado;
            } else {
                linea2 = "Todo regado por hoy";
            }
            views.setTextViewText(R.id.widget_proximo, linea2);
        }

        // Tocar el widget abre PlantTrack (launcher intent estándar)
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (intent != null) {
            PendingIntent pi = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pi);
        }

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        manager.updateAppWidget(new ComponentName(context, WidgetPlantTrack.class), views);
    }
}
