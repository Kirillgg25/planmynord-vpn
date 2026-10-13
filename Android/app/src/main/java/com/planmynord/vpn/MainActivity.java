package com.planmynord.vpn;

import android.app.Activity;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.net.VpnService;
import android.net.Uri;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Space;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends Activity {
    private static final int VPN_PERMISSION_REQUEST = 1407;
    private static final int BG = Color.rgb(7, 16, 29);
    private static final int PANEL = Color.rgb(13, 25, 41);
    private static final int PANEL_2 = Color.rgb(17, 31, 49);
    private static final int TEXT = Color.rgb(247, 251, 255);
    private static final int MUTED = Color.rgb(143, 162, 184);
    private static final int BLUE = Color.rgb(59, 130, 246);
    private static final int CYAN = Color.rgb(35, 200, 230);
    private static final int GREEN = Color.rgb(52, 211, 153);
    private static final int RED = Color.rgb(251, 113, 133);

    private final Map<String, Map<String, String>> translations = new HashMap<>();
    private LinearLayout content;
    private String language = "no";
    private String accountCookie = "";
    private boolean demoConnected = false;
    private String currentPage = "overview";
    private final ExecutorService networkExecutor = Executors.newSingleThreadExecutor();
    private final Handler metricsHandler = new Handler(Looper.getMainLooper());
    private TextView durationValue;
    private TextView trafficValue;
    private final Runnable metricsUpdater = new Runnable() {
        @Override
        public void run() {
            boolean active = PlanMyNordVpnService.isActive();
            if (active != demoConnected) {
                demoConnected = active;
                render();
            }
            updateMetrics();
            metricsHandler.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        buildTranslations();
        SharedPreferences preferences = getSharedPreferences("planmynord", MODE_PRIVATE);
        language = preferences.getString("language", "no");
        try {
            String encrypted = preferences.getString("account_cookie_encrypted", "");
            if (!encrypted.isEmpty()) {
                byte[] packed = android.util.Base64.decode(encrypted, android.util.Base64.NO_WRAP);
                javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(javax.crypto.Cipher.DECRYPT_MODE, accountKey(), new javax.crypto.spec.GCMParameterSpec(128, java.util.Arrays.copyOfRange(packed, 0, 12)));
                String cookie = new String(cipher.doFinal(java.util.Arrays.copyOfRange(packed, 12, packed.length)), StandardCharsets.UTF_8);
                accountCookie = cookie;
            }
        } catch (Exception ignored) { }
        demoConnected = PlanMyNordVpnService.isActive();
        render();
    }

    @Override
    protected void onResume() {
        super.onResume();
        demoConnected = PlanMyNordVpnService.isActive();
        render();
        metricsHandler.removeCallbacks(metricsUpdater);
        metricsHandler.post(metricsUpdater);
    }

    @Override
    protected void onPause() {
        metricsHandler.removeCallbacks(metricsUpdater);
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        metricsHandler.removeCallbacks(metricsUpdater);
        networkExecutor.shutdownNow();
        super.onDestroy();
    }

    private void render() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(BG);

        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(20), dp(24), dp(20), dp(28));
        scrollView.addView(content, new ScrollView.LayoutParams(-1, -2));

        renderHeader();
        if ("account".equals(currentPage)) {
            renderAccount();
        } else if ("settings".equals(currentPage)) {
            renderSettings();
        } else {
            renderConnectionCard();
            renderMetrics();
        }
        renderNavigation();
        setContentView(scrollView);
    }

    private void renderSubscriptionCard() {
        LinearLayout box = column();
        box.setPadding(dp(18), dp(18), dp(18), dp(18));
        box.setBackground(card(PANEL, 20, Color.rgb(30, 50, 73)));
        box.addView(text(t("subscription"), 17, TEXT, true));
        TextView hint = text(t("subscriptionHint"), 13, MUTED, false);
        hint.setPadding(0, dp(6), 0, dp(12));
        box.addView(hint);

        box.addView(text(t("subscriptionServerRequired"), 13, MUTED, false));
        content.addView(box);
        addSpace(16);
    }

    private void renderHeader() {
        LinearLayout header = row();
        LinearLayout brand = column();
        brand.addView(text("PlanMyNord", 23, TEXT, true));
        TextView vpn = text("VPN", 12, CYAN, true);
        brand.addView(vpn);
        header.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));

        LinearLayout languages = row();
        languages.setBackground(card(PANEL_2, 12, Color.rgb(38, 55, 74)));
        languages.setPadding(dp(4), dp(4), dp(4), dp(4));
        for (String code : new String[]{"NO", "RU", "EN"}) {
            Button button = smallButton(code, code.equalsIgnoreCase(language));
            button.setOnClickListener(v -> {
                language = code.toLowerCase();
                getSharedPreferences("planmynord", MODE_PRIVATE).edit().putString("language", language).apply();
                render();
            });
            languages.addView(button);
        }
        header.addView(languages);
        content.addView(header);
        addSpace(22);
    }

    private void renderConnectionCard() {
        LinearLayout card = column();
        card.setGravity(Gravity.CENTER_HORIZONTAL);
        card.setPadding(dp(20), dp(20), dp(20), dp(20));
        card.setBackground(card(PANEL, 24, Color.rgb(30, 50, 73)));

        TextView badge = text(t(demoConnected ? "connected" : "disconnected"), 12, demoConnected ? GREEN : RED, true);
        badge.setPadding(dp(12), dp(7), dp(12), dp(7));
        badge.setBackground(card(demoConnected ? Color.rgb(18, 58, 49) : Color.rgb(61, 30, 43), 30, Color.TRANSPARENT));
        card.addView(badge);

        Button power = new Button(this);
        power.setText("VPN");
        power.setTextSize(22);
        power.setTextColor(demoConnected ? GREEN : Color.rgb(96, 165, 250));
        power.setGravity(Gravity.CENTER);
        power.setBackground(card(Color.rgb(16, 35, 57), 100, demoConnected ? GREEN : BLUE));
        LinearLayout.LayoutParams powerParams = new LinearLayout.LayoutParams(dp(145), dp(145));
        powerParams.setMargins(0, dp(30), 0, dp(25));
        card.addView(power, powerParams);
        power.setOnClickListener(v -> {
            if (demoConnected) {
                Intent stop = new Intent(this, PlanMyNordVpnService.class).setAction(PlanMyNordVpnService.ACTION_DISCONNECT);
                startService(stop);
                demoConnected = false;
                render();
                return;
            }
            if (accountCookie.isEmpty()) {
                Toast.makeText(this, t("accountHint"), Toast.LENGTH_LONG).show();
                currentPage = "account";
                render();
                return;
            }
            String plan = getSharedPreferences("planmynord", MODE_PRIVATE).getString("account_plan", "free");
            if (!"vpn".equals(plan)) {
                currentPage = "account";
                render();
                Toast.makeText(this, t("vpnPaymentRequired"), Toast.LENGTH_LONG).show();
                return;
            }
            Toast.makeText(this, t("subscriptionServerRequired"), Toast.LENGTH_LONG).show();
        });

        card.addView(text(t(demoConnected ? "demoActive" : "ready"), 23, TEXT, true));
        TextView description = text(t(demoConnected ? "demoTraffic" : "readyCopy"), 14, MUTED, false);
        description.setGravity(Gravity.CENTER);
        description.setPadding(0, dp(8), 0, dp(22));
        card.addView(description);

        LinearLayout profile = row();
        profile.setPadding(dp(15), dp(13), dp(15), dp(13));
        profile.setBackground(card(PANEL_2, 14, Color.rgb(38, 55, 74)));
        LinearLayout details = column();
        details.addView(text(t("selectedProfile"), 12, MUTED, false));
        details.addView(text("PlanMyNord VPN", 15, TEXT, true));
        profile.addView(details, new LinearLayout.LayoutParams(0, -2, 1));
        profile.addView(text("Xray · " + t(demoConnected ? "configured" : "notConfigured"), 12, CYAN, true));
        card.addView(profile, new LinearLayout.LayoutParams(-1, -2));

        content.addView(card, new LinearLayout.LayoutParams(-1, -2));
        addSpace(16);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == VPN_PERMISSION_REQUEST && resultCode == RESULT_OK) startRealVpn();
    }

    private void startRealVpn() {
        Intent connect = new Intent(this, PlanMyNordVpnService.class).setAction(PlanMyNordVpnService.ACTION_CONNECT);
        startForegroundService(connect);
        demoConnected = true;
        render();
    }

    private void renderMetrics() {
        LinearLayout metrics = column();
        metrics.setPadding(dp(18), dp(18), dp(18), dp(18));
        metrics.setBackground(card(PANEL, 20, Color.rgb(30, 50, 73)));
        metrics.addView(text(t("session"), 16, TEXT, true));
        addMetric(metrics, t("protocol"), "Xray");
        addMetric(metrics, t("location"), t("norway"));
        durationValue = addMetric(metrics, t("duration"), "00:00:00");
        trafficValue = addMetric(metrics, t("traffic"), "↓ 0 B  ↑ 0 B");
        content.addView(metrics);
        updateMetrics();

        TextView notice = text(t("subscriptionServerRequired"), 13, Color.rgb(245, 194, 94), false);
        notice.setPadding(dp(16), dp(14), dp(16), dp(14));
        notice.setBackground(card(Color.rgb(49, 40, 23), 16, Color.rgb(103, 78, 25)));
        LinearLayout.LayoutParams noticeParams = new LinearLayout.LayoutParams(-1, -2);
        noticeParams.setMargins(0, dp(16), 0, 0);
        content.addView(notice, noticeParams);
    }

    private void renderAccount() {
        SharedPreferences preferences = getSharedPreferences("planmynord", MODE_PRIVATE);
        String cookie = accountCookie;
        LinearLayout box = column();
        box.setPadding(dp(18), dp(18), dp(18), dp(18));
        box.setBackground(card(PANEL, 20, Color.rgb(30, 50, 73)));
        box.addView(text(t("accountTitle"), 20, TEXT, true));

        if (!cookie.isEmpty()) {
            String name = preferences.getString("account_name", t("accountUser"));
            String email = preferences.getString("account_email", "");
            String plan = preferences.getString("account_plan", "free");
            int devices = preferences.getInt("account_devices", 0);
            int limit = preferences.getInt("account_device_limit", 3);
            TextView identity = text(name, 18, TEXT, true);
            identity.setPadding(0, dp(18), 0, dp(4));
            box.addView(identity);
            box.addView(text(email, 13, MUTED, false));
            addMetric(box, t("plan"), plan.toUpperCase(Locale.ROOT));
            addMetric(box, t("devices"), devices + " / " + limit);

            TextView status = text("", 13, MUTED, false);
            status.setPadding(0, dp(12), 0, 0);
            box.addView(status);
            LinearLayout actions = row();
            actions.setPadding(0, dp(14), 0, 0);
            Button refresh = smallButton(t("refresh"), true);
            refresh.setOnClickListener(v -> refreshAccount(status));
            Button pay = smallButton(t("vpnPayment"), true);
            pay.setOnClickListener(v -> startActivity(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("https://planmynord.com/profile"))));
            Button logout = smallButton(t("logout"), false);
            logout.setOnClickListener(v -> logoutAccount());
            actions.addView(refresh, new LinearLayout.LayoutParams(0, dp(46), 1));
            actions.addView(pay, new LinearLayout.LayoutParams(0, dp(46), 1));
            actions.addView(logout, new LinearLayout.LayoutParams(0, dp(46), 1));
            box.addView(actions);
        } else {
            TextView hint = text(t("accountHint"), 13, MUTED, false);
            hint.setPadding(0, dp(8), 0, dp(14));
            box.addView(hint);
            EditText email = input(t("email"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
            EditText password = input(t("password"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
            box.addView(email, new LinearLayout.LayoutParams(-1, dp(52)));
            addInnerSpace(box, 10);
            box.addView(password, new LinearLayout.LayoutParams(-1, dp(52)));
            TextView status = text("", 13, MUTED, false);
            status.setPadding(0, dp(10), 0, 0);
            box.addView(status);
            Button login = smallButton(t("login"), true);
            LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(-1, dp(48));
            buttonParams.setMargins(0, dp(14), 0, 0);
            box.addView(login, buttonParams);
            login.setOnClickListener(v -> loginAccount(email.getText().toString().trim(),
                    password.getText().toString(), status, login));

            TextView registerTitle = text(t("registerTitle"), 18, TEXT, true);
            registerTitle.setPadding(0, dp(26), 0, dp(12));
            box.addView(registerTitle);
            EditText registerName = input(t("name"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
            EditText registerEmail = input(t("email"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
            EditText registerPassword = input(t("newPassword"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
            box.addView(registerName, new LinearLayout.LayoutParams(-1, dp(52)));
            addInnerSpace(box, 10);
            box.addView(registerEmail, new LinearLayout.LayoutParams(-1, dp(52)));
            addInnerSpace(box, 10);
            box.addView(registerPassword, new LinearLayout.LayoutParams(-1, dp(52)));
            TextView registerStatus = text("", 13, MUTED, false);
            registerStatus.setPadding(0, dp(10), 0, 0);
            box.addView(registerStatus);
            Button register = smallButton(t("register"), true);
            box.addView(register, buttonParams);
            register.setOnClickListener(v -> registerAccount(
                    registerName.getText().toString().trim(),
                    registerEmail.getText().toString().trim(),
                    registerPassword.getText().toString(), registerStatus, register));
            Button resendVerification = smallButton(t("resendVerification"), false);
            box.addView(resendVerification, buttonParams);
            resendVerification.setOnClickListener(v -> resendVerification(
                    registerEmail.getText().toString().trim(), registerStatus, resendVerification));
            Button registerWebsite = smallButton(t("createAccount"), false);
            box.addView(registerWebsite, buttonParams);
            registerWebsite.setOnClickListener(v -> startActivity(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("https://planmynord.com/account"))));
        }
        content.addView(box, new LinearLayout.LayoutParams(-1, -2));
    }

    private void renderSettings() {
        SharedPreferences preferences = getSharedPreferences("planmynord", MODE_PRIVATE);
        LinearLayout box = column();
        box.setPadding(dp(18), dp(18), dp(18), dp(18));
        box.setBackground(card(PANEL, 20, Color.rgb(30, 50, 73)));
        box.addView(text(t("settingsTitle"), 20, TEXT, true));
        TextView hint = text(t("settingsHint"), 13, MUTED, false);
        hint.setPadding(0, dp(7), 0, dp(16));
        box.addView(hint);

        EditText dns = input(t("dnsServer"), InputType.TYPE_CLASS_PHONE);
        dns.setText(preferences.getString("dns_server", "1.1.1.1"));
        box.addView(dns, new LinearLayout.LayoutParams(-1, dp(52)));
        addInnerSpace(box, 10);
        EditText mtu = input("MTU (1280–1500)", InputType.TYPE_CLASS_NUMBER);
        mtu.setText(String.valueOf(preferences.getInt("vpn_mtu", 1500)));
        box.addView(mtu, new LinearLayout.LayoutParams(-1, dp(52)));

        Switch allowLan = settingSwitch(t("allowLan"), preferences.getBoolean("allow_lan", false));
        Switch autoReconnect = settingSwitch(t("autoReconnect"), preferences.getBoolean("auto_reconnect", true));
        Switch diagnosticLogs = settingSwitch(t("diagnosticLogs"), preferences.getBoolean("diagnostic_logs", false));
        box.addView(allowLan);
        box.addView(autoReconnect);
        box.addView(diagnosticLogs);

        Button save = smallButton(t("applySettings"), true);
        LinearLayout.LayoutParams saveParams = new LinearLayout.LayoutParams(-1, dp(48));
        saveParams.setMargins(0, dp(16), 0, 0);
        box.addView(save, saveParams);
        save.setOnClickListener(v -> {
            String dnsValue = dns.getText().toString().trim();
            int mtuValue;
            try { mtuValue = Integer.parseInt(mtu.getText().toString().trim()); }
            catch (Exception error) { mtuValue = 0; }
            if (!dnsValue.matches("^(?:\\d{1,3}\\.){3}\\d{1,3}$") || mtuValue < 1280 || mtuValue > 1500) {
                Toast.makeText(this, t("invalidSettings"), Toast.LENGTH_LONG).show();
                return;
            }
            preferences.edit()
                    .putString("dns_server", dnsValue)
                    .putInt("vpn_mtu", mtuValue)
                    .putBoolean("allow_lan", allowLan.isChecked())
                    .putBoolean("auto_reconnect", autoReconnect.isChecked())
                    .putBoolean("diagnostic_logs", diagnosticLogs.isChecked())
                    .apply();
            Toast.makeText(this, demoConnected ? t("settingsReconnect") : t("settingsSaved"), Toast.LENGTH_LONG).show();
        });

        Button reset = smallButton(t("resetSettings"), false);
        box.addView(reset, saveParams);
        reset.setOnClickListener(v -> {
            preferences.edit().remove("dns_server").remove("vpn_mtu").remove("allow_lan")
                    .remove("auto_reconnect").remove("diagnostic_logs").apply();
            render();
            Toast.makeText(this, t("settingsReset"), Toast.LENGTH_SHORT).show();
        });
        content.addView(box, new LinearLayout.LayoutParams(-1, -2));
    }

    private EditText input(String hint, int inputType) {
        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint(hint);
        input.setInputType(inputType);
        input.setTextColor(TEXT);
        input.setHintTextColor(MUTED);
        input.setPadding(dp(12), dp(10), dp(12), dp(10));
        input.setBackground(card(PANEL_2, 12, Color.rgb(38, 55, 74)));
        return input;
    }

    private Switch settingSwitch(String label, boolean checked) {
        Switch view = new Switch(this);
        view.setText(label);
        view.setTextColor(TEXT);
        view.setTextSize(14);
        view.setChecked(checked);
        view.setPadding(0, dp(16), 0, dp(4));
        return view;
    }

    private void addInnerSpace(LinearLayout parent, int height) {
        parent.addView(new Space(this), new LinearLayout.LayoutParams(1, dp(height)));
    }

    private void renderNavigation() {
        addSpace(22);
        LinearLayout nav = row();
        nav.setGravity(Gravity.CENTER);
        for (String key : new String[]{"overview", "account", "settings"}) {
            Button button = new Button(this);
            button.setText(t(key));
            button.setTextColor(key.equals(currentPage) ? TEXT : MUTED);
            button.setTextSize(12);
            button.setAllCaps(false);
            button.setBackgroundColor(Color.TRANSPARENT);
            button.setOnClickListener(v -> {
                currentPage = key;
                render();
                if ("account".equals(key) && !accountCookie.isEmpty()) {
                    String cookie = accountCookie;
                    networkExecutor.execute(() -> {
                        try { loadVpnAccount(cookie); runOnUiThread(this::render); }
                        catch (Exception error) { runOnUiThread(() -> Toast.makeText(this, error.getMessage(), Toast.LENGTH_LONG).show()); }
                    });
                }
            });
            nav.addView(button, new LinearLayout.LayoutParams(0, dp(52), 1));
        }
        content.addView(nav);
    }

    private TextView addMetric(LinearLayout parent, String label, String value) {
        LinearLayout row = row();
        row.setPadding(0, dp(14), 0, 0);
        row.addView(text(label, 13, MUTED, false), new LinearLayout.LayoutParams(0, -2, 1));
        TextView valueView = text(value, 13, TEXT, true);
        row.addView(valueView);
        parent.addView(row);
        return valueView;
    }

    private void updateMetrics() {
        if (durationValue == null || trafficValue == null) return;
        long totalSeconds = PlanMyNordVpnService.getConnectedDurationMillis() / 1000;
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        durationValue.setText(String.format(Locale.ROOT, "%02d:%02d:%02d", hours, minutes, seconds));
        trafficValue.setText("↓ " + formatBytes(PlanMyNordVpnService.getReceivedBytes())
                + "  ↑ " + formatBytes(PlanMyNordVpnService.getTransmittedBytes()));
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        double kib = bytes / 1024.0;
        if (kib < 1024) return String.format(Locale.ROOT, "%.1f KB", kib);
        double mib = kib / 1024.0;
        if (mib < 1024) return String.format(Locale.ROOT, "%.1f MB", mib);
        return String.format(Locale.ROOT, "%.2f GB", mib / 1024.0);
    }

    private void loginAccount(String email, String password, TextView status, Button button) {
        if (email.isEmpty() || password.isEmpty()) {
            status.setText(t("fillCredentials"));
            status.setTextColor(RED);
            return;
        }
        button.setEnabled(false);
        status.setText(t("signingIn"));
        status.setTextColor(MUTED);
        networkExecutor.execute(() -> {
            try {
                JSONObject body = new JSONObject().put("email", email).put("password", password);
                ApiResponse response = requestJson("/api/login", "POST", body, "");
                JSONObject user = response.data.getJSONObject("user");
                String cookie = response.cookie;
                if (cookie.isEmpty()) throw new IllegalStateException(t("sessionMissing"));
                String encryptedCookie = encryptAccountCookie(cookie);
                accountCookie = cookie;
                getSharedPreferences("planmynord", MODE_PRIVATE).edit()
                        .putString("account_cookie_encrypted", encryptedCookie)
                        .remove("account_cookie")
                        .putString("account_name", user.optString("name", ""))
                        .putString("account_email", user.optString("email", email))
                        .apply();
                loadVpnAccount(cookie);
                runOnUiThread(() -> render());
            } catch (Exception error) {
                runOnUiThread(() -> {
                    button.setEnabled(true);
                    status.setText(error.getMessage());
                    status.setTextColor(RED);
                });
            }
        });
    }

    private void registerAccount(String name, String email, String password, TextView status, Button button) {
        if (name.length() < 2 || !email.contains("@") || password.length() < 4) {
            status.setText(t("invalidRegistration"));
            status.setTextColor(RED);
            return;
        }
        button.setEnabled(false);
        status.setText(t("registering"));
        status.setTextColor(MUTED);
        networkExecutor.execute(() -> {
            try {
                JSONObject body = new JSONObject()
                        .put("name", name)
                        .put("email", email)
                        .put("password", password);
                JSONObject data = requestJson("/api/register", "POST", body, "").data;
                String message = data.optString("message", t("registrationCreated"));
                runOnUiThread(() -> {
                    button.setEnabled(true);
                    status.setText(message);
                    status.setTextColor(GREEN);
                });
            } catch (Exception error) {
                runOnUiThread(() -> {
                    button.setEnabled(true);
                    status.setText(error.getMessage());
                    status.setTextColor(RED);
                });
            }
        });
    }

    private void resendVerification(String email, TextView status, Button button) {
        if (!email.contains("@")) {
            status.setText(t("enterEmailForVerification"));
            status.setTextColor(RED);
            return;
        }
        button.setEnabled(false);
        status.setText(t("sendingVerification"));
        status.setTextColor(MUTED);
        networkExecutor.execute(() -> {
            try {
                JSONObject result = requestJson("/api/resend-verification", "POST",
                        new JSONObject().put("email", email), "").data;
                String message = result.optString("message", t("verificationSent"));
                runOnUiThread(() -> {
                    button.setEnabled(true);
                    status.setText(message);
                    status.setTextColor(GREEN);
                });
            } catch (Exception error) {
                runOnUiThread(() -> {
                    button.setEnabled(true);
                    status.setText(error.getMessage());
                    status.setTextColor(RED);
                });
            }
        });
    }

    private void refreshAccount(TextView status) {
        status.setText(t("refreshing"));
        String cookie = accountCookie;
        networkExecutor.execute(() -> {
            try {
                ApiResponse me = requestJson("/api/me", "GET", null, cookie);
                JSONObject user = me.data.getJSONObject("user");
                getSharedPreferences("planmynord", MODE_PRIVATE).edit()
                        .putString("account_name", user.optString("name", ""))
                        .putString("account_email", user.optString("email", ""))
                        .apply();
                loadVpnAccount(cookie);
                runOnUiThread(this::render);
            } catch (Exception error) {
                runOnUiThread(() -> {
                    status.setText(error.getMessage());
                    status.setTextColor(RED);
                });
            }
        });
    }

    private void loadVpnAccount(String cookie) throws Exception {
        JSONObject account = requestJson("/api/vpn/account", "GET", null, cookie).data;
        JSONObject subscription = account.getJSONObject("subscription");
        String deviceName = "Android · " + android.os.Build.MODEL;
        org.json.JSONArray devices = account.optJSONArray("devices");
        JSONObject device = null;
        boolean deviceCreated = false;
        if (devices != null) for (int i = 0; i < devices.length(); i++) {
            JSONObject candidate = devices.optJSONObject(i);
            if (candidate != null && "android".equals(candidate.optString("platform"))
                    && deviceName.equals(candidate.optString("name"))) { device = candidate; break; }
        }
        if (device == null) {
            JSONObject created = requestJson("/api/vpn/devices", "POST",
                    new JSONObject().put("name", deviceName).put("platform", "android"), cookie).data;
            device = created.getJSONObject("device");
            deviceCreated = true;
        }
        getSharedPreferences("planmynord", MODE_PRIVATE).edit()
                .putString("account_plan", subscription.optString("plan", "free"))
                .putInt("account_device_limit", subscription.optInt("deviceLimit", 3))
                .putInt("account_devices", (devices == null ? 0 : devices.length()) + (deviceCreated ? 1 : 0))
                .apply();
    }

    private void logoutAccount() {
        SharedPreferences preferences = getSharedPreferences("planmynord", MODE_PRIVATE);
        String cookie = accountCookie;
        accountCookie = "";
        preferences.edit().remove("account_cookie").remove("account_cookie_encrypted")
                .remove("account_name").remove("account_email")
                .remove("account_plan").remove("account_device_limit").remove("account_devices").apply();
        render();
        networkExecutor.execute(() -> {
            try { requestJson("/api/logout", "POST", new JSONObject(), cookie); }
            catch (Exception ignored) { }
        });
    }

    private ApiResponse requestJson(String path, String method, JSONObject body, String cookie) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL("https://planmynord.com" + path).openConnection();
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(15_000);
        connection.setRequestMethod(method);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("User-Agent", "PlanMyNordVPN/0.2 Android");
        if (cookie != null && !cookie.isEmpty()) connection.setRequestProperty("Cookie", cookie);
        if (body != null && !"GET".equals(method)) {
            connection.setDoOutput(true);
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }
        }
        int status = connection.getResponseCode();
        InputStream stream = status >= 200 && status < 300
                ? connection.getInputStream() : connection.getErrorStream();
        StringBuilder text = new StringBuilder();
        if (stream != null) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) text.append(line);
            }
        }
        JSONObject data = text.length() == 0 ? new JSONObject() : new JSONObject(text.toString());
        if (status < 200 || status >= 300)
            throw new IllegalStateException(data.optString("error", t("requestFailed") + " (HTTP " + status + ")"));
        String setCookie = connection.getHeaderField("Set-Cookie");
        connection.disconnect();
        return new ApiResponse(data, setCookie == null ? "" : setCookie.split(";", 2)[0]);
    }

    private javax.crypto.SecretKey accountKey() throws Exception {
        java.security.KeyStore store = java.security.KeyStore.getInstance("AndroidKeyStore");
        store.load(null);
        String alias = "planmynord-account-session";
        if (store.containsAlias(alias)) return (javax.crypto.SecretKey) store.getKey(alias, null);
        javax.crypto.KeyGenerator generator = javax.crypto.KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return generator.generateKey();
    }

    private String encryptAccountCookie(String cookie) throws Exception {
        javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, accountKey());
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(cookie.getBytes(StandardCharsets.UTF_8));
        byte[] packed = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, packed, 0, iv.length);
        System.arraycopy(encrypted, 0, packed, iv.length, encrypted.length);
        return android.util.Base64.encodeToString(packed, android.util.Base64.NO_WRAP);
    }

    private static final class ApiResponse {
        final JSONObject data;
        final String cookie;
        ApiResponse(JSONObject data, String cookie) {
            this.data = data;
            this.cookie = cookie;
        }
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    private Button smallButton(String label, boolean selected) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(11);
        button.setTextColor(selected ? TEXT : MUTED);
        button.setMinWidth(0);
        button.setMinimumWidth(0);
        button.setMinHeight(0);
        button.setMinimumHeight(0);
        button.setPadding(dp(10), dp(7), dp(10), dp(7));
        button.setBackground(card(selected ? Color.rgb(38, 75, 137) : Color.TRANSPARENT, 9, Color.TRANSPARENT));
        return button;
    }

    private LinearLayout row() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        layout.setGravity(Gravity.CENTER_VERTICAL);
        return layout;
    }

    private LinearLayout column() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private GradientDrawable card(int fill, int radius, int stroke) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(dp(radius));
        if (stroke != Color.TRANSPARENT) drawable.setStroke(dp(1), stroke);
        return drawable;
    }

    private void addSpace(int height) {
        Space space = new Space(this);
        content.addView(space, new LinearLayout.LayoutParams(1, dp(height)));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String t(String key) {
        Map<String, String> selected = translations.get(language);
        return selected != null && selected.containsKey(key) ? selected.get(key) : translations.get("no").getOrDefault(key, key);
    }

    private void buildTranslations() {
        translations.put("no", map(new String[][]{
            {"connected","VPN er aktiv"},{"disconnected","Ikke tilkoblet"},{"demoActive","Tilkoblet"},{"ready","Klar når du er"},
            {"demoTraffic","Abonnementet lastes inn og en sikker tunnel startes."},{"readyCopy","Koble sikkert til din private VPN."},
            {"selectedProfile","Valgt profil"},{"demoNorway","Demo · Norge"},{"configured","aktiv"},{"notConfigured","ikke konfigurert"},{"session","Tilkobling"},
            {"protocol","Protokoll"},{"location","Plassering"},{"norway","Norge"},{"duration","Varighet"},{"traffic","Trafikk"},
            {"prototype","Betaversjon: ekte Xray VPN er aktivert, men må testes på en telefon."},{"overview","Oversikt"},{"account","Konto"},{"settings","Innstillinger"},
            {"subscription","VPN-profil"},{"subscriptionHint","Profilen tilordnes fra PlanMyNord-kontoen."},{"subscriptionServerRequired","VPN-serveren må kobles til kontoen først."},{"vpnPaymentRequired","Kjøp VPN-tilgang på nettstedet først."},{"paste","Lim inn"},{"save","Lagre"},{"invalidSubscription","Ugyldig abonnementslenke"},{"subscriptionSaved","Abonnement lagret lokalt"},{"subscriptionRequired","Lagre en abonnementslenke først"}
            ,{"accountTitle","PlanMyNord-konto"},{"vpnPayment","VPN-kjøp"},{"accountHint","Logg inn med samme konto som på planmynord.com."},{"accountUser","Bruker"},{"email","E-post"},{"password","Passord"},{"login","Logg inn"},{"registerTitle","Ny konto"},{"name","Navn"},{"newPassword","Nytt passord (minst 4 tegn)"},{"register","Registrer deg"},{"registering","Oppretter konto…"},{"invalidRegistration","Fyll inn navn, gyldig e-post og minst 4 tegn i passordet."},{"registrationCreated","Kontoen er opprettet. Bekreft e-posten før du logger inn."},{"resendVerification","Send bekreftelses-e-post på nytt"},{"enterEmailForVerification","Skriv inn e-posten du registrerte deg med."},{"sendingVerification","Sender bekreftelses-e-post…"},{"verificationSent","En ny bekreftelseslenke er sendt."},{"createAccount","Opprett konto på nettstedet"},{"logout","Logg ut"},{"refresh","Oppdater"},{"refreshing","Oppdaterer…"},{"signingIn","Logger inn…"},{"fillCredentials","Fyll inn e-post og passord."},{"sessionMissing","Serveren returnerte ingen økt."},{"requestFailed","Forespørselen mislyktes"},{"plan","Abonnement"},{"devices","Enheter"}
            ,{"settingsTitle","VPN-innstillinger"},{"settingsHint","Endringene brukes ved neste tilkobling."},{"dnsServer","DNS-server"},{"allowLan","Tillat tilgang til lokalnettverket"},{"autoReconnect","Koble til igjen hvis tjenesten stopper"},{"diagnosticLogs","Detaljerte diagnoselogger"},{"applySettings","Lagre innstillinger"},{"resetSettings","Tilbakestill"},{"invalidSettings","Kontroller DNS-adressen og MTU-verdien."},{"settingsReconnect","Lagret. Koble fra og til VPN-et på nytt."},{"settingsSaved","Innstillingene er lagret."},{"settingsReset","Standardinnstillingene er gjenopprettet."}
        }));
        translations.put("ru", map(new String[][]{
            {"connected","VPN активен"},{"disconnected","Не подключено"},{"demoActive","Подключено"},{"ready","Готово к подключению"},
            {"demoTraffic","Подписка загружается и запускается защищённый туннель."},{"readyCopy","Безопасное подключение к вашему VPN."},
            {"selectedProfile","Выбранный профиль"},{"demoNorway","Демо · Норвегия"},{"configured","активен"},{"notConfigured","не настроен"},{"session","Подключение"},
            {"protocol","Протокол"},{"location","Расположение"},{"norway","Норвегия"},{"duration","Длительность"},{"traffic","Трафик"},
            {"prototype","Бета-версия: настоящий Xray VPN добавлен, но его нужно проверить на телефоне."},{"overview","Обзор"},{"account","Аккаунт"},{"settings","Настройки"},
            {"subscription","VPN-профиль"},{"subscriptionHint","Профиль выдаётся через аккаунт PlanMyNord."},{"subscriptionServerRequired","Сначала нужно подключить сервер VPN к аккаунту сайта."},{"vpnPaymentRequired","Сначала оплатите VPN-доступ в аккаунте на сайте."},{"paste","Вставить"},{"save","Сохранить"},{"invalidSubscription","Неверная ссылка подписки"},{"subscriptionSaved","Подписка сохранена локально"},{"subscriptionRequired","Сначала войдите в аккаунт PlanMyNord"}
            ,{"accountTitle","Аккаунт PlanMyNord"},{"vpnPayment","Оплатить VPN"},{"accountHint","Войдите с тем же аккаунтом, который используете на planmynord.com."},{"accountUser","Пользователь"},{"email","Электронная почта"},{"password","Пароль"},{"login","Войти"},{"registerTitle","Новый аккаунт"},{"name","Имя"},{"newPassword","Новый пароль (минимум 4 символа)"},{"register","Зарегистрироваться"},{"registering","Создание аккаунта…"},{"invalidRegistration","Введите имя, правильную почту и пароль минимум из 4 символов."},{"registrationCreated","Аккаунт создан. Подтвердите почту перед входом."},{"resendVerification","Отправить письмо подтверждения повторно"},{"enterEmailForVerification","Введите почту, с которой регистрировались."},{"sendingVerification","Отправляем письмо подтверждения…"},{"verificationSent","Новая ссылка подтверждения отправлена."},{"createAccount","Создать аккаунт на сайте"},{"logout","Выйти"},{"refresh","Обновить"},{"refreshing","Обновление…"},{"signingIn","Выполняется вход…"},{"fillCredentials","Введите почту и пароль."},{"sessionMissing","Сервер не вернул сессию."},{"requestFailed","Ошибка запроса"},{"plan","Тариф"},{"devices","Устройства"}
            ,{"settingsTitle","Настройки VPN"},{"settingsHint","Изменения применяются при следующем подключении."},{"dnsServer","DNS-сервер"},{"allowLan","Разрешить доступ к локальной сети"},{"autoReconnect","Переподключаться после остановки сервиса"},{"diagnosticLogs","Подробные диагностические логи"},{"applySettings","Сохранить настройки"},{"resetSettings","Сбросить настройки"},{"invalidSettings","Проверьте DNS-адрес и значение MTU."},{"settingsReconnect","Сохранено. Переподключите VPN."},{"settingsSaved","Настройки сохранены."},{"settingsReset","Настройки по умолчанию восстановлены."}
        }));
        translations.put("en", map(new String[][]{
            {"connected","VPN active"},{"disconnected","Not connected"},{"demoActive","Connected"},{"ready","Ready when you are"},
            {"demoTraffic","Loading the subscription and starting a secure tunnel."},{"readyCopy","Connect securely to your private VPN."},
            {"selectedProfile","Selected profile"},{"demoNorway","Demo · Norway"},{"configured","active"},{"notConfigured","not configured"},{"session","Connection"},
            {"protocol","Protocol"},{"location","Location"},{"norway","Norway"},{"duration","Duration"},{"traffic","Traffic"},
            {"prototype","Beta: real Xray VPN is enabled but must be tested on a phone."},{"overview","Overview"},{"account","Account"},{"settings","Settings"},
            {"subscription","VPN profile"},{"subscriptionHint","Your profile is assigned through your PlanMyNord account."},{"subscriptionServerRequired","The VPN server must be connected to the account first."},{"vpnPaymentRequired","Purchase VPN access from your website account first."},{"paste","Paste"},{"save","Save"},{"invalidSubscription","Invalid subscription URL"},{"subscriptionSaved","Subscription saved locally"},{"subscriptionRequired","Sign in to your PlanMyNord account first"}
            ,{"accountTitle","PlanMyNord account"},{"vpnPayment","Pay for VPN"},{"accountHint","Sign in with the same account you use on planmynord.com."},{"accountUser","User"},{"email","Email"},{"password","Password"},{"login","Sign in"},{"registerTitle","New account"},{"name","Name"},{"newPassword","New password (at least 4 characters)"},{"register","Create account"},{"registering","Creating account…"},{"invalidRegistration","Enter a name, valid email, and a password of at least 4 characters."},{"registrationCreated","Account created. Verify your email before signing in."},{"resendVerification","Resend verification email"},{"enterEmailForVerification","Enter the email you registered with."},{"sendingVerification","Sending verification email…"},{"verificationSent","A new verification link has been sent."},{"createAccount","Create account on website"},{"logout","Sign out"},{"refresh","Refresh"},{"refreshing","Refreshing…"},{"signingIn","Signing in…"},{"fillCredentials","Enter your email and password."},{"sessionMissing","The server returned no session."},{"requestFailed","Request failed"},{"plan","Plan"},{"devices","Devices"}
            ,{"settingsTitle","VPN settings"},{"settingsHint","Changes apply on the next connection."},{"dnsServer","DNS server"},{"allowLan","Allow access to the local network"},{"autoReconnect","Reconnect if the service stops"},{"diagnosticLogs","Detailed diagnostic logs"},{"applySettings","Save settings"},{"resetSettings","Reset settings"},{"invalidSettings","Check the DNS address and MTU value."},{"settingsReconnect","Saved. Reconnect the VPN."},{"settingsSaved","Settings saved."},{"settingsReset","Default settings restored."}
        }));
    }

    private Map<String, String> map(String[][] pairs) {
        Map<String, String> result = new HashMap<>();
        for (String[] pair : pairs) result.put(pair[0], pair[1]);
        return result;
    }
}
