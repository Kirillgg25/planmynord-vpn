package com.planmynord.vpn;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.IpPrefix;
import android.net.VpnService;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.os.SystemClock;
import android.net.TrafficStats;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import hev.htproxy.TProxyService;
import libXray.LibXray;

public final class PlanMyNordVpnService extends VpnService {
    private static final String TAG = "PlanMyNordVpn";
    public static final String ACTION_CONNECT = "com.planmynord.vpn.CONNECT";
    public static final String ACTION_DISCONNECT = "com.planmynord.vpn.DISCONNECT";
    private static final String CHANNEL_ID = "planmynord_vpn";
    private static final int NOTIFICATION_ID = 1407;
    private static final int SOCKS_PORT = 10808;

    private static volatile boolean active;
    private static volatile boolean connected;
    private static volatile long connectedAtElapsed;
    private static volatile long baselineRxBytes;
    private static volatile long baselineTxBytes;

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private ParcelFileDescriptor tunnel;
    private Thread tunThread;

    @Override
    public void onCreate() {
        super.onCreate();
        getSystemService(NotificationManager.class).createNotificationChannel(new NotificationChannel(
                CHANNEL_ID, "PlanMyNord VPN", NotificationManager.IMPORTANCE_LOW));
        LibXray.registerDialerController(fd -> {
            boolean protectedSocket = protect((int) fd);
            if (!protectedSocket) Log.e(TAG, "Failed to protect an Xray dialer socket");
            return protectedSocket;
        });
        LibXray.registerListenerController(fd -> {
            boolean protectedSocket = protect((int) fd);
            if (!protectedSocket) Log.e(TAG, "Failed to protect an Xray listener socket");
            return protectedSocket;
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, notification("VPN starting"));
        if (intent != null && ACTION_DISCONNECT.equals(intent.getAction())) executor.execute(this::stopTunnel);
        else {
            active = true;
            executor.execute(this::startTunnel);
        }
        boolean autoReconnect = getSharedPreferences("planmynord", MODE_PRIVATE)
                .getBoolean("auto_reconnect", true);
        return autoReconnect ? START_STICKY : START_NOT_STICKY;
    }

    private void startTunnel() {
        try {
            stopTunnelOnly();
            active = true;
            Network underlyingNetwork = findUnderlyingNetwork();
            if (underlyingNetwork == null)
                throw new IllegalStateException("No validated Wi-Fi network is available");
            Log.i(TAG, "Using validated Wi-Fi as the VPN underlying network");
            if (!isVpnProfileServiceReady())
                throw new IllegalStateException("Paid account is ready, but the VPN profile service is not connected yet");
            String subscriptionUrl = getSharedPreferences("planmynord", MODE_PRIVATE)
                    .getString("subscription_url", "");
            if (!subscriptionUrl.startsWith("https://") || !subscriptionUrl.contains("/sub/"))
                throw new IllegalStateException("VPN profile is not available");

            JSONObject convertRequest = new JSONObject()
                    .put("apiVersion", 3)
                    .put("method", "convertShareLinksToXrayJson")
                    .put("payload", new JSONObject().put("text", download(subscriptionUrl)));
            JSONObject converted = new JSONObject(LibXray.invoke(convertRequest.toString()));
            if (!converted.optBoolean("success"))
                throw new IllegalStateException(converted.optString("error", "Subscription parsing failed"));
            JSONArray parsed = converted.getJSONObject("data").getJSONArray("outbounds");
            if (parsed.length() == 0) throw new IllegalStateException("Subscription has no usable profiles");
            JSONObject proxy = parsed.getJSONObject(0).put("tag", "proxy");
            resolveProxyServer(proxy, underlyingNetwork);

            String dnsServer = getSharedPreferences("planmynord", MODE_PRIVATE)
                    .getString("dns_server", "1.1.1.1");
            int mtu = Math.max(1280, Math.min(1500, getSharedPreferences("planmynord", MODE_PRIVATE)
                    .getInt("vpn_mtu", 1500)));
            boolean allowLan = getSharedPreferences("planmynord", MODE_PRIVATE)
                    .getBoolean("allow_lan", false);
            boolean diagnosticLogs = getSharedPreferences("planmynord", MODE_PRIVATE)
                    .getBoolean("diagnostic_logs", false);

            JSONObject config = new JSONObject()
                    .put("log", new JSONObject().put("loglevel", diagnosticLogs ? "debug" : "warning"))
                    .put("dns", new JSONObject().put("servers", new JSONArray().put(dnsServer)))
                    .put("inbounds", new JSONArray().put(new JSONObject().put("tag", "socks-in")
                            .put("listen", "127.0.0.1").put("port", SOCKS_PORT)
                            .put("protocol", "socks")
                            .put("settings", new JSONObject().put("udp", true))))
                    .put("outbounds", new JSONArray().put(proxy)
                            .put(new JSONObject().put("tag", "direct").put("protocol", "freedom")))
                    .put("routing", new JSONObject().put("domainStrategy", "IPIfNonMatch")
                            .put("rules", new JSONArray().put(new JSONObject().put("type", "field")
                                    .put("inboundTag", new JSONArray().put("socks-in"))
                                    .put("outboundTag", "proxy"))));
            JSONObject runRequest = new JSONObject().put("apiVersion", 3).put("method", "runXray")
                    .put("payload", new JSONObject().put("xrayJson", config.toString()));
            JSONObject result = new JSONObject(LibXray.invoke(runRequest.toString()));
            if (!result.optBoolean("success"))
                throw new IllegalStateException(result.optString("error", "Xray failed to start"));

            waitForSocks();
            Builder builder = new Builder().setSession("PlanMyNord VPN").setMtu(mtu)
                    .setUnderlyingNetworks(new Network[]{underlyingNetwork})
                    .addAddress("10.73.0.2", 32).addRoute("0.0.0.0", 0)
                    .addDnsServer(dnsServer);
            if (allowLan && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                builder.excludeRoute(new IpPrefix(InetAddress.getByName("10.0.0.0"), 8));
                builder.excludeRoute(new IpPrefix(InetAddress.getByName("172.16.0.0"), 12));
                builder.excludeRoute(new IpPrefix(InetAddress.getByName("192.168.0.0"), 16));
            }
            tunnel = builder.establish();
            if (tunnel == null) throw new IllegalStateException("Android rejected the VPN tunnel");
            setUnderlyingNetworks(new Network[]{underlyingNetwork});

            File hevConfig = new File(getFilesDir(), "hev-socks5-tunnel.yml");
            String yaml = "tunnel:\n"
                    + "  name: tun0\n"
                    + "  mtu: " + mtu + "\n"
                    + "  multi-queue: false\n"
                    + "  ipv4: 10.73.0.1\n"
                    + "  ipv6: 'fc00::1'\n"
                    + "  icmp: 'off'\n"
                    + "socks5:\n"
                    + "  port: " + SOCKS_PORT + "\n"
                    + "  address: 127.0.0.1\n"
                    + "  udp: 'udp'\n"
                    + "misc:\n"
                    + "  task-stack-size: 20480\n"
                    + "  log-level: warn\n";
            try (FileOutputStream output = new FileOutputStream(hevConfig, false)) {
                output.write(yaml.getBytes(StandardCharsets.UTF_8));
            }

            final int tunFd = tunnel.getFd();
            tunThread = new Thread(() -> {
                boolean started = TProxyService.TProxyStartService(hevConfig.getAbsolutePath(), tunFd);
                Log.i(TAG, "TProxy exited, result=" + started);
            }, "PlanMyNord-tun2socks");
            tunThread.start();
            waitForTun2Socks();
            baselineRxBytes = safeUidBytes(TrafficStats.getUidRxBytes(android.os.Process.myUid()));
            baselineTxBytes = safeUidBytes(TrafficStats.getUidTxBytes(android.os.Process.myUid()));
            connectedAtElapsed = SystemClock.elapsedRealtime();
            connected = true;
            getSystemService(NotificationManager.class).notify(NOTIFICATION_ID, notification("VPN connected"));
        } catch (Exception error) {
            Log.e(TAG, "VPN start failed", error);
            getSystemService(NotificationManager.class).notify(NOTIFICATION_ID, notification("Connection failed"));
            stopTunnelOnly();
            stopSelf();
        }
    }

    private boolean isVpnProfileServiceReady() {
        return false;
    }

    private Network findUnderlyingNetwork() {
        ConnectivityManager manager = getSystemService(ConnectivityManager.class);
        for (Network network : manager.getAllNetworks()) {
            NetworkCapabilities capabilities = manager.getNetworkCapabilities(network);
            if (capabilities != null
                    && capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                    && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                    && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_VPN)) {
                return network;
            }
        }
        return null;
    }

    private void resolveProxyServer(JSONObject proxy, Network underlyingNetwork) throws Exception {
        int replaced = resolveAddressFields(proxy, underlyingNetwork);
        Log.i(TAG, "Resolved VPN server fields through Wi-Fi=" + replaced);
        if (replaced == 0) Log.i(TAG, "Converted proxy top-level keys=" + proxy.names());
    }

    private int resolveAddressFields(Object node, Network underlyingNetwork) throws Exception {
        int replaced = 0;
        if (node instanceof JSONObject) {
            JSONObject object = (JSONObject) node;
            Iterator<String> keys = object.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object value = object.opt(key);
                if ("address".equals(key) && value instanceof String) {
                    String host = (String) value;
                    if (!host.isEmpty() && !isNumericAddress(host)) {
                        InetAddress[] addresses = underlyingNetwork.getAllByName(host);
                        if (addresses.length == 0)
                            throw new IllegalStateException("VPN server DNS returned no addresses");
                        InetAddress selected = addresses[0];
                        for (InetAddress address : addresses) {
                            if (address.getAddress().length == 4) {
                                selected = address;
                                break;
                            }
                        }
                        object.put(key, selected.getHostAddress());
                        replaced++;
                    }
                } else if (value instanceof JSONObject || value instanceof JSONArray) {
                    replaced += resolveAddressFields(value, underlyingNetwork);
                }
            }
        } else if (node instanceof JSONArray) {
            JSONArray array = (JSONArray) node;
            for (int index = 0; index < array.length(); index++) {
                Object value = array.opt(index);
                if (value instanceof JSONObject || value instanceof JSONArray)
                    replaced += resolveAddressFields(value, underlyingNetwork);
            }
        }
        return replaced;
    }

    private boolean isNumericAddress(String value) {
        return value.matches("^[0-9.]+$") || value.contains(":");
    }

    private void waitForSocks() throws Exception {
        Exception lastError = null;
        for (int attempt = 0; attempt < 30; attempt++) {
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress("127.0.0.1", SOCKS_PORT), 100);
                return;
            } catch (Exception error) {
                lastError = error;
                Thread.sleep(100);
            }
        }
        throw new IllegalStateException("Local Xray SOCKS did not start", lastError);
    }

    private void waitForTun2Socks() throws Exception {
        for (int attempt = 0; attempt < 30; attempt++) {
            if (TProxyService.TProxyIsRunning()) return;
            if (tunThread != null && !tunThread.isAlive()) break;
            Thread.sleep(100);
        }
        throw new IllegalStateException("TUN to SOCKS bridge did not start");
    }

    private String download(String address) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(address).openConnection();
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(15_000);
        connection.setRequestProperty("User-Agent", "PlanMyNordVPN/0.2 Android");
        connection.setInstanceFollowRedirects(true);
        int status = connection.getResponseCode();
        if (status < 200 || status >= 300) throw new IllegalStateException("Subscription HTTP " + status);
        try (InputStream stream = connection.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder result = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                if (result.length() > 2_000_000) throw new IllegalStateException("Subscription is too large");
                result.append(line).append('\n');
            }
            return result.toString();
        } finally {
            connection.disconnect();
        }
    }

    private JSONObject requestJson(String path, String method, JSONObject body, String cookie, String authorization) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL("https://planmynord.com" + path).openConnection();
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(15_000);
        connection.setRequestMethod(method);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("User-Agent", "PlanMyNordVPN/0.3 Android");
        if (cookie != null && !cookie.isEmpty()) connection.setRequestProperty("Cookie", cookie);
        if (authorization != null && !authorization.isEmpty()) connection.setRequestProperty("Authorization", authorization);
        if (body != null) {
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            try (java.io.OutputStream output = connection.getOutputStream()) {
                output.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }
        }
        int status = connection.getResponseCode();
        InputStream stream = status >= 200 && status < 300 ? connection.getInputStream() : connection.getErrorStream();
        StringBuilder content = new StringBuilder();
        if (stream != null) try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line; while ((line = reader.readLine()) != null) content.append(line);
        }
        connection.disconnect();
        JSONObject result = content.length() == 0 ? new JSONObject() : new JSONObject(content.toString());
        if (status < 200 || status >= 300) throw new IllegalStateException(result.optString("error", "Account request failed"));
        return result;
    }

    private Notification notification(String status) {
        PendingIntent pending = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new Notification.Builder(this, CHANNEL_ID).setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle("PlanMyNord VPN").setContentText(status)
                .setContentIntent(pending).setOngoing(true).build();
    }

    private void stopTunnel() {
        stopTunnelOnly();
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    private void stopTunnelOnly() {
        active = false;
        connected = false;
        connectedAtElapsed = 0;
        baselineRxBytes = 0;
        baselineTxBytes = 0;
        try { TProxyService.TProxyStopService(); } catch (Exception ignored) { }
        tunThread = null;
        try {
            LibXray.invoke(new JSONObject().put("apiVersion", 3).put("method", "stopXray")
                    .put("payload", new JSONObject()).toString());
        } catch (Exception ignored) { }
        try { LibXray.resetDNS(); } catch (Exception ignored) { }
        if (tunnel != null) {
            try { tunnel.close(); } catch (Exception ignored) { }
            tunnel = null;
        }
    }

    public static boolean isActive() {
        return active;
    }

    public static boolean isConnected() {
        return connected;
    }

    public static long getConnectedDurationMillis() {
        long started = connectedAtElapsed;
        return connected && started > 0 ? Math.max(0, SystemClock.elapsedRealtime() - started) : 0;
    }

    public static long getReceivedBytes() {
        if (!connected) return 0;
        long current = safeUidBytes(TrafficStats.getUidRxBytes(android.os.Process.myUid()));
        return Math.max(0, current - baselineRxBytes);
    }

    public static long getTransmittedBytes() {
        if (!connected) return 0;
        long current = safeUidBytes(TrafficStats.getUidTxBytes(android.os.Process.myUid()));
        return Math.max(0, current - baselineTxBytes);
    }

    private static long safeUidBytes(long value) {
        return value == TrafficStats.UNSUPPORTED ? 0 : Math.max(0, value);
    }

    @Override
    public void onRevoke() {
        executor.execute(this::stopTunnel);
        super.onRevoke();
    }

    @Override
    public void onDestroy() {
        stopTunnelOnly();
        executor.shutdownNow();
        super.onDestroy();
    }
}
