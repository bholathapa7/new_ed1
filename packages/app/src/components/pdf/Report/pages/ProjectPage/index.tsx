import React, { FC, ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';

import * as T from '^/types';
import Texts from './text';

const styles = StyleSheet.create({
  root: { height: '100%' },
  section: { marginTop: 95 },
  content: { position: 'relative', marginTop: 83 },
  label: { fontSize: 10, marginBottom: 5 },
  title: { fontSize: 22 },
  photoWrapper: { position: 'absolute', left: 0, bottom: 0 },
  photo: { marginTop: 'auto', maxWidth: 60, maxHeight: 60 },
});

const contentStyles = StyleSheet.create({
  row: { marginBottom: 12 },
  label: { fontWeight: 300, fontSize: 7, marginBottom: 3 },
  main: { fontSize: 9 },
});

interface Info {
  label: string;
  value: string;
}

export interface Project {
  title: string;
  dataset: string;
  projectCreatedDate: string;
  reportCreatedDate: string;
  userName: string;
  coordinate: string;
  description: string;
  logo: string | undefined;
}

interface Props {
  data: Project;
  lang: T.Language;
}

const Project: FC<Props> = ({ data, lang }) => {
  const info: Info[] = [
    {
      label: Texts.dataset[lang],
      value: data.dataset,
    },
    {
      label: Texts.projectCreatedDate[lang],
      value: data.projectCreatedDate,
    },
    {
      label: Texts.reportCreatedDate[lang],
      value: data.reportCreatedDate,
    },
    {
      label: Texts.userName[lang],
      value: data.userName,
    },
    {
      label: Texts.coordinate[lang],
      value: data.coordinate,
    },
    {
      label: Texts.description[lang],
      value: data.description,
    },
  ];

  const projectInfo: ReactNode = info.filter((i) => i.value).map((i) => (
    <View style={contentStyles.row} key={i.label}>
      <Text style={contentStyles.label}>{i.label}</Text>
      <Text style={contentStyles.main}>{i.value}</Text>
    </View>
  ));

  // The library has cors issues about images.
  // https://github.com/diegomura/react-pdf/issues/929
  const projectLogo = data.logo ? (
    <View style={styles.photoWrapper}>
      <Image
        src={{ uri: data.logo, method: 'GET', headers: { 'Cache-Control': 'no-cache, private' }, body: '' }}
        style={styles.photo}
      />
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.label}>{Texts.title[lang]}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>
      <View style={styles.content}>
        {projectInfo}
      </View>
      {projectLogo}
    </View>
  );
};

export default Project;
