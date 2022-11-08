import React, { FC } from 'react';
import { Document, Page, StyleSheet, Font } from '@react-pdf/renderer';

import FrameView, { Frame } from './FrameView';
import ProjectPage, { Project } from './pages/ProjectPage';
import PhotoPage, { Photo } from './pages/PhotoPage';
import MeasurementPage, { Measurement } from './pages/MeasurementPage';
import { FontFamily } from '^/constants/styles';
import palette from '^/constants/palette';
import * as T from '^/types';


const RESOURCE_BUCKET_BASE_URL = 'https://angelswing-resources.s3.ap-northeast-2.amazonaws.com';
const PDF_FONT_BASE_URL = `${RESOURCE_BUCKET_BASE_URL}/fonts`;

const PDF_FONT_LIGHT_URL = `${PDF_FONT_BASE_URL}/NanumBarunGothicLight.ttf`;
const PDF_FONT_REGULAR_URL = `${PDF_FONT_BASE_URL}/NanumBarunGothic.ttf`;
const PDF_FONT_BOLD_URL = `${PDF_FONT_BASE_URL}/NanumBarunGothicBold.ttf`;

Font.register({
  family: FontFamily.NANUMBARUNGOTHIC,
  fonts: [
    { src: PDF_FONT_LIGHT_URL, fontWeight: 300 },
    { src: PDF_FONT_REGULAR_URL, fontWeight: 400 },
    { src: PDF_FONT_BOLD_URL, fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: '100vw',
    height: '100vh',
    padding: '60 40',
    fontFamily: FontFamily.NANUMBARUNGOTHIC,
    fontWeight: 400,
    color: palette.black.toString(),
  },
});

export interface Data {
  frame: Frame;
  project: Project;
  photo: Photo;
  measurement: Measurement;
}

interface Props {
  data: Data;
  lang: T.Language;
}

// This is a React Component for Measurement Report (PDF).
// Can't use Redux context in this component.
// https://github.com/facebook/react/issues/17275
// Since this is a problem with react, please correct the code if it is solved.
const Report: FC<Props> = ({ data, lang }) => (
  <Document>
    <Page style={styles.page}>
      <FrameView data={data.frame} lang={lang} />
      <ProjectPage data={data.project} lang={lang} />
      <PhotoPage data={data.photo} />
      <MeasurementPage data={data.measurement} lang={lang} />
    </Page>
  </Document>
);

export default Report;
