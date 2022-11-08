import React, { FC } from 'react';

import { l10n } from '^/utilities/l10n';

import * as T from '^/types';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import SimpleDocumentPage, {
  ParagraphProps, TextContentBlock,
} from '^/components/pages/SimpleDocumentPage';

import terms from './text';

const TermsPage: FC<L10nProps> = () => {
  // TODO: remove default usage of KO_KR language when the English text is ready
  const language: T.Language = T.Language.KO_KR;
  const paragraphs: Array<ParagraphProps> = terms.contentBlocks.map((block: TextContentBlock) => ({
    ['title']: l10n(block.title, language),
    ['content']: l10n(block.content, language),
  }));

  return (
    <SimpleDocumentPage
      title={l10n(terms.mainTitle, language)}
      paragraphs={paragraphs}
    />
  );
};

export default withL10n(TermsPage);
