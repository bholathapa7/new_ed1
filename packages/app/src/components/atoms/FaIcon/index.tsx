import styled from 'styled-components';

export interface Props {
  faNames: string | Array<string>;
  fontSize?: string;
  color?: string;
  className?: string;
}

const FaIcon = styled.i.attrs(({ faNames }: Props) => Array.isArray(faNames) ? {
  className: `fa ${faNames.map((faName) => `fa-${faName}`).join(' ')}`,
} : {
  className: `fa fa-${faNames}`,
})<Props>(({ fontSize, color }) => ({
  fontSize,
  color,
}));

FaIcon.displayName = 'FaIcon';
export default FaIcon;
