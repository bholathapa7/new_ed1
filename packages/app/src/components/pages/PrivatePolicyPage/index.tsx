import React, { FC } from 'react';

import { l10n } from '^/utilities/l10n';

import * as T from '^/types';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import SimpleDocumentPage, {
  ParagraphProps, TextContentBlock,
} from '^/components/pages/SimpleDocumentPage';

import policies from './text';

const PrivatePolicyPage: FC<L10nProps> = () => {
  /**
   * @todo remove following line with KO_KR
   * and use language from props when the English text is ready.
   */
  const language: T.Language = T.Language.KO_KR;

  const paragraphs: Array<ParagraphProps> = policies.contentBlocks
    .map((block: TextContentBlock): ParagraphProps => ({
      /**
       * @desc These weird keys are introduced
       * because of an issue of stylelint.
       * After stylelint is fixed (or removed), please fix
       * these keys to use normal object key syntax.
       */
      ['title']: l10n(block.title, language),
      ['content']: l10n(block.content, language),
    }));

  return (
    <SimpleDocumentPage
      title={l10n(policies.mainTitle, language)}
      paragraphs={paragraphs}
    />
  );
};

export default withL10n(PrivatePolicyPage);
