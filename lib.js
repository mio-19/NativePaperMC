function list_assert_one(xs){
  if(xs.length!==1){throw `length (${xs.length}) isn't 1`}
  return xs[0]}
function id(x){ return x }
function lines(x){
  return x.split("\n").filter(x=>x!='')}
// https://stackoverflow.com/questions/34887973/how-to-create-a-partition-function-in-javascript-using-the-following-guidelines/34890630#34890630
function partition(arr, filter) {
  var fail = [];

  var pass = arr.filter((e, i, a) => {
    if (filter(e, i, a)) return true;
    fail.push(e);
  });

  return [pass, fail];
}

const request = require('cloudscraper')
const { get } = request
const { JSDOM } = require('jsdom')
const fs = require('fs')
const util = require('util')
const shell = require('shelljs')
const isZip = util.promisify(require('is-zip-file').isZip)
const parseXML = util.promisify(require('xml2js').parseString)
const { URL } = require('url')
const process = require('process')
const { exit } = process
const StreamZip = require('node-stream-zip')
const execa = require('execa')

async function asyncRetry3(f){
  let result_e
  for(let i=3;i>0;i--){
    try {
      return await f()
    } catch(e) {
      result_e = e
    }}
  throw result_e}

async function readAFileFromZipAsStream(path, inner_path){
  const zip = new StreamZip({file: path, storeEntries: true})
  return await new Promise((resolve, reject)=>{
    zip.on('ready', ()=>zip.stream(inner_path, (err, stm)=>err==null?resolve(stm):reject(err)))
    zip.on('error', e=>reject(e))})}
async function lsZip(path){
  const zip = new StreamZip({file: path, storeEntries: true})
  return await new Promise((resolve, reject)=>{
    zip.on('ready', ()=>resolve(Object.values(zip.entries())))
    zip.on('error', e=>reject(e))})}
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)
const exists = util.promisify(fs.exists)
function shelljs2promise(f){
  return async function(...args){
    return await new Promise((resolve, reject)=>{
      const result = f(...args)
      return (result.code===0||result.code===void 0)?resolve(result):reject(result)})}}
const pushd = shelljs2promise(shell.pushd)
const popd = shelljs2promise(shell.popd)
const mv = shelljs2promise(shell.mv)
const cp = shelljs2promise(shell.cp)
const rm = shelljs2promise(shell.rm)
const mkdir = shelljs2promise(shell.mkdir)
const chmod = shelljs2promise(shell.chmod)
const sed = shelljs2promise(shell.sed)
const find = shelljs2promise(shell.find)
const touch = shelljs2promise(shell.touch)
const ls = shelljs2promise(shell.ls)

async function execaToStdIO(...args){
  const r = execa(...args)
  r.stdout.pipe(process.stdout)
  r.stderr.pipe(process.stderr)
  return await r}

async function librarify_papermc(){
  //await librarify_papermc_patch_worldedit()
  //await librarify_papermc_patch_fawe()
  await librarify_papermc_patch_QualityArmoryVehicles()
  await plugins_processClass()
  await librarify_papermc_main()
}
async function librarify_papermc_patch_QualityArmoryVehicles(){
  await await execaToStdIO("7z", ["d", "dist/plugins/QualityArmoryVehicles.jar"].concat("me/zombie_striker/customitemmanager/AbstractItem.class me/zombie_striker/customitemmanager/AbstractItemFact.class me/zombie_striker/customitemmanager/CustomBaseObject.class me/zombie_striker/customitemmanager/CustomItemManager.class me/zombie_striker/customitemmanager/MaterialStorage.class me/zombie_striker/customitemmanager/versions/V1_13/ItemFactory.class me/zombie_striker/customitemmanager/versions/V1_14/ItemFactory.class".split(" ")))}
/*async function librarify_papermc_patch_worldedit(){
  await rm("-fr", "tmp")
  await mkdir("tmp")
  await pushd("tmp")
    await execaToStdIO("7z", ["x", "../dist/plugins/WorldEdit.jar"])
    await rm("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.class")
    const impl = "Spigot_v1_15_R2"
    const LOAD_ERROR_MESSAGE =
            "\n**********************************************\n" +
            "** This WorldEdit version does not fully support your version of Bukkit.\n" +
            "**\n" +
            "** When working with blocks or undoing, chests will be empty, signs\n" +
            "** will be blank, and so on. There will be no support for entity\n" +
            "** and block property-related functions.\n" +
            "**\n" +
            "** Please see https://worldedit.enginehub.org/en/latest/faq/#bukkit-adapters\n" +
            "**********************************************\n";
    await writeFile("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java", `
package com.sk89q.worldedit.bukkit.adapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.IOException;
public class BukkitImplLoader {
    private static final Logger log = LoggerFactory.getLogger(BukkitImplLoader.class);
    public BukkitImplLoader() {
    }
    private void addDefaults() {
    }
    public void addFromJar(File file) throws IOException {
    }
    public void addFromPath(ClassLoader classLoader) throws IOException {
    }
    public BukkitImplAdapter loadAdapter() throws AdapterLoadException {
        try {
            return (BukkitImplAdapter) new com.sk89q.worldedit.bukkit.adapter.impl.${impl}();
        } catch (Throwable e) {
            log.warn("Failed to load the Bukkit adapter class com.sk89q.worldedit.bukkit.adapter.impl.${impl}", e);
        }
        throw new AdapterLoadException(${JSON.stringify(LOAD_ERROR_MESSAGE)});
    }
}`)
    await execaToStdIO("javac", ["-cp", "../dist/papermc.jar:.", "com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java"])
    await rm("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java", "../dist/plugins/WorldEdit.jar")
    await execaToStdIO("7z", ["a", "-r", "../dist/plugins/WorldEdit.jar", "."])
  await popd()
  await rm("-fr", "tmp")}*/
/*async function librarify_papermc_patch_fawe(){
  await rm("-fr", "tmp")
  await mkdir("tmp")
  await pushd("tmp")
    await execaToStdIO("7z", ["x", "../dist/plugins/FastAsyncWorldEdit.jar"])
    await rm("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.class")
    const impl = "FAWE_Spigot_v1_15_R2"
    const LOAD_ERROR_MESSAGE =
            "\n**********************************************\n" +
            "** This WorldEdit version does not fully support your version of Bukkit.\n" +
            "**\n" +
            "** When working with blocks or undoing, chests will be empty, signs\n" +
            "** will be blank, and so on. There will be no support for entity\n" +
            "** and block property-related functions.\n" +
            "**\n" +
            "** Please see https://worldedit.enginehub.org/en/latest/faq/#bukkit-adapters\n" +
            "**********************************************\n";
    await writeFile("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java", `
package com.sk89q.worldedit.bukkit.adapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.IOException;
public class BukkitImplLoader {
    private static final Logger log = LoggerFactory.getLogger(BukkitImplLoader.class);
    public BukkitImplLoader() {
    }
    private void addDefaults() {
    }
    public void addFromJar(File file) throws IOException {
    }
    public void addFromPath(ClassLoader classLoader) throws IOException {
    }
    public BukkitImplAdapter loadAdapter() throws AdapterLoadException {
        try {
            return (BukkitImplAdapter) new com.sk89q.worldedit.bukkit.adapter.impl.${impl}();
        } catch (Throwable e) {
            log.warn("Failed to load the Bukkit adapter class com.sk89q.worldedit.bukkit.adapter.impl.${impl}", e);
        }
        throw new AdapterLoadException(${JSON.stringify(LOAD_ERROR_MESSAGE)});
    }
}`)
    await execaToStdIO("javac", ["-cp", "../dist/papermc.jar:.", "com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java"])
    await rm("com/sk89q/worldedit/bukkit/adapter/BukkitImplLoader.java", "DummyFawe.src", "../dist/plugins/FastAsyncWorldEdit.jar")
    await execaToStdIO("7z", ["a", "-r", "../dist/plugins/FastAsyncWorldEdit.jar", "."])
  await popd()
  await rm("-fr", "tmp")}*/
// org/bukkit/plugin/java/PluginClassLoader.java Class<?> findClass(@NotNull String s, boolean flag):
// server.getUnsafe().processClass(this.description, s1, abyte)
// org/bukkit/craftbukkit/util/CraftMagicNumbers.java public byte[] processClass(PluginDescriptionFile pdf, String path, byte[] clazz):
// Commodore.convert(clazz, !isLegacy(pdf))
// org/bukkit/craftbukkit/util/Commodore.java
async function plugins_processClass(){
  await rm("-fr", "tmp")
  await mkdir("tmp")
  await pushd("tmp")
    await writeFile(`ProcessOneClass.java`, `
import java.nio.file.Files;
import java.nio.file.Paths;
import org.bukkit.plugin.PluginDescriptionFile;
import java.util.Arrays;
import org.bukkit.craftbukkit.v1_15_R1.util.Commodore;
import org.bukkit.craftbukkit.v1_15_R1.util.CraftMagicNumbers;
public class ProcessOneClass {
  public static void main(String[] args) throws Exception {
    if(args.length != 1){ throw new IllegalArgumentException("expect <path>"); }
    for (var arg : Files.readAllLines(Paths.get(args[0]))) {
      String[] pluginYmlAndClass = arg.split(" ");
      if(pluginYmlAndClass.length != 2){ throw new IllegalArgumentException("expect '<plugin.yml> <class>', get '"+arg+"'"); }
      var pluginDescriptionPath = pluginYmlAndClass[0];
      var clazzPath = pluginYmlAndClass[1];
      var pdf = new PluginDescriptionFile(Files.newInputStream(Paths.get(pluginDescriptionPath)));
      System.out.println("processing " + clazzPath + " (plugin.yml: " + pluginDescriptionPath + ") ...");
      byte[] clazz = Files.readAllBytes(Paths.get(clazzPath));
      byte[] result = Commodore.convert(clazz, !CraftMagicNumbers.isLegacy(pdf));
      Files.newOutputStream(Paths.get(clazzPath)).write(result);
    }
  }
}
`)
    await pushd("../dist/plugins")
      const plugins = (await ls("*.jar"))
    await popd()
    await mkdir("plug")
    await pushd("plug")
      await Promise.all(plugins.map(async x=>{
        const path = "../../dist/plugins/"+x
        await execaToStdIO("7z", ["x", path, "-o"+x])
        await rm(path)}))
      await writeFile("../args",
        (await Promise.all(plugins
            .map(async plug=>
              (await find(plug))
                .filter(x=>x.endsWith(".class"))
                .map(x=>`${plug}/plugin.yml ${x}`))))
            .flat()
            .join("\n"))
      await execaToStdIO("java", ["-cp", "../../dist/papermc.jar", "../ProcessOneClass.java", "../args"])
      for(const plug of plugins){
        await pushd(plug)
          await execaToStdIO("7z", ["a", "-r", "../../../dist/plugins/"+plug, "."])
        await popd()
      }
    await popd()
  await popd()
  await rm("-fr", "tmp")}
async function papermc_plugins_reslove_depend(){
  const raw_plugins = await Promise.all((await ls("dist/plugins/*.jar")).map(async x=>id({
    jarpath: x,
    main: await readPluginYml(x, "main"),
    name: await readPluginYml(x, "name"),
    depend: lines(await readPluginYml(x, "depend[*]")),
    softdepend: lines(await readPluginYml(x, "softdepend[*]")),
    loadbefore: lines(await readPluginYml(x, "loadbefore[*]"))})))
  const plugins_table = {}
  for(const p of raw_plugins){ plugins_table[p.name] = p }
  for(const p in plugins_table){
    for(const elem of plugins_table[p].depend){
      if(!(elem in plugins_table)){ throw `${elem} not exist (depend of ${p})` }}}
  for(const p in plugins_table){
    for(const elem of plugins_table[p].loadbefore){
      if(plugins_table[elem]==null){
        console.error(`[WARNING] ${elem} not exist (loadbefore of ${p})`)
      } else {
        plugins_table[elem].depend.push(p)}}
    for(const elem of plugins_table[p].softdepend){
      if(elem in plugins_table){
        plugins_table[p].depend.push(elem)}}
    plugins_table[p].packagename = plugins_table[p].main.split('.').slice(0, -1).join('.')
    plugins_table[p].classname = plugins_table[p].main.split('.').pop()
    plugins_table[p].path = plugins_table[p].main.replace(/\./g,'/')
    plugins_table[p].dir = plugins_table[p].packagename.replace(/\./g,'/')
    plugins_table[p].loadbefore = null
    plugins_table[p].softdepend = null}
  let plugins = Object.values(plugins_table).map(x=>x.name)
  let sorted_plugins = []
  while(plugins.length!==0){
    const [plugins_to_load, next_plugins] = partition(plugins, x=>plugins_table[x].depend.map(dep=>sorted_plugins.includes(dep)).reduce(((a,b)=>a&&b), true))
    if(plugins_to_load.length==0){ throw 'dependencies cycle' }
    sorted_plugins = sorted_plugins.concat(plugins_to_load)
    plugins = next_plugins}
  return [sorted_plugins, plugins_table]}
async function librarify_papermc_main(){
  const [sorted_plugins, plugins_table] = await papermc_plugins_reslove_depend()
  const fernflower_options = "-dgs=1 -hdc=0 -asc=1 -udv=0 -rsy=1 -aoa=1".split(" ") // MC1.15.2
  await rm("-fr", "tmp")
  await mkdir("-p", "tmp/classes")
  await pushd("tmp")
    await Promise.all([
      execaToStdIO("curl", ["-Lo", "fernflower.jar", "https://hub.spigotmc.org/stash/projects/SPIGOT/repos/builddata/raw/bin/fernflower.jar?at=4a6af056693a191400cc4bc242823734c865c282"]), // MC1.15.2
      execaToStdIO("curl", ["-Lo", "annotations.jar", "https://repo1.maven.org/maven2/org/jetbrains/annotations/19.0.0/annotations-19.0.0.jar"])])
    await execaToStdIO("7z", ["e", "../dist/papermc.jar", "META-INF/MANIFEST.MF"])
    await writeFile("GetVersion.java", `
public class GetVersion {
  public static void main(String[] args) throws Exception {
    System.out.println(new java.util.jar.Manifest(GetVersion.class.getResourceAsStream("/MANIFEST.MF")).getMainAttributes().getValue("Implementation-Version"));
  }
}`)
    const implementation_version = (await execa("java", ["GetVersion.java"])).stdout
  await popd()
  await pushd("tmp/classes")
    {console.log("extracting papermc and plugins ...")
    const plugins_files_table = {}
    for(const p of sorted_plugins){
      for(const f of (await lsZip("../../"+plugins_table[p].jarpath)).filter(x=>x.isFile).map(x=>x.name).filter(x=>!x.startsWith('META-INF/'))){
        if(f in plugins_files_table){
          plugins_files_table[f].push(p)
        }else{
          plugins_files_table[f] = [p]}}}
    for(const f of (await lsZip("../../dist/papermc.jar")).filter(x=>x.isFile).map(x=>x.name).filter(x=>!x.startsWith('META-INF/'))){
      if(f in plugins_files_table){
        plugins_files_table[f].push("__PAPERMC")
      }else{
        plugins_files_table[f] = ["__PAPERMC"]}}
    for(const p in plugins_table){
      const dupres_path = "pluginsResources/"+p
      await mkdir("-p", dupres_path)
      const jarpath = "../../"+plugins_table[p].jarpath
      const all_files = (await lsZip(jarpath)).filter(x=>x.isFile).map(x=>x.name).filter(x=>!x.startsWith('META-INF/'))
      const [dup, notdup] = partition(all_files, x=>plugins_files_table[x].length!==1)
      const [dupclasses, dupfiles] = partition(dup, x=>x.endsWith(".class"))
      await execaToStdIO("7z", ["x", jarpath].concat(notdup))
      if(dupclasses.length !== 0){
        console.error(`[WARNING] ${jarpath}: duplicate classes ${dupclasses.join(" ")}`)
        await rm("-f", dupclasses)
        await execaToStdIO("7z", ["x", jarpath].concat(dupclasses))}
      await execaToStdIO("7z", ["x", "-o"+dupres_path, jarpath].concat(dupfiles))}
    await execaToStdIO("7z", ["x", "-y", "../../dist/papermc.jar"])
    await rm("-fr", "../../dist/papermc.jar", "../../dist/plugins/*.jar")}

    const classes_to_remove = [
      "org/bukkit/plugin/java/JavaPluginLoader", "org/bukkit/plugin/java/PluginClassLoader", // librarify_papermc.patch
      "net/minecraft/server/v1_15_R1/ServerGUI", "net/minecraft/server/v1_15_R1/GuiStatsComponent", "net/minecraft/server/v1_15_R1/PlayerListBox", // mc1_15_remove_gui.patch
      "org/bukkit/craftbukkit/v1_15_R1/util/Commodore"] // papermc_remove_asm.patch
    const classes_to_patch = [
      "co/aikar/timings/TimingsManager", "org/bukkit/plugin/SimplePluginManager", "org/bukkit/plugin/java/JavaPlugin", // librarify_papermc.patch
      "org/bukkit/craftbukkit/v1_15_R1/CraftServer", // librarify_papermc.patch and papermc_substratevm.patch
      "net/minecraft/server/v1_15_R1/DedicatedServer", // mc1_15_remove_gui.patch
      "org/bukkit/craftbukkit/v1_15_R1/util/CraftMagicNumbers", "org/bukkit/plugin/EventExecutor", // papermc_remove_asm.patch
      "org/bukkit/craftbukkit/Main", "net/minecraft/server/v1_15_R1/ResourcePackVanilla", // papermc_substratevm.patch
      "org/apache/logging/log4j/core/jmx/Server"] // substratevm_log4j.patch
    const classes_to_add = ["org/bukkit/plugin/java/StaticPluginLoader", "org/bukkit/plugin/java/StaticPluginInformationList"] // librarify_papermc.patch
    const paths_simply_remove = ["com/destroystokyo/paper/gui/", // mc1_15_remove_gui.patch (undo Spigot-Server-Patches/0442-Make-the-GUI-graph-fancier.patch)
      // papermc_remove_asm.patch Begin
        "org/bukkit/craftbukkit/libs/org/objectweb/asm/",
        // (undo Spigot-API-Patches/0022-Use-ASM-for-event-executors.patch)
        "com/destroystokyo/paper/event/executor/MethodHandleEventExecutor.class",
        "com/destroystokyo/paper/event/executor/StaticMethodHandleEventExecutor.class",
        "com/destroystokyo/paper/event/executor/asm/",
        "com/destroystokyo/paper/utils/UnsafeUtils.class"]
      // papermc_remove_asm.patch End
    const classes_has_nested_classes = [
      "org/bukkit/craftbukkit/v1_15_R1/CraftServer", // librarify_papermc.patch and papermc_substratevm.patch
      "net/minecraft/server/v1_15_R1/DedicatedServer", "net/minecraft/server/v1_15_R1/ServerGUI", // mc1_15_remove_gui.patch
      "org/bukkit/craftbukkit/v1_15_R1/util/Commodore", "org/bukkit/craftbukkit/v1_15_R1/util/CraftMagicNumbers", "org/bukkit/plugin/EventExecutor", // papermc_remove_asm.patch
      "org/bukkit/craftbukkit/Main"] // papermc_substratevm.patch
    const patches = [
      "librarify_papermc.patch", // undo Spigot-API-Patches/0022-Use-ASM-for-event-executors.patch (org/bukkit/plugin/java/JavaPluginLoader.java)
      "mc1_15_remove_gui.patch",
      "papermc_remove_asm.patch", // undo Spigot-API-Patches/0022-Use-ASM-for-event-executors.patch
      "papermc_substratevm.patch",
      "substratevm_log4j.patch"] // https://github.com/oracle/graal/issues/1209

    // https://github.com/games647/CraftAPI/pull/3
    if(await exists("com/github/games647/craftapi/cache/SafeCacheBuilder.class")){
      classes_to_patch.push("com/github/games647/craftapi/cache/SafeCacheBuilder", "com/github/games647/fastlogin/core/shared/FastLoginCore")
      patches.push("librarify_and_substratevm_fastlogin.patch")}

    // com.oracle.svm.core.jdk.UnsupportedFeatureError: Resource bundle lookup must be loaded during native image generation: sun.awt.resources.awt
    // at java.awt.event.KeyEvent.getKeyText(KeyEvent.java:1403) ~[?:?]
    // patch the class to fix `java.lang.IllegalStateException: Access to implementation before detect` when build-time init
    if(await exists("protocolsupport/protocol/utils/minecraftdata/MinecraftKeybindData.class")){
      classes_to_patch.push("protocolsupport/protocol/utils/minecraftdata/MinecraftKeybindData",
        "protocolsupport/zplatform/impl/spigot/entitytracker/SpigotEntityTrackerEntryInjector",
        "protocolsupport/utils/ReflectionUtils")
      patches.push("substratevm_protocolsupport.patch")}

    await rm("-fr", paths_simply_remove)

    const java_files_to_compile = classes_to_patch.concat(classes_to_add).map(x=>`${x}.java`)
    const java_files_to_decompile = classes_to_remove.concat(classes_to_patch).map(x=>`${x}.java`)
    const classes_files_to_decompile = classes_to_remove.concat(classes_to_patch).map(x=>`${x}.class`).concat(await ls(classes_has_nested_classes.map(x=>x+`$*.class`)))
    await execaToStdIO("7z", ["a", "-r", "../FILES_TO_DECOMPILE.jar"].concat(classes_files_to_decompile))
    await rm(classes_files_to_decompile)
    console.log(`decompiling ...`)
    await mkdir("../DECOMPILED_FILES")
    await execaToStdIO("java", ["-Xms16M", "-Xmx1G", "-jar", "../fernflower.jar"].concat(fernflower_options).concat(["../FILES_TO_DECOMPILE.jar", "../DECOMPILED_FILES"]))
    await execaToStdIO("7z", ["x", "../DECOMPILED_FILES/FILES_TO_DECOMPILE.jar"])
    for(const f of java_files_to_decompile){
      await writeFile(f, (await readFile(f, 'utf8')).replace(/ *@Override\n/g, "\n"))}
    for(const p of patches) {
      await execaToStdIO("patch", ["-p1"], {input:await readFile(`${__dirname}/${p}`)})}

    // papermc_substratevm.patch
    await sed("-i", "REPLACE_THIS_EXPRESSION_WITH_IMPLEMENTATION_VERSION", JSON.stringify(implementation_version), "org/bukkit/craftbukkit/Main.java", "org/bukkit/craftbukkit/v1_15_R1/CraftServer.java")

    // librarify_papermc.patch
    // the line: `// LOAD_STATIC_PLUGINS_THERE // try{JavaPlugin.initializeFakeParameters(pl,dir,<duplicateResourcesPath>);list.add(new <class>());}catch(Exception e){displayException(server,e,"<name>");}`
    await sed("-i",
      /^.*LOAD_STATIC_PLUGINS_THERE.*$/,
      (await Promise.all(sorted_plugins.map(async x=>
        `try{JavaPlugin.initializeFakeParameters(pl,dir,${JSON.stringify("pluginsResources/"+x)});list.add(new ${plugins_table[x].main}());}catch(Exception e){displayException(server,e,${JSON.stringify(x)});}`))).join(""),
      "org/bukkit/plugin/java/StaticPluginInformationList.java")
    // the line: `private static final String[] hardcodedBuiltinMinecraftData_assets = {}; // REPLACE_THIS_LINE_HARDCODED_DATA_assets`
    // the line: `private static final String[] hardcodedBuiltinMinecraftData_data = {}; // REPLACE_THIS_LINE_HARDCODED_DATA_data`
    for(const [dir, reg] of [
      ["assets", /^.*REPLACE_THIS_LINE_HARDCODED_DATA_assets.*$/],
      ["data", /^.*REPLACE_THIS_LINE_HARDCODED_DATA_data.*$/]]) {
      await pushd(dir+"/minecraft")
      await sed("-i",
        reg,
        `private static final String[] hardcodedBuiltinMinecraftData_${dir} = {${
          (await find(".")).filter(x=>(!x.endsWith(".mcmeta"))&&(fs.statSync(x)).isFile()).map(x=>JSON.stringify(x)).join(",")}};`,
        "../../net/minecraft/server/v1_15_R1/ResourcePackVanilla.java")
      await popd()}
    console.log(`compiling ...`)
    await execaToStdIO("javac", ["-cp", "../annotations.jar:."].concat(java_files_to_compile))
    await rm(java_files_to_compile)
    console.log("repacking papermc ...")
    await execaToStdIO("7z", ["a", "-r", "../../dist/papermc.jar", "."])
  await popd()
  await rm("-fr", "tmp")
  await make_files_list()}
async function minify_plugins(){ for(const jar of (await ls("dist/plugins/*.jar")).concat(["dist/papermc.jar"])){
  const to_remove = (await lsZip(jar)).filter(x=>x.isFile).map(x=>x.name).filter(x=>x.endsWith(".java")||x==='changelog.txt'||x==='LICENSE'||x==='License.txt'||x.startsWith('licenses/'))
  if(to_remove.length !== 0){
    console.log(`${jar}: removing ${to_remove.join(" ")} ...`)
    await execaToStdIO("7z", ["d", jar].concat(to_remove))}}}
async function readPluginYml(path, x){
  const {stdout} = await execa("yq", ["read", "-", x], {input: await readAFileFromZipAsStream(path, "plugin.yml")})
  return stdout}
async function get_plugins(plugins_to_get){
  await mkdir("-p", "dist/plugins")
  await Promise.all(plugins_to_get.map(async ([file, url, required_version]) => {
    const path = `dist/plugins/${file}.jar`
    const url_awaited = await ((async ()=>{try{return await url}catch(e){console.error(`URL failed (${file})`);throw e}})())
    await downloadZip(path, url_awaited)
    const current_version = await readPluginYml(path, "version")
    if(!(current_version===required_version || current_version.slice(0, required_version.length+1)===required_version+'.' || current_version.slice(0, required_version.length+1)===required_version+'-')){
      throw `manual review requested: ${file} ${required_version} -> ${current_version}`}}))}
function package_async_program(f){return async () => {
  try{
    await f()
    exit(0)
  }catch(e){
    console.error(e)
    exit(1)}}}
async function get_files_list(path){
  await pushd(path)
  const result = []
  for(const f of await find(".")){
    if((await stat(f)).isFile()){
      result.push("./"+f)}}
  await popd()
  return result}
async function make_files_list(){
  await touch("dist/files.list") // include `files.list` itself.
  await writeFile("dist/files.list", (await get_files_list("dist")).join(" "))}
exports.librarify_papermc = package_async_program(librarify_papermc)

