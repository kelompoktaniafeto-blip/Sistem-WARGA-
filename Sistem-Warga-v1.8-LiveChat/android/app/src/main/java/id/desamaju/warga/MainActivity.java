package id.desamaju.warga;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import android.graphics.Color;
import android.view.Gravity;
import android.view.ViewGroup;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final int REQ_MEDIA = 1001;
    private static final int REQ_LOCATION = 1002;
    private static final String PREFS = "warga_config";
    private static final String KEY_URL = "server_url";
    private WebView webView;
    private String serverUrl;
    private String pendingOrigin;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SharedPreferences p = getSharedPreferences(PREFS, MODE_PRIVATE);
        serverUrl = p.getString(KEY_URL, "");
        if (serverUrl.isEmpty()) showServerSetup(); else launchWeb();
    }

    private void showServerSetup() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(48, 60, 48, 40);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        box.setBackgroundColor(Color.rgb(245,247,251));

        TextView title = new TextView(this);
        title.setText("WARGA\nSistem Informasi Desa");
        title.setTextSize(28); title.setTextColor(Color.rgb(18,51,91));
        title.setGravity(Gravity.CENTER); title.setPadding(0,0,0,28);
        box.addView(title, new LinearLayout.LayoutParams(-1, -2));

        TextView help = new TextView(this);
        help.setText("Masukkan alamat server Sistem WARGA. Contoh LAN: http://192.168.1.10:3000");
        help.setTextSize(15); help.setTextColor(Color.DKGRAY); help.setPadding(0,0,0,18);
        box.addView(help, new LinearLayout.LayoutParams(-1, -2));

        EditText input = new EditText(this);
        input.setHint("http://192.168.1.10:3000"); input.setSingleLine(true);
        input.setText("http://10.0.2.2:3000");
        box.addView(input, new LinearLayout.LayoutParams(-1, -2));

        Button save = new Button(this); save.setText("Hubungkan ke Sistem WARGA");
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1, -2); bp.topMargin = 24;
        box.addView(save, bp);
        TextView note = new TextView(this);
        note.setText("Untuk penggunaan publik, gunakan HTTPS. HTTP cocok untuk pengujian jaringan lokal.");
        note.setTextSize(12); note.setTextColor(Color.GRAY); note.setPadding(0,22,0,0);
        box.addView(note, new LinearLayout.LayoutParams(-1,-2));

        save.setOnClickListener(v -> {
            String u = input.getText().toString().trim();
            if (!u.startsWith("http://") && !u.startsWith("https://")) { Toast.makeText(this,"URL harus diawali http:// atau https://",Toast.LENGTH_LONG).show(); return; }
            serverUrl = u.replaceAll("/+$", "");
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_URL, serverUrl).apply();
            launchWeb();
        });
        setContentView(box);
    }

    private void launchWeb() {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); s.setGeolocationEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true);
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){
                Uri u=r.getUrl();
                if (u.getScheme()!=null && (u.getScheme().equals("http")||u.getScheme().equals("https"))) { v.loadUrl(u.toString()); return true; }
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override public void onPermissionRequest(final PermissionRequest request){
                runOnUiThread(() -> {
                    if (isTrustedOrigin(request.getOrigin().toString())) {
                        List<String> grants = new ArrayList<>();
                        for (String r: request.getResources()) {
                            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) grants.add(r);
                            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) grants.add(r);
                        }
                        if (!grants.isEmpty() && checkSelfPermission(Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED) {
                            if (grants.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE) && checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED) {
                                pendingOrigin=request.getOrigin().toString(); requestMediaPermissions(); return;
                            }
                            request.grant(grants.toArray(new String[0]));
                        } else if (!grants.isEmpty()) { pendingOrigin=request.getOrigin().toString(); requestMediaPermissions(); }
                    } else request.deny();
                });
            }
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback){
                if (isTrustedOrigin(origin)) {
                    if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED) requestLocationPermissions();
                    callback.invoke(origin,true,false);
                } else callback.invoke(origin,false,false);
            }
        });
        setContentView(webView);
        webView.loadUrl(serverUrl);
    }

    private boolean isTrustedOrigin(String origin){
        try { return Uri.parse(origin).getHost()!=null && Uri.parse(origin).getHost().equals(Uri.parse(serverUrl).getHost()); }
        catch(Exception e){ return false; }
    }
    private void requestMediaPermissions(){
        List<String> p=new ArrayList<>();
        if(checkSelfPermission(Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED)p.add(Manifest.permission.CAMERA);
        if(checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED)p.add(Manifest.permission.RECORD_AUDIO);
        if(!p.isEmpty()) requestPermissions(p.toArray(new String[0]),REQ_MEDIA);
    }
    private void requestLocationPermissions(){
        if(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
    }
    @Override public void onBackPressed(){ if(webView!=null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
}
