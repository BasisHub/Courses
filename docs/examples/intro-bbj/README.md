# Introduction to BBj Development samples

These are the sample programs from the Introduction to BBj Development training book.
Each folder holds the files for one lesson. Open them in your IDE, run them and change them.

- `better-hello-world/` shows a window with a button that opens a message box.
- `oo-samples/` holds the Car classes and the dialog class from the object-oriented videos.
- `dwc-lesson-start/` is the program where the web development lesson starts.
- `dwc-lesson-result/` is the program and the CSS file as they look after the lesson.
- `exercises/` holds a possible solution for every exercise, written for this book; `exercises/oo-tic-tac-toe/` holds the object-oriented Tic-Tac-Toe classes.

## Compile and run examples that use other class files

Extract the ZIP before opening a program. Keep the files for each example together. BBj resolves a `USE ::file.bbj::Class` reference through the working directory and PREFIX; opening a file in the IDE does not make its folder the working directory.

Set the IDE's working directory to the folder containing the program you want to run, or add that folder to its PREFIX:

- Run `CarApplication.bbj` from `oo-samples/`, with `Car.bbj` beside it. `Car.bbj` defines both `Car` and `FlyingCar`.
- Run `PlayTicTacToe.bbj` from `exercises/oo-tic-tac-toe/`, with `Board.bbj`, `Player.bbj`, and `GameWindow.bbj` beside it.

With the compiler on your PATH, check the Car example from its own folder:

```bash
bbjcpl -t -N -X CarApplication.bbj
```

To check it from this repository's root instead, tell the compiler where to find the other class files:

```bash
bbjcpl -t -N -X -Pdocs/examples/intro-bbj/oo-samples docs/examples/intro-bbj/oo-samples/CarApplication.bbj
```

For a downloaded copy, replace the repository paths with your extracted folder's paths. If you see `Cannot find program Car.bbj` or `Cannot find program GameWindow.bbj`, check these paths first. The compiler's `-P` option configures its type check; configure the working directory or PREFIX separately when you run the program.

See the [USE reference](https://documentation.basis.cloud/BASISHelp/WebHelp/commands/use_verb.htm) and [compiler options](https://documentation.basis.cloud/BASISHelp/WebHelp/util/bbjcpl_bbj_compiler.htm).
