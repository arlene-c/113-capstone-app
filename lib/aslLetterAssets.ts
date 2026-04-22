export const SUPPORTED_ASL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export type AslLetterAsset = {
  letter: string;
  src: string;
  alt: string;
  note?: string;
};

export type EnglishToAslLookup =
  | {
      status: 'empty';
    }
  | {
      status: 'supported';
      asset: AslLetterAsset;
    }
  | {
      status: 'unsupported';
      normalizedInput: string;
      message: string;
    };

function buildAsset(letter: string): AslLetterAsset {
  return {
    letter,
    src: `/asl-letters/${letter}.svg`,
    alt: `ASL fingerspelled handshape for the English letter ${letter}`,
    note:
      letter === 'J' || letter === 'Z'
        ? 'J and Z use motion in real ASL, so this static image shows the handshape starting point rather than the full movement.'
        : undefined,
  };
}

export function lookupEnglishToAsl(input: string): EnglishToAslLookup {
  const normalizedInput = input.trim().toUpperCase();

  if (!normalizedInput) {
    return { status: 'empty' };
  }

  if (
    normalizedInput.length === 1 &&
    SUPPORTED_ASL_LETTERS.includes(normalizedInput)
  ) {
    return {
      status: 'supported',
      asset: buildAsset(normalizedInput),
    };
  }

  return {
    status: 'unsupported',
    normalizedInput,
    message:
      'This is not supported yet. Right now the app can translate one English letter (A-Z) into a fingerspelled ASL handshape.',
  };
}
