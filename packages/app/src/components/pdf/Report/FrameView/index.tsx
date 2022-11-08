import React, { FC } from 'react';
import { Text, View , StyleSheet, Image, Link } from '@react-pdf/renderer';

import * as T from '^/types';
import Texts from './text';
import palette from '^/constants/palette';
import { changeWordsOrderOnLang } from '^/utilities/l10n';

const styles = StyleSheet.create({
  root: {
    position:'absolute',
    width: '100%',
    height: '100%',
    top: 60,
    left: 40,
  },
  logo: {
    position: 'absolute',
    height: 16,
    top: -20,
    left: 0,
    objectFit: 'contain',
  },
  link: {
    position: 'absolute',
    top: -20,
    right: 0,
    fontSize: 7,
    fontWeight: 300,
    color: palette.black.toString(),
  },
  page: {
    position: 'absolute',
    right: 0,
    bottom: -20,
    fontSize: 7,
    fontWeight: 300,
  },
  dataset: {
    position: 'absolute',
    left: 0,
    bottom: -20,
    fontWeight: 300,
    fontSize: 7,
  },
});

export interface Frame {
  url: string;
  dataset: string;
  logo: string | undefined;
  companyName: string | undefined;
}

interface Props {
  data: Frame;
  lang: T.Language;
}

const FrameView: FC<Props> = ({ data, lang }) => {
  const projectLogo = data.logo ? (
    <Image
      src={{ uri: data.logo, method: 'GET', headers: { 'Cache-Control': 'no-cache' }, body: '' }}
      style={styles.logo}
    />
  ) : null;
  const projectLink = data.companyName ? (
    <Link src={data.url} style={styles.link}>
      {changeWordsOrderOnLang(data.companyName, Texts.link[lang], lang)}
    </Link>
  ) : null;
  return (
    <View style={styles.root} fixed={true}>
      {projectLogo}
      {projectLink}
      <Text style={styles.dataset}>{data.dataset}</Text>
      {/* A fixed prop is essential to use pages parameters. */}
      <Text
        style={styles.page}
        render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
        fixed={true}
      />
    </View>
  );
};

export default FrameView;

