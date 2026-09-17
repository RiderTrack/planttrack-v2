package com.planttrack.v2;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity de PlantTrack con el plugin nativo del widget.
 * registerPlugin() DEBE llamarse antes de super.onCreate():
 * BridgeActivity construye el bridge (y registra los plugins)
 * dentro de su propio onCreate.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridge.class);
        super.onCreate(savedInstanceState);
    }
}
