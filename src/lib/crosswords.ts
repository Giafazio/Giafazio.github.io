/*
 * Modello logico di un cruciverba.
 *
 * Righe e colonne usano indici a partire da zero.
 * Le chiavi "riga,colonna" identificano una casella; le chiavi
 * "direzione-numero" distinguono le parole orizzontali e verticali.
 */

export type CrosswordDirection = "across" | "down";

export interface CrosswordCell {
  key: string;
  row: number;
  column: number;
  number?: number;
}

export interface CrosswordWord {
  key: string;
  number: number;
  direction: CrosswordDirection;
  cells: string[];
}

export interface CrosswordModel {
  rows: number;
  columns: number;
  cells: CrosswordCell[];
  words: CrosswordWord[];
}

export function buildCrosswordModel(
  layout: readonly string[],
  clues: Record<CrosswordDirection, readonly { number: number }[]>,
): CrosswordModel {
  /*
   * Il layout è già stato controllato dallo schema dei contenuti:
   * tutte le righe hanno la stessa lunghezza e contengono solo "." e "#".
   */
  const rows = layout.length;
  const columns = layout[0]?.length ?? 0;
  const cells: CrosswordCell[] = [];
  const words: CrosswordWord[] = [];
  const directions = ["across", "down"] as const;

  /*
   * Le coordinate esterne alla griglia vengono considerate nere.
   * Questo consente di riconoscere l'inizio e la fine delle parole
   * senza controllare separatamente i quattro bordi.
   */
  const isWhite = (row: number, column: number) =>
    layout[row]?.[column] === ".";

  let number = 0;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (!isWhite(row, column)) continue;

      /*
       * Una casella inizia una parola se prima c'è un bordo o una
       * casella nera e dopo c'è almeno un'altra casella bianca.
       * In questo modo non vengono create parole di una sola lettera.
       */
      const starts = {
        across:
          !isWhite(row, column - 1) && isWhite(row, column + 1),
        down:
          !isWhite(row - 1, column) && isWhite(row + 1, column),
      };

      const isStart = starts.across || starts.down;

      /*
       * Se dalla stessa casella partono entrambe le direzioni,
       * il numero viene incrementato una volta sola e condiviso.
       */
      if (isStart) number++;

      cells.push({
        key: `${row},${column}`,
        row,
        column,
        number: isStart ? number : undefined,
      });

      for (const direction of directions) {
        if (!starts[direction]) continue;

        /*
         * Raccoglie le caselle consecutive fino al bordo della griglia
         * o alla prima casella nera.
         */
        const wordCells: string[] = [];
        let r = row;
        let c = column;

        while (isWhite(r, c)) {
          wordCells.push(`${r},${c}`);
          if (direction === "across") c++;
          else r++;
        }

        words.push({
          key: `${direction}-${number}`,
          number,
          direction,
          cells: wordCells,
        });
      }
    }
  }

  /*
   * Confronta i numeri ricavati dallo schema con quelli dichiarati
   * nel Markdown. Set.delete() restituisce false anche quando un numero
   * è già stato rimosso, permettendo di riconoscere i duplicati.
   */
  for (const direction of directions) {
    const expected = new Set(
      words
        .filter((word) => word.direction === direction)
        .map((word) => word.number),
    );
    const supplied = clues[direction];

    if (
      supplied.length !== expected.size ||
      supplied.some((clue) => !expected.delete(clue.number))
    ) {
      const label =
        direction === "across" ? "orizzontali" : "verticali";
      throw new Error(
        `Definizioni ${label} non coerenti con la griglia.`,
      );
    }
  }

  /*
   * Una casella bianca non coperta da alcuna parola non potrebbe essere
   * raggiunta attraverso una definizione: la consideriamo quindi un
   * errore nella struttura dello schema.
   */
  const coveredCells = new Set(words.flatMap((word) => word.cells));
  if (cells.some((cell) => !coveredCells.has(cell.key))) {
    throw new Error(
      "La griglia contiene caselle bianche isolate in entrambe le direzioni.",
    );
  }

  return { rows, columns, cells, words };
}

