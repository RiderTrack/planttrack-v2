package com.planttrack.v2;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;

/**
 * Widget 2x2 de PlantTrack para el escritorio del celular.
 * Muestra el total de plantas y el próximo riego; al tocarlo
 * abre la app. Los datos los escribe la WebView a través de
 * WidgetBridge (SharedPreferences "planttrack_widget"), así el
 * widget siempre refleja el estado real del jardín.
 */
public class WidgetPlantTrack extends AppWidgetProvider {

    static final String PREFS = "planttrack_widget";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        WidgetBridge.pintar(context, sp);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        WidgetBridge.pintar(context, sp);
    }
}
