import { isEllipsisActive } from '^/utilities/styles';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { UseState } from '.';

export type UseIsTextEllipsisActive = ReturnType<typeof useIsTextEllipsisActive>;

export function useIsTextEllipsisActive<ArrayType, UpdateConditions extends Array<ArrayType>>(
  ...updateConditions: UpdateConditions
): [MutableRefObject<HTMLParagraphElement | null> | undefined, boolean] {
  const textEllipsisRef: MutableRefObject<null | HTMLParagraphElement> | undefined = useRef(null);
  const [isActive, setActive]: UseState<Readonly<boolean>> = useState(textEllipsisRef?.current ? isEllipsisActive(textEllipsisRef?.current) : false);

  useEffect(() => {
    setActive(textEllipsisRef?.current ? isEllipsisActive(textEllipsisRef?.current) : false);
  }, [textEllipsisRef?.current, ...updateConditions]);

  return [textEllipsisRef, isActive];
}
