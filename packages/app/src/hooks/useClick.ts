import { MouseEvent, useCallback, useState } from 'react';

import { UseState } from '.';

/**
 * @description
 * This is custom useState hooks for clicking events.
 * If the value should be change when clicked, you can use this hooks.
 * If you want to use this for not only clicking, please rename & recode MouseEvent
 */
export type UseClick = [boolean, (e?: MouseEvent) => void];
export const useClick: (initialValue: boolean) => UseClick = (initialValue) => {
  const [isClicked, setIsClick]: UseState<boolean> = useState<boolean>(initialValue);

  const onClick: (e?: MouseEvent) => void = useCallback((e?: MouseEvent) => {
    e?.preventDefault();
    setIsClick((prevIsClicked) => !prevIsClicked);
  }, []);

  return [isClicked, onClick];
};
