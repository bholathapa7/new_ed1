import { useCallback, useState, SyntheticEvent } from 'react';

import { UseState } from '.';

type InputElementType = HTMLInputElement | HTMLTextAreaElement;
export type UseInput<T> = [T, (e: SyntheticEvent<InputElementType, Event>) => void];

export const useInput: (
  initialValue: string,
) => UseInput<typeof initialValue> = (initialValue) => {
  const [input, setInput]: UseState<typeof initialValue>
    = useState<typeof initialValue>(initialValue);

  const inputChange: (e: SyntheticEvent<InputElementType, Event>) => void
    = useCallback(
      (e: SyntheticEvent<InputElementType>) => setInput(e.currentTarget.value), [],
    );

  return [input, inputChange];
};
