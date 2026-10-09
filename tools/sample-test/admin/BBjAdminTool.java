// BBjAdminTool: administer a local BBjServices from plain Java through the BBj Admin API.
// It lists sessions and license use, registers and removes DWC apps, terminates sessions and
// scans a file for the admin password. Plain Java needs no BBj interpreter license.
//
// Run (single-file source launch, Java 11 or newer):
//   java -cp "<BBJ_HOME>/.lib/*" admin/BBjAdminTool.java <envFile> <command> [args]
// The whole .lib folder goes on the classpath (BBjAdminAPI.jar alone misses guava). Pass the
// wildcard literally, without a shell, so Java expands it.
//
// Evolved from the phase spike AdminProbe.java (06.2 spike folder). Only Admin API names the
// spike compiled and ran are used.
//
// The env file holds BBJ_ADMIN_USER and BBJ_ADMIN_PASSWORD. This tool reads the file itself, so
// credentials never travel through arguments or Node. The password never reaches the output:
// error text is redacted.
//
// Commands (stdout, one record per line):
//   status                 LICENSE <feature> total=<n> inUse=<n> ... PROC id=<id> since=<text> notResponding=<n> prog=<path>
//   register-many <tsv>    per TSV line "name<TAB>program<TAB>workdir": URL <name> <url> | FAIL <name> <reason>; exit 2 on any FAIL
//   apps <prefix>          APP <name> <program>
//   unregister <prefix>    REMOVED <name>; a prefix outside courses-[a-z0-9-]* prints REFUSED <prefix>, exit 3
//   killids <id,id,...>    TERMINATED <id> | NOTFOUND <id>
//   scan <file>            CLEAN | LEAK BBJ_ADMIN_PASSWORD (exit 2); opens no admin connection
// Errors print ERROR <ExceptionSimpleName>: <message> with exit 1. Bad usage prints USAGE ... with exit 64.
import com.basis.api.admin.*;
import com.basis.api.admin.client.*;
import java.io.FileDescriptor;
import java.io.FileOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;

public class BBjAdminTool {
  private static final Pattern APP_NAME = Pattern.compile("^courses-[a-z0-9]+(-[a-z0-9]+)*$");
  private static final Pattern REMOVABLE_PREFIX = Pattern.compile("^courses-[a-z0-9-]*$");
  private static final String USAGE =
      "USAGE java -cp \"<BBJ_HOME>/.lib/*\" BBjAdminTool.java <envFile> "
          + "status|register-many <tsv>|apps <prefix>|unregister <prefix>|killids <ids>|scan <file>";

  // Always UTF-8, whatever the console code page says.
  private static final PrintStream OUT =
      new PrintStream(new FileOutputStream(FileDescriptor.out), true, StandardCharsets.UTF_8);

  private static String password = "";

  public static void main(String[] a) {
    int code;
    try {
      code = run(a);
    } catch (Throwable e) {
      OUT.println("ERROR " + e.getClass().getSimpleName() + ": " + redact(String.valueOf(e.getMessage())));
      code = 1;
    }
    OUT.flush();
    System.exit(code);
  }

  private static int run(String[] a) throws Exception {
    if (a.length < 2) return usage();
    String command = a[1];
    boolean needsArg =
        command.equals("register-many")
            || command.equals("apps")
            || command.equals("unregister")
            || command.equals("killids")
            || command.equals("scan");
    if (!needsArg && !command.equals("status")) return usage();
    if (needsArg && a.length < 3) return usage();
    // Refuse before reading credentials or opening an admin connection: only courses-* is removable.
    if (command.equals("unregister") && !REMOVABLE_PREFIX.matcher(a[2]).matches()) {
      OUT.println("REFUSED " + one(a[2]));
      return 3;
    }

    String user = "";
    List<String> envLines = Files.readAllLines(Path.of(a[0]), StandardCharsets.UTF_8);
    for (int n = 0; n < envLines.size(); n++) {
      String line = envLines.get(n);
      if (n == 0 && line.startsWith("﻿")) line = line.substring(1);
      int i = line.indexOf('=');
      if (i <= 0) continue;
      String key = line.substring(0, i).trim();
      String value = unquote(line.substring(i + 1).trim());
      if (key.equals("BBJ_ADMIN_USER")) user = value;
      else if (key.equals("BBJ_ADMIN_PASSWORD")) password = value;
    }

    if (command.equals("scan")) return scan(a[2]);

    if (user.isEmpty() || password.isEmpty()) {
      OUT.println("ERROR missing BBJ_ADMIN_USER or BBJ_ADMIN_PASSWORD in env file");
      return 1;
    }
    BBjAdminBase admin = BBjAdminFactory.getBBjAdmin(user, password);
    try {
      switch (command) {
        case "status":
          return status(admin);
        case "register-many":
          return registerMany(admin, a[2]);
        case "apps":
          return apps(admin, a[2]);
        case "unregister":
          return unregister(admin, a[2]);
        default:
          return killIds(admin, a[2]);
      }
    } finally {
      admin.release();
    }
  }

  private static int usage() {
    OUT.println(USAGE);
    return 64;
  }

  private static String unquote(String v) {
    if (v.length() >= 2) {
      char first = v.charAt(0);
      if ((first == '"' || first == '\'') && v.charAt(v.length() - 1) == first) {
        return v.substring(1, v.length() - 1);
      }
    }
    return v;
  }

  private static String redact(String text) {
    if (password == null || password.isEmpty()) return text;
    return text.replace(password, "<redacted>");
  }

  // One record per line: keep a value on a single line.
  private static String one(Object value) {
    return Objects.toString(value, "").replaceAll("[\\r\\n]+", " ");
  }

  private static int scan(String file) throws Exception {
    String text = Files.readString(Path.of(file), StandardCharsets.UTF_8);
    if (!password.isEmpty() && text.contains(password)) {
      OUT.println("LEAK BBJ_ADMIN_PASSWORD");
      return 2;
    }
    OUT.println("CLEAN");
    return 0;
  }

  private static int status(BBjAdminBase admin) throws Exception {
    for (String feature : new String[] {"BBJ", "WEBCUI"}) {
      String total = "0";
      String inUse = "0";
      try {
        BBjAdminLicenseFeatureInfo lic = admin.getLicenseFeatureInfo(feature);
        total = String.valueOf(lic.getTotalUserCount());
        inUse = String.valueOf(lic.getNumberInUse());
      } catch (Exception e) {
        total = "0";
        inUse = "0";
      }
      OUT.println("LICENSE " + feature + " total=" + total + " inUse=" + inUse);
    }
    for (BBjAdminBBjProcess p : admin.getBBjProcesses()) {
      OUT.println(
          "PROC id=" + one(p.getString(BBjAdminBBjProcess.PROCESS_ID))
              + " since=" + one(p.getString(BBjAdminBBjProcess.CONNECTION_TIME))
              + " notResponding=" + one(p.getString(BBjAdminBBjProcess.NOT_RESPONDING))
              + " prog=" + one(p.getString(BBjAdminBBjProcess.PROGRAM_NAME)));
    }
    return 0;
  }

  private static String label(String name) {
    String clean = one(name).replaceAll("\\s", "_");
    return clean.isEmpty() ? "-" : clean;
  }

  private static int registerMany(BBjAdminBase admin, String tsv) throws Exception {
    int failed = 0;
    BBjAdminAppDeploymentConfiguration cfg = admin.getRemoteConfiguration();
    for (String row : Files.readAllLines(Path.of(tsv), StandardCharsets.UTF_8)) {
      if (row.trim().isEmpty()) continue;
      String[] c = row.split("\t", -1);
      String name = c.length > 0 ? c[0].trim() : "";
      String program = c.length > 1 ? c[1].trim() : "";
      String workdir = c.length > 2 ? c[2].trim() : "";
      if (!APP_NAME.matcher(name).matches()) {
        OUT.println("FAIL " + label(name) + " invalid name");
        failed++;
        continue;
      }
      if (!Files.isRegularFile(Path.of(program))) {
        OUT.println("FAIL " + name + " no such program: " + one(program));
        failed++;
        continue;
      }
      if (!Files.isDirectory(Path.of(workdir))) {
        OUT.println("FAIL " + name + " no such directory: " + one(workdir));
        failed++;
        continue;
      }
      try {
        BBjAdminAppDeploymentApplication app = null;
        for (BBjAdminAppDeploymentApplication x : cfg.getApplications()) {
          if (name.equals(x.getString(BBjAdminAppDeploymentApplication.NAME))) app = x;
        }
        if (app == null) app = cfg.createApplication();
        app.setString(BBjAdminAppDeploymentApplication.NAME, name);
        app.setString(BBjAdminAppDeploymentApplication.PROGRAM, program);
        app.setString(BBjAdminAppDeploymentApplication.WORKING_DIRECTORY, workdir);
        app.setBoolean(BBjAdminAppDeploymentApplication.DWC_ENABLED, true);
        app.setBoolean(BBjAdminAppDeploymentApplication.BUI_ENABLED, false);
        app.setBoolean(BBjAdminAppDeploymentApplication.DISALLOW_CONSOLE_USE_DEFAULT, false);
        app.setBoolean(BBjAdminAppDeploymentApplication.DISALLOW_CONSOLE, false);
        app.commit();
        OUT.println("URL " + name + " " + one(app.getDwcUrl(false)));
      } catch (Exception e) {
        OUT.println(
            "FAIL " + name + " " + e.getClass().getSimpleName() + ": " + one(redact(String.valueOf(e.getMessage()))));
        failed++;
      }
    }
    return failed > 0 ? 2 : 0;
  }

  private static int apps(BBjAdminBase admin, String prefix) throws Exception {
    BBjAdminAppDeploymentConfiguration cfg = admin.getRemoteConfiguration();
    for (BBjAdminAppDeploymentApplication x : cfg.getApplications()) {
      String name = x.getString(BBjAdminAppDeploymentApplication.NAME);
      if (name != null && name.startsWith(prefix)) {
        OUT.println("APP " + name + " " + one(x.getString(BBjAdminAppDeploymentApplication.PROGRAM)));
      }
    }
    return 0;
  }

  private static int unregister(BBjAdminBase admin, String prefix) throws Exception {
    if (!REMOVABLE_PREFIX.matcher(prefix).matches()) {
      OUT.println("REFUSED " + one(prefix));
      return 3;
    }
    BBjAdminAppDeploymentConfiguration cfg = admin.getRemoteConfiguration();
    List<String> names = new ArrayList<>();
    for (BBjAdminAppDeploymentApplication x : cfg.getApplications()) {
      String name = x.getString(BBjAdminAppDeploymentApplication.NAME);
      if (name != null && name.startsWith(prefix)) names.add(name);
    }
    for (String name : names) {
      cfg.removeApplication(name);
      OUT.println("REMOVED " + name);
    }
    return 0;
  }

  private static int killIds(BBjAdminBase admin, String ids) throws Exception {
    Set<String> wanted = new LinkedHashSet<>();
    for (String id : ids.split(",")) {
      if (!id.trim().isEmpty()) wanted.add(id.trim());
    }
    Set<String> seen = new HashSet<>();
    for (BBjAdminBBjProcess p : admin.getBBjProcesses()) {
      String id = p.getString(BBjAdminBBjProcess.PROCESS_ID);
      if (id != null && wanted.contains(id)) {
        p.terminate();
        seen.add(id);
        OUT.println("TERMINATED " + id);
      }
    }
    for (String id : wanted) {
      if (!seen.contains(id)) OUT.println("NOTFOUND " + id);
    }
    return 0;
  }
}
