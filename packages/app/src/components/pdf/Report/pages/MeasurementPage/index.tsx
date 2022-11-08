import React, { FC, ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';

import Table from './Table';
import * as T from '^/types';
import Texts from './text';
import marker from '^/assets/icons/pdf/marker.png';
import length from '^/assets/icons/pdf/length.png';
import area from '^/assets/icons/pdf/area.png';
import volume from '^/assets/icons/pdf/volume.png';
import { L10nDictionary } from '^/utilities/l10n';

const styles = StyleSheet.create({
  root: {
    marginTop: 33,
  },
  measurement: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontWeight: 700,
    fontSize: 10,
    marginRight: 8,
  },
  subTitle: {
    fontWeight: 700,
    fontSize: 9,
    marginBottom: 5,
  },
  table: {
    marginBottom: 30,
  },
  volumeTable: {
    marginBottom: 25,
  },
});

const iconStyles = StyleSheet.create({
  marker: { width: 9, height: 11 },
  length: { width: 10, height: 10 },
  area: { width: 10, height: 10 },
  volume: { width: 10, height: 11 },
});

interface TableInfo {
  title: L10nDictionary;
  head: L10nDictionary[];
  size: number[];
  image: {
    src: string;
    style: Style;
  };
}

interface VolumeTableInfo extends Omit<TableInfo, 'head'> {
  subTitle: Record<T.VolumeCalcMethod, L10nDictionary>;
  head: Record<T.VolumeCalcMethod, L10nDictionary[]>;
}

/* eslint-disable no-magic-numbers */
const MeasurementTable: Record<T.ContentType.MARKER | T.ContentType.LENGTH | T.ContentType.AREA, TableInfo> = {
  [T.ContentType.MARKER]: {
    title: Texts.marker.title,
    head: Texts.marker.head,
    size: [33, 127, 132, 132],
    image: {
      src: marker,
      style: iconStyles.marker,
    },
  },
  [T.ContentType.LENGTH]: {
    title: Texts.length.title,
    head: Texts.length.head,
    size: [33, 127, 132, 132],
    image: {
      src: length,
      style: iconStyles.length,
    },
  },
  [T.ContentType.AREA]: {
    title: Texts.area.title,
    head: Texts.area.head,
    size: [33, 127, 132],
    image: {
      src: area,
      style: iconStyles.area,
    },
  },
};

const VolumeTable: Record<T.ContentType.VOLUME, VolumeTableInfo> = {
  [T.ContentType.VOLUME]: {
    title: Texts.volume.title,
    subTitle: {
      [T.VolumeCalcMethod.BASIC]: Texts.volume.subTitle.basic,
      [T.VolumeCalcMethod.DESIGN]: Texts.volume.subTitle.design,
      [T.VolumeCalcMethod.SURVEY]: Texts.volume.subTitle.survey,
    },
    head: {
      [T.VolumeCalcMethod.BASIC]: Texts.volume.head.basic,
      [T.VolumeCalcMethod.DESIGN]: Texts.volume.head.design,
      [T.VolumeCalcMethod.SURVEY]: Texts.volume.head.survey,
    },
    size: [33, 127, 132, 67, 67],
    image: {
      src: volume,
      style: iconStyles.volume,
    },
  },
};

type Row = (string | number)[];

export interface Measurement {
  [T.ContentType.MARKER]: Row[];
  [T.ContentType.LENGTH]: Row[];
  [T.ContentType.AREA]: Row[];
  [T.ContentType.VOLUME]: Record<T.VolumeCalcMethod, Row[]>;
}

interface Props {
  data: Measurement;
  lang: T.Language;
}

const MeasurementPage: FC<Props> = ({ data, lang }) => {
  const filteredMeasurement = Object.keys(data).filter((type: keyof Measurement) => {
    if (type === T.ContentType.VOLUME) {
      return Object.values(T.VolumeCalcMethod).some((method) => data[type][method].length);
    }
    return data[type].length;
  });

  if (filteredMeasurement.length === 0) return null;

  const tables: ReactNode = filteredMeasurement.map((type: keyof Measurement) => {
    if (type === T.ContentType.VOLUME) {
      const volumeInfo = data[type];
      const table = VolumeTable[type];

      const volumeTables = Object.values(T.VolumeCalcMethod)
        .filter((method) => volumeInfo[method].length)
        .map((method) => (
          <View style={styles.volumeTable} key={method}>
            <Text style={styles.subTitle}>{table.subTitle[method][lang]}</Text>
            <Table
              size={table.size}
              children={[(table.head[method].map((head) => head[lang]) as string[]), ...volumeInfo[method]]}
            />
          </View>
        ));

      return (
        <View key={type}>
          <View style={styles.measurement} wrap={false}>
            <Text style={styles.title}>{table.title[lang]}</Text>
            <Image src={table.image.src} style={table.image.style} />
          </View>
          <View>
            {volumeTables}
          </View>
        </View>
      );
    }

    const table = MeasurementTable[type];
    const contentRows = data[type];
    const tableHead: string[] = table.head.map((h) => h[lang]) as string[];

    return (
      <View key={type} style={styles.table}>
        <View style={styles.measurement} wrap={false}>
          <Text style={styles.title}>{table.title[lang]}</Text>
          <Image src={table.image.src} style={table.image.style} />
        </View>
        <Table
          size={table.size}
          children={[tableHead, ...contentRows]}
        />
      </View>
    );
  });

  return (
    <View style={styles.root}>
      {tables}
    </View>
  );
};

export default MeasurementPage;
