import { useCallback, useRef } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

// see https://github.com/reactjs/rfcs/pull/220
export function useEffectEvent<T extends ((...args: never[]) => unknown) | undefined>(
  callback: T,
): T {
  const ref = useRef<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fn = useCallback((...args: never[]) => ref.current!(...args), []);
  return (callback ? fn : callback) as T;
}
