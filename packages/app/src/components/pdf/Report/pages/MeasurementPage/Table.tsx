import React from 'react';
import { Text, View , StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  head: {
    borderBottom: '1 solid #E9E9E9',
    fontWeight: 400,
    marginBottom: 3,
  },
  row:{
    display: 'flex',
    fontSize: 7,
    fontWeight: 300,
    flexDirection: 'row',
  },
  cell: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'left',
    flexWrap: 'wrap',
  },
});

type Row = (string | number)[];

interface Props {
  size: number[];
  children: Row[];
}

const Table = ({ children, size }: Props) => {
  const cells = (row: Row, isHead: boolean) => row.map((cell, index) => (
    <View key={index} style={[styles.cell, { width: size[index], height: 24 }]}>
      {
        !isHead && index === 0
          ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: String(cell), marginLeft: 1 }} />
          : <Text>{cell}</Text>
      }
    </View>
  ));

  const rows = children.map((row, index) => (
    <View key={index} style={[styles.row, index === 0 ? styles.head : {}]} wrap={false}>
      {cells(row, index === 0)}
    </View>
  ));

  return (
    <View style={styles.root}>
      {rows}
    </View>
  );
};

export default Table;
