export interface HowtoCard {
  title: string;
  body: string;
}

export const HOWTO_CARDS: readonly HowtoCard[] = [
  {
    title: "Ziel",
    body: "Fülle waagerechte Reihen mit Tetrominos. Volle Reihen verschwinden. Spiele so lange wie möglich — Game Over, wenn ein neues Teil nicht mehr spawnen kann.",
  },
  {
    title: "Steuern",
    body: "Links/Rechts bewegen (DAS/ARR). Unten: Soft Drop. Leertaste: Hard Drop. Hoch oder X: drehen (CW). Z: gegen den Uhrzeigersinn. A: 180°. Esc: Pause. R: Neustart.",
  },
  {
    title: "Hold/Next",
    body: "C oder Shift legt das aktuelle Teil in Hold (einmal pro Teil). Next zeigt die nächsten fünf Teile. Nach einem Lock ist Hold wieder frei.",
  },
  {
    title: "Score-Basics",
    body: "Single 100 · Double 300 · Triple 500 · Tetris 800 (× Level). T-Spin und Mini extra. Back-to-Back ×1.5. Combo 50 × Combo × Level. Soft Drop +1, Hard Drop +2 pro Zelle.",
  },
];
