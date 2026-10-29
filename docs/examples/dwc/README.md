# BBj DWC Training samples

These are the examples and exercise starters and solutions from the DWC Training course.
Keep each sample's companion CSS, JavaScript, ARC, and data files beside its program when you extract a ZIP.

## Requirements and running

- Use BBj 24.11 or later with BBjServices running. The button icon examples use `BBjControl::setSlot`, introduced in 24.11.
- Register a program as a web application in Enterprise Manager, enable DWC, and open its `/webapp/<application-name>` URL in a browser. Running a program directly with `bbj` starts the desktop client.
- Set the application's working directory to the sample folder. Samples load their companion assets relative to their own program file.
- The GUI/BUI starter programs show the code being migrated. Use their DWC counterparts to try the finished browser examples.
- The icon, Chart.js, and Shoelace examples load resources from CDNs and need internet access in the browser. The Shoelace examples pin version 2.20.1.
- `Exercise-*.bbj` starters deliberately leave work for the learner. Compare them with their `*Complete.bbj` solutions.

## Grid and database examples

Install the BBjGridExWidget plug-in with the BBj Plug-In Manager before using the GridEx examples. Keep `<BBjHome>/plugins/` on the application's PREFIX so that `USE ::BBjGridExWidget/BBjGridExWidget.bbj::BBjGridExWidget` resolves.
The grid and tree examples that query `CDStore` also need the CDStore demo database and its `CDINVENTORY` table.

The standalone compiler needs that PREFIX too. For example, from the extracted `03C_Grid2GridEx` folder on Windows:

```powershell
bbjcpl -t -N -X -c"C:/bbx/cfg/config.bbx" DWCGridSample.bbj
```

Replace `C:/bbx` with your installation path. The `-c` option supplies the installed configuration to the type checker; it does not change the web application's runtime configuration.
With `-t -N -X`, a successful check prints no diagnostics. Check compiler output, because BBjCpl can return exit code 0 even when it reports errors.

See the [compiler reference](https://documentation.basis.cloud/BASISHelp/WebHelp/util/bbjcpl_bbj_compiler.htm), [DWC registration guide](https://documentation.basis.cloud/BASISHelp/WebHelp/dwc/DWC_Registration_Launching.htm), and [GridEx installation guide](https://documentation.basis.cloud/BASISHelp/WebHelp/bbutil/BBjGridExWidget/BBjGridExWidget.htm).
