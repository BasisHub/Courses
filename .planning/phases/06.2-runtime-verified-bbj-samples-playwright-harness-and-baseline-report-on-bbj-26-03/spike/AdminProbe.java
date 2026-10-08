// Spike: talk to the BBj Admin API from plain Java, without a BBj interpreter license.
// Usage: java -cp "C:/bbx/.lib/*" AdminProbe.java <env file> list|kill <marker>|killids <id,id,...>
import com.basis.api.admin.*;
import com.basis.api.admin.client.*;
import java.nio.file.*;
import java.util.*;

public class AdminProbe {
  public static void main(String[] a) throws Exception {
    Map<String, String> env = new HashMap<>();
    for (String l : Files.readAllLines(Path.of(a[0]))) {
      int i = l.indexOf('=');
      if (i > 0) env.put(l.substring(0, i).trim(), l.substring(i + 1).trim());
    }
    String mode = a[1];
    String marker = a.length > 2 ? a[2].toLowerCase() : "";
    BBjAdminBase admin = BBjAdminFactory.getBBjAdmin(env.get("BBJ_ADMIN_USER"), env.get("BBJ_ADMIN_PASSWORD"));
    try {
      if (mode.equals("register")) {
        // register <name> <program> <workdir> [noconsole]
        String name = a[2], program = a[3], dir = a[4];
        String consoleMode = a.length > 5 ? a[5] : "default"; // default | noconsole | console
        if (!Files.isRegularFile(Path.of(program))) throw new IllegalArgumentException("no such program: " + program);
        BBjAdminAppDeploymentConfiguration cfg = admin.getRemoteConfiguration();
        BBjAdminAppDeploymentApplication app = null;
        for (BBjAdminAppDeploymentApplication x : cfg.getApplications())
          if (name.equals(x.getString(BBjAdminAppDeploymentApplication.NAME))) app = x;
        if (app == null) app = cfg.createApplication();
        app.setString(BBjAdminAppDeploymentApplication.NAME, name);
        app.setString(BBjAdminAppDeploymentApplication.PROGRAM, program);
        app.setString(BBjAdminAppDeploymentApplication.WORKING_DIRECTORY, dir);
        app.setBoolean(BBjAdminAppDeploymentApplication.DWC_ENABLED, true);
        app.setBoolean(BBjAdminAppDeploymentApplication.BUI_ENABLED, false);
        app.setBoolean(BBjAdminAppDeploymentApplication.DISALLOW_CONSOLE_USE_DEFAULT, consoleMode.equals("default"));
        app.setBoolean(BBjAdminAppDeploymentApplication.DISALLOW_CONSOLE, consoleMode.equals("noconsole"));
        app.commit();
        System.out.println("URL " + app.getDwcUrl(false));
        return;
      }
      if (mode.equals("unregister")) {
        // unregister <name prefix>
        BBjAdminAppDeploymentConfiguration cfg = admin.getRemoteConfiguration();
        List<String> names = new ArrayList<>();
        for (BBjAdminAppDeploymentApplication x : cfg.getApplications()) {
          String n = x.getString(BBjAdminAppDeploymentApplication.NAME);
          if (n != null && n.startsWith(a[2])) names.add(n);
        }
        for (String n : names) { cfg.removeApplication(n); System.out.println("REMOVED " + n); }
        return;
      }
      BBjAdminLicenseFeatureInfo lic = admin.getLicenseFeatureInfo("BBJ");
      System.out.println("LICENSE BBJ total=" + lic.getTotalUserCount() + " inUse=" + lic.getNumberInUse());
      for (BBjAdminBBjProcess p : admin.getBBjProcesses()) {
        String prog = Objects.toString(p.getString(BBjAdminBBjProcess.PROGRAM_NAME), "");
        String line = "PROC id=" + p.getString(BBjAdminBBjProcess.PROCESS_ID)
            + " since=" + p.getString(BBjAdminBBjProcess.CONNECTION_TIME)
            + " notResponding=" + p.getString(BBjAdminBBjProcess.NOT_RESPONDING)
            + " prog=" + prog;
        String id = p.getString(BBjAdminBBjProcess.PROCESS_ID);
        boolean byId = mode.equals("killids") && Arrays.asList(marker.split(",")).contains(id);
        boolean byMarker = mode.equals("kill") && !marker.isEmpty() && prog.toLowerCase().contains(marker);
        if (byId || byMarker) {
          p.terminate();
          line += " -> TERMINATED";
        }
        System.out.println(line);
      }
    } finally {
      admin.release();
    }
  }
}
