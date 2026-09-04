/*
 * Comportamento interattivo dei cruciverba.
 *
 * Il modello della griglia viene costruito sul server; questo modulo
 * collega nel browser caselle, parole, definizioni e controlli.
 */

type CrosswordDirection = "across" | "down";

interface CrosswordWordBinding {
  key: string;
  direction: CrosswordDirection;
  cells: HTMLInputElement[];
  button: HTMLButtonElement;
}

interface StoredCrosswordProgress {
  version: 1;
  layout: string;
  values: Record<string, string>;
}

type CellWordBindings = Partial<
  Record<CrosswordDirection, CrosswordWordBinding>
>;

const otherDirection = (
  direction: CrosswordDirection,
): CrosswordDirection =>
  direction === "across" ? "down" : "across";

const initializeCrosswordReader = (reader: HTMLElement) => {
  if (reader.dataset.crosswordReaderInitialized === "true") {
    return;
  }

  const rows = Number(reader.dataset.crosswordRows);
  const columns = Number(reader.dataset.crosswordColumns);

  const crosswordId = reader.dataset.crosswordId;
  const layoutSignature = reader.dataset.crosswordLayout;

  const storageKey = crosswordId
    ? `fabrizioswebhome:crossword:${crosswordId}`
    : null;

  const storageStatus = reader.querySelector<HTMLElement>(
    "[data-crossword-storage-status]",
  );

  const resetButton = reader.querySelector<HTMLButtonElement>(
    "[data-crossword-reset]",
  );

  let storageAvailable = Boolean(
    storageKey && layoutSignature,
  );

  const setStorageStatus = (message: string) => {
    if (storageStatus) {
      storageStatus.textContent = message;
    }
  };

  const disableStorage = () => {
    storageAvailable = false;
    setStorageStatus("Salvataggio locale non disponibile.");
  };

  if (!rows || !columns) return;

  reader.dataset.crosswordReaderInitialized = "true";

  const cells = new Map<string, HTMLInputElement>();
  const words = new Map<string, CrosswordWordBinding>();
  const cellWords = new Map<
    HTMLInputElement,
    CellWordBindings
  >();

  reader
    .querySelectorAll<HTMLInputElement>("[data-crossword-cell]")
    .forEach((cell) => {
      const key = cell.dataset.crosswordCell;
      if (key) cells.set(key, cell);
    });

  /*
   * Accetta una sola lettera e normalizza il valore come avviene
   * durante la normale digitazione nel cruciverba.
   */
  const normalizeStoredLetter = (value: unknown) => {
    if (typeof value !== "string") return "";

    return (
      value
        .normalize("NFC")
        .toLocaleUpperCase("it-IT")
        .match(/\p{L}/u)?.[0] ?? ""
    );
  };

  /*
   * Ripristina soltanto dati compatibili con la versione e con
   * la struttura attuale della griglia. I dati obsoleti o corrotti
   * vengono eliminati senza impedire l'uso del cruciverba.
   */
  const restoreProgress = () => {
    if (
      !storageAvailable ||
      !storageKey ||
      !layoutSignature
    ) {
      return;
    }

    let rawProgress: string | null;

    try {
      rawProgress = localStorage.getItem(storageKey);
    } catch {
      disableStorage();
      return;
    }

    if (!rawProgress) return;

    let stored: Partial<StoredCrosswordProgress>;

    try {
      stored = JSON.parse(rawProgress);
    } catch {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        disableStorage();
      }

      return;
    }

    const hasValidValues =
      typeof stored.values === "object" &&
      stored.values !== null &&
      !Array.isArray(stored.values);

    if (
      stored.version !== 1 ||
      stored.layout !== layoutSignature ||
      !hasValidValues
    ) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        disableStorage();
      }

      return;
    }

    Object.entries(
      stored.values as Record<string, unknown>,
    ).forEach(([cellKey, value]) => {
      const cell = cells.get(cellKey);
      const letter = normalizeStoredLetter(value);

      if (cell && letter) {
        cell.value = letter;
      }
    });
  };

  /*
   * Registra soltanto le caselle compilate. Se lo schema è vuoto,
   * elimina completamente la voce dal localStorage.
   */
  const saveProgress = () => {
    if (
      !storageAvailable ||
      !storageKey ||
      !layoutSignature
    ) {
      return;
    }

    const values: Record<string, string> = {};

    cells.forEach((cell, cellKey) => {
      if (cell.value) {
        values[cellKey] = cell.value;
      }
    });

    try {
      if (Object.keys(values).length === 0) {
        localStorage.removeItem(storageKey);
        return;
      }

      const progress: StoredCrosswordProgress = {
        version: 1,
        layout: layoutSignature,
        values,
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(progress),
      );
    } catch {
      disableStorage();
    }
  };

  restoreProgress();

  /*
   * Collega ogni definizione alle caselle appartenenti alla parola.
   * Le chiavi sono state calcolate sul server dal layout Markdown.
   */
  reader
    .querySelectorAll<HTMLButtonElement>("[data-crossword-word]")
    .forEach((button) => {
      const key = button.dataset.crosswordWord;
      const direction = button.dataset
        .crosswordDirection as CrosswordDirection | undefined;

      if (!key || !direction) return;

      const datasetKey =
        direction === "across"
          ? "crosswordAcross"
          : "crosswordDown";

      const wordCells = [...cells.values()].filter(
        (cell) => cell.dataset[datasetKey] === key,
      );

      const word: CrosswordWordBinding = {
        key,
        direction,
        cells: wordCells,
        button,
      };

      words.set(key, word);

      wordCells.forEach((cell) => {
        const bindings = cellWords.get(cell) ?? {};
        bindings[direction] = word;
        cellWords.set(cell, bindings);
      });
    });

  const directionButtons =
    reader.querySelectorAll<HTMLButtonElement>(
      "[data-crossword-clue-button]",
    );

  const mobileButtons =
    reader.querySelectorAll<HTMLButtonElement>(
      "[data-crossword-mobile-button]",
    );

  const activeClue = reader.querySelector<HTMLElement>(
    "[data-crossword-active-clue]",
  );

  let activeCell: HTMLInputElement | null = null;
  let toggleOnClick: HTMLInputElement | null = null;
  let direction: CrosswordDirection = "across";

  const setClueDirection = (
    nextDirection: CrosswordDirection,
  ) => {
    reader.dataset.activeClues = nextDirection;

    directionButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(
          button.dataset.crosswordClueButton === nextDirection,
        ),
      );
    });
  };

  const setMobilePanel = (panel: string) => {
    reader.dataset.mobilePanel = panel;

    mobileButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.crosswordMobileButton === panel),
      );
    });

    if (panel === "across" || panel === "down") {
      setClueDirection(panel);
    }
  };

  /*
   * Aggiorna la riga mostrata sotto lo schema nella versione mobile.
   * Rimane nascosta finché non viene selezionata una parola.
   */
  const updateActiveClue = (word: CrosswordWordBinding) => {
    if (!activeClue) return;

    const number = word.button.dataset.crosswordNumber ?? "";
    const text =
      word.button
        .querySelector<HTMLElement>(
          "[data-crossword-clue-text]",
        )
        ?.textContent?.trim() ?? "";

    const directionLabel =
      word.direction === "across"
        ? "Orizzontale"
        : "Verticale";

    const directionElement =
      activeClue.querySelector<HTMLElement>(
        "[data-crossword-active-direction]",
      );

    const numberElement =
      activeClue.querySelector<HTMLElement>(
        "[data-crossword-active-number]",
      );

    const textElement =
      activeClue.querySelector<HTMLElement>(
        "[data-crossword-active-text]",
      );

    if (directionElement) {
      directionElement.textContent = directionLabel;
    }

    if (numberElement) numberElement.textContent = number;
    if (textElement) textElement.textContent = text;

    activeClue.hidden = false;
  };

  const activateCell = (
    cell: HTMLInputElement,
    requestedDirection = direction,
  ) => {
    const available = cellWords.get(cell);
    if (!available) return null;

    /*
     * Se la casella appartiene a una sola parola, viene scelta quella
     * anche quando è stata richiesta l'altra direzione.
     */
    const word =
      available[requestedDirection] ??
      available[otherDirection(requestedDirection)];

    if (!word) return null;

    direction = word.direction;
    activeCell = cell;

    const selectedCells = new Set(word.cells);

    cells.forEach((item) => {
      const isSelected = selectedCells.has(item);
      item.classList.toggle("is-in-word", isSelected);

      if (isSelected) {
        item.setAttribute("aria-describedby", word.button.id);
      } else {
        item.removeAttribute("aria-describedby");
      }
    });

    words.forEach((item) => {
      item.button.setAttribute(
        "aria-pressed",
        String(item === word),
      );
    });

    setClueDirection(word.direction);
    updateActiveClue(word);

    return word;
  };

  const focusCell = (
    cell: HTMLInputElement | null,
    requestedDirection = direction,
  ) => {
    if (!cell) return;

    activateCell(cell, requestedDirection);
    cell.focus({ preventScroll: true });
    cell.select();
  };

  /*
   * Individua una casella vicina. Durante la digitazione ci si ferma
   * davanti a un nero; le frecce possono invece oltrepassarlo.
   */
  const neighbor = (
    cell: HTMLInputElement,
    rowStep: number,
    columnStep: number,
    skipBlack = false,
  ) => {
    let row = Number(cell.dataset.crosswordRow) + rowStep;
    let column =
      Number(cell.dataset.crosswordColumn) + columnStep;

    while (
      row >= 0 &&
      row < rows &&
      column >= 0 &&
      column < columns
    ) {
      const next = cells.get(`${row},${column}`);
      if (next) return next;
      if (!skipBlack) break;

      row += rowStep;
      column += columnStep;
    }

    return null;
  };

  /*
   * Restituisce la casella precedente o successiva nella parola
   * attualmente selezionata.
   */
  const alongWord = (
    cell: HTMLInputElement,
    step: number,
  ) => {
    const word = cellWords.get(cell)?.[direction];
    if (!word) return null;

    const index = word.cells.indexOf(cell);
    return word.cells[index + step] ?? null;
  };

  cells.forEach((cell) => {
    cell.addEventListener("pointerdown", () => {
      toggleOnClick = activeCell === cell ? cell : null;
    });

    cell.addEventListener("pointercancel", () => {
      toggleOnClick = null;
    });

    cell.addEventListener("focus", () => {
      activateCell(cell);
      cell.select();
    });

    cell.addEventListener("click", (event) => {
      /*
       * pointerdown avviene prima di focus: così il primo clic
       * seleziona la casella e soltanto il secondo cambia direzione.
       */
      const shouldToggle =
        event.detail === 0
          ? activeCell === cell
          : toggleOnClick === cell;

      toggleOnClick = null;

      focusCell(
        cell,
        shouldToggle
          ? otherDirection(direction)
          : direction,
      );
    });

    cell.addEventListener("input", (event) => {
      const inputEvent = event as InputEvent;
      if (inputEvent.isComposing) return;

      activateCell(cell);

      const letters = cell.value
        .normalize("NFC")
        .toLocaleUpperCase("it-IT")
        .match(/\p{L}/gu);

      cell.value = letters?.[0] ?? "";
      saveProgress();

      if (cell.value) {
        /*
         * Dopo l'ultima lettera della parola la selezione resta
         * sulla casella appena compilata.
         */
        focusCell(alongWord(cell, 1) ?? cell);
      }
    });

    cell.addEventListener("compositionend", () => {
      cell.dispatchEvent(
        new InputEvent("input", { bubbles: false }),
      );
    });

    cell.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const arrows: Partial<
        Record<string, readonly [number, number]>
      > = {
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
      };

      const arrow = arrows[event.key];

      if (arrow) {
        event.preventDefault();

        const [rowStep, columnStep] = arrow;

        focusCell(
          neighbor(cell, rowStep, columnStep, true) ?? cell,
          rowStep === 0 ? "across" : "down",
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        focusCell(cell, otherDirection(direction));
      } else if (event.key === "Backspace") {
        event.preventDefault();

        if (cell.value) {
          cell.value = "";
        } else {
          const previous = alongWord(cell, -1);

          if (previous) {
            previous.value = "";
            focusCell(previous);
          }
        }

        saveProgress();
      } else if (event.key === "Delete") {
        event.preventDefault();
        cell.value = "";
        saveProgress();
      }
    });
  });

  resetButton?.addEventListener("click", () => {
    cells.forEach((cell) => {
      cell.value = "";
    });

    saveProgress();

    if (storageAvailable) {
      setStorageStatus(
        "Schema cancellato. Il salvataggio automatico resta attivo.",
      );
    }
  });

  /*
   * Se una definizione viene scelta da mobile, rende prima visibile
   * lo schema e soltanto dopo porta il cursore alla prima casella.
   */
  words.forEach((word) => {
    word.button.addEventListener("click", () => {
      const selectWord = () => {
        focusCell(word.cells[0] ?? null, word.direction);
      };

      if (window.matchMedia("(max-width: 760px)").matches) {
        setMobilePanel("grid");
        requestAnimationFrame(selectWord);
      } else {
        selectWord();
      }
    });
  });

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextDirection = button.dataset
        .crosswordClueButton as CrosswordDirection | undefined;

      if (nextDirection) setClueDirection(nextDirection);
    });
  });

  mobileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.dataset.crosswordMobileButton;
      if (panel) setMobilePanel(panel);
    });
  });
};

export const initializeCrosswordReaders = () => {
  document
    .querySelectorAll<HTMLElement>("[data-crossword-reader]")
    .forEach(initializeCrosswordReader);
};
