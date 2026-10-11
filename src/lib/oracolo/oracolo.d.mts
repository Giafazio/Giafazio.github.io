export function classificaDomanda(text: string): {
  etichetta: 'si_no' | 'aperta' | 'incerta';
  regola: string;
  motivo: string;
  parole?: string[];
};
