# DWC gap audit: Moodle course 4

Gap audit of the Moodle course 4 backup (`backup-moodle2-course-4-bbjdwc-20261003-1015-nu.mbz`, file name only) against the DWC book in `docs/docs/dwc/`, written 2026-10-04. Screenshots were matched to DWC images by SHA-1 against the Moodle `contenthash`: the backup holds 199 image file rows and 180 unique hashes; 60 DWC images matched, 42 of them with 2022 names. Verdicts follow the D-11 rules and are reviewed in the PR before any content changes.

Verdicts:

- **keep**: teaching content that is still correct for current BBj and DWC and is missing from the DWC page. It is adapted into the page named in Target.
- **covered**: the DWC page already says the same thing, or shows the same image by hash.
- **drop**: Moodle-isms (navigation, submit, course logistics), content superseded by a newer DWC chapter, redundant screenshots, or factually outdated content.

Every kept BBj snippet carries its `bbj_check_syntax` result and any fix in the Reason column.

## Summary

| Unit | Module | keep | covered | drop |
|------|--------|------|---------|------|
| 0P | book_56, chapter 35 | 0 | 16 | 15 |
| 0R | page_57 | 0 | 18 | 4 |
| 1A | page_58 | 2 | 6 | 6 |
| 1B | page_59 | 5 | 11 | 4 |
| 1C | page_60 | 15 | 26 | 4 |
| 2A | page_116 | 0 | 26 | 1 |
| 2B | page_62 | 4 | 20 | 17 |
| 2C | page_63 | 18 | 37 | 7 |
| 2D | page_64 | 6 | 14 | 7 |
| 3A | page_66 | 1 | 6 | 1 |
| 3B1 | book_67, chapter 36 | 2 | 4 | 1 |
| 3B2 | book_67, chapter 37 | 5 | 0 | 0 |
| 3B3 | book_67, chapter 38 | 20 | 0 | 1 |
| 3B4 | book_67, chapter 39 | 5 | 0 | 1 |
| 4A | page_69 | 4 | 14 | 5 |
| 5A | page_71 | 16 | 20 | 8 |
| 6A | page_74 | 19 | 10 | 12 |
| 7A | page_76 | 29 | 19 | 16 |
| 8A | page_78 | 4 | 1 | 3 |
| 8B | page_79 | 5 | 0 | 2 |
| 9A | page_80 | 14 | 0 | 3 |
| 9B | page_81 | 7 | 0 | 2 |
| 9C | page_82 | 8 | 0 | 1 |
| 10A | page_117 | 1 | 7 | 1 |
| 10B | page_120 | 1 | 4 | 2 |
| Total | 22 modules | 191 | 259 | 124 |

## Prerequisites - READ FIRST!

Unit: 0P. Module: book_56, chapter 35. DWC target: `docs/docs/dwc/prerequisites.mdx`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 0P-01 | paragraph | Students should be familiar with the following concepts before beginning the DWC training course... | - | covered | `docs/docs/dwc/prerequisites.mdx#dwc-training-class-prerequisites` | - |
| 0P-02 | link | `https://elearning.basis.com/course/index.php?categoryid=17` | - | drop | - | Moodle e-learning catalog link; the page points to the BBj Beginner Course instead |
| 0P-03 | link | `https://elearning.basis.com/course/index.php?categoryid=2` | - | drop | - | Moodle e-learning catalog link; the page points to the BBj Beginner Course instead |
| 0P-04 | link | `https://drive.google.com/file/d/0ByERNUtEl6-feE9KTUhxTTFIRTg/view?resourcekey=0-2y0VHJy5UGmp0jhT5e0S3Q` | - | drop | - | personal Google Drive file, not a stable official source |
| 0P-05 | link | `https://documentation.basis.com/BASISHelp/WebHelp/bbjobjects/bbjobject_diagram.htm` | - | drop | - | old documentation.basis.com host; the page links the current BASIS Online Help |
| 0P-06 | link | `https://drive.google.com/file/d/1WVRT1SOZ_VCMiT3NpxdMh6ATGioEN-n2/view` | - | drop | - | personal Google Drive file, not a stable official source |
| 0P-07 | link | `https://documentation.basis.com/WhitePapers/BBj%20Custom%20Objects%2020.20+.pdf` | - | drop | - | old documentation.basis.com host, white paper no longer needed as a prerequisite |
| 0P-08 | link | `https://documentation.basis.com/BASISHelp/WebHelp/bbjobjects/SysGui/bbjcontrol/bbjcontrol_setcallback.htm` | - | drop | - | old documentation.basis.com host; the page links the current BASIS Online Help |
| 0P-09 | link | `https://documentation.basis.com/BASISHelp/WebHelp/bbjevents/bbjevent_objects.htm` | - | drop | - | old documentation.basis.com host; the page links the current BASIS Online Help |
| 0P-10 | link | `https://drive.google.com/file/d/0ByERNUtEl6-faVhNTkw3LXBOOUU/view?resourcekey=0-xFJ8Enzl7fp6cymLV7pp7A` | - | drop | - | personal Google Drive file, not a stable official source |
| 0P-11 | paragraph | **Online Courses** Students with a basic understanding of HTML and CSS will be able to get significantly more... | - | covered | `docs/docs/dwc/prerequisites.mdx#online-courses` | - |
| 0P-12 | link | `https://www.freecodecamp.org/` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-13 | link | `https://www.freecodecamp.org/learn/responsive-web-design/` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-14 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#basic-html-and-html5` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-15 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#basic-css` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-16 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#applied-visual-design` | - | drop | - | optional sub-course link; the page already links the certification that contains it |
| 0P-17 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#responsive-web-design-principles` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-18 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#css-flexbox` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-19 | link | `https://www.freecodecamp.org/learn/responsive-web-design/#css-grid` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-20 | link | `https://www.youtube.com/c/Freecodecamp/videos?view=0&sort=dd&flow=grid` | - | drop | - | channel listing sorted by date, not stable; the certification link already leads to the material |
| 0P-21 | link | `https://upskillcourses.com/courses/html-css-syntax` | - | drop | - | third-party course of unknown availability; two other free HTML and CSS courses stay listed |
| 0P-22 | link | `https://www.khanacademy.org/computing/computer-programming/html-css` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-23 | link | `https://www.codecademy.com/learn/learn-html` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-24 | link | `https://www.codecademy.com/learn/learn-css` | - | covered | `docs/docs/dwc/prerequisites.mdx#recommended-free-courses` | - |
| 0P-25 | paragraph | **Course Materials** Here is the link to the repository with the various files you'll be using throughout this course... | - | covered | `docs/docs/dwc/prerequisites.mdx#course-materials` | - |
| 0P-26 | link | `https://github.com/BasisHub/DWCTraining` | - | drop | - | old DWCTraining repository; the Sample Code page replaces it |
| 0P-27 | paragraph | **Setup Check** Your Setup for this course should look like this: BBj 24.02, Eclipse, BDT 24... | - | covered | `docs/docs/dwc/prerequisites.mdx#setup-check` | - |
| 0P-28 | paragraph | **More Information** The DWC Training Class Prerequisites are also available in Google document format... | - | covered | `docs/docs/dwc/prerequisites.mdx#more-information` | - |
| 0P-29 | screenshot | `iconInfoLogo.png` | - | drop | - | not in backup; decorative info icon replaced by the info admonition |
| 0P-30 | link | `https://docs.google.com/document/d/1FhvT78EfO1CM63k8h3SFnEXoLuMXCB3ZZ10zYIX0NM0/edit` | - | drop | - | Google document copy of this page; the page itself is the source of truth now |
| 0P-31 | link | `$@PAGEVIEWBYID*57@$` | - | covered | `docs/docs/dwc/prerequisites.mdx#more-information` | - |

## Useful Resource Links

Unit: 0R. Module: page_57. DWC target: `docs/docs/dwc/resources.mdx`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 0R-01 | paragraph | **Course Files** DWCTraining Repository - Github repository with the various files used throughout the course | - | covered | `docs/docs/dwc/resources.mdx#course-files` | - |
| 0R-02 | link | `https://github.com/BasisHub/DWCTraining` | - | drop | - | old DWCTraining repository; the Sample Code page replaces it |
| 0R-03 | paragraph | **BASIS Documentation** BASIS Online Help; BBj DWC-specific Documentation; BBj DWC Theme Engine | - | covered | `docs/docs/dwc/resources.mdx#basis-documentation` | - |
| 0R-04 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/index.htm` | - | covered | `docs/docs/dwc/resources.mdx#basis-documentation` | - |
| 0R-05 | link | `https://basishub.github.io/basis-next/#/dwc/` | - | drop | - | old basis-next host; dwc.style on the page replaces it |
| 0R-06 | link | `https://basishub.github.io/basis-next/#/theme-engine/` | - | drop | - | old basis-next host; dwc.style on the page replaces it |
| 0R-07 | paragraph | **DWC-Related Topics** Mozilla Developer: Using CSS Custom Properties; CSS Tricks - A Complete Guide to Custom Properties | - | covered | `docs/docs/dwc/resources.mdx#dwc-related-topics` | - |
| 0R-08 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties` | - | covered | `docs/docs/dwc/resources.mdx#dwc-related-topics` | - |
| 0R-09 | link | `https://css-tricks.com/a-complete-guide-to-custom-properties/` | - | covered | `docs/docs/dwc/resources.mdx#dwc-related-topics` | - |
| 0R-10 | paragraph | **DWC Themer** DWC Themer - A "work-in-progress" version of the DWC Themer app shown in the TechCon DWC sessions... | - | covered | `docs/docs/dwc/resources.mdx#dwc-themer` | - |
| 0R-11 | link | `https://us.bbx.kitchen/webapp/DWCThemer` | - | covered | `docs/docs/dwc/resources.mdx#dwc-themer` | - |
| 0R-12 | link | `https://docs.google.com/document/d/13lGfm38u5DpLQhmENS_Prfs1yZ79H0dnJLsaWtLbR8U/edit#` | - | drop | - | Google document, work in progress, not a stable official source |
| 0R-13 | paragraph | **Browser Developer Tools Links** Mozilla Developer: What are browser developer tools?; Debugging CSS; Chrome DevTools | - | covered | `docs/docs/dwc/resources.mdx#browser-developer-tools-links` | - |
| 0R-14 | link | `https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools` | - | covered | `docs/docs/dwc/resources.mdx#browser-developer-tools-links` | - |
| 0R-15 | link | `https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Debugging_CSS` | - | covered | `docs/docs/dwc/resources.mdx#browser-developer-tools-links` | - |
| 0R-16 | link | `https://developer.chrome.com/docs/devtools/` | - | covered | `docs/docs/dwc/resources.mdx#browser-developer-tools-links` | - |
| 0R-17 | paragraph | **CSS Reference Links** Mozilla Developer - CSS: Cascading Style Sheets; CSS Basics; CSS Reference; Cascade; Specificity | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |
| 0R-18 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS` | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |
| 0R-19 | link | `https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics` | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |
| 0R-20 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference` | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |
| 0R-21 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade` | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |
| 0R-22 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#specifications` | - | covered | `docs/docs/dwc/resources.mdx#css-reference-links` | - |

## 1A. Registering and Launching a DWC App

Unit: 1A. Module: page_58. DWC target: `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md`, `docs/docs/dwc/01-gui-to-bui-to-dwc/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 1A-01 | summary | **Concepts Covered in This Chapter** 1A. Registering and Launching a DWC App ... 1C. Taking an App From GUI to BUI to DWC | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/index.md#concepts-covered-in-this-chapter` | - |
| 1A-02 | paragraph | **Overview** This section covers registering a simple "Hello World" BBj program | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#overview` | - |
| 1A-03 | paragraph | **Concepts Covered in This Section** Registering and launching BBj GUI apps in the BUI and DWC clients | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#registering-apps-for-the-web` | - |
| 1A-04 | screenshot | `Eclipse-RunBUIProgram (1).png` | 611dc7460b6685b66942751cc00ba5eaed7c1201 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#launching-from-eclipse` | 34 px Run BUI Program toolbar icon, viewed, no personal data; the page names the button but never shows it |
| 1A-05 | screenshot | `DWCWebIconLarge.png` | 0f7ea58a15f3fca9474b2a3644e45b3fc7bd8b4c | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#launching-from-eclipse` | 64 px Run DWC Program toolbar icon, viewed, no personal data; the page names the button but never shows it |
| 1A-06 | screenshot | `DWCWebIconLarge.png` | 0f7ea58a15f3fca9474b2a3644e45b3fc7bd8b4c | drop | - | same file as 1A-05, repeated for the old-version step |
| 1A-07 | screenshot | `Eclipse-RunBUIProgram.png` | 611dc7460b6685b66942751cc00ba5eaed7c1201 | drop | - | same file as 1A-04, repeated for the old-version step |
| 1A-08 | screenshot | `Google Chrome - ... screenshot 2022-06-27 at 14.56.43.png` | 95288a63c6c6d9f58797c1b25259c46c09c78831 | drop | - | 32 px green plus icon of the Add button; the step text names the button |
| 1A-09 | screenshot | `Google Chrome - ... screenshot 2022-06-27 at 15.02.38.png` | 8f8c74b6c275bfb4c26c8ddc61386746014c3262 | drop | - | 38 px save icon of the Save button; the step text names the button |
| 1A-10 | screenshot | `Microsoft Edge - localhost8888bbjememapp- screenshot 2022-07-01 at 13.17.10.png` | acc8abf4f8ae143d7caeb0d177c529da6da8eba9 | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#registering-via-enterprise-manager` | same image by hash: docs/docs/dwc/01-gui-to-bui-to-dwc/img/em-registration.png |
| 1A-11 | screenshot | `QASmall.png` | 219e52764ea02c949ea9df1b0770397371693201 | drop | - | Moodle question and answer forum icon, course navigation |
| 1A-12 | paragraph | **1) Default BUI and DWC Contexts** The previous examples replaced the default BUI context of 'apps' | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#default-bui-and-dwc-contexts` | - |
| 1A-13 | screenshot | `vixBfU9qjVeqJPAT8gzrY0SJ9Man-2atZ4_-TDCvUKL03_xy67AViyrSZZpQ_ID73oP1h5HuKcbhWFxifZaRSZjNb4rksNs1o4...` | - | drop | - | not in backup (off-site image of the Context Configuration page) |
| 1A-14 | screenshot | `EclipsePreferences.png` | ea474f29b003ef40aba75418f92f0ac3eb5c85b5 | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md#using-an-external-browser` | same image by hash: docs/docs/dwc/01-gui-to-bui-to-dwc/img/eclipse-preferences.png |

## 1B. Running a "Hello World" App in BUI and DWC

Unit: 1B. Module: page_59. DWC target: `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 1B-01 | paragraph | **Overview** This section covers registering a simple "Hello World" BBj program | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#overview` | - |
| 1B-02 | paragraph | **Concepts Covered in This Section** Registering and launching BBj GUI apps in the BUI and DWC clients | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#concepts-covered-in-this-section` | - |
| 1B-03 | paragraph | **Sample Code** The following program will be the source for your first DWC app | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#sample-code` | - |
| 1B-04 | code (bbj) | `if (info(3,6)="1") then client$ = "GUI"` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#sample-code` | - |
| 1B-05 | paragraph | **Program Notes** The code determines the runtime client by comparing the value for the INFO(3,6) | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#program-notes` | - |
| 1B-06 | paragraph | **Example 1 - Running a BBj Program in GUI, BUI, and DWC** 1) Load the above program (MessageBox.bbj | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-1---running-a-bbj-program-in-gui-bui-and-dwc` | - |
| 1B-07 | screenshot | `EclipseRun.png` | d561628685c114a58823d3f1b3f11c6781706772 | drop | - | 28 px generic green Run icon, viewed; the step names the Run button |
| 1B-08 | screenshot | `BBj - Greetings- screenshot 2022-07-02 at 14.50.03.png` | f40f6a8438231394bfaea7d0d8e5edc039b91188 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-1---running-a-bbj-program-in-gui-bui-and-dwc` | message box as the GUI client draws it (macOS), viewed, no personal data; the page shows no result image |
| 1B-09 | screenshot | `Eclipse-RunBUIProgram.png` | 611dc7460b6685b66942751cc00ba5eaed7c1201 | drop | - | same file as 1A-04, icon kept on the 1A page |
| 1B-10 | screenshot | `Google Chrome - myApp- screenshot 2022-06-29 at 09.23.53.png` | a8e58fa8937d1332870bdc43128d6513282c0bbc | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-1---running-a-bbj-program-in-gui-bui-and-dwc` | message box in the BUI client, viewed, no personal data; shows the BUI look next to GUI and DWC |
| 1B-11 | screenshot | `Google Chrome - myApp- screenshot 2022-06-27 at 15.49.33.png` | 94c3a51b092f2911b7d57c30c896cffb76ecfe6b | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-1---running-a-bbj-program-in-gui-bui-and-dwc` | message box in the DWC with the primary theme, viewed, no personal data; the expected result of step 3 |
| 1B-12 | paragraph | **Example 2 - DWC Component Themes** 1) The DWC offers seven different component themes | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-2---dwc-component-themes` | - |
| 1B-13 | screenshot | `Google Chrome - myApp- screenshot 2022-06-29 at 07.08.09.png` | cbf8b2c8aa2f7cbbfcb7c06bd9e27ba2ea31ec34 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#example-2---dwc-component-themes` | message box with theme=danger and a danger OK button, viewed, no personal data; the expected result of the exercise |
| 1B-14 | screenshot | `Google Chrome - 1A-MessageBox- screenshot 2022-06-30 at 15.15.53.png` | 5568e3f107a6b68d0bcafd7c0acf3d35cb76f2ec | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#going-the-extra-mile` | message box with the default theme, viewed, no personal data; the expected result of the extra-mile experiment |
| 1B-15 | screenshot | `QASmall.png` | 219e52764ea02c949ea9df1b0770397371693201 | drop | - | Moodle question and answer forum icon, course navigation |
| 1B-16 | paragraph | **Notes** 1) Running a BBj App in the Dynamic Web Client | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#running-a-bbj-app-in-the-dynamic-web-client` | - |
| 1B-17 | screenshot | `Eclipse-RunBUIProgram (1).png` | 611dc7460b6685b66942751cc00ba5eaed7c1201 | drop | - | same file as 1A-04, icon kept on the 1A page |
| 1B-18 | code (bbj) | `rem If the app is running in BUI, switch it automatically to run in the DWC client instead` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md#running-a-bbj-app-in-the-dynamic-web-client` | - |
| 1B-19 | attachment | `MessageBox.bbj` | 6f2cf709edd2d36296b7ab300764c5b2749898f9 | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC (CRLF aside) |
| 1B-20 | attachment | `01_GUI2BUI2DWC.zip` | 40e3f395ddbc50bce9869771d0787202205d483c | covered | `docs/docs/dwc/samples.mdx` | same files as docs/examples/dwc/01_GUI2BUI2DWC |

## 1C. Taking an App From GUI to BUI to DWC

Unit: 1C. Module: page_60. DWC target: `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 1C-01 | paragraph | **Overview** This section deals with a traditional BBj GUI program that contains fields and a button | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#overview` | - |
| 1C-02 | paragraph | **Concepts Covered in This Section** Running a complete graphical BBj app in the thin client (GUI) | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#concepts-covered-in-this-section` | - |
| 1C-03 | paragraph | **Sample Code** For this section, you will start by running the GUISample.bbj program in GUI | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#sample-code` | - |
| 1C-04 | screenshot | `BBj - Hello BBj DWC- screenshot 2022-06-30 at 15.41.54.png` | ce2af7dee48b2515f02abf495f3d688eba593aac | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#sample-code` | GUISample.bbj in the GUI client, viewed, sample names Joe and Blow only; the page says "shown below" but has no image |
| 1C-05 | paragraph | **Program Notes** The program displays a dialog with inputs for the user's first and last names | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#program-notes` | - |
| 1C-06 | paragraph | **Example 1 - Running the App in GUI, BUI, and the DWC** 1) Begin by loading the GUISample.bbj program | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#example-1---running-the-app-in-gui-bui-and-the-dwc` | - |
| 1C-07 | paragraph | **Example 2 - Responsive Layouts** 1) BBj programs running in GUI, BUI, and the DWC create their windows and controls | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-1-enable-flow-layout` | page has the flow layout flag text and the setPanelStyle step; the BBjUtils keyword help walk-through is dropped in 1C-10 |
| 1C-08 | screenshot | `BBjSysGui-addWindowMethod.png` | cdbd8a85ec10a43b86328a79ebde0bf51cb833dd | drop | - | image of the addWindow help table; the page names the method and the flags, and the help table changes with the BBj release |
| 1C-09 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-06-30 at 08.27.21.png` | 53e227598be4ceac0023216414da7b2203a73d52 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-1-enable-flow-layout` | flow layout result (controls side by side, no spacing), viewed, no personal data; the page has no result image |
| 1C-10 | screenshot | `Eclipse - EclipseBBjWorkspace - DWCTraining01_GUI2BUI2DWCGUISample-Working.bbj- screenshot 2022-07-05 at 10.23.42.png` | 869b162d2ddd8e83878e7d3e346ccac8badb2f34 | drop | - | Eclipse BBj Keyword Help view of the BBjUtils plug-in, an editor detail that does not teach the flags |
| 1C-11 | code (bbj) | `REM setting the styles into the style property of the element` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#method-1-inside-the-bbj-code-used-in-this-exercise` | - |
| 1C-12 | paragraph | **Example 2 - Responsive Layouts** 2-2) In an external CSS file: Add the styles to the window by adding a class name | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#method-2-in-an-external-css-file` | - |
| 1C-13 | code (css) | `.mypanel{` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#method-2-in-an-external-css-file` | - |
| 1C-14 | paragraph | **Example 2 - Responsive Layouts** Both ways are valid, but in a production system, you would want definitely to use the second way | - | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#css-grid-explanation` | page lacks the row wrap note, the gap and padding unit choices (0.25in, space custom properties, calc) and the case for external CSS over three setPanelStyle round trips; adapt with --dwc-* names |
| 1C-15 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 10.50.52.png` | 955491b58f9903c8e39ed5bc553aa1a61936384c | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#css-grid-explanation` | two-column grid result with the button in column 1, viewed, no personal data |
| 1C-16 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 11.20.32.png` | eaf16b10e456276d612c139411be422bf870648d | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-3-button-spanning` | button spanning both columns, viewed, no personal data; result of grid-column span 2 |
| 1C-17 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 11.23.32.png` | d7ff658bfe57115c77017fdf2c1d0d67ebc9dee3 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-3-button-spanning` | button in column 2, viewed, no personal data; result of grid-column 2 |
| 1C-18 | code (html) | `<div id="4" class="BBjDockedChildrenPanel BBjControl BBjTopLevelWindow-container">` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-4-understanding-window-structure` | - |
| 1C-19 | code (html) | `<div id="2" class="BBjWindow BBjControl bbj-0-0 BBjTopLevelWindow-center">` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-4-understanding-window-structure` | same nested DIV fence on the page, Moodle splits it in two pre blocks |
| 1C-20 | paragraph | **Example 2 - Responsive Layouts** All the controls contained in the window are child elements of the innermost window element | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-4-understanding-window-structure` | page gives the setPanelStyle versus setStyle reason and the single-DIV addChildWindow note |
| 1C-21 | attachment | `BBjTopLevelWindow Structure.svg` | 18b4c234d9f417d1c7c53a181a15c78c92cfeb59 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-4-understanding-window-structure` | diagram of the three nested DIVs with docked windows and status bar, the page has no figure; screened (no script, foreignObject, on*= or external href), 06-12 re-greps before copying |
| 1C-22 | paragraph | **Example 3 - BBjControl Attributes** 1) The DWC-specific documentation for the BBjButton displays a Properties table | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#example-3---bbjcontrol-attributes` | - |
| 1C-23 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 11.30.52.png` | bdd03091d96939e126ace5e934117056407da216 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-2-set-theme` | extra large green Say Hello button, viewed, no personal data; result of expanse xl and theme success |
| 1C-24 | paragraph | **Example 4 - Making a Real Web App** 1) Our GUI to BUI to DWC app is progressing nicely | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#example-4---making-a-real-web-app` | - |
| 1C-25 | screenshot | `Safari - Hello BBj DWC- screenshot 2022-07-05 at 12.50.54.png` | be1a09d022bb65bb604445ec3ebf30643de2b821 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-1-remove-window-chrome` | full-width grid with an overly wide column 2 in Safari, viewed, only localhost shown; the problem step 2 fixes |
| 1C-26 | screenshot | `Safari - Hello BBj DWC- screenshot 2022-07-05 at 13.10.58.png` | f4f0f43608c94cca1ff767fbe67c06b3f750b079 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-2-fix-column-widths` | narrow inline-grid result with 1fr 2fr, viewed, only localhost shown; the fixed layout |
| 1C-27 | code (bbj) | `st! = wnd!.addStaticText("First Name:")` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#step-3-clean-up-code` | - |
| 1C-28 | paragraph | **Example 4 - Making a Real Web App** After making these changes, your program should match the DWC2.bbj program | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#going-the-extra-mile` | - |
| 1C-29 | screenshot | `Eclipse-RunBUIProgram.png` | 611dc7460b6685b66942751cc00ba5eaed7c1201 | drop | - | same file as 1A-04, icon kept on the 1A page |
| 1C-30 | code (bbj) | `rem If the app is running in BUI, switch it automatically to run in the DWC client instead` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#auto-switch-to-dwc` | - |
| 1C-31 | paragraph | **Example 4 - Making a Real Web App** 2) When running on a mobile device like an iPhone, you find that the phone zooms into the form | - | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#mobile-device-fixes` | page gives the two fixes but not why iOS zooms (14 px base font below the 16 px iOS threshold); adapt with the current --dwc-font-size token, not the Moodle --bbj-font-size |
| 1C-32 | code (bbj) | `wnd!.setStyle("font-size","16px")` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#mobile-device-fixes` | - |
| 1C-33 | paragraph | **web! = BBjAPI().getWebManager() web!.setMeta("viewport", ...)** This method prevents the user from zooming in and out | - | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#mobile-device-fixes` | page has the setMeta fence but not the trade-off: turn off user scaling only with a responsive layout, else keep zoom for legibility |
| 1C-34 | paragraph | **Example 5 - Error Handling** 1) Our DWC app is running correctly, but what happens when we make a mistake | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#example-5---error-handling` | - |
| 1C-35 | code (bbj) | `print btn!; escape` | - | covered | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#testing-error-handling` | page fence has the same two statements on two lines |
| 1C-36 | paragraph | **Example 5 - Error Handling** 3) Now print out the date in the Console using the provided Answer syntax | - | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#testing-error-handling` | page stops at the BBj console date; the browser console answer("? date(0)") step is missing |
| 1C-37 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 18.43.35.png` | 7241b9357b515e078e2fb017907f881c8211663f | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#testing-error-handling` | BBj mini console showing BBjButton and READY, viewed, no personal data |
| 1C-38 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 18.44.19.png` | 7cd296fa5fbd5daa572634552df111523c91e578 | keep | `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md#testing-error-handling` | browser Developer Tools Console with the same output, viewed, no personal data |
| 1C-39 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 19.21.43.png` | e751a81057f89ccbfef30fad100007b99ea1769b | drop | - | second Console crop for answer(), redundant with 1C-38 once the text names the call |
| 1C-40 | attachment | `01_GUI2BUI2DWC.zip` | 40e3f395ddbc50bce9869771d0787202205d483c | covered | `docs/docs/dwc/samples.mdx` | same files as docs/examples/dwc/01_GUI2BUI2DWC |
| 1C-41 | attachment | `GUISample.bbj` | a7934a482670f46cb786b9a06160aa933a243867 | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC (CRLF aside) |
| 1C-42 | attachment | `DWC1.bbj` | b421d0917b121aaec2989c06c27ce3c47062ab46 | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC (CRLF aside) |
| 1C-43 | attachment | `DWC2.bbj` | 05c77322b9db79a388c9b3a697114be4c64b69e0 | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC; repo copy differs only in updated dwc.style links and comments |
| 1C-44 | attachment | `Sample.bbj` | b5cdc5e5b60e40454d9c95e7b83f1213592d9aa5 | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC/DWC_ExternalCSS |
| 1C-45 | attachment | `Sample.css` | d07260fc2589aa4e714afec0c1aea9543104e34b | covered | `docs/docs/dwc/samples.mdx` | already in docs/examples/dwc/01_GUI2BUI2DWC/DWC_ExternalCSS |

## 2A. Introduction to CSS

Unit: 2A. Module: page_116. DWC target: `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md`, `docs/docs/dwc/02-browser-developer-tools/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 2A-01 | summary | **Section 2 summary** Concepts Covered in This Chapter: 2A. Introduction to CSS ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/index.md` | - |
| 2A-02 | paragraph | **Overview** This section covers the Introduction into CSS. | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#overview` | - |
| 2A-03 | paragraph | **What is CSS?** CSS (Cascading Style Sheets) is as its name implies ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#what-is-css` | - |
| 2A-04 | paragraph | **How to use CSS Selectors** Style definitions in a CSS file ... CSS Type Selector | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-type-selector` | - |
| 2A-05 | code (css) | `p {` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-type-selector` | - |
| 2A-06 | paragraph | **How to use CSS Selectors** You just write out your element name ... CSS Class Selector | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-class-selector` | - |
| 2A-07 | code (css) | `.myClass {` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-class-selector` | - |
| 2A-08 | paragraph | **How to use CSS Selectors** For classes you write the name of your class ... CSS Id Selector | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-id-selector` | - |
| 2A-09 | code (css) | `#myId {` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-id-selector` | - |
| 2A-10 | paragraph | **How to use CSS Selectors** This is important if you want to give one specific element the style ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-id-selector` | - |
| 2A-11 | paragraph | **CSS Selector Combinators** CSS Classes can also be Combined ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-selector-combinators` | - |
| 2A-12 | code (text) | `element-one, .class-two { ... }` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#comma-or` | - |
| 2A-13 | paragraph | **CSS Selector Combinators** A comma between selectors applies the same style ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#comma-or` | - |
| 2A-14 | code (text) | `element one.class-two.class-three { ... }` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#chaining-and` | - |
| 2A-15 | paragraph | **CSS Selector Combinators** Chaining classes with other classes ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#chaining-and` | - |
| 2A-16 | code (text) | `element-one .class-two { ... }` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#space-descendant` | - |
| 2A-17 | paragraph | **CSS Selector Combinators** A Space between selectors specifies descendants ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#space-descendant` | - |
| 2A-18 | code (text) | `element-one > element-two { ... }` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#greater-than-direct-descendant` | - |
| 2A-19 | paragraph | **CSS Selector Combinators** A > between selectors to specify a direct descendant ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#greater-than-direct-descendant` | - |
| 2A-20 | paragraph | **CSS Pseudo-Classes (States)** Pseudo-classes are CSS selectors that can represent state ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-pseudo-classes-states` | - |
| 2A-21 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#css-pseudo-classes-states` | - |
| 2A-22 | paragraph | **Shadow DOM's** DOM (Document Object Model) is the structural model of all element on a page ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#shadow-doms` | - |
| 2A-23 | link | `https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM` | - | drop | - | The DWC page links the MDN CSS landing page for the same Shadow DOM sentence; no gap |
| 2A-24 | paragraph | **Apply Classes and inject CSS Files in BBj** Classes are easily applied to any Object by using addClass ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#adding-classes` | - |
| 2A-25 | code (text) | `injectStyle(String style, boolean top, String attributes)` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#injecting-css` | - |
| 2A-26 | paragraph | **Apply Classes and inject CSS Files in BBj** style: A String of CSS ... Notes: ExternalCssExample.bbj and InlineCssExample.bbj | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#injecting-css` | - |
| 2A-27 | link | `https://www.w3schools.com/css/default.asp` | - | covered | `docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md#notes` | same W3Schools CSS tutorial linked on the DWC page |

## 2B. Introduction to the Browser's Developer Tools

Unit: 2B. Module: page_62. DWC target: `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 2B-01 | paragraph | **Overview** This section starts with an introduction to the browser's Developer Tools ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#overview` | - |
| 2B-02 | paragraph | **Section Files** We'll be using the DWC1.bbj file during this section of the course. | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#section-files` | - |
| 2B-03 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | raw file link; DWC1.bbj ships in the downloadable DWC samples |
| 2B-04 | paragraph | **Concepts Covered in This Section** Accessing the browser's Developer Tools ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#concepts-covered-in-this-section` | - |
| 2B-05 | paragraph | **Developer Tools Features** The browser's Developer Tools are designed to help web developers ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#developer-tools-features` | - |
| 2B-06 | link | `https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction` | - | drop | - | term is explained inline on the DWC page; MDN link adds no gap |
| 2B-07 | link | `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div` | - | drop | - | term is explained inline on the DWC page; MDN link adds no gap |
| 2B-08 | paragraph | **Example 1 - Opening the Browser's Developer Tools** 1) Begin by loading the DWC1.bbj program ... 4) familiarize yourself | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md` | - |
| 2B-09 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | raw file link; DWC1.bbj ships in the downloadable DWC samples |
| 2B-10 | link | `$@COURSEVIEWBYID*4@$#section-1` | - | drop | - | Moodle-internal link (Section 1 Notes) |
| 2B-11 | link | `$@PAGEVIEWBYID*57@$&forceview=1` | - | drop | - | Moodle-internal link; the DWC book has resources.mdx |
| 2B-12 | paragraph | **Example 2 - Modifying a DWC App in the Developer Tools** 1) Now that the DWC1.bbj program ... is running in the browser ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#example-2---modifying-a-dwc-app-in-the-developer-tools` | - |
| 2B-13 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | raw file link; DWC1.bbj ships in the downloadable DWC samples |
| 2B-14 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-06-30 at 16.24.00.png` | 1f9fb8a9dc17e4b57f2987310e8b4139f58b864d | drop | - | tiny inline icon of the element selection tool, no teaching value |
| 2B-15 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-06-30 at 17.00.11.png` | fe441707b06135a4c2e2c09fb70996d35c93d330 | drop | - | tiny inline icon of the search steppers, no teaching value |
| 2B-16 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 14.54.21.png` (parked `dev-tools-screenshot-1.png`) | 0c93f9d67e4776b2927144dd8407b5fad11fac62 | drop | - | redundant: green title bar text is already shown by dwc-titlebar-text.png on the DWC page |
| 2B-17 | screenshot | `DTColorCodeCompletionForDWCVars.gif` | 4cbcd2cf50a6009ba139f6c2c70e251d51e162d3 | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#step-4-use-css-custom-properties` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/dt-color-code-completion.gif |
| 2B-18 | paragraph | **Example 3 - Setting CSS Styles on Controls** 1) Instead of modifying the styles for the app in the Developer Tools ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#example-3---setting-css-styles-on-controls` | - |
| 2B-19 | paragraph | **Going the Extra Mile** 1) Previously, we set the label's foreground color ... 2) If you attempt | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#going-the-extra-mile` | - |
| 2B-20 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 15.11.36.png` | 8743658558647e08ce728fd5009cdf791209070f | drop | - | label with warning background, trivial result of one setStyle call that the code already shows |
| 2B-21 | code (bbj) | `btn!.setAttribute("expanse","xl")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#button-background-considerations` | DWC page shows the same lines with the closing parentheses of var() fixed |
| 2B-22 | paragraph | **Going the Extra Mile** If you attempt to set the 'background-color' CSS property ... only visible in the corners | - | keep | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#button-background-considerations` | DWC page states the shorthand rule but not the visible corners-only symptom; goes with the two kept button screenshots |
| 2B-23 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 15.16.53.png` (parked `dev-tools-screenshot-2.png`) | 2ba367e1fa98b200f9b29522b736a8b8264dd163 | keep | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#button-background-considerations` | shows the button with background-color: only the corners are tinted; the DWC page describes the step without a figure |
| 2B-24 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/background-color` | - | drop | - | MDN reference link; the DWC page explains the property inline |
| 2B-25 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/background` | - | drop | - | MDN reference link; the DWC page explains the shorthand inline |
| 2B-26 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 15.19.27.png` (parked `dev-tools-screenshot-3.png`) | c59d3ba61e5e7a5aeaf25cfaaf97f0bf7ebc173d | keep | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#button-background-considerations` | shows the button with the background shorthand: whole button tinted; the DWC page describes the step without a figure |
| 2B-27 | code (bbj) | `logo$ = "'https://basis.cloud/wp-content/uploads/2023/07/logo_basis_v2.svg'"` | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#complex-background-example` | - |
| 2B-28 | paragraph | **Going the Extra Mile** That code results in the window's background looking like this ... two backgrounds in the CSS background property | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#complex-background-example` | DWC page has a shorter explanation; the figure is kept in the next row |
| 2B-29 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-01 at 09.54.59.png` (parked `dev-tools-screenshot-4.png`) | d6db442d8aeb50d2cc926922f879e41e2e32bb64 | keep | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#complex-background-example` | shows the window with the BASIS logo and swirl pattern the code produces; the DWC page describes the result without a figure |
| 2B-30 | screenshot | `QASmall.png` | 219e52764ea02c949ea9df1b0770397371693201 | drop | - | decorative Q and A icon from the Moodle page |
| 2B-31 | paragraph | **More Information About the Browser's Developer Tools** 1) The screenshot below shows the DWC1 BBj program ... 3) Clicking | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#more-information-about-the-browsers-developer-tools` | - |
| 2B-32 | screenshot | `ChromeDevConsoleView.png` | 8b9ac90be4d0b74215c4c25da25971ed3e631f6b | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#step-4-key-sections-to-know` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/chrome-dev-console-view.png |
| 2B-33 | screenshot | `dwc_titlebar_text_nocolor_example.png` | 73a709c2611e28681500c5c3d94aad04e493b0a7 | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#step-2-change-title-color` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/dwc-titlebar-text-nocolor.png |
| 2B-34 | screenshot | `dwc_titlebar_text_example.png` | d9d795f174161da541d182ed8d7d859637e1da71 | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#step-2-change-title-color` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/dwc-titlebar-text.png |
| 2B-35 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#specifications` | - | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#style-specificity` | - |
| 2B-36 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | raw file link; DWC1.bbj ships in the downloadable DWC samples |
| 2B-37 | screenshot | `DwcPanel.png` | f368a9c8ecb299897e503168ef404d03327d56ab | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#css-grid-visualization` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/dwc-panel.png |
| 2B-38 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 19.39.30.png` | 9ec2b522bbd4585b9b6616b43c4babd569ac3d0a | drop | - | tiny inline image of the grid badge, no teaching value |
| 2B-39 | screenshot | `DWC1_showGridSize.png` | fdadc29ae6189e46ebe9fdda0c57fcbdb9d427c0 | covered | `docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md#css-grid-visualization` | same image by hash: docs/docs/dwc/02-browser-developer-tools/img/dwc1-show-grid-size.png |
| 2B-40 | attachment | `2A_Files.zip` | 5a9b636df060a291d0e5b2b64da1ba607332407e | drop | - | Phase 7 QUAL-03 lead: longer SetStyle.bbj; this phase adds no samples |
| 2B-41 | attachment | `DWC1.bbj` | b421d0917b121aaec2989c06c27ce3c47062ab46 | covered | `docs/docs/dwc/samples.mdx` | - |

## 2C. CSS Styles and CSS Custom Properties

Unit: 2C. Module: page_63. DWC target: `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 2C-01 | paragraph | **Overview** This section covers inspecting, modifying, adding, and deleting CSS styles on BBjControls. It also covers the DWC's CSS custom | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-02 | paragraph | **Concepts Covered in This Section** The DWC's CSS custom properties The DWC's App Themes Modifying a BBjControl's Style Properties Using Di | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-03 | paragraph | **The DWC's CSS Custom Properties** In the previous section, we got our first look at the DWC's CSS custom properties, also known as CSS var | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-04 | code (css) | `--dwc-color-black: #000;` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-05 | paragraph | **The DWC's CSS Custom Properties** and their values are accessed using the var() function, e.g. | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-06 | code (css) | `color: var(--dwc-color-black);` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-07 | paragraph | **The DWC's CSS Custom Properties** Given the above examples, "--dwc-color-black" is the CSS custom property and its value was set to the co | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-08 | code (css) | `color: var(--dwc-button-color, red);` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-09 | paragraph | **The DWC's CSS Custom Properties** In this example, the color of the text on a BBjButton is set to the value of the --dwc-button-color CSS | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#the-dwcs-css-custom-properties` | pretty-print toggle for the minified dwc-ui.css is missing from the tip |
| 2C-10 | screenshot | `DWC_Custom_Properties.png` | 906d136b2d2f3fb8836c40c701277221947c9a1d | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#the-dwcs-css-custom-properties` | shows where dwc-ui.css lives in the Application tab and the pretty-print button; page has no figure |
| 2C-11 | paragraph | **Example 1 - Setting Custom Values for the DWC's CSS Custom Properties** 1) Load the CSSCustomProperties.bbj program from the 02_CSSStylesA | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-12 | screenshot | `CSSCustomPropertiesLightMode.png` | c71e41e142b0674c5446c82617476fe82f12f28d | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#example-1---setting-custom-values-for-css-custom-properties` | result of setting --dwc-primary-color to orange; page describes it without a figure |
| 2C-13 | code (bbj) | `sampleWindow!.setStyle(currentProperty$, currentValue$)` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-14 | paragraph | **Example 1 - Setting Custom Values for the DWC's CSS Custom Properties** We simply get the currently selected Property and Value from the r | - | drop | - | explains internals of CSSCustomProperties.bbj, which ships as a sample |
| 2C-15 | code (bbj) | `newValue!.addClass("fieldSet")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-16 | paragraph | **Example 1 - Setting Custom Values for the DWC's CSS Custom Properties** Going the Extra Mile 1) Try adding another property to the css! ob | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-17 | paragraph | **The DWC's App Themes** The DWC offers three different built-in app themes: light, dark, and dark-pure. It's pretty easy to change the them | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-18 | code (bbj) | `rem Get the WebManager to apply the themes` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-19 | paragraph | **The DWC's App Themes** The DWC_AppThemes folder in the class materials contains a few different examples that deal with the DWC Themes. Th | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-20 | code (bbj) | `web! = BBjAPI().getWebManager()` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-21 | paragraph | **The DWC's App Themes** When the client's OS is in light mode, the app will display using the DWC's light theme. If the user changes their | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-22 | paragraph | **Example 2 - Setting a DWC App to Dark Mode** 1) For this exercise, add one of the lines of code above to the CSSCustomProperties.bbj progr | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-23 | screenshot | `CSSCustomPropertiesDarkMode.png` | 36a5e734dfa54526eb871435c6325b6014aa3a31 | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#example-2---setting-a-dwc-app-to-dark-mode` | dark-mode result of Example 2; page has no figure |
| 2C-24 | paragraph | **Modifying a BBjControl's style properties** So far we've covered multiple ways of setting styles on a BBjControl, including directly in th | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-25 | code (bbj) | `rem Set the button's style via setStyle() and CSS` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-26 | paragraph | **Modifying a BBjControl's style properties** The code for myButton1! and myButton2! both attempt to set the foreground and background color | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#method-2-injectstyle-with-class` | explains why the injected class misses the button face and why setStyle works; page only warns "see below" |
| 2C-27 | screenshot | `setStyle_example.png` | 2b54cfd4641382298aa56e40c5e10a4eea261856 | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#modifying-a-bbjcontrols-style-properties` | shows four buttons, only the second left unstyled; illustrates the setStyle versus injectStyle result |
| 2C-28 | code (bbj) | `style! = DemoUtils.getFileContents(dsk("")+dir("")+"style.css")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-29 | paragraph | **Modifying a BBjControl's style properties** 2) Using the Java's Files and Paths classes: | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-30 | code (bbj) | `use java.nio.file.Files` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-31 | paragraph | **Modifying a BBjControl's style properties** 3) Using standard BBj open/readrecord/close syntax: | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-32 | code (bbj) | `chan = unt` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-33 | paragraph | **The Web Component Architecture and the Shadow DOM** Before digging into the CSS details of the shadow DOM, let's take a step back and take | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-34 | screenshot | `Button_DWC.png` | d23a910063bfe5dd286d391d6ee37b5717ecb03d | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#dwc-vs-bui` | real dwc-button outer HTML; page shows only a placeholder |
| 2C-35 | screenshot | `Button_BUI.png` | 376bfab77d214b17063eae4af29c781a64105e69 | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#dwc-vs-bui` | real BUI button outer HTML for the comparison; page shows only a placeholder |
| 2C-36 | screenshot | `BUIButton2Bordered.png` | b2ef80658f37edbef9ba2d2e29f14a01b5bbd96a | drop | - | redundant second BUI button markup, same point as the other BUI shot |
| 2C-37 | screenshot | `Button_DWC_ShadowDOM.png` | 63f2f2fac50b12a2aefeed41f753b42773196fda | drop | - | redundant with the annotated exposed-parts shot of the same shadow tree |
| 2C-38 | code (bbj) | `rem Set the button's style via the .setStyle method` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-39 | paragraph | **The Web Component Architecture and the Shadow DOM** But if we wanted to change the colors for ALL the dwc-button's instead of applying the | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-40 | code (bbj) | `web! = BBjAPI().getWebManager()` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-41 | paragraph | **The Web Component Architecture and the Shadow DOM** This sets the values for the CSS custom properties for the entire DOM, and therefore a | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-42 | code (bbj) | `myButton6!.addStyle("button-6")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-43 | paragraph | **The Web Component Architecture and the Shadow DOM** When defining the css! variable in the line of code above, we used the custom class na | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | explains the ::part pseudo-element and how to find exposed parts in Developer Tools; page has one sentence |
| 2C-44 | screenshot | `Button_DWC_exposedControls.png` | fe6cad2cd44fe0ef741815a53a2d7e947a0f0d0c | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | annotated shadow tree showing the part attributes control, prefix, label, suffix |
| 2C-45 | code (bbj) | `css! =        ".myButton4::part(control) {"` | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | ::part(label) variant missing from the page; bbj_check_syntax: pass |
| 2C-46 | paragraph | **The Web Component Architecture and the Shadow DOM** The code targets the "label" part of the dwc- button now instead of the "control" part | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | contrasts ::part(control) with ::part(label) |
| 2C-47 | screenshot | `Google Chrome - Setting a BBjButtons Styles- screenshot 2022-07-09 at 11.44.55.png` | 1f75ba0083e1eab27e79c9d2e68625ff4b8a899b | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | result of styling ::part(control) |
| 2C-48 | screenshot | `Google Chrome - Setting a BBjButtons Styles- screenshot 2022-07-09 at 11.46.11.png` | cecab38704296a65b090aaae06c20d3470ba199a | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#styling-shadow-dom-elements` | result of styling ::part(label), shows the different outcome |
| 2C-49 | code (bbj) | `rem Set the button's style via the shadow DOM parts` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-50 | paragraph | **The Web Component Architecture and the Shadow DOM** Notes: 1) Inheritable styles such as background, color, font, line height, etc. contin | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-51 | paragraph | **Font Size Compatibility** One area where the DWC differs from BUI is the default font size. When we compare the same app running in BUI an | - | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#font-size-compatibility` | points versus pixels explanation and the BUI versus DWC listbox comparison are missing |
| 2C-52 | screenshot | `Google Chrome - BUI UI Kit- screenshot 2022-07-10 at 06.17.32.png` | e9bee9093baa7de1fad10cecd4379ae1b0230bcb | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#font-size-compatibility` | BUI listbox showing three items at 160x55; baseline for the font comparison |
| 2C-53 | screenshot | `Google Chrome - DWC UI Kit- screenshot 2022-07-10 at 06.17.56.png` | e61718b184e1b7f285b942e4d8ce64fc11fd8cd7 | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#font-size-compatibility` | DWC listbox at the same size showing one item; shows the effect of the larger default font |
| 2C-54 | screenshot | `Google Chrome - BUI UI Kit- screenshot 2022-07-10 at 06.21.19.png` | 13b08fa543ad136167ad61a4487d5315d25dd78d | keep | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md#font-size-compatibility` | computed font-size of 10.6667px in BUI traced to basis.css |
| 2C-55 | screenshot | `Google Chrome - UIKit- screenshot 2022-07-10 at 06.22.34.png` | d9ee6f9bc11c87f01e0445d040276c98b3e7ed36 | drop | - | outdated: shows --bbj-font-size from bbj-ui.css, the page uses --dwc-font-size from dwc-ui.css |
| 2C-56 | code (bbj) | `temp$ = STBL("!COMPAT","LEGACY_FONTS=TRUE")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-57 | paragraph | **Font Size Compatibility** 2) Setting the font-size CSS property, as in: | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-58 | code (bbj) | `myWindow!.setStyle("font-size","8pt")` | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-59 | paragraph | **Example 3 - Font Sizes** 1) If you compare the app running in BUI (with the /apps/ context in the URL) versus it running in the DWC (with | - | covered | `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md` | - |
| 2C-60 | screenshot | `Google Chrome - Setting a BBjButtons Styles- screenshot 2022-07-11 at 06.25.27.png` | 768ced3344ea4a7b2770b255fd2ea519ae44ae40 | drop | - | tiny element-selector toolbar icon, no teaching content |
| 2C-61 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 06.26.23.png` | 2e59bf68603282000f1925e013ae65126e98d7f6 | drop | - | tiny element-selector toolbar icon from another browser, redundant |
| 2C-62 | screenshot | `Google Chrome - Setting a BBjButtons Styles- screenshot 2022-07-11 at 06.27.33.png` | cf1ac50a4c15fff9c1723122d0fa36c6147cc313 | drop | - | outdated: shows --bbj-font-size from bbj-ui.css, duplicate of another computed-style shot |

## 2D. DWC Themes

Unit: 2D. Module: page_64. DWC target: `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 2D-01 | paragraph | **Overview** This section covers adding a Light/Dark Mode toggle ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#overview` | - |
| 2D-02 | paragraph | **Concepts Covered in This Section** Adding a Light/Dark Mode Toggle to an App ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#concepts-covered-in-this-section` | - |
| 2D-03 | paragraph | **Light and Dark Themes** The previous section covered the DWC's App Themes ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#light-and-dark-themes` | - |
| 2D-04 | screenshot | `Google Chrome - BBj UI  Home- screenshot 2022-07-10 at 15.31.49.png` | 3d3563bafd96ec7d42e107fdc27024cc908cba7c | drop | - | tiny inline sun icon, no teaching value |
| 2D-05 | link | `https://basishub.github.io/basis-next/#/dwc/` | - | drop | - | superseded link: old DWC documentation host |
| 2D-06 | paragraph | **Example 1 - Adding a Light/Dark Mode Toggle** 1) Start by loading the CSSCustomProperties.bbj program ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-1-add-the-toggle-button` | - |
| 2D-07 | code (bbj) | `rem Add a toggle button for dark/light mode` | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-1-add-the-toggle-button` | - |
| 2D-08 | paragraph | **Example 1 - Adding a Light/Dark Mode Toggle** Note that we're making use of the DWC's icon pools ... 2) Then add the callback code | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-add-the-callback` | - |
| 2D-09 | code (bbj) | `onThemeToggle:` | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-add-the-callback` | - |
| 2D-10 | paragraph | **Example 1 - Adding a Light/Dark Mode Toggle** 3) Run the program and test the button ... | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-3-test` | - |
| 2D-11 | screenshot | `BBjButton-LightMode.png` | 7550a6df87ee2c9bb0defcf694f2f166a99694be | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-3-test` | DWC page describes the sun-icon Light button only in text; the picture shows the expected result |
| 2D-12 | screenshot | `BBjButton-DarkMode.png` | 55116bc4d0e3a05809921f6a613a74084b97cad7 | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-3-test` | DWC page describes the moon-icon Dark button only in text; the picture shows the expected result |
| 2D-13 | paragraph | **The DWC Themer** Running the TechCon 2022 UI Kit Demo ... After applying the saved CSS theme ... looks quite a bit different | - | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#the-dwc-themer` | before and after comparison of an app with a saved theme is missing; new heading "Applying a Theme to the DWC UI Kit" (new H3 under The DWC Themer) |
| 2D-14 | link | `https://us.bbx.kitchen/webapp/DWCThemer` | - | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#the-dwc-themer` | DWC page names the Themer but does not link it; successor host per P5 D-27 (provisional, review pending) |
| 2D-15 | screenshot | `DWCThemer-NoChanges.png` | e354c01df21c8d89c0e65c69e09357d05e3e935d | drop | - | shows the author's browser profile photo in the toolbar (personal data); the DWC page already describes the three Themer sections in text |
| 2D-16 | screenshot | `DWCThemer-NicksTheme.png` | f41a4fd2b1a054923a3c7a7a77510019f8eca9e7 | drop | - | shows the author's browser profile photo in the toolbar (personal data); the DWC page already describes the modified-property outline in text |
| 2D-17 | screenshot | `DwcUiKit-NoTheme.png` | a1d3171fb3fde2764d547c9cf5dbabfbb6936a45 | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#the-dwc-themer` | UI Kit with the default theme, left half of the before and after pair; goes under new heading "Applying a Theme to the DWC UI Kit" |
| 2D-18 | screenshot | `DwcUIKit-Themed-NicksTheme.png` | 39f1eb2c159c2521f9dcad9ea49b35dde0a73a5d | keep | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#the-dwc-themer` | UI Kit with the saved theme (new primary color, font, tighter spacing), right half of the pair; goes under new heading "Applying a Theme to the DWC UI Kit" |
| 2D-19 | paragraph | **Example 2 - Creating a Theme in the DWC Themer** 1) Start by launching the DWC Themer ... 2) Apply the theme by running DWCThemer.bbj | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#example-2---creating-a-theme-in-the-dwc-themer` | - |
| 2D-20 | link | `https://us.bbx.kitchen/webapp/DWCThemer` | - | drop | - | duplicate of the link kept in the Themer section |
| 2D-21 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC_AppThemes/css/MyDwcTheme.css` | - | drop | - | raw file link; the sample ships in the downloadable DWC samples and the page names its path |
| 2D-22 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj` | - | drop | - | raw file link; the sample ships in the downloadable DWC samples and the page names its path |
| 2D-23 | code (bbj) | `theme! = new String(Files.readAllBytes(Paths.get(fs!.resolvePath(...` | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-apply-the-theme` | - |
| 2D-24 | paragraph | **Example 2 - Creating a Theme in the DWC Themer** In other words, change the above line ... import the Java Paths and Files | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-apply-the-theme` | - |
| 2D-25 | code (bbj) | `use java.nio.file.Paths` | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-apply-the-theme` | - |
| 2D-26 | paragraph | **Example 2 - Creating a Theme in the DWC Themer** After this you just create your WebManager and then inject the Style | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-apply-the-theme` | - |
| 2D-27 | code (bbj) | `web! = BBjAPI().getWebManager()` | - | covered | `docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md#step-2-apply-the-theme` | - |

## 3A. Working with ARC Files

Unit: 3A. Module: page_66. DWC target: `docs/docs/dwc/04-upgrading-apps/01-arc-files.md`, `docs/docs/dwc/04-upgrading-apps/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 3A-01 | summary | Concepts Covered in This Chapter: 3A. Working with ARC Files; 3B. Upgrading BBjGrids | - | covered | `docs/docs/dwc/04-upgrading-apps/index.md#concepts-covered-in-this-chapter` | - |
| 3A-02 | paragraph | **Overview** This section covers working with ASCII Resource files (ARC or .arc files). | - | covered | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#overview` | - |
| 3A-03 | paragraph | **Concepts Covered in This Section** Modifying an existing .arc file to use a flow layout in the DWC | - | covered | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#concepts-covered-in-this-section` | - |
| 3A-04 | paragraph | **Changing a Window in an .arc File to Use Flexible CSS-based Layout** We have seen that the window creation flag... | - | covered | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#changing-a-window-in-an-arc-file-to-use-flexible-css-based-layout` | - |
| 3A-05 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/resprops/resource_property_gravity.htm` | - | keep | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#changing-a-window-in-an-arc-file-to-use-flexible-css-based-layout` | live BASIS Online Help page for the GRAVITY resource property; the DWC page names GRAVITY without a link |
| 3A-06 | screenshot | `image.png` | 11ed275d820573cd6d124f0b124c3559677f6c08 | covered | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#example` | same image by hash: docs/docs/dwc/04-upgrading-apps/img/arc-image-1.png |
| 3A-07 | screenshot | `image (1).png` | d7625536340b02a943f2b1ad2bf75149e7360d0c | covered | `docs/docs/dwc/04-upgrading-apps/01-arc-files.md#example` | same image by hash: docs/docs/dwc/04-upgrading-apps/img/arc-image-2.png |
| 3A-08 | link | `https://github.com/BasisHub/DWCTraining/tree/main/03B_ArcFiles` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |

## 3B. Upgrading BBjGrids: Overview

Unit: 3B1. Module: book_67, chapter 36. DWC target: `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 3B1-01 | paragraph | The DWC does not offer a direct 1:1 API compatible implementation of the BBjStandardGrid and its siblings... | - | covered | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#overview` | - |
| 3B1-02 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbutil/BBjGridExWidget/BBjGridExWidget.htm` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#bbjgridexwidget-plug-in` | live BASIS Online Help intro page; the DWC page mentions an overview document without a link |
| 3B1-03 | link | `https://github.com/BBj-Plugins/BBjGridExWidget` | - | covered | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#resources` | - |
| 3B1-04 | paragraph | **Differences between the BBjStandardGrid and BBjGridExWidget** While the BBjStandardGrid is typically filled cell-by-cell... | - | covered | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#differences-between-bbjstandardgrid-and-bbjgridexwidget` | - |
| 3B1-05 | link | `https://docs.oracle.com/javase/8/docs/api/java/sql/Types.html` | - | drop | - | Java 8 API page for SQL types; the DWC page already lists the supported types |
| 3B1-06 | link | `https://github.com/BBj-Plugins/BBjGridExWidget` | - | covered | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#differences-between-bbjstandardgrid-and-bbjgridexwidget` | - |
| 3B1-07 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbutil/BBjGridExWidget/BBjGridExWidget.htm` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#differences-between-bbjstandardgrid-and-bbjgridexwidget` | same intro page as 3B1-02, linked from the closing "overview document" sentence |

## 3B. Upgrading BBjGrids: Installation of the BBjGridExWidget Plug-In

Unit: 3B2. Module: book_67, chapter 37. DWC target: `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 3B2-01 | paragraph | Use the Plug-In Manager to install the BBjGridExWidget on your system. You can find the plug-in manager in the start menu... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#install-the-plug-in` | install steps are missing from the DWC page; new heading "Install the Plug-In" before Migration Steps |
| 3B2-02 | link | `https://bbj-plugins.com/en/get-started` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#install-the-plug-in` | official BBj-Plugins getting started document for the Plug-In Manager, belongs to the install steps |
| 3B2-03 | paragraph | **Inspect the Demos** The BBjGridExWidget comes with demo programs that can be started from the plug-in manager... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#install-the-plug-in` | demos are the main learning source beyond the course; no mention on the DWC page; goes under the new "Install the Plug-In" heading |
| 3B2-04 | paragraph | **Review the JavaDoc** The BBjGridExWidget API is documented in JavaDoc format... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#install-the-plug-in` | API reference pointer is missing from the DWC page; goes under the new "Install the Plug-In" heading |
| 3B2-05 | link | `https://bbj-plugins.github.io/BBjGridExWidget/javadoc/` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#install-the-plug-in` | official BBj-Plugins JavaDoc site, linked from the JavaDoc paragraph |

## 3B. Upgrading BBjGrids: Working with ResultSet and DataRow

Unit: 3B3. Module: book_67, chapter 38. DWC target: `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 3B3-01 | paragraph | The central classes for data handling (not only) for BBjGridExWidget are implemented in the basiscomponents library... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | DataRow and ResultSet are not explained on the DWC page; new heading "Working with ResultSet and DataRow" before Migration Steps |
| 3B3-02 | link | `https://basishub.github.io/components/javadoc/overview-tree.html` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS basiscomponents JavaDoc, linked from the intro paragraph |
| 3B3-03 | link | `https://basishub.github.io/components/javadoc/com/basiscomponents/db/DataRow.html` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS JavaDoc for DataRow, linked from the intro paragraph |
| 3B3-04 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/API/bbjtemplatedstring/bbjtemplatedstring.htm` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | live BASIS Online Help page for BBjTemplatedString, the comparison the intro paragraph draws |
| 3B3-05 | link | `https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS JavaDoc for ResultSet, linked from the intro paragraph |
| 3B3-06 | paragraph | **Creating a new DataRow from Code** The following code snippet creates a DataRow and sets two string fields and one field... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | introduces the DataRow sample; goes under the new heading |
| 3B3-07 | code (bbj) | `use com.basiscomponents.db.DataRow` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | DataRow sample, not on the DWC page; the second getFieldAsString("LAST_NAME") should read FIRST_NAME, to be fixed in 06-09; bbj_check_syntax: fixed (second getFieldAsString("LAST_NAME") changed to getFieldAsString("FIRST_NAME") (output printed the last name twice); original parses) |
| 3B3-08 | paragraph | **Creating a new DataRow from Code** The DataRow gets instantiated with the new keyword, like most any other Java class... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | explains the sample above; setFieldValue and dynamic fields without DIM |
| 3B3-09 | paragraph | **Upgrading existing code using BBx Templated Strings** The DataRow class brings a factory method fromTemplate... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | core upgrade path from existing string templates; missing from the DWC page |
| 3B3-10 | link | `http://basishub.github.io/components/javadoc/com/basiscomponents/db/DataRow.html#fromTemplate(java.lang.String,java.lang.String)` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS JavaDoc for fromTemplate; use https when adapting |
| 3B3-11 | code (bbj) | `use com.basiscomponents.db.DataRow` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | fromTemplate sample; same LAST_NAME slip as 3B3-07 to be fixed in 06-09; bbj_check_syntax: fixed (second getFieldAsString("LAST_NAME") changed to getFieldAsString("FIRST_NAME") (output printed the last name twice); original parses) |
| 3B3-12 | paragraph | **Combining DataRows to a ResultSet** To load a grid with data, you need to combine the single records into a ResultSet... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | explains how to build the ResultSet the grid needs; missing from the DWC page |
| 3B3-13 | link | `https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS JavaDoc for ResultSet, same as 3B3-05 |
| 3B3-14 | link | `https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html#add(com.basiscomponents.db.DataRow)` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BASIS JavaDoc for ResultSet.add |
| 3B3-15 | code (bbj) | `use com.basiscomponents.db.DataRow` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | ResultSet sample with three rows; feeds the grid sample in 3B4; bbj_check_syntax: pass |
| 3B3-16 | paragraph | **Combining DataRows to a ResultSet** The resulting rs! variable can be given to the BBjGridExWidget to load it with data. | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | bridges to the grid; the DWCTraining source link is dropped in 3B3-17 |
| 3B3-17 | link | `https://github.com/BasisHub/DWCTraining/tree/main/3C_Grid2GridEx/DataRow_and_ResultSet` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |
| 3B3-18 | paragraph | **Loading a ResultSet from SQL** If you work with data coming from SQL, you can create a ResultSet directly by using SqlQueryBC. | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | SQL path to a ResultSet, the typical upgrade case; missing from the DWC page |
| 3B3-19 | code (bbj) | `use com.basiscomponents.db.ResultSet` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | SqlQueryBC retrieve sample over the CDStore connection; bbj_check_syntax: pass |
| 3B3-20 | paragraph | **Loading a ResultSet from SQL** The CDStore Sample of the BBjGridExWidget uses this method to retrieve the data... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | points to a working plug-in demo for the same method |
| 3B3-21 | link | `https://github.com/BBj-Plugins/BBjGridExWidget/blob/master/demo/CD-Store.bbj` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#working-with-resultset-and-datarow` | official BBj-Plugins repository, linked from the CDStore sentence |

## 3B. Upgrading BBjGrids: Setting up a Simple BBjGridExWidget for DWC

Unit: 3B4. Module: book_67, chapter 39. DWC target: `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 3B4-01 | paragraph | The ResultSet we have created in the section can now be loaded into a BBjGridExWidget, using the setData method... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#set-up-a-simple-bbjgridexwidget` | the DWC page has no working grid example; new heading "Set Up a Simple BBjGridExWidget" after the ResultSet heading |
| 3B4-02 | code (bbj) | `use ::BBjGridExWidget/BBjGridExWidget.bbj::BBjGridExWidget` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#set-up-a-simple-bbjgridexwidget` | complete grid sample with child window, ResultSet and setData; the only runnable BBjGridExWidget code in the chapter; bbj_check_syntax: pass |
| 3B4-03 | paragraph | Run this program in DWC and you will see a grid that takes the full browser canvas to display a BBjGridExWidget. | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#set-up-a-simple-bbjgridexwidget` | expected result of the sample; the DWCTraining source link is dropped in 3B4-04 |
| 3B4-04 | link | `https://github.com/BasisHub/DWCTraining/tree/main/3C_Grid2GridEx` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |
| 3B4-05 | paragraph | **Styling and Configuring the Grid** Now that we have the basic functionality of loading data into a grid working... | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#set-up-a-simple-bbjgridexwidget` | points to the plug-in demos for styling and configuration; not covered on the DWC page |
| 3B4-06 | link | `https://github.com/BBj-Plugins/BBjGridExWidget/tree/master/demo` | - | keep | `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md#set-up-a-simple-bbjgridexwidget` | official BBj-Plugins demo folder, linked from the demos sentence |

## 4A. DWC Controls With Extended Attributes

Unit: 4A. Module: page_69. DWC target: `docs/docs/dwc/05-dwc-controls/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 4A-01 | paragraph | **Overview** This section covers BBj controls implemented as web components for the Dynamic Web Client. | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#overview` | - |
| 4A-02 | link | `https://basishub.github.io/basis-next/docs/#/dwc/guide/attributes` | - | drop | - | Old basis-next documentation link; the page names the DWC-specific documentation without it. |
| 4A-03 | paragraph | **Concepts Covered in This Section** Component themes for controls, Attributes, The BBjTree's built-in search | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#concepts-covered-in-this-chapter` | - |
| 4A-04 | paragraph | **Component Themes** Many controls offer a "theme" attribute that can be set to one of the DWC's component themes | - | keep | `docs/docs/dwc/05-dwc-controls/index.md#color-properties` | The theme table and the three color properties are covered; missing and still correct: how the DWC Themer only rewrites the `--dwc-color-primary-h` and `-s` values, and the pointer to the `theme` attribute in the MessageBox and DWC1 samples (new heading "Setting the Theme Attribute"). |
| 4A-05 | screenshot | `Microsoft Edge - BBj DWC Themer- screenshot 2022-07-11 at 16.22.00.png` | 3f22531690492bf396e3e3aeb635139031a25163 | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/dwc-themer.png |
| 4A-06 | screenshot | `ColorCss.png` | 8bfcb38d8440a1d5f7f13708a738fa439bd4c94c | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/color-css.png |
| 4A-07 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/MessageBox.bbj` | - | drop | - | Raw GitHub link to a sample from chapter 1; the sample is covered in the 01 chapter. |
| 4A-08 | screenshot | `Microsoft Edge - MessageBox- screenshot 2022-07-11 at 15.22.07.png` (parked `message-box.png`) | 37eade8d4ae806270d35b7ae9f6e824283d00955 | keep | `docs/docs/dwc/05-dwc-controls/index.md#setting-the-theme-attribute` | Shows a message box with theme "primary", the example for the kept theme text; new heading "Setting the Theme Attribute"; no personal data. |
| 4A-09 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | Raw GitHub link to a sample from chapter 1; the sample is covered in the 01 chapter. |
| 4A-10 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 15.23.51.png` (parked `hello-dwc-4a.png`) | 7bcb6d081c6d1d1fe36b74e213c54200b2791713 | keep | `docs/docs/dwc/05-dwc-controls/index.md#setting-the-theme-attribute` | Shows the Say Hello button with theme "success" and an expanse, the second example for the kept theme text; no personal data. |
| 4A-11 | paragraph | **Attributes** Many of the DWC controls offer attributes that provide extra functionality. | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#attributes` | - |
| 4A-12 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | Duplicate of 4A-09. |
| 4A-13 | link | `https://basishub.github.io/basis-next/docs/#/dwc/BBjTree` | - | drop | - | Old basis-next documentation link; the attribute table already lists the five search attributes. |
| 4A-14 | paragraph | **Example 1 - Setting attributes on the BBjTree** 1) Start by running the DWCTraining/04_ExtendedAttributes/TreeSearch.bbj program. | - | keep | `docs/docs/dwc/05-dwc-controls/index.md#example-1---setting-attributes-on-bbjtree` | Steps 1 to 3 are covered; missing and still correct: step 4, reading the source for `search-input`, `icon-collapsed`, `icon-expanded` and the per-tree `--dwc-tree-icon-fill` custom property. |
| 4A-15 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/04_ExtendedAttributes/TreeSearch.bbj` | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#example-1---setting-attributes-on-bbjtree` | - |
| 4A-16 | screenshot | `Microsoft Edge - BBj Tree Search- screenshot 2022-07-11 at 16.15.12.png` | a291d932b05a49dfb8c6626deffea545cd7fbd2a | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/tree-search.png |
| 4A-17 | paragraph | **Input Control Labels** In addition to the attributes previously covered, BBJ controls that deal with input also offer a "label" attribute | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#input-control-labels` | - |
| 4A-18 | paragraph | **Example 2 - Comparing attribute labels and BBjStaticText controls** 1) Start by running LabelAttributes.bbj. | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#example-2---comparing-label-types` | - |
| 4A-19 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/04_ExtendedAttributes/LabelAttributes.bbj` | - | covered | `docs/docs/dwc/05-dwc-controls/index.md#example-2---comparing-label-types` | - |
| 4A-20 | screenshot | `EditBox_withLabelAttribute.png` | 7da8fc79ad1c06b2a5813d9bb707ae688c6e3c28 | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/edit-box-with-label.png |
| 4A-21 | screenshot | `EditBox_withoutLabelAttributes.png` | 7ec386bed9d832f13bcdb803a7ed856c188ded8f | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/edit-box-without-label.png |
| 4A-22 | screenshot | `Microsoft Edge - Using Label Attributes- screenshot 2022-07-12 at 16.49.04.png` | 0dbb11708239c156575140cc60bfdf3a744f9f9f | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/label-attributes.png |
| 4A-23 | screenshot | `Microsoft Edge - Using Discrete Labels- screenshot 2022-07-12 at 16.50.35.png` | c00e1f8d65e615474a7f347149b5b3ddbb7de4fe | covered | `docs/docs/dwc/05-dwc-controls/index.md` | same image by hash: docs/docs/dwc/05-dwc-controls/img/discrete-labels.png |

## 5A. CSS Layout Options

Unit: 5A. Module: page_71. DWC target: `docs/docs/dwc/06-flow-layouts/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 5A-01 | paragraph | **Overview** This section covers the different CSS layout strategies for a responsive BBj app in the DWC. | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#overview` | - |
| 5A-02 | paragraph | **Concepts Covered in This Section** CSS layout options, CSS flexbox, CSS grid | - | drop | - | Moodle section intro list; the page opens with the same topics in its headings. |
| 5A-03 | paragraph | **CSS Layout Options** There are different ways to achieve responsive, multi-column layouts using CSS | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#media-queries` | Flexbox and grid summaries are covered; missing and still correct: media queries as if/then with and/or/not, orientation, hiding elements, font size, accessibility. |
| 5A-04 | screenshot | `CSSFlexbox.png` | fb57dc34303e31d0630fd888ad125f0dbbf6a655 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-flexbox.png |
| 5A-05 | screenshot | `CSSGrid.png` | cac7b5e90b1d438b0bb8e050310448f55cbb49f8 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-grid.png |
| 5A-06 | paragraph | **CSS Flexbox** CSS flexbox is typically used when you want to lay out controls in one direction or another (row or column). | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#css-flexbox-properties` | - |
| 5A-07 | paragraph | **Example 1 - Experimenting With CSS Flexbox** 1) Start by running the DWCTraining/05_CssLayouts/DWCFlexbox.bbj program | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#example-1---css-flexbox` | - |
| 5A-08 | link | `https://github.com/BasisHub/DWCTraining/blob/main/05_CssLayouts/DWCFlexbox.BBj24.bbj` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#example-1---css-flexbox` | - |
| 5A-09 | screenshot | `DWC_Flexbox_Demo.png` | 8550faa637c06efd7a7b2aebc9313b2434be2593 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/dwc-flexbox-demo.png |
| 5A-10 | screenshot | `Layout_Information.png` | 8a2843325d39e17d71d2f038819efdd544321d5e | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/layout-information.png |
| 5A-11 | paragraph | **CSS Grid** As covered earlier, CSS Flexbox and Grid may both be used for a number of scenarios | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#css-grid` | Missing and still correct: guidance on when flexbox or grid fits better, and that the grid has far more properties than flexbox. |
| 5A-12 | link | `https://css-tricks.com/snippets/css/complete-guide-grid` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#resources` | - |
| 5A-13 | paragraph | **Placing Controls In a CSS Grid** There are a couple of distinct ways to use the CSS grid: | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | Method 1 is covered in brief; missing: reading the named areas example step by step and Method 2, row and column templates that place controls automatically. |
| 5A-14 | link | `https://www.cssgridplayground.com` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#resources` | - |
| 5A-15 | screenshot | `Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.34.55.png` | d019b9dae938a53654a4e544a25e8ed2fa6e48fc | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-grid-playground-1.png |
| 5A-16 | link | `https://css-tricks.com/introduction-fr-css-unit/` | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#fractional-units-fr` | The page explains fr units but does not link the in-depth article. |
| 5A-17 | screenshot | `Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.36.14.png` (parked `css-grid-playground-2.png`) | 85ee968b585a089ce2124ed2a847df071d18b521 | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | Shows the named-area grid after changing the bottom row to "sidebar footer aside"; the page lacks this step; no personal data. |
| 5A-18 | link | `https://css-tricks.com/introduction-fr-css-unit/` | - | drop | - | Duplicate of 5A-16. |
| 5A-19 | screenshot | `Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.50.26.png` (parked `css-grid-playground-3.png`) | c73eee12e40dfd81236e0183444fc2618e20a2d3 | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | Shows grid-template-columns "25% 1fr" and rows "1fr 2fr 2fr 1fr" for Method 2; the page lacks this step; no personal data. |
| 5A-20 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC1.bbj` | - | drop | - | Raw GitHub link to a chapter 1 sample, which that chapter covers. |
| 5A-21 | code (bbj) | `wnd!.setPanelStyle("display","inline-grid")` | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | The 180px auto template of the DWC1 window ties Method 2 to a BBj call; the page has no setPanelStyle code.; bbj_check_syntax: pass |
| 5A-22 | paragraph | **Placing Controls In a CSS Grid** That set the window to use an inline-grid, then defined the grid's template columns to be "180px auto". | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | Explains how controls fill a two-column template row by row; missing on the page. |
| 5A-23 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-17 at 13.58.07.png` (parked `hello-bbj-dwc-grid.png`) | 2ce434e1dbf35127fa1c190452eb3a9a50529f9b | keep | `docs/docs/dwc/06-flow-layouts/index.md#placing-controls` | Developer Tools grid overlay showing the 180px and auto columns of the Hello window; no personal data. |
| 5A-24 | paragraph | **More Template Options** repeat() represents a repeated fragment of the track list; auto-fit, auto-fill and minmax() | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#responsive-grids-with-repeat` | The page has the code line and one sentence; missing: repeat(2, auto 1fr) equals auto 1fr auto 1fr, auto-fit versus auto-fill, minmax(). |
| 5A-25 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/repeat` | - | drop | - | Reference link only; the kept paragraph explains repeat(). |
| 5A-26 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/minmax` | - | drop | - | Reference link only; the kept paragraph explains minmax(). |
| 5A-27 | code (text) | `display: grid;` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#responsive-grids-with-repeat` | - |
| 5A-28 | paragraph | **More Template Options** The first line simply set's the window's layout to use the CSS grid. | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#responsive-grids-with-repeat` | Line-by-line breakdown of the repeat/minmax template (no rows defined, 10ch and 20ch minimums, 1fr and 2fr); missing on the page. |
| 5A-29 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.30.19.png` | 5d7baa17d23a840bef25d3eb1d3ecd7596ac9a03 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-layout-samples-1.png |
| 5A-30 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.31.17.png` | 0c3b458892c42c949440aa052e52e942242de51d | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-layout-samples-2.png |
| 5A-31 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.31.50.png` | 67f8792c60f87d523daf53f340f49f6e7ec1d243 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-layout-samples-3.png |
| 5A-32 | paragraph | **Example 2 - Experimenting With Various CSS Grid Layouts** 1) Start by running the DWCTraining/05_CssLayouts/DWCGrid.bbj program | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#example-2---css-grid-layouts` | The page lists layouts 1 to 9 in brief; missing: auto versus fr behaviour in layouts 1 and 2, and testing layout 8 in the Developer Tools Responsive mode. |
| 5A-33 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/05_CssLayouts/DWCGrid.bbj` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#example-2---css-grid-layouts` | - |
| 5A-34 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.49.56.png` | f9a42ee80d5ecaeca639e8606a47c201000ee766 | covered | `docs/docs/dwc/06-flow-layouts/index.md` | same image by hash: docs/docs/dwc/06-flow-layouts/img/css-layout-samples-4.png |
| 5A-35 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 17.37.11.png` (parked `css-layout-samples-5.png`) | e614abadb5e7076d332737b38cdaaa8a9e2116da | drop | - | 40 by 38 pixel inline icon of the Device Emulation toolbar button; the kept text names the tab, so the icon adds nothing; no personal data. |
| 5A-36 | screenshot | `Google Chrome - 24625 ... screenshot 2022-07-17 at 17.38.06.png` (parked `responsive-demo.png`) | 8ce7ce0f603155016569caf3bf409c5f69716ff7 | drop | - | 32 by 34 pixel icon of the same button in Chrome, redundant with 5A-35; the file holds only the icon, no tab title. |
| 5A-37 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 17.42.33.png` (parked `css-layout-samples-6.png`) | 6bd7358062ff172fce4ae8c9aa11701185fa3ed2 | keep | `docs/docs/dwc/06-flow-layouts/index.md#example-2---css-grid-layouts` | Layout 8 in Responsive mode with drag handles and the 900 pixel width box; illustrates the kept testing steps; no personal data. |
| 5A-38 | code (css) | `@media (min-width: 600px) {` | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#example-2---css-grid-layouts` | The page shows only the 600px rule; the 900px rule with six columns completes the layout 8 example. |
| 5A-39 | paragraph | **Example 2 - Experimenting With Various CSS Grid Layouts** The original grid definition defines two columns, followed by the CSS above. | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#example-2---css-grid-layouts` | Explains why the later media query overrides the window's two-column grid; missing on the page. |
| 5A-40 | paragraph | **Justification and Alignment** One of the potentially tricky spots with CSS is that it allows developers to define the justification | - | keep | `docs/docs/dwc/06-flow-layouts/index.md#justification-and-alignment` | The table lists the six properties; missing: justify-content has no effect when the grid fills its container, justify-self applies to nested grids. |
| 5A-41 | paragraph | **Fractional Units** CSS Grids support a number of ways to define their track size | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#fractional-units-fr` | - |
| 5A-42 | code (text) | `grid-template-columns: 25% 75%;` | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#fractional-units-fr` | - |
| 5A-43 | paragraph | **Fractional Units** After all, they're both setting the first column to a third of the size of the second column, right? | - | covered | `docs/docs/dwc/06-flow-layouts/index.md#fractional-units-fr` | - |
| 5A-44 | link | `https://css-tricks.com/introduction-fr-css-unit/` | - | drop | - | Duplicate of 5A-16. |

## 6A. Icon Pools

Unit: 6A. Module: page_74. DWC target: `docs/docs/dwc/07-icon-pools/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 6A-01 | paragraph | **Overview** This section covers the DWC's Icon Pools, which simplifies the task of adding Scalable Vector Graphics (SVG) icons to any co... | - | covered | `docs/docs/dwc/07-icon-pools/index.md#overview` | - |
| 6A-02 | link | `https://basishub.github.io/basis-next/docs/#/dwc/dwc-icon?id=dwc-icon` | - | drop | - | outdated basis-next docs link, superseded by the DWC chapter |
| 6A-03 | link | `https://developer.mozilla.org/en-US/docs/Web/SVG` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#scalable-vector-graphics` | MDN SVG reference for the new heading "Scalable Vector Graphics" |
| 6A-04 | paragraph | **Concepts Covered in This Section** Scalable vector graphics The DWC's three icon pools Adding icons to buttons Custom icon pools | - | drop | - | Moodle concept list, navigation only |
| 6A-05 | paragraph | **Scalable Vector Graphics** The SVG format is an XML-based markup language that describes two-dimensional vector graphics. One of their ... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#scalable-vector-graphics` | SVG scaling, CSS sizing and fill colors are missing on the page; new heading "Scalable Vector Graphics" |
| 6A-06 | link | `https://poweredbybbj.com/files/images/ScrewHead.svg` | - | drop | - | link to an external demo image on a third-party site, adds nothing the paragraph lacks |
| 6A-07 | screenshot | `Google Chrome - httpspoweredbybbj.comfilesimagesScrewHead.svg- screenshot 2022-07-11 at 18.19.05.png` | 5d73e40dcb253d2d3aa33f8c6b1955841058536c | drop | - | screenshot of a single external SVG in a browser tab, redundant with the paragraph; 2022 browser chrome |
| 6A-08 | paragraph | **The DWC's three icon pools** While it's possible to add the SVG source for an icon to a BBj control's title, it's much easier to access... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#available-icon-pools` | page lists only Tabler and Font Awesome; Feather, the bbj pool, the fa naming convention and why to use a pool are missing; leave out the 2022 icon counts |
| 6A-09 | link | `https://tabler-icons.io/` | - | covered | `docs/docs/dwc/07-icon-pools/index.md` | - |
| 6A-10 | link | `https://feathericons.com/` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#available-icon-pools` | Feather link for the pool list |
| 6A-11 | link | `https://fontawesome.com/icons` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#available-icon-pools` | Font Awesome link for the pool list |
| 6A-12 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/01_GUI2BUI2DWC/DWC2.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 6A-13 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.26.43.png` | 0b43585e49cb684a14ca78e4ab9636a8ad4eeef8 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-1.png |
| 6A-14 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.28.33.png` | 873fc56a693e39a0abf6d35f503fab14aa5d1882 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-2.png |
| 6A-15 | screenshot | `Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.29.12.png` | 73dbd77682e22ec2bf75950ac293f2741159a1c9 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-3.png |
| 6A-16 | paragraph | **Example 1 - Adding a download icon to a button** 1) To add a "download" icon to a button, we will first want to find a suitable icon. W... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | how to look up the same icon name in each pool; page has no pool-by-pool example |
| 6A-17 | link | `https://feathericons.com/?query=download` | - | drop | - | search URL with a transient query, replaced by the pool links kept in 6A-10 and 6A-11 |
| 6A-18 | link | `https://tabler-icons.io/` | - | covered | `docs/docs/dwc/07-icon-pools/index.md` | - |
| 6A-19 | link | `https://fontawesome.com/v5/search?q=download&m=free` | - | drop | - | search URL on a Font Awesome v5 path, outdated |
| 6A-20 | code (bbj) | `rem Define the HTML title for the buttons that incorporate the download icons` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | shows pool feather, tabler and fa with the fas- prefix; page shows only the default pool; bbj_check_syntax: pass |
| 6A-21 | code (bbj) | `rem Now create the buttons using the HTML for the title` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | creates the buttons that use the icon titles from 6A-20; bbj_check_syntax: pass |
| 6A-22 | paragraph | **Example 1 - Adding a download icon to a button** That results in the following buttons added to the window: 3) So far, so good. But wha... | - | drop | - | narration of the screenshot in 6A-23 only |
| 6A-23 | screenshot | `Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 15.55.25.png` | 2600307395fab30fdff48d3b84dd4c41ae2b1c1e | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-4.png |
| 6A-24 | code (bbj) | `rem Define the HTML title for the alternate buttons that incorporate the cloud download icons with extra styling for siz` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | sizing and coloring icons with expanse, theme and inline style; missing on the page; bbj_check_syntax: pass |
| 6A-25 | code (bbj) | `rem Now create the buttons using the HTML for the title` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | creates the buttons that use the icon titles from 6A-24; bbj_check_syntax: pass |
| 6A-26 | paragraph | **Example 1 - Adding a download icon to a button** That results in the following buttons: Notice that we could set the icon's color eithe... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#example---adding-icons-to-buttons` | explains theme versus inline style color; drop the load-and-run sentence (exercise text moves to the exercise page, D-01) |
| 6A-27 | screenshot | `Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 15.58.16.png` | 312569a02c887ef3986550390613b159574e5d23 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-5.png |
| 6A-28 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/06_IconPools/DownloadButton.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 6A-29 | paragraph | **Custom Icon Pools** The icon pools are nice, but what if we have our own preferred set of icons that we want to use instead? And what i... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | custom icon pools from a CDN or a local Jetty directory are missing; new heading "Custom Icon Pools" |
| 6A-30 | paragraph | **Example 2 - Adding icons from a custom icon pool that's hosted by a CDN** 1) In this example, we want to reference a different icon lib... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | walk-through for picking an open source library and its CDN; use one consistent ionicons version in the text |
| 6A-31 | link | `https://ionic.io/ionicons` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | Ionic Ionicons library link |
| 6A-32 | link | `https://cdnjs.com/` | - | drop | - | general cdnjs home page, the library link in the example text is enough |
| 6A-33 | link | `https://cdnjs.com/libraries/ionicons` | - | drop | - | version-specific cdnjs page that conflicts with the version in the code (6.0.2 versus 7.4.0) |
| 6A-34 | code (bbj) | `rem Add a custom icon pool referencing the ionicons library from a CDN` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | pool registration with injectScript and a resolver; Moodle fence tagged javascript but the code is BBj; bbj_check_syntax: pass |
| 6A-35 | paragraph | **Example 2 - Adding icons from a custom icon pool that's hosted by a CDN** Ultimately, we're injecting some JavaScript that adds another... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | explains the resolver name placeholder and the .svg suffix choice |
| 6A-36 | code (bbj) | `rem Define the HTML title for the buttons that incorporate the bootstrap icons` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | HTML titles that use the custom pool name; bbj_check_syntax: pass |
| 6A-37 | code (bbj) | `rem Now create the buttons using the HTML for the title` | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | creates the buttons that use the custom pool; bbj_check_syntax: pass |
| 6A-38 | paragraph | **Example 2 - Adding icons from a custom icon pool that's hosted by a CDN** Running our program results in the two buttons with custom ic... | - | keep | `docs/docs/dwc/07-icon-pools/index.md#custom-icon-pools` | local Jetty directory and PNG resolver variant; drop the load-and-run sentence (exercise text moves to the exercise page, D-01) |
| 6A-39 | screenshot | `Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 16.38.04.png` | f575c3547b6594715f6a02464fc1b16b58818f69 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-6.png |
| 6A-40 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/06_IconPools/DownloadButton.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 6A-41 | screenshot | `Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 16.46.25.png` | b44abe49b789518eee7f90cde56ba92fa4e57cd3 | covered | `docs/docs/dwc/07-icon-pools/index.md` | same image by hash: docs/docs/dwc/07-icon-pools/img/icon-pools-7.png |

## 7A. Control Validation

Unit: 7A. Module: page_76. DWC target: `docs/docs/dwc/08-control-validation/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 7A-01 | paragraph | **Overview** This section covers the DWC's validation, which covers the ways that we ensure that the user has entered valid data into an ... | - | covered | `docs/docs/dwc/08-control-validation/index.md#overview` | - |
| 7A-02 | link | `https://basishub.github.io/basis-next/docs/#/dwc/guide/form-validation?id=form-validation` | - | drop | - | outdated basis-next docs link, superseded by the DWC chapter |
| 7A-03 | paragraph | **Concepts Covered in This Section** Form validation Client-side validation Built-in validation JavaScript validation Validation customiz... | - | drop | - | Moodle concept list, navigation only |
| 7A-04 | paragraph | **Form Validation** Form validation is the process of ensuring that the information filled in by the end-user is valid to avoid sending i... | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | server-side form validation with ON_FORM_VALIDATION and accept() is missing on the page; new heading "Form Validation"; leave out the 2012 article and the BUI product page claim |
| 7A-05 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjFormValidationEvent/bbjformvalidationevent.htm?Highlight=BBjFormV` | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | BBjFormValidationEvent reference link |
| 7A-06 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjFormValidationEvent/bbjformvalidationevent_accept.htm` | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | accept method reference link |
| 7A-07 | link | `https://www.basis.cloud/download-product` | - | drop | - | link to the product download page, tangential |
| 7A-08 | link | `https://documentation.basis.cloud/advantage/v16-2012/12webapp.pdf` | - | drop | - | 2012 Advantage article, outdated |
| 7A-09 | paragraph | **Example 1 - Form Validation** 1) Start by running the DWCTraining/07_ControlValiation/formValidation.bbj program. 2) Click the [Submit]... | - | drop | - | run-this-sample steps, exercise-style text (D-01) |
| 7A-10 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/07_ControlValiation/formValidation.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 7A-11 | code (bbj) | `btnSubmit!.setCallback(BBjButton.ON_FORM_VALIDATION, "OnFormValidation")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | registers the form validation callback on the submit button; bbj_check_syntax: pass |
| 7A-12 | paragraph | **Example 1 - Form Validation** The callback for the form validation is listed below, and it starts by getting the contents of the first ... | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | explains getting all control values from the event without round trips |
| 7A-13 | code (bbj) | `OnFormValidation:` | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | full OnFormValidation callback with accept(1) and accept(0); bbj_check_syntax: pass |
| 7A-14 | paragraph | **Example 1 - Form Validation** After the code gets the first and last names, it checks the result of ANDing the length of each. If eithe... | - | keep | `docs/docs/dwc/08-control-validation/index.md#form-validation` | explains the accept(0) path and why trim() belongs in real validation |
| 7A-15 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjFormValidationEvent/bbjformvalidationevent_accept.htm` | - | drop | - | duplicate of the accept link in 7A-06 |
| 7A-16 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 19.40.44.png` | 3f6abc1c62b60f23a283d7558fcf45554a49e2d8 | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-1.png |
| 7A-17 | paragraph | **Client-side Validation** One of the benefits of adding in client-side validation is that the user gets real-time feedback about potenti... | - | keep | `docs/docs/dwc/08-control-validation/index.md#client-side-validation` | why client-side validation, built-in versus JavaScript, and why the server still validates; new heading "Client-Side Validation"; drop the Bug 24625 history |
| 7A-18 | link | `https://bugzilla.basis.cloud/show_bug.cgi?id=24625` | - | drop | - | internal bug tracker link from 2012, history only |
| 7A-19 | paragraph | **Built-In Validation** The DWC's validation documentation lists the types of built-in validation that are available for particular BBj c... | - | covered | `docs/docs/dwc/08-control-validation/index.md#validation-attributes` | - |
| 7A-20 | link | `https://basishub.github.io/basis-next/docs/#/dwc/guide/form-validation?id=form-validation` | - | drop | - | outdated basis-next docs link, superseded by the DWC chapter |
| 7A-21 | paragraph | **BBjEditBox** Attribute Description required The control needs to be filled in before the form can be submitted minlength, maxlength Spe... | - | covered | `docs/docs/dwc/08-control-validation/index.md#validation-attributes` | page table has required, pattern, min, max, minlength, maxlength; only the type row differs |
| 7A-22 | link | `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions` | - | keep | `docs/docs/dwc/08-control-validation/index.md#pattern-validation` | MDN regular expression guide for the pattern attribute |
| 7A-23 | paragraph | **Example 2 - Built-in Client-Side Validation** 1) Start by running the DWCTraining/07_ControlValiation/builtInValidation.bbj program, wh... | - | drop | - | run-this-sample steps, exercise-style text (D-01); the required code is covered by 7A-25 |
| 7A-24 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/07_ControlValiation/builtInValidation.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 7A-25 | code (bbj) | `editFirstName!.setAttribute("required", "true")` | - | covered | `docs/docs/dwc/08-control-validation/index.md#required-field` | - |
| 7A-26 | paragraph | **Example 2 - Built-in Client-Side Validation** Now that those fields are configured to be required, we can't submit the form unless both... | - | keep | `docs/docs/dwc/08-control-validation/index.md#controlling-when-validation-runs` | auto-validate, auto-validate-on-load and auto-was-validated attributes are missing; new heading "Controlling When Validation Runs" |
| 7A-27 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 20.35.11.png` | b7c645fcb4c601274bd880d68afa101babe5949b | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-2.png |
| 7A-28 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 07.31.31.png` | a2c74e4733272ec280300bcc8a157a453ca1e00e | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-3.png |
| 7A-29 | code (bbj) | `editFirstName!.setAttribute("required", "true")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#controlling-when-validation-runs` | sets auto-validate-on-load for the required name fields; bbj_check_syntax: pass |
| 7A-30 | paragraph | **Example 2 - Built-in Client-Side Validation** With this code in place, the name fields are now initially displayed as invalid before th... | - | covered | `docs/docs/dwc/08-control-validation/index.md#pattern-validation` | zip pattern idea and the regex101 pointer are on the page |
| 7A-31 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 08.35.16.png` | 7bf34d2a52034005eaeda73998483b16d0172f3b | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-4.png |
| 7A-32 | link | `https://regex101.com/` | - | covered | `docs/docs/dwc/08-control-validation/index.md#testing-regular-expressions` | - |
| 7A-33 | screenshot | `Google Chrome - regex101 build test and debug regex- screenshot 2022-07-18 at 07.36.14.png` | 2fabc6c2daaacccf922c9850037b50730d6e8fe9 | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/regex101.png; shows the zip pattern explanation from example 2, so 06-15 should move it up to Pattern Validation (D-04) |
| 7A-34 | code (bbj) | `editZip!.setAttribute("pattern", "(\d{5})(-\d{4})?")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#pattern-validation` | zip code pattern with an optional four-digit extension; page shows only an email pattern; bbj_check_syntax: pass |
| 7A-35 | paragraph | **Example 2 - Built-in Client-Side Validation** with that code in place, the edit box will only be considered valid when it has the regul... | - | keep | `docs/docs/dwc/08-control-validation/index.md#pattern-validation` | a pattern field stays valid when empty unless it is required |
| 7A-36 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 20.30.58.gif` | c450a12285b6d0a4c728e57c903a3dd4a0eec10c | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-demo.gif |
| 7A-37 | paragraph | **JavaScript Validation** The last style of validation available is the developer-defined JavaScript expression. While you normally don't... | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | developer-defined JavaScript validation is missing; new heading "JavaScript Validation" |
| 7A-38 | paragraph | **Example 3 - Client-Side JavaScript Validation That Replicates the "required" Attribute** 1) Start by loading the DWCTraining/07_Control... | - | drop | - | run-this-sample steps, exercise-style text (D-01) |
| 7A-39 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/07_ControlValiation/javaScriptValidation-Required.bbj` | - | drop | - | raw GitHub link to the old DWCTraining repository, samples ship with the book |
| 7A-40 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 10.46.11.png` | bad61b8e5120520d8bcd05e2615651fb969009b6 | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-5.png |
| 7A-41 | code (bbj) | `rem Define the JavaScript function that determines if the provided input` | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | setClientValidationFunction and setClientValidationMessage; Moodle fence tagged javascript but the code is BBj; bbj_check_syntax: pass |
| 7A-42 | paragraph | **Example 3 - Client-Side JavaScript Validation That Replicates the "required" Attribute** The JavaScript was pretty simple, and used an ... | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | popover default and the validation-popover-placement attribute |
| 7A-43 | code (bbj) | `editFirstName!.setAttribute("validation-popover-placement", "right")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | sets the popover placement; bbj_check_syntax: pass |
| 7A-44 | paragraph | **Example 3 - Client-Side JavaScript Validation That Replicates the "required" Attribute** 3) Fill in the first name edit box with a bunc... | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | explains why the trim() check is stricter than required |
| 7A-45 | code (bbj) | `rem The first example could be written in a much more compact manner, so` | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | compact function and inline validation style; Moodle fence tagged javascript but the code is BBj; bbj_check_syntax: pass |
| 7A-46 | paragraph | **Example 3 - Client-Side JavaScript Validation That Replicates the "required" Attribute** The last line set the style of the validation ... | - | keep | `docs/docs/dwc/08-control-validation/index.md#javascript-validation` | explains the inline validation style |
| 7A-47 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.01.58.gif` | 27af0af1c707640002b611328172894b4be9bdca | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-demo2.gif |
| 7A-48 | paragraph | **Validation Customization** In the previous example, we started customizing the client-side validation by changing the style from popove... | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | validation-icon customization is missing; new heading "Validation Customization" |
| 7A-49 | link | `https://basishub.github.io/basis-next/docs/#/dwc/guide/form-validation?id=validation-customization` | - | drop | - | outdated basis-next docs link, superseded by the DWC chapter |
| 7A-50 | code (bbj) | `editLastName!.setAttribute("validation-icon", "fa:thumbs-down")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | first validation-icon example; bbj_check_syntax: pass |
| 7A-51 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.21.28.png` | e94da338558f053ea15f9c5943944aba38f678cb | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-6.png; shows the thumbs-down icon of 7A-50; not exercise 77 material, so 06-15 should keep it out of the exercise heading (D-04) |
| 7A-52 | code (bbj) | `editLastName!.setAttribute("validation-icon", "fa:hand-paper")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | second validation-icon example; bbj_check_syntax: pass |
| 7A-53 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.22.25.png` | 452aec4fde5a8f7463d5b379c3e40211c32ec59c | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-7.png; shows the hand icon of 7A-52; not exercise 77 material, so 06-15 should keep it out of the exercise heading (D-04) |
| 7A-54 | code (bbj) | `editLastName!.setAttribute("validation-icon", "fa:fas-exclamation-circle")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | third validation-icon example with the fas- prefix; bbj_check_syntax: pass |
| 7A-55 | paragraph | **Validation Customization** Those examples used the Font Awesome icon pool, but we could have also chosen icons from the Tabler, Feather... | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | icon pools, URLs and data URLs as icon sources |
| 7A-56 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.26.37.png` | 5f3bd7044e42f5238e93acf01d5ff7fcbb63dcaa | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-8.png; shows the icon of 7A-54; not exercise 77 material, so 06-15 should keep it out of the exercise heading (D-04) |
| 7A-57 | link | `https://en.wikipedia.org/wiki/Base64` | - | drop | - | general Wikipedia link on base64, tangential |
| 7A-58 | code (bbj) | `base64Icon! = "data:image/png;base64,iVBOR..."` | - | keep | `docs/docs/dwc/08-control-validation/index.md#validation-customization` | data URL icon, truncated base64 in the sample; bbj_check_syntax: pass |
| 7A-59 | paragraph | **Validation Customization** Which results in the following customized error message with our custom PNG image that was converted to base64: | - | drop | - | narration of the screenshot in 7A-60 only |
| 7A-60 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 12.35.50.png` | ee215cbc7b324b459416a12df6042fed68f82706 | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-9.png; shows the data URL icon of 7A-58; not exercise 77 material, so 06-15 should keep it out of the exercise heading (D-04) |
| 7A-61 | paragraph | **Disabling the Submit Button** One more interesting configuration option is the "validation-auto-disable" attribute. This attribute is s... | - | keep | `docs/docs/dwc/08-control-validation/index.md#disabling-the-submit-button` | validation-auto-disable and the data- prefix on windows; new heading "Disabling the Submit Button" |
| 7A-62 | code (bbj) | `window!.setAttribute("data-validation-auto-disable", "true")` | - | keep | `docs/docs/dwc/08-control-validation/index.md#disabling-the-submit-button` | sets validation-auto-disable on the window; bbj_check_syntax: pass |
| 7A-63 | paragraph | **Disabling the Submit Button** Since we set the attribute on the window, we prefixed the desired attribute (validation-auto-disable) wit... | - | keep | `docs/docs/dwc/08-control-validation/index.md#disabling-the-submit-button` | explains the data- prefix and the enabled submit button |
| 7A-64 | screenshot | `Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 12.49.24.gif` | 80e1ee9343c0acbacf8fda855dd8adac70d4dc8f | covered | `docs/docs/dwc/08-control-validation/index.md` | same image by hash: docs/docs/dwc/08-control-validation/img/validation-demo3.gif; shows the auto-disable submit button of 7A-62; not exercise 77 material, so 06-15 should keep it out of the exercise heading (D-04) |

## Handling Client Files

Unit: 8A. Module: page_78. DWC target: `docs/docs/dwc/09-browser-constraints/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 8A-01 | paragraph | The browser does not allow BBj to access files on the client computer directly. Instead, you have to download... | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#handling-client-files` | adds why (security) and that an upload needs a manual file selection and confirmation; the DWC page only states the limit |
| 8A-02 | link | `https://docs.google.com/document/pub?id=1qYNOstYTVC69OjI6dFGt3eIq6B0WkiG9U2nG1GOIFo8` | - | drop | - | published Google document, not a stable official source |
| 8A-03 | paragraph | **Uploading Files to the Server** The BBjFileChooser control can be used to select client files... | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#file-uploads` | names BBjFileChooser with drag and drop and a drop zone for one or many files; the DWC page has only a short code stub |
| 8A-04 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/08_BrowserConstraints/BBjFileChooserUpload.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |
| 8A-05 | screenshot | `image.png` | 1d51210b64b638856c6dbd2dd2d987c1782a8aeb | covered | `docs/docs/dwc/09-browser-constraints/index.md#handling-client-files` | same image by hash: docs/docs/dwc/09-browser-constraints/img/client-files.png |
| 8A-06 | paragraph | **File Downloads** Much simpler compared to uploading is downloading a file. The copyToClient() Method of BBjClientFilesystem... | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#file-downloads` | names BBjClientFilesystem copyToClient() as the download call for BUI and DWC; the DWC page shows a different call |
| 8A-07 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/bbjclientfile/bbjclientfile_copytoclient.htm` | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#file-downloads` | live BASIS Online Help page for copyToClient; not linked on the DWC page |
| 8A-08 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/08_BrowserConstraints/DownloadingAFile.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |

## Printing and Print Preview in the Client

Unit: 8B. Module: page_79. DWC target: `docs/docs/dwc/09-browser-constraints/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 8B-01 | paragraph | As a browser does not have direct access to local printers in the client, the typical way of printing... is a PDF document... | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#printing-and-print-preview` | explains that SysPrint output goes to the browser as PDF preview without PREVIEW; the DWC page only lists options |
| 8B-02 | code (bbj) | `lp = unt` | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#printing-and-print-preview` | minimal SysPrint PDF sample that shows the browser preview; bbj_check_syntax: pass |
| 8B-03 | paragraph | From the browser, the user can view and also print the document. As a general solution, all BBj printing capabilities... | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#print-preview` | PDF on the server plus the BBjDocViewer Plug-In; the DWC page shows a bare download stub |
| 8B-04 | link | `https://github.com/BBj-Plugins/BBjDocViewer` | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#print-preview` | official BBj-Plugins repository for BBjDocViewer, linked from the paragraph |
| 8B-05 | screenshot | `image.png` | 506daf9d4168bb9d1ef4861e648a2e6e0b58a3f0 | drop | - | shows personal data (author names and e-mail addresses in the sample PDF) |
| 8B-06 | paragraph | **BBJasper Print Preview** The BBJasper Print Preview works with the known features also in DWC: | - | keep | `docs/docs/dwc/09-browser-constraints/index.md#print-preview` | one sentence: BBJasper print preview works in the DWC; the DWC page lists Jasper only as a table row |
| 8B-07 | screenshot | `image (1).png` | 063dcb00f067f81ce50c6e4ebf25c6daaea8e681 | drop | - | shows personal data (customer names and addresses) and a dated 2022 report |

## Embedding a JavaScript Chart Component

Unit: 9A. Module: page_80. DWC target: `docs/docs/dwc/10-embedding-components/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 9A-01 | paragraph | **Using the BBjHTMLView to embed 3rd Party Components** Embedding 3rd Party Components is done using the BBjHTMLView... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#using-the-bbjhtmlview-to-embed-third-party-components` | five-step embedding recipe and the page-then-script load order; new heading "Using the BBjHTMLView to Embed Third-Party Components" before the chart example |
| 9A-02 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/Window/bbjhtmlview/bbjhtmlview.htm` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#using-the-bbjhtmlview-to-embed-third-party-components` | live BASIS Online Help page for BBjHTMLView |
| 9A-03 | code (text) | `(empty code block)` | - | drop | - | empty code block in the Moodle page, nothing to keep |
| 9A-04 | code (bbj) | `html$ = "<html><<body><div id='myComponent'></div></body></html>"` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#using-the-bbjhtmlview-to-embed-third-party-components` | seeds the BBjHTMLView and registers both callbacks; contains a typo (<<body>) to fix in 06-09; bbj_check_syntax: fixed (HTML typo in string literal: "<html><<body>" changed to "<html><body>"; original parses) |
| 9A-05 | code (bbj) | `process_events` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#using-the-bbjhtmlview-to-embed-third-party-components` | callback cascade for page loaded then script loaded; BBj code, the draft guessed javascript; has a broken js$ line to fix in 06-09; bbj_check_syntax: fixed (line 15: js$ = js" + ... changed to js$ = js$ + ...) |
| 9A-06 | paragraph | This cascade of events - one for the page loaded, followed by the script loaded event - ensures that each part... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#using-the-bbjhtmlview-to-embed-third-party-components` | explains why the cascade is needed |
| 9A-07 | paragraph | **Embedding a Chart Component from charts.js** We're going to exercise the embedding of a chart widget to DWC... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | introduces the chart sample under the existing chart heading |
| 9A-08 | link | `https://www.chartjs.org/docs/latest/getting-started/` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | official Chart.js getting started page the sample follows |
| 9A-09 | code (bbj) | `html$ = "<html></head><body><canvas id='myChart'></canvas></body></html>"` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | canvas seed for the chart; stray </head> to fix in 06-09; bbj_check_syntax: fixed (HTML in string literal: stray "</head>" changed to "<head></head>"; original parses) |
| 9A-10 | paragraph | If you are planning to embed multiple similar components to your page, make sure to give each one a unique ID... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | unique ID advice and the ON_PAGE_LOADED step |
| 9A-11 | code (bbj) | `handlePageLoaded:` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | injects the Chart.js library from a CDN after the page loaded; bbj_check_syntax: pass |
| 9A-12 | paragraph | If you like to host the library locally, you will need to download it and put it somewhere under BBj's htdocs folder... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | local hosting option; missing from the DWC page |
| 9A-13 | code (bbj) | `url$ = "http://bbjservername:8888/files/chart.min.js"` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | URL form for a locally hosted library; bbj_check_syntax: pass |
| 9A-14 | paragraph | Then, after the library is successfully loaded, the ON_SCRIPT_LOADED event is fired, and we can now work with it... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | explains script-loaded step and hardcoded versus dynamic data |
| 9A-15 | code (bbj) | `handleScriptLoaded:` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#embedding-a-javascript-chart-component` | builds the Chart.js line chart via injectScript; BBj code, the draft guessed javascript; bbj_check_syntax: pass |
| 9A-16 | paragraph | You can find the complete program under ChartJS_NoEventFromJS.bbj. | - | drop | - | points to the old DWCTraining sample; the Sample Code page replaces it |
| 9A-17 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/09_EmbeddingOtherComponents/ChartJS_NoEventFromJS.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |

## Receiving Events from JavaScript in BBj

Unit: 9B. Module: page_81. DWC target: `docs/docs/dwc/10-embedding-components/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 9B-01 | paragraph | A JavaScript component can send events back to BBj, so you can respond to user interaction within BBj... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | when to use the HTMLView for Chart.js and where the event map sample lives |
| 9B-02 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjNativeJavaScriptEvent/BBjNativeJavaScriptEvent_getEventMap.htm` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | live BASIS Online Help page for getEventMap |
| 9B-03 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/09_EmbeddingOtherComponents/EventMapSample.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |
| 9B-04 | code (bbj) | `js$ = js$ + "        onClick: (evt, item) => {"` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | JavaScript lines inside js$ strings, so BBj code, the draft guessed javascript; fragment of the chart legend handler; bbj_check_syntax: pass |
| 9B-05 | paragraph | The key statement in this example is the "basisDispatchCustomEvent" which passes the customEvent object back to BBj. | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | names basisDispatchCustomEvent and the ON_NATIVE_JAVASCRIPT handler |
| 9B-06 | link | `https://documentation.basis.cloud/BASISHelp/WebHelp/bbjevents/BBjNativeJavaScriptEvent/BBjNativeJavaScriptEvent.htm` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | live BASIS Online Help page for ON_NATIVE_JAVASCRIPT |
| 9B-07 | code (bbj) | `handleNativeJavascript:` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | event handler that reads the event map and shows it in a MSGBOX; bbj_check_syntax: pass |
| 9B-08 | paragraph | Here we simply output the contents of the event object in a MSGBOX for illustration. The complete sample is hosted under ChartJS.bbj | - | keep | `docs/docs/dwc/10-embedding-components/index.md#receiving-events-from-javascript-in-bbj` | MSGBOX remark is useful; the ChartJS.bbj pointer is dropped with 9B-09 |
| 9B-09 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/09_EmbeddingOtherComponents/ChartJS.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |

## Working with Slots

Unit: 9C. Module: page_82. DWC target: `docs/docs/dwc/10-embedding-components/index.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 9C-01 | paragraph | When embedding a web component or some 3rd party library, you sometimes need to put a BBj control like a BBjChildWindow "in the middle"... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#working-with-slots` | explains slots in terms of BBjChildWindow; the DWC page has a generic one-line definition |
| 9C-02 | paragraph | **Example for Slots: a Splitter Component from Shoelace** The shoelace library is a set of web components that you can combine with BBj... | - | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | the problem and the JavaScript appendChild trick; new heading "Example for Slots: a Splitter Component from Shoelace" |
| 9C-03 | link | `https://shoelace.style/` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | official Shoelace site |
| 9C-04 | link | `https://shoelace.style/components/split-panel` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | official Shoelace split-panel page |
| 9C-05 | screenshot | `image.png` | 0b56a33d8e8f66e1b5c6d7e95b0dede12efa3ccd | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | viewed: Shoelace split panel with Start and End areas, no personal data; shows what the BBjChildWindows must fill; new image folder 10-embedding-components/img |
| 9C-06 | code (bbj) | `BBjAPI().getSysGui().executeScript(` | - | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | moves both child windows into the splitter with appendChild; BBj code, the draft guessed javascript; bbj_check_syntax: fixed (statement split over three lines without continuation: added the ":" continuation prefix to lines 2 and 3) |
| 9C-07 | paragraph | Note: if you want to use the .getAttribute("id") method, you have to use the .setAttribute("id", "your id Here") method before it! | - | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | setAttribute before getAttribute; a common trap |
| 9C-08 | link | `https://raw.githubusercontent.com/BasisHub/DWCTraining/main/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj` | - | drop | - | old DWCTraining repository path; the Sample Code page replaces it |
| 9C-09 | screenshot | `Shoelace Splitter.png` | 18414eb2e43d3c449a6dbca12b15c65ee99bedfc | keep | `docs/docs/dwc/10-embedding-components/index.md#example-for-slots-a-splitter-component-from-shoelace` | viewed: splitter window with a red top and green bottom panel, no personal data; shows the result of the sample |

## 10A. Media Queries

Unit: 10A. Module: page_117. DWC target: `docs/docs/dwc/11-advanced-responsive/01-media-queries.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 10A-01 | paragraph | **Overview** We have already talked a bit about Media Queries, but here is the information in one place. | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#overview` | - |
| 10A-02 | paragraph | **What are Media Queries?** Media Queries can be kind of seen like a CSS specific if statement... | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#overview` | - |
| 10A-03 | code (css) | `@media (orientation: landscape) { .winTitle { display: none; }}` | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#common-media-features` | - |
| 10A-04 | paragraph | This will say that if the media is orientated in landscape mode then the object with the class winTitle will not be displayed... | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#basic-syntax` | - |
| 10A-05 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries` | - | keep | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#overview` | official MDN deep dive on media queries; the DWC page has no further reading link |
| 10A-06 | paragraph | **How do i implement them into CSS?** Like we saw above @media will tell CSS to listen to the device... | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#testing-media-queries` | - |
| 10A-07 | screenshot | `sizeChange.png` | bc3224182b7e457a9521125feaf20ae8cf99ea37 | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#testing-media-queries` | same image by hash: docs/docs/dwc/11-advanced-responsive/img/media-queries-size-change.png |
| 10A-08 | paragraph | **What are the standard Screen Sizes to use?** You may ask yourself what the Screen sizes you should use... | - | covered | `docs/docs/dwc/11-advanced-responsive/01-media-queries.md#common-breakpoints` | - |
| 10A-09 | link | `https://www.w3schools.com/css/css_rwd_mediaqueries.asp` | - | drop | - | third-party tutorial; the DWC page has its own breakpoint table |

## 10B. Transitions

Unit: 10B. Module: page_120. DWC target: `docs/docs/dwc/11-advanced-responsive/02-transitions.md`.

| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |
|------|------|-----------------|-------|---------|--------|--------|
| 10B-01 | paragraph | **What are Transitions?** If you worked with resizable components in you webpage a lot, you will know what i mean... | - | covered | `docs/docs/dwc/11-advanced-responsive/02-transitions.md#overview` | - |
| 10B-02 | paragraph | **How to use Transitions?** When writing a Transition, two things are required: property and duration... | - | covered | `docs/docs/dwc/11-advanced-responsive/02-transitions.md#basic-syntax` | - |
| 10B-03 | code (text) | `transition: <property> <duration> <timing-function> <delay>;` | - | covered | `docs/docs/dwc/11-advanced-responsive/02-transitions.md#basic-syntax` | - |
| 10B-04 | paragraph | This is what the other two parts of the syntax do: delay and timing-function... | - | covered | `docs/docs/dwc/11-advanced-responsive/02-transitions.md#transition-properties` | - |
| 10B-05 | link | `https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function` | - | drop | - | the DWC page has its own Timing Functions table |
| 10B-06 | code (text) | `transition: width 2.5, height 4s;` | - | drop | - | factually wrong: 2.5 has no time unit; the DWC page shows valid multiple transitions |
| 10B-07 | paragraph | Note: Not all properties are able to be transitioned, if you want to transition something, its best to look it up... | - | keep | `docs/docs/dwc/11-advanced-responsive/02-transitions.md#transition-properties` | notes that not every CSS property can be transitioned; the DWC page does not say it; drop the "ask an AI" advice and the MediaQueries.bbj pointer when adapting |
