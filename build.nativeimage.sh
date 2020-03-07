#!/bin/sh
set -e
rm -fr tmp
mkdir tmp
cp -r dist tmp/
rm dist/papermc.jar
cd tmp
  # https://github.com/mageddo/graalvm-examples/blob/492a43bb83984e613a67230aa384198600d7152f/sqlite/build.gradle
  curl -Lo graal-sdk.jar https://repo1.maven.org/maven2/org/graalvm/sdk/graal-sdk/20.0.0/graal-sdk-20.0.0.jar
  curl -Lo svm.jar https://repo1.maven.org/maven2/com/oracle/substratevm/svm/19.2.1/svm-19.2.1.jar
  mkdir papermc
  cd papermc
    mkdir -p com/mageddo/sqlite
    curl -Lo com/mageddo/sqlite/JNIReflectionClasses.java https://github.com/mageddo/graalvm-examples/raw/492a43bb83984e613a67230aa384198600d7152f/sqlite/src/main/java/com/mageddo/sqlite/JNIReflectionClasses.java
    curl -Lo com/mageddo/sqlite/ReflectionClasses.java https://github.com/mageddo/graalvm-examples/raw/492a43bb83984e613a67230aa384198600d7152f/sqlite/src/main/java/com/mageddo/sqlite/ReflectionClasses.java
    javac -cp '.:../dist/papermc.jar:../graal-sdk.jar:../svm.jar' -d ../config-classes com/mageddo/sqlite/JNIReflectionClasses.java com/mageddo/sqlite/ReflectionClasses.java
  cd ../config-classes
    7z a -r ../dist/papermc.jar .
cd ../..
cd tmp/dist

mkdir -p plugins/TMPStopAfterServerLoadEvent.lkt
cat << 'EOF' > plugins/TMPStopAfterServerLoadEvent.lkt/plugin.yml
main: main.lua
version: 1.0
name: TMPStopAfterServerLoadEvent
description: TMPStopAfterServerLoadEvent
author: Author
EOF
cat << 'EOF' > plugins/TMPStopAfterServerLoadEvent.lkt/main.lua
plugin.registerEvent("ServerLoadEvent", function(...)
  local s = plugin.getServer()
  s:shutdown()
end)
EOF
java -agentlib:native-image-agent=experimental-class-loader-support,config-output-dir=nativeimage-build-config -jar papermc.jar
# native-image-agent not tracing
7z l -ba -slt papermc.jar | grep '^Path ' | awk '{print $3;}' |
  grep '^net/minecraft/server/v1_15_R1/Packet.*\.class$' | sed 's|^\(.*\)\.class|\1|g' | sed 's|/|.|g' > ../packets_classes
7z l -ba -slt papermc.jar | grep '^Path ' | awk '{print $3;}' |
  grep '^protocolsupport/.*\.class$' | sed 's|^\(.*\)\.class|\1|g' | sed 's|/|.|g' > ../protocolsupport_classes
node << 'EOF'
const fs = require('fs')
const path = 'nativeimage-build-config/reflect-config.json'
const reflconf = {}
for(const i of JSON.parse(fs.readFileSync(path, 'utf8'))){
  reflconf[i.name] = i}
function has(name) {
  return reflconf[name] !== undefined }
function refl_add(name, content){
  if(has(name)) { throw `duplicate: ${name}` }
  reflconf[name] = content}
function maybe_refl_add(name, content){
  if(has(name)) { return }
  reflconf[name] = content}
for(const x of [
  "org.apache.logging.log4j.LogManager",
  "net.minecraft.server.v1_15_R1.Entity",
  "net.minecraft.server.v1_15_R1.EntityPlayer",
  "net.minecraft.server.v1_15_R1.DataWatcher",
  "net.minecraft.server.v1_15_R1.PathfinderGoalSelector",
  "net.minecraft.server.v1_15_R1.WorldGenFeatureDefinedStructureJigsawPlacement",
  "net.minecraft.server.v1_15_R1.EntityTrackerEntry",
  "net.minecraft.server.v1_15_R1.PacketDebug",
  "net.minecraft.server.v1_15_R1.DefinedStructurePiece"]) {
  maybe_refl_add(x, {})}
refl_add("io.netty.channel.socket.nio.NioServerSocketChannel",{
  "methods": [{"name":"<init>"}]})
refl_add("com.google.common.cache.LocalCache$LocalLoadingCache",{
  // "methods": [{"name":"asMap"}] // (extends com.google.common.cache.LocalCache$LocalManualCache)
})
// FastLogin
refl_add("java.util.concurrent.CopyOnWriteArrayList",{
  "fields": [
    { "name": "lock", "allowWrite": true }]})
// ProtocolSupport Begin
// https://github.com/ProtocolSupport/ProtocolSupport/blob/2e129b436bc5e455bd3235ca5e4388f747bb345f/src/protocolsupport/zplatform/impl/spigot/network/handler/SpigotLoginListenerPlay.java and some other files in the same directory and https://github.com/ProtocolSupport/ProtocolSupport/blob/2e129b436bc5e455bd3235ca5e4388f747bb345f/src/protocolsupport/zplatform/impl/spigot/SpigotPacketFactory.java
function lines_of(path) {
  return fs.readFileSync(path, 'utf8').split("\n").filter(x=>x!=="")}
for(const x of lines_of('../packets_classes')) {
  maybe_refl_add(x, {})
  if(!reflconf[x].allPublicConstructors) {
    reflconf[x].methods = reflconf[x].methods || []
    reflconf[x].methods.push({"name":"<init>","parameterTypes": []})}}
for(const x of lines_of('../protocolsupport_classes')) { maybe_refl_add(x, {}) }
// https://github.com/ProtocolSupport/ProtocolSupport/blob/2e129b436bc5e455bd3235ca5e4388f747bb345f/src/protocolsupport/zplatform/impl/spigot/entitytracker/SpigotEntityTrackerEntryInjector.java
// protocolsupport.zplatform.impl.spigot.entitytracker.SpigotEntityTrackerEntryInjector.createSetTrackerEntryFieldMH()
refl_add("net.minecraft.server.v1_15_R1.PlayerChunkMap$EntityTracker", {
  "fields": [{"name": "tracker"}, {"name": "trackerEntry", "allowWrite": true}]})
// allowWrite is not traced
for(const x of [
  "net.minecraft.server.v1_15_R1.BlockWaterLily",
  "net.minecraft.server.v1_15_R1.BlockCarpet",
  "net.minecraft.server.v1_15_R1.BlockLadder"]) {
  reflconf[x].fields.forEach(f => {f.allowWrite = true})}
reflconf["net.minecraft.server.v1_15_R1.PlayerChunkMap"] = {
  // traced
  "allDeclaredFields": true,
  // not traced
  "fields": [
    { "name": "trackedEntities", "allowWrite": true }]}
// ProtocolSupport End
reflconf["org.bukkit.potion.PotionData"] = {
  // not traced: (for EssentialsX)
  "fields": [
    { "name": "type", "allowWrite": true },
    { "name": "upgraded", "allowWrite": true },
    { "name": "extended", "allowWrite": true }],
  // traced:
  "allDeclaredFields": true}
reflconf["net.minecraft.server.v1_15_R1.ServerConnection"] = {
  // not traced: (for ProtocolLib)
  "fields": [
    { "name": "listeningChannels", "allowWrite": true },
    { "name": "pending", "allowWrite": true }],
  // traced:
  "allDeclaredFields": true,
  "allPublicFields": true}

const result = []
for(const x in reflconf){
  reflconf[x].name = x
  result.push(reflconf[x])}
fs.writeFileSync(path, JSON.stringify(result, null, 2))
EOF
# to fix "... was unintentionally initialized at build time. ... has been initialized without the native-image initialization instrumentation and the stack trace can't be tracked. Try marking this class for build-time initialization with --initialize-at-build-time=..."
buildtimeinits="org.apache.http.HttpEntityEnclosingRequest org.apache.http.conn.ManagedHttpClientConnection org.apache.http.Header org.apache.http.client.methods.CloseableHttpResponse org.apache.http.StatusLine org.apache.http.HttpResponse org.apache.http.protocol.HttpContext org.apache.http.ProtocolVersion org.apache.http.HttpRequest org.apache.http.HttpEntity org.apache.http.params.HttpParams"
# (partial) safe to initialize at build time
buildtimeinits="$buildtimeinits org.bukkit.Bukkit net.md_5.bungee.chat com.google.common.collect com.google.common.base com.google.gson com.google.gson.internal com.google.gson.internal.bind com.google.gson.reflect"
# https://github.com/oracle/graal/issues/966
# https://github.com/mageddo/graalvm-examples/blob/492a43bb83984e613a67230aa384198600d7152f/sqlite/build.gradle
buildtimeinits="$buildtimeinits org.sqlite.JDBC org.sqlite.core.DB\$ProgressObserver org.sqlite.core.DB org.sqlite.core.NativeDB org.sqlite.ProgressHandler org.sqlite.Function org.sqlite.Function\$Aggregate org.sqlite.Function\$Window"
# ProtocolSupport
# see also lib.js
buildtimeinits="$buildtimeinits protocolsupport.protocol.utils.minecraftdata.MinecraftKeybindData protocolsupport.utils.ResourceUtils protocolsupport.ProtocolSupport "'protocolsupport.ProtocolSupport$BuildInfo'
# "-H:+UseLowLatencyGC" requires GraalVM Enterprise, so not enabled
# "-H:IncludeResourceBundles=messages" is for EssentialsX
# "-H:IncludeResourceBundles=joptsimple.HelpFormatterMessages" is for "--help"
native-image -cp papermc.jar \
  --no-server -J-Xms10G -J-Xmx20G \
  --verbose -H:+TraceClassInitialization -H:+ReportExceptionStackTraces -H:+PrintCompilation \
  --no-fallback \
  -Dfile.encoding=UTF-8 \
  -H:IncludeResources='^[^.]*$|^.*\.[^.]{0,4}$|^.*\.[^.]{6,}$|^.*\.[^.]{0}[^c][^.]{4}$|^.*\.[^.]{1}[^l][^.]{3}$|^.*\.[^.]{2}[^a][^.]{2}$|^.*\.[^.]{3}[^s][^.]{1}$|^.*\.[^.]{4}[^s][^.]{0}$' \
  -H:IncludeResourceBundles=messages,joptsimple.HelpFormatterMessages \
  -H:DynamicProxyConfigurationFiles=nativeimage-build-config/proxy-config.json \
  -H:JNIConfigurationFiles=nativeimage-build-config/jni-config.json \
  -H:ReflectionConfigurationFiles=nativeimage-build-config/reflect-config.json \
  --report-unsupported-elements-at-runtime \
  "--initialize-at-build-time=$(echo "$buildtimeinits" | sed 's| |,|g')" \
  --allow-incomplete-classpath \
  --enable-url-protocols=http,https \
  -H:Name=papermc \
  -H:Class=org.bukkit.craftbukkit.Main
strip -s papermc
compress_upx() {
curl -L https://github.com/upx/upx/releases/download/v3.96/upx-3.96-amd64_linux.tar.xz | tar -xJvC .. --strip-components=1 upx-3.96-amd64_linux/upx
../upx papermc
}
compress_appimage(){
curl -Lo ../appimagetool https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x ../appimagetool
mkdir ../papermc.AppDir
mv papermc ../papermc.AppDir/AppRun
cat << 'EOF' > ../papermc.AppDir/papermc.desktop
[Desktop Entry]
Name=papermc
Exec=papermc
Icon=papermc
Type=Application
Categories=Utility;
EOF
curl -Lo ../papermc.AppDir/papermc.png 'https://avatars2.githubusercontent.com/u/7608950?s=200&v=4' # https://github.com/PaperMC
../appimagetool ../papermc.AppDir papermc
}
# compress_upx

cd ../..
cp -r tmp/dist/nativeimage-build-config tmp/dist/papermc dist/
rm -fr tmp
./make_files_list.sh
