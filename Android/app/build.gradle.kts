plugins {
    id("com.android.application")
}

android {
    namespace = "com.planmynord.vpn"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.planmynord.vpn"
        minSdk = 29
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(files("libs/libXray.aar"))
    implementation(files("libs/hev-socks5-tunnel-2.18.0.aar"))
}
