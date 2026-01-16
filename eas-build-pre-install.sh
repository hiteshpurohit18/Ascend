#!/usr/bin/env bash

set -e

echo "🔧 Configuring Gradle repositories with fallbacks..."

mkdir -p ~/.gradle/init.d

cat > ~/.gradle/init.d/repositories.gradle << 'EOF'
allprojects {
    buildscript {
        repositories {
            google()
            mavenCentral()
            gradlePluginPortal()
            maven { 
                url "https://repo1.maven.org/maven2"
                allowInsecureProtocol = false
            }
        }
    }
    
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
        maven { 
            url "https://repo1.maven.org/maven2"
            allowInsecureProtocol = false
        }
    }
}
EOF

echo "✅ Gradle repository configuration complete"
cat ~/.gradle/init.d/repositories.gradle
