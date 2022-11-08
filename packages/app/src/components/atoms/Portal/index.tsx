import { FC } from 'react';
import { createPortal } from 'react-dom';

export interface Props {
  readonly node: HTMLElement;
}

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc Wrapper component for react portal
 */
const Portal: FC<Props> = ({ children, node }) => createPortal(children, node);

export default Portal;
