#!/bin/bash

# Dzikr Al Ma'tsurat TV - Build Script
# Untuk membangun APK Android TV

echo "========================================="
echo "  Building AMI TV APK"
echo "========================================="

# Konfigurasi
APP_NAME="AMI_TV"
PACKAGE_NAME="com.ami.tv"
VERSION="1.0.1"
VERSION_CODE="2"

# Buat struktur folder
echo "Creating project structure..."
mkdir -p app/src/main/java/com/ami/tv
mkdir -p app/src/main/res/drawable
mkdir -p app/src/main/res/mipmap-hdpi
mkdir -p app/src/main/res/mipmap-mdpi
mkdir -p app/src/main/res/mipmap-xhdpi
mkdir -p app/src/main/res/mipmap-xxhdpi
mkdir -p app/src/main/res/xml
mkdir -p app/src/main/assets

# Copy assets
echo "Copying assets..."
cp index.html dzikr.html pagi.html sore.html app/src/main/assets/
cp tv-styles.css tv-navigation.js app/src/main/assets/
cp logo.png shubh.png *.png app/src/main/assets/

# Copy icons
cp ic_launcher.png app/src/main/res/mipmap-hdpi/
cp ic_launcher.png app/src/main/res/mipmap-mdpi/
cp ic_launcher.png app/src/main/res/mipmap-xhdpi/
cp ic_launcher.png app/src/main/res/mipmap-xxhdpi/
cp tv_banner.png app/src/main/res/drawable/

# Build APK menggunakan Gradle
echo "Building APK..."
./gradlew assembleRelease

# Sign APK
echo "Signing APK..."
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
    -keystore dzikr-tv.keystore \
    app/build/outputs/apk/release/app-release-unsigned.apk \
    dzikr-tv

# Optimize APK
echo "Optimizing APK..."
zipalign -v 4 \
    app/build/outputs/apk/release/app-release-unsigned.apk \
    ${APP_NAME}_v${VERSION}.apk

echo "========================================="
echo "  Build Complete!"
echo "  APK: ${APP_NAME}_v${VERSION}.apk"
echo "========================================="
