export type SceneMeta = {
  id: string
  index: string
  title: string
  line: string
  /** Short label for the progress rail. */
  rail: string
}

/**
 * Voice note: the band writes in Hinglish on their own reels — "hum har
 * Tuesday stage", "But stage nhi h?", "Find people who sing louder than your
 * overthinking". The copy below follows that register rather than flattening
 * it into brochure English.
 */
export const SCENES: SceneMeta[] = [
  {
    id: 'doors',
    index: '01',
    rail: 'Doors',
    title: 'But stage nhi h?',
    line: 'Correct. There is no stage — just a corner of a café where the tables used to be, and about forty people who came in for coffee.',
  },
  {
    id: 'forward',
    index: '02',
    rail: 'Aage',
    title: 'Hum har Tuesday stage',
    line: 'Nobody announces it. Somewhere in the second song the room closes in, and the gap between the people playing and the people listening stops existing.',
  },
  {
    id: 'stage',
    index: '03',
    rail: 'Mic',
    title: 'Jisko gaana hai, woh aa jaata hai',
    line: 'Open jamming means exactly that. Put your name down, take the mic, and the rest of us will find the key and play behind you.',
  },
  {
    id: 'reverse',
    index: '04',
    rail: 'The room',
    title: 'Look up from the guitar and this is it',
    line: 'Phones, chai, someone filming for a story, and a circle of people who did not know each other at eight o’clock.',
  },
  {
    id: 'after',
    index: '05',
    rail: 'After',
    title: 'Chalte chalte',
    line: 'Cases shut, chairs stacked, someone still humming on the way to the parking. Agla Tuesday, phir wahi jagah.',
  },
]
