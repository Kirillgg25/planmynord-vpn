package com.planmynord.vpn;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

final class ProfileStore {
    private static final String PREFS = "planmynord";
    private static final String DATA_KEY = "vpn_profiles_encrypted";
    private static final String SELECTED_KEY = "vpn_profile_selected";
    private static final String KEY_ALIAS = "planmynord-vpn-profiles";

    private ProfileStore() { }

    static JSONArray load(Context context) {
        try {
            String packedText = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(DATA_KEY, "");
            if (packedText.isEmpty()) return new JSONArray();
            byte[] packed = Base64.decode(packedText, Base64.NO_WRAP);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Arrays.copyOfRange(packed, 0, 12)));
            return new JSONArray(new String(cipher.doFinal(Arrays.copyOfRange(packed, 12, packed.length)), StandardCharsets.UTF_8));
        } catch (Exception ignored) { return new JSONArray(); }
    }

    static void save(Context context, JSONArray profiles) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key());
        byte[] encrypted = cipher.doFinal(profiles.toString().getBytes(StandardCharsets.UTF_8));
        byte[] packed = new byte[cipher.getIV().length + encrypted.length];
        System.arraycopy(cipher.getIV(), 0, packed, 0, cipher.getIV().length);
        System.arraycopy(encrypted, 0, packed, cipher.getIV().length, encrypted.length);
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString(DATA_KEY, Base64.encodeToString(packed, Base64.NO_WRAP)).apply();
    }

    static String selectedId(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(SELECTED_KEY, "");
    }

    static void select(Context context, String id) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(SELECTED_KEY, id).apply();
    }

    static JSONObject selected(Context context) {
        String id = selectedId(context);
        JSONArray profiles = load(context);
        for (int i = 0; i < profiles.length(); i++) {
            JSONObject profile = profiles.optJSONObject(i);
            if (profile != null && id.equals(profile.optString("id"))) return profile;
        }
        return null;
    }

    private static SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore");
        store.load(null);
        if (store.containsAlias(KEY_ALIAS)) return (SecretKey) store.getKey(KEY_ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return generator.generateKey();
    }
}
