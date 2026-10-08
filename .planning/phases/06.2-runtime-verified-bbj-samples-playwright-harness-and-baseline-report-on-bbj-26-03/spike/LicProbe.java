// Spike: list license features (name, total, in use).
import com.basis.api.admin.*;
import com.basis.api.admin.client.*;
import java.nio.file.*;
import java.util.*;

public class LicProbe {
  public static void main(String[] a) throws Exception {
    Map<String, String> env = new HashMap<>();
    for (String l : Files.readAllLines(Path.of(a[0]))) { int i = l.indexOf('='); if (i > 0) env.put(l.substring(0, i).trim(), l.substring(i + 1).trim()); }
    BBjAdminBase admin = BBjAdminFactory.getBBjAdmin(env.get("BBJ_ADMIN_USER"), env.get("BBJ_ADMIN_PASSWORD"));
    try {
      for (BBjAdminLicenseFeatureInfo f : admin.getAllLicenseFeatureInfo())
        System.out.println("FEATURE " + f.getFeature() + " total=" + f.getTotalUserCount() + " inUse=" + f.getNumberInUse() + " version=" + f.getVersion());
    } finally { admin.release(); }
  }
}
