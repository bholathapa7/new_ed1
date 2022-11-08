import React, { FC } from 'react';
import { View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  photoWrapper: {
    height: '100%',
    border: '1 solid #E9E9E9',
  },
});

export interface Photo {
  image: string;
}

interface Props {
  data: Photo;
}

const PhotoPage: FC<Props> = ({ data }) => (
  <View style={styles.photoWrapper}>
    <View>
      {Boolean(data.image) && <Image src={data.image} />}
    </View>
  </View>
);

export default PhotoPage;
