package com.krackit.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable Chrome remote debugging: open chrome://inspect on PC while app is running
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
