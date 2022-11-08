import { Coordinate } from 'ol/coordinate';
import proj4 from 'proj4';

import * as T from '^/types';
import { L10nDictionary } from './l10n';

const { EASTING, NORTHING, LATITUDE, LONGITUDE, ALTITUDE }: typeof T.CoordinateTitle = T.CoordinateTitle;

/* eslint-disable max-len, max-lines */
export const projectionSystem: Array<[string, string]> = [
  [
    'EPSG:2177',
    '+proj=tmerc +lat_0=0 +lon_0=18 +k=0.999923 +x_0=6500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:2180',
    '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:2932',
    '+proj=tmerc +lat_0=24.45 +lon_0=51.21666666666667 +k=0.99999 +x_0=200000 +y_0=300000 +ellps=intl +towgs84=-119.425,-303.659,-11.0006,1.1643,0.174458,1.09626,3.65706 +units=m +no_defs',
  ],
  [
    'EPSG:3414',
    '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs',
  ],
  [
    'EPSG:5255',
    '+proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:4917',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:4918',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:4919',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:4896',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:5332',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:7789',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:9988',
    '+proj=geocent +ellps=GRS80 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:4326',
    '+proj=longlat +datum=WGS84 +no_defs',
  ],
  [
    'EPSG:5173',
    '+proj=tmerc +lat_0=38 +lon_0=125.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
  ],
  [
    'EPSG:5174',
    '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
  ],
  [
    'EPSG:5175',
    '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=550000 +ellps=bessel +units=m +no_defs  +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
  ],
  [
    'EPSG:5176',
    '+proj=tmerc +lat_0=38 +lon_0=129.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
  ],
  [
    'EPSG:5177',
    '+proj=tmerc +lat_0=38 +lon_0=131.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs  +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43',
  ],
  [
    'EPSG:5182',
    '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=550000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:5185',
    '+proj=tmerc +lat_0=38 +lon_0=125 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:5186',
    '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:5187',
    '+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:5188',
    '+proj=tmerc +lat_0=38 +lon_0=131 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:5387',
    '+proj=utm +zone=18 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
  [
    'EPSG:32652',
    '+proj=utm +zone=52 +datum=WGS84 +units=m +no_defs',
  ],
  [
    'EPSG:23700',
    '+proj=somerc +lat_0=47.1443937222222 +lon_0=19.0485717777778 +k_0=0.99993 +x_0=650000 +y_0=200000 +ellps=GRS67 +towgs84=52.684,-71.194,-13.975,-0.312,-0.1063,-0.3729,1.0191 +units=m +no_defs',
  ],
  [
    'EPSG:32651',
    '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs',
  ],
  [
    'EPSG:32650',
    '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs',
  ],
  [
    'EPSG:32643',
    '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32644',
    '+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32646',
    '+proj=utm +zone=46 +datum=WGS84 +units=m +no_defs',
  ],

  // WSG84 UTM
  [
    'EPSG:32601',
    '+proj=utm +zone=1 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32602',
    '+proj=utm +zone=2 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32603',
    '+proj=utm +zone=3 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32604',
    '+proj=utm +zone=4 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32605',
    '+proj=utm +zone=5 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32606',
    '+proj=utm +zone=6 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32607',
    '+proj=utm +zone=7 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32608',
    '+proj=utm +zone=8 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32609',
    '+proj=utm +zone=9 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32610',
    '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32611',
    '+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32612',
    '+proj=utm +zone=12 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32613',
    '+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32614',
    '+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32615',
    '+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32616',
    '+proj=utm +zone=16 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32617',
    '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32618',
    '+proj=utm +zone=18 +datum=WGS84 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:32619',
    '+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs +type=crs',
  ],

  // NAD83(2011)
  [
    'EPSG:6355',
    '+proj=tmerc +lat_0=30.5 +lon_0=-85.8333333333333 +k=0.99996 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:9748',
    '+proj=tmerc +lat_0=30.5 +lon_0=-85.8333333333333 +k=0.99996 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6356',
    '+proj=tmerc +lat_0=30 +lon_0=-87.5 +k=0.999933333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:9749',
    '+proj=tmerc +lat_0=30 +lon_0=-87.5 +k=0.999933333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6403',
    '+proj=lcc +lat_0=51 +lon_0=-176 +lat_1=53.8333333333333 +lat_2=51.8333333333333 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6395',
    '+proj=tmerc +lat_0=54 +lon_0=-142 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6396',
    '+proj=tmerc +lat_0=54 +lon_0=-146 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6397',
    '+proj=tmerc +lat_0=54 +lon_0=-150 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6398',
    '+proj=tmerc +lat_0=54 +lon_0=-154 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6399',
    '+proj=tmerc +lat_0=54 +lon_0=-158 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6400',
    '+proj=tmerc +lat_0=54 +lon_0=-162 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6401',
    '+proj=tmerc +lat_0=54 +lon_0=-166 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6402',
    '+proj=tmerc +lat_0=54 +lon_0=-170 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6404',
    '+proj=tmerc +lat_0=31 +lon_0=-111.916666666667 +k=0.9999 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6405',
    '+proj=tmerc +lat_0=31 +lon_0=-111.916666666667 +k=0.9999 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6406',
    '+proj=tmerc +lat_0=31 +lon_0=-110.166666666667 +k=0.9999 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6407',
    '+proj=tmerc +lat_0=31 +lon_0=-110.166666666667 +k=0.9999 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6408',
    '+proj=tmerc +lat_0=31 +lon_0=-113.75 +k=0.999933333 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6409',
    '+proj=tmerc +lat_0=31 +lon_0=-113.75 +k=0.999933333 +x_0=213360 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6410',
    '+proj=lcc +lat_0=34.3333333333333 +lon_0=-92 +lat_1=36.2333333333333 +lat_2=34.9333333333333 +x_0=400000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6411',
    '+proj=lcc +lat_0=34.3333333333333 +lon_0=-92 +lat_1=36.2333333333333 +lat_2=34.9333333333333 +x_0=399999.99998984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6412',
    '+proj=lcc +lat_0=32.6666666666667 +lon_0=-92 +lat_1=34.7666666666667 +lat_2=33.3 +x_0=400000 +y_0=400000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6413',
    '+proj=lcc +lat_0=32.6666666666667 +lon_0=-92 +lat_1=34.7666666666667 +lat_2=33.3 +x_0=399999.99998984 +y_0=399999.99998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6415',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-122 +lat_1=41.6666666666667 +lat_2=40 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6416',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-122 +lat_1=41.6666666666667 +lat_2=40 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6417',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-122 +lat_1=39.8333333333333 +lat_2=38.3333333333333 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6418',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-122 +lat_1=39.8333333333333 +lat_2=38.3333333333333 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6419',
    '+proj=lcc +lat_0=36.5 +lon_0=-120.5 +lat_1=38.4333333333333 +lat_2=37.0666666666667 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6420',
    '+proj=lcc +lat_0=36.5 +lon_0=-120.5 +lat_1=38.4333333333333 +lat_2=37.0666666666667 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6421',
    '+proj=lcc +lat_0=35.3333333333333 +lon_0=-119 +lat_1=37.25 +lat_2=36 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6422',
    '+proj=lcc +lat_0=35.3333333333333 +lon_0=-119 +lat_1=37.25 +lat_2=36 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6423',
    '+proj=lcc +lat_0=33.5 +lon_0=-118 +lat_1=35.4666666666667 +lat_2=34.0333333333333 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6424',
    '+proj=lcc +lat_0=33.5 +lon_0=-118 +lat_1=35.4666666666667 +lat_2=34.0333333333333 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6425',
    '+proj=lcc +lat_0=32.1666666666667 +lon_0=-116.25 +lat_1=33.8833333333333 +lat_2=32.7833333333333 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6426',
    '+proj=lcc +lat_0=32.1666666666667 +lon_0=-116.25 +lat_1=33.8833333333333 +lat_2=32.7833333333333 +x_0=2000000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6427',
    '+proj=lcc +lat_0=37.8333333333333 +lon_0=-105.5 +lat_1=39.75 +lat_2=38.45 +x_0=914401.8289 +y_0=304800.6096 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6428',
    '+proj=lcc +lat_0=37.8333333333333 +lon_0=-105.5 +lat_1=39.75 +lat_2=38.45 +x_0=914401.828803657 +y_0=304800.609601219 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6429',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-105.5 +lat_1=40.7833333333333 +lat_2=39.7166666666667 +x_0=914401.8289 +y_0=304800.6096 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6430',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-105.5 +lat_1=40.7833333333333 +lat_2=39.7166666666667 +x_0=914401.828803657 +y_0=304800.609601219 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6431',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-105.5 +lat_1=38.4333333333333 +lat_2=37.2333333333333 +x_0=914401.8289 +y_0=304800.6096 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6432',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-105.5 +lat_1=38.4333333333333 +lat_2=37.2333333333333 +x_0=914401.828803657 +y_0=304800.609601219 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6433',
    '+proj=lcc +lat_0=40.8333333333333 +lon_0=-72.75 +lat_1=41.8666666666667 +lat_2=41.2 +x_0=304800.6096 +y_0=152400.3048 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6434',
    '+proj=lcc +lat_0=40.8333333333333 +lon_0=-72.75 +lat_1=41.8666666666667 +lat_2=41.2 +x_0=304800.609601219 +y_0=152400.30480061 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6435',
    '+proj=tmerc +lat_0=38 +lon_0=-75.4166666666667 +k=0.999995 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6436',
    '+proj=tmerc +lat_0=38 +lon_0=-75.4166666666667 +k=0.999995 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6437',
    '+proj=tmerc +lat_0=24.3333333333333 +lon_0=-81 +k=0.999941177 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6438',
    '+proj=tmerc +lat_0=24.3333333333333 +lon_0=-81 +k=0.999941177 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6440',
    '+proj=lcc +lat_0=29 +lon_0=-84.5 +lat_1=30.75 +lat_2=29.5833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6441',
    '+proj=lcc +lat_0=29 +lon_0=-84.5 +lat_1=30.75 +lat_2=29.5833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6442',
    '+proj=tmerc +lat_0=24.3333333333333 +lon_0=-82 +k=0.999941177 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6443',
    '+proj=tmerc +lat_0=24.3333333333333 +lon_0=-82 +k=0.999941177 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6444',
    '+proj=tmerc +lat_0=30 +lon_0=-82.1666666666667 +k=0.9999 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6445',
    '+proj=tmerc +lat_0=30 +lon_0=-82.1666666666667 +k=0.9999 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6446',
    '+proj=tmerc +lat_0=30 +lon_0=-84.1666666666667 +k=0.9999 +x_0=700000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6447',
    '+proj=tmerc +lat_0=30 +lon_0=-84.1666666666667 +k=0.9999 +x_0=699999.999898399 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6448',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-114 +k=0.999947368 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6449',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-114 +k=0.999947368 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6450',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-112.166666666667 +k=0.999947368 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6451',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-112.166666666667 +k=0.999947368 +x_0=200000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6452',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-115.75 +k=0.999933333 +x_0=800000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6453',
    '+proj=tmerc +lat_0=41.6666666666667 +lon_0=-115.75 +k=0.999933333 +x_0=800000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6454',
    '+proj=tmerc +lat_0=36.6666666666667 +lon_0=-88.3333333333333 +k=0.999975 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6455',
    '+proj=tmerc +lat_0=36.6666666666667 +lon_0=-88.3333333333333 +k=0.999975 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6456',
    '+proj=tmerc +lat_0=36.6666666666667 +lon_0=-90.1666666666667 +k=0.999941177 +x_0=700000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6457',
    '+proj=tmerc +lat_0=36.6666666666667 +lon_0=-90.1666666666667 +k=0.999941177 +x_0=699999.99998984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6458',
    '+proj=tmerc +lat_0=37.5 +lon_0=-85.6666666666667 +k=0.999966667 +x_0=100000 +y_0=250000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6459',
    '+proj=tmerc +lat_0=37.5 +lon_0=-85.6666666666667 +k=0.999966667 +x_0=99999.9998983997 +y_0=249999.9998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6460',
    '+proj=tmerc +lat_0=37.5 +lon_0=-87.0833333333333 +k=0.999966667 +x_0=900000 +y_0=250000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6461',
    '+proj=tmerc +lat_0=37.5 +lon_0=-87.0833333333333 +k=0.999966667 +x_0=900000 +y_0=249999.9998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6462',
    '+proj=lcc +lat_0=41.5 +lon_0=-93.5 +lat_1=43.2666666666667 +lat_2=42.0666666666667 +x_0=1500000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6463',
    '+proj=lcc +lat_0=41.5 +lon_0=-93.5 +lat_1=43.2666666666667 +lat_2=42.0666666666667 +x_0=1500000 +y_0=999999.999989839 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6464',
    '+proj=lcc +lat_0=40 +lon_0=-93.5 +lat_1=41.7833333333333 +lat_2=40.6166666666667 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6465',
    '+proj=lcc +lat_0=40 +lon_0=-93.5 +lat_1=41.7833333333333 +lat_2=40.6166666666667 +x_0=500000.00001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6466',
    '+proj=lcc +lat_0=38.3333333333333 +lon_0=-98 +lat_1=39.7833333333333 +lat_2=38.7166666666667 +x_0=400000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6467',
    '+proj=lcc +lat_0=38.3333333333333 +lon_0=-98 +lat_1=39.7833333333333 +lat_2=38.7166666666667 +x_0=399999.99998984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6468',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-98.5 +lat_1=38.5666666666667 +lat_2=37.2666666666667 +x_0=400000 +y_0=400000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6469',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-98.5 +lat_1=38.5666666666667 +lat_2=37.2666666666667 +x_0=399999.99998984 +y_0=399999.99998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6470',
    '+proj=lcc +lat_0=37.5 +lon_0=-84.25 +lat_1=37.9666666666667 +lat_2=38.9666666666667 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6471',
    '+proj=lcc +lat_0=37.5 +lon_0=-84.25 +lat_1=37.9666666666667 +lat_2=38.9666666666667 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6472',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-85.75 +lat_1=37.0833333333333 +lat_2=38.6666666666667 +x_0=1500000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6473',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-85.75 +lat_1=37.0833333333333 +lat_2=38.6666666666667 +x_0=1500000 +y_0=999999.999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6474',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-85.75 +lat_1=37.9333333333333 +lat_2=36.7333333333333 +x_0=500000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6475',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-85.75 +lat_1=37.9333333333333 +lat_2=36.7333333333333 +x_0=500000.0001016 +y_0=500000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6476',
    '+proj=lcc +lat_0=30.5 +lon_0=-92.5 +lat_1=32.6666666666667 +lat_2=31.1666666666667 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6477',
    '+proj=lcc +lat_0=30.5 +lon_0=-92.5 +lat_1=32.6666666666667 +lat_2=31.1666666666667 +x_0=999999.999989839 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6478',
    '+proj=lcc +lat_0=28.5 +lon_0=-91.3333333333333 +lat_1=30.7 +lat_2=29.3 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6479',
    '+proj=lcc +lat_0=28.5 +lon_0=-91.3333333333333 +lat_1=30.7 +lat_2=29.3 +x_0=999999.999989839 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6483',
    '+proj=tmerc +lat_0=43.6666666666667 +lon_0=-68.5 +k=0.9999 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6484',
    '+proj=tmerc +lat_0=43.6666666666667 +lon_0=-68.5 +k=0.9999 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6485',
    '+proj=tmerc +lat_0=42.8333333333333 +lon_0=-70.1666666666667 +k=0.999966667 +x_0=900000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6486',
    '+proj=tmerc +lat_0=42.8333333333333 +lon_0=-70.1666666666667 +k=0.999966667 +x_0=900000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6487',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-77 +lat_1=39.45 +lat_2=38.3 +x_0=400000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6488',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-77 +lat_1=39.45 +lat_2=38.3 +x_0=399999.9998984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6489',
    '+proj=lcc +lat_0=41 +lon_0=-70.5 +lat_1=41.4833333333333 +lat_2=41.2833333333333 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6490',
    '+proj=lcc +lat_0=41 +lon_0=-70.5 +lat_1=41.4833333333333 +lat_2=41.2833333333333 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6491',
    '+proj=lcc +lat_0=41 +lon_0=-71.5 +lat_1=42.6833333333333 +lat_2=41.7166666666667 +x_0=200000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6492',
    '+proj=lcc +lat_0=41 +lon_0=-71.5 +lat_1=42.6833333333333 +lat_2=41.7166666666667 +x_0=200000.0001016 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6493',
    '+proj=lcc +lat_0=43.3166666666667 +lon_0=-84.3666666666667 +lat_1=45.7 +lat_2=44.1833333333333 +x_0=6000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6494',
    '+proj=lcc +lat_0=43.3166666666667 +lon_0=-84.3666666666667 +lat_1=45.7 +lat_2=44.1833333333333 +x_0=5999999.999976 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6495',
    '+proj=lcc +lat_0=44.7833333333333 +lon_0=-87 +lat_1=47.0833333333333 +lat_2=45.4833333333333 +x_0=8000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6496',
    '+proj=lcc +lat_0=44.7833333333333 +lon_0=-87 +lat_1=47.0833333333333 +lat_2=45.4833333333333 +x_0=7999999.999968 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6498',
    '+proj=lcc +lat_0=41.5 +lon_0=-84.3666666666667 +lat_1=43.6666666666667 +lat_2=42.1 +x_0=4000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6499',
    '+proj=lcc +lat_0=41.5 +lon_0=-84.3666666666667 +lat_1=43.6666666666667 +lat_2=42.1 +x_0=3999999.999984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6500',
    '+proj=lcc +lat_0=45 +lon_0=-94.25 +lat_1=47.05 +lat_2=45.6166666666667 +x_0=800000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6501',
    '+proj=lcc +lat_0=45 +lon_0=-94.25 +lat_1=47.05 +lat_2=45.6166666666667 +x_0=800000.00001016 +y_0=99999.9999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6502',
    '+proj=lcc +lat_0=46.5 +lon_0=-93.1 +lat_1=48.6333333333333 +lat_2=47.0333333333333 +x_0=800000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6503',
    '+proj=lcc +lat_0=46.5 +lon_0=-93.1 +lat_1=48.6333333333333 +lat_2=47.0333333333333 +x_0=800000.00001016 +y_0=99999.9999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6504',
    '+proj=lcc +lat_0=43 +lon_0=-94 +lat_1=45.2166666666667 +lat_2=43.7833333333333 +x_0=800000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6505',
    '+proj=lcc +lat_0=43 +lon_0=-94 +lat_1=45.2166666666667 +lat_2=43.7833333333333 +x_0=800000.00001016 +y_0=99999.9999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6506',
    '+proj=tmerc +lat_0=29.5 +lon_0=-88.8333333333333 +k=0.99995 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6507',
    '+proj=tmerc +lat_0=29.5 +lon_0=-88.8333333333333 +k=0.99995 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6509',
    '+proj=tmerc +lat_0=29.5 +lon_0=-90.3333333333333 +k=0.99995 +x_0=700000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6510',
    '+proj=tmerc +lat_0=29.5 +lon_0=-90.3333333333333 +k=0.99995 +x_0=699999.999898399 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6511',
    '+proj=tmerc +lat_0=35.8333333333333 +lon_0=-92.5 +k=0.999933333 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6512',
    '+proj=tmerc +lat_0=35.8333333333333 +lon_0=-90.5 +k=0.999933333 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6513',
    '+proj=tmerc +lat_0=36.1666666666667 +lon_0=-94.5 +k=0.999941177 +x_0=850000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6514',
    '+proj=lcc +lat_0=44.25 +lon_0=-109.5 +lat_1=49 +lat_2=45 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6515',
    '+proj=lcc +lat_0=44.25 +lon_0=-109.5 +lat_1=49 +lat_2=45 +x_0=599999.9999976 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6516',
    '+proj=lcc +lat_0=39.8333333333333 +lon_0=-100 +lat_1=43 +lat_2=40 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6880',
    '+proj=lcc +lat_0=39.8333333333333 +lon_0=-100 +lat_1=43 +lat_2=40 +x_0=500000.00001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6518',
    '+proj=tmerc +lat_0=34.75 +lon_0=-116.666666666667 +k=0.9999 +x_0=500000 +y_0=6000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6519',
    '+proj=tmerc +lat_0=34.75 +lon_0=-116.666666666667 +k=0.9999 +x_0=500000.00001016 +y_0=6000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6520',
    '+proj=tmerc +lat_0=34.75 +lon_0=-115.583333333333 +k=0.9999 +x_0=200000 +y_0=8000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6521',
    '+proj=tmerc +lat_0=34.75 +lon_0=-115.583333333333 +k=0.9999 +x_0=200000.00001016 +y_0=8000000.00001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6522',
    '+proj=tmerc +lat_0=34.75 +lon_0=-118.583333333333 +k=0.9999 +x_0=800000 +y_0=4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6523',
    '+proj=tmerc +lat_0=34.75 +lon_0=-118.583333333333 +k=0.9999 +x_0=800000.00001016 +y_0=3999999.99998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6524',
    '+proj=tmerc +lat_0=42.5 +lon_0=-71.6666666666667 +k=0.999966667 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6525',
    '+proj=tmerc +lat_0=42.5 +lon_0=-71.6666666666667 +k=0.999966667 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6526',
    '+proj=tmerc +lat_0=38.8333333333333 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6527',
    '+proj=tmerc +lat_0=38.8333333333333 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6528',
    '+proj=tmerc +lat_0=31 +lon_0=-106.25 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6529',
    '+proj=tmerc +lat_0=31 +lon_0=-106.25 +k=0.9999 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6530',
    '+proj=tmerc +lat_0=31 +lon_0=-104.333333333333 +k=0.999909091 +x_0=165000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6531',
    '+proj=tmerc +lat_0=31 +lon_0=-104.333333333333 +k=0.999909091 +x_0=165000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6532',
    '+proj=tmerc +lat_0=31 +lon_0=-107.833333333333 +k=0.999916667 +x_0=830000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6533',
    '+proj=tmerc +lat_0=31 +lon_0=-107.833333333333 +k=0.999916667 +x_0=830000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6534',
    '+proj=tmerc +lat_0=40 +lon_0=-76.5833333333333 +k=0.9999375 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6535',
    '+proj=tmerc +lat_0=40 +lon_0=-76.5833333333333 +k=0.9999375 +x_0=249999.9998984 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6536',
    '+proj=tmerc +lat_0=38.8333333333333 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6537',
    '+proj=tmerc +lat_0=38.8333333333333 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6538',
    '+proj=lcc +lat_0=40.1666666666667 +lon_0=-74 +lat_1=41.0333333333333 +lat_2=40.6666666666667 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6539',
    '+proj=lcc +lat_0=40.1666666666667 +lon_0=-74 +lat_1=41.0333333333333 +lat_2=40.6666666666667 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6540',
    '+proj=tmerc +lat_0=40 +lon_0=-78.5833333333333 +k=0.9999375 +x_0=350000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6541',
    '+proj=tmerc +lat_0=40 +lon_0=-78.5833333333333 +k=0.9999375 +x_0=350000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6542',
    '+proj=lcc +lat_0=33.75 +lon_0=-79 +lat_1=36.1666666666667 +lat_2=34.3333333333333 +x_0=609601.22 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6543',
    '+proj=lcc +lat_0=33.75 +lon_0=-79 +lat_1=36.1666666666667 +lat_2=34.3333333333333 +x_0=609601.219202438 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6544',
    '+proj=lcc +lat_0=47 +lon_0=-100.5 +lat_1=48.7333333333333 +lat_2=47.4333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6545',
    '+proj=lcc +lat_0=47 +lon_0=-100.5 +lat_1=48.7333333333333 +lat_2=47.4333333333333 +x_0=599999.9999976 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6546',
    '+proj=lcc +lat_0=45.6666666666667 +lon_0=-100.5 +lat_1=47.4833333333333 +lat_2=46.1833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6547',
    '+proj=lcc +lat_0=45.6666666666667 +lon_0=-100.5 +lat_1=47.4833333333333 +lat_2=46.1833333333333 +x_0=599999.9999976 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6548',
    '+proj=lcc +lat_0=39.6666666666667 +lon_0=-82.5 +lat_1=41.7 +lat_2=40.4333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6549',
    '+proj=lcc +lat_0=39.6666666666667 +lon_0=-82.5 +lat_1=41.7 +lat_2=40.4333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6550',
    '+proj=lcc +lat_0=38 +lon_0=-82.5 +lat_1=40.0333333333333 +lat_2=38.7333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6551',
    '+proj=lcc +lat_0=38 +lon_0=-82.5 +lat_1=40.0333333333333 +lat_2=38.7333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6552',
    '+proj=lcc +lat_0=35 +lon_0=-98 +lat_1=36.7666666666667 +lat_2=35.5666666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6553',
    '+proj=lcc +lat_0=35 +lon_0=-98 +lat_1=36.7666666666667 +lat_2=35.5666666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6554',
    '+proj=lcc +lat_0=33.3333333333333 +lon_0=-98 +lat_1=35.2333333333333 +lat_2=33.9333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6555',
    '+proj=lcc +lat_0=33.3333333333333 +lon_0=-98 +lat_1=35.2333333333333 +lat_2=33.9333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6558',
    '+proj=lcc +lat_0=43.6666666666667 +lon_0=-120.5 +lat_1=46 +lat_2=44.3333333333333 +x_0=2500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6559',
    '+proj=lcc +lat_0=43.6666666666667 +lon_0=-120.5 +lat_1=46 +lat_2=44.3333333333333 +x_0=2500000.0001424 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6560',
    '+proj=lcc +lat_0=41.6666666666667 +lon_0=-120.5 +lat_1=44 +lat_2=42.3333333333333 +x_0=1500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6561',
    '+proj=lcc +lat_0=41.6666666666667 +lon_0=-120.5 +lat_1=44 +lat_2=42.3333333333333 +x_0=1500000.0001464 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6562',
    '+proj=lcc +lat_0=40.1666666666667 +lon_0=-77.75 +lat_1=41.95 +lat_2=40.8833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6563',
    '+proj=lcc +lat_0=40.1666666666667 +lon_0=-77.75 +lat_1=41.95 +lat_2=40.8833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6564',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-77.75 +lat_1=40.9666666666667 +lat_2=39.9333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6565',
    '+proj=lcc +lat_0=39.3333333333333 +lon_0=-77.75 +lat_1=40.9666666666667 +lat_2=39.9333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6567',
    '+proj=tmerc +lat_0=41.0833333333333 +lon_0=-71.5 +k=0.99999375 +x_0=100000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6568',
    '+proj=tmerc +lat_0=41.0833333333333 +lon_0=-71.5 +k=0.99999375 +x_0=99999.9999898399 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6569',
    '+proj=lcc +lat_0=31.8333333333333 +lon_0=-81 +lat_1=34.8333333333333 +lat_2=32.5 +x_0=609600 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6570',
    '+proj=lcc +lat_0=31.8333333333333 +lon_0=-81 +lat_1=34.8333333333333 +lat_2=32.5 +x_0=609600 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs',
  ],
  [
    'EPSG:6571',
    '+proj=lcc +lat_0=43.8333333333333 +lon_0=-100 +lat_1=45.6833333333333 +lat_2=44.4166666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6572',
    '+proj=lcc +lat_0=43.8333333333333 +lon_0=-100 +lat_1=45.6833333333333 +lat_2=44.4166666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6573',
    '+proj=lcc +lat_0=42.3333333333333 +lon_0=-100.333333333333 +lat_1=44.4 +lat_2=42.8333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6574',
    '+proj=lcc +lat_0=42.3333333333333 +lon_0=-100.333333333333 +lat_1=44.4 +lat_2=42.8333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6575',
    '+proj=lcc +lat_0=34.3333333333333 +lon_0=-86 +lat_1=36.4166666666667 +lat_2=35.25 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6576',
    '+proj=lcc +lat_0=34.3333333333333 +lon_0=-86 +lat_1=36.4166666666667 +lat_2=35.25 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6577',
    '+proj=lcc +lat_0=29.6666666666667 +lon_0=-100.333333333333 +lat_1=31.8833333333333 +lat_2=30.1166666666667 +x_0=700000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6578',
    '+proj=lcc +lat_0=29.6666666666667 +lon_0=-100.333333333333 +lat_1=31.8833333333333 +lat_2=30.1166666666667 +x_0=699999.999898399 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6581',
    '+proj=lcc +lat_0=34 +lon_0=-101.5 +lat_1=36.1833333333333 +lat_2=34.65 +x_0=200000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6582',
    '+proj=lcc +lat_0=34 +lon_0=-101.5 +lat_1=36.1833333333333 +lat_2=34.65 +x_0=200000.0001016 +y_0=999999.999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6583',
    '+proj=lcc +lat_0=31.6666666666667 +lon_0=-98.5 +lat_1=33.9666666666667 +lat_2=32.1333333333333 +x_0=600000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6584',
    '+proj=lcc +lat_0=31.6666666666667 +lon_0=-98.5 +lat_1=33.9666666666667 +lat_2=32.1333333333333 +x_0=600000 +y_0=2000000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6585',
    '+proj=lcc +lat_0=25.6666666666667 +lon_0=-98.5 +lat_1=27.8333333333333 +lat_2=26.1666666666667 +x_0=300000 +y_0=5000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6586',
    '+proj=lcc +lat_0=25.6666666666667 +lon_0=-98.5 +lat_1=27.8333333333333 +lat_2=26.1666666666667 +x_0=300000 +y_0=5000000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6587',
    '+proj=lcc +lat_0=27.8333333333333 +lon_0=-99 +lat_1=30.2833333333333 +lat_2=28.3833333333333 +x_0=600000 +y_0=4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6588',
    '+proj=lcc +lat_0=27.8333333333333 +lon_0=-99 +lat_1=30.2833333333333 +lat_2=28.3833333333333 +x_0=600000 +y_0=3999999.9998984 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6619',
    '+proj=lcc +lat_0=38.3333333333333 +lon_0=-111.5 +lat_1=40.65 +lat_2=39.0166666666667 +x_0=500000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6625',
    '+proj=lcc +lat_0=38.3333333333333 +lon_0=-111.5 +lat_1=40.65 +lat_2=39.0166666666667 +x_0=500000.00001016 +y_0=2000000.00001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6620',
    '+proj=lcc +lat_0=40.3333333333333 +lon_0=-111.5 +lat_1=41.7833333333333 +lat_2=40.7166666666667 +x_0=500000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6626',
    '+proj=lcc +lat_0=40.3333333333333 +lon_0=-111.5 +lat_1=41.7833333333333 +lat_2=40.7166666666667 +x_0=500000.00001016 +y_0=999999.999989839 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6621',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-111.5 +lat_1=38.35 +lat_2=37.2166666666667 +x_0=500000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6627',
    '+proj=lcc +lat_0=36.6666666666667 +lon_0=-111.5 +lat_1=38.35 +lat_2=37.2166666666667 +x_0=500000.00001016 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6589',
    '+proj=tmerc +lat_0=42.5 +lon_0=-72.5 +k=0.999964286 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6590',
    '+proj=tmerc +lat_0=42.5 +lon_0=-72.5 +k=0.999964286 +x_0=500000.00001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6592',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-78.5 +lat_1=39.2 +lat_2=38.0333333333333 +x_0=3500000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6593',
    '+proj=lcc +lat_0=37.6666666666667 +lon_0=-78.5 +lat_1=39.2 +lat_2=38.0333333333333 +x_0=3500000.0001016 +y_0=2000000.0001016 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6594',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-78.5 +lat_1=37.9666666666667 +lat_2=36.7666666666667 +x_0=3500000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6595',
    '+proj=lcc +lat_0=36.3333333333333 +lon_0=-78.5 +lat_1=37.9666666666667 +lat_2=36.7666666666667 +x_0=3500000.0001016 +y_0=999999.999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6598',
    '+proj=lcc +lat_0=45.3333333333333 +lon_0=-120.5 +lat_1=47.3333333333333 +lat_2=45.8333333333333 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6599',
    '+proj=lcc +lat_0=45.3333333333333 +lon_0=-120.5 +lat_1=47.3333333333333 +lat_2=45.8333333333333 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6600',
    '+proj=lcc +lat_0=38.5 +lon_0=-79.5 +lat_1=40.25 +lat_2=39 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6601',
    '+proj=lcc +lat_0=38.5 +lon_0=-79.5 +lat_1=40.25 +lat_2=39 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6602',
    '+proj=lcc +lat_0=37 +lon_0=-81 +lat_1=38.8833333333333 +lat_2=37.4833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6603',
    '+proj=lcc +lat_0=37 +lon_0=-81 +lat_1=38.8833333333333 +lat_2=37.4833333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6879',
    '+proj=lcc +lat_0=43.8333333333333 +lon_0=-90 +lat_1=45.5 +lat_2=44.25 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6605',
    '+proj=lcc +lat_0=43.8333333333333 +lon_0=-90 +lat_1=45.5 +lat_2=44.25 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6606',
    '+proj=lcc +lat_0=45.1666666666667 +lon_0=-90 +lat_1=46.7666666666667 +lat_2=45.5666666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6607',
    '+proj=lcc +lat_0=45.1666666666667 +lon_0=-90 +lat_1=46.7666666666667 +lat_2=45.5666666666667 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6608',
    '+proj=lcc +lat_0=42 +lon_0=-90 +lat_1=44.0666666666667 +lat_2=42.7333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6609',
    '+proj=lcc +lat_0=42 +lon_0=-90 +lat_1=44.0666666666667 +lat_2=42.7333333333333 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6611',
    '+proj=tmerc +lat_0=40.5 +lon_0=-105.166666666667 +k=0.9999375 +x_0=200000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6612',
    '+proj=tmerc +lat_0=40.5 +lon_0=-105.166666666667 +k=0.9999375 +x_0=200000.00001016 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6613',
    '+proj=tmerc +lat_0=40.5 +lon_0=-107.333333333333 +k=0.9999375 +x_0=400000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6614',
    '+proj=tmerc +lat_0=40.5 +lon_0=-107.333333333333 +k=0.9999375 +x_0=399999.99998984 +y_0=99999.9999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6615',
    '+proj=tmerc +lat_0=40.5 +lon_0=-110.083333333333 +k=0.9999375 +x_0=800000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6616',
    '+proj=tmerc +lat_0=40.5 +lon_0=-110.083333333333 +k=0.9999375 +x_0=800000.00001016 +y_0=99999.9999898399 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
  [
    'EPSG:6617',
    '+proj=tmerc +lat_0=40.5 +lon_0=-108.75 +k=0.9999375 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  ],
  [
    'EPSG:6618',
    '+proj=tmerc +lat_0=40.5 +lon_0=-108.75 +k=0.9999375 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs',
  ],
];

export const projectionSystemLabel: { [key in T.CoordinateSystem]: L10nDictionary } = {
  GRS80_EPSG_5182_EN: {
    [T.Language.KO_KR]: '제주원점(GRS80) - EPSG:5182',
    [T.Language.EN_US]: 'Korea2000/Central Belt Jeju - EPSG:5182',
  },
  GRS80_EPSG_5185_EN: {
    [T.Language.KO_KR]: '서부원점(GRS80) - EPSG:5185',
    [T.Language.EN_US]: 'Korea2000/West Belt 2010 - EPSG:5185',
  },
  GRS80_EPSG_5186_EN: {
    [T.Language.KO_KR]: '중부원점(GRS80) - EPSG:5186',
    [T.Language.EN_US]: 'Korea2000/Central Belt 2010 - EPSG:5186',
  },
  GRS80_EPSG_5187_EN: {
    [T.Language.KO_KR]: '동부원점(GRS80) - EPSG:5187',
    [T.Language.EN_US]: 'Korea2000/East Belt 2010 - EPSG:5187',
  },
  GRS80_EPSG_5188_EN: {
    [T.Language.KO_KR]: '동해(울릉)원점(GRS80) - EPSG:5188',
    [T.Language.EN_US]: 'Korea2000/East Sea Belt 2010 - EPSG:5188',
  },
  WGS84_EPSG_4326_LL: {
    [T.Language.KO_KR]: 'WGS84 경위도 - EPSG:4326',
    [T.Language.EN_US]: 'WGS84-EPSG4326',
  },
  WGS84_EPSG_32652_EN: {
    [T.Language.KO_KR]: 'UTM52N (WGS84) - EPSG:32652',
    [T.Language.EN_US]: 'WGS 84/UTM zone 52N - EPSG:32652',
  },
  WGS84_EPSG_32651_EN: {
    [T.Language.KO_KR]: 'UTM51N (WGS84) - EPSG:32651',
    [T.Language.EN_US]: 'WGS 84/UTM zone 51N - EPSG:32651',
  },
  WGS84_EPSG_32650_EN: {
    [T.Language.KO_KR]: 'UTM50N (WGS84) - EPSG:32650',
    [T.Language.EN_US]: 'WGS 84/UTM zone 50N - EPSG:32650',
  },
  WGS84_EPSG_3414_EN: {
    [T.Language.KO_KR]: 'SVY21/Singapore TM - EPSG:3414',
    [T.Language.EN_US]: 'SVY21/Singapore TM - EPSG:3414',
  },
  GRS80_EPSG_5255_EN: {
    [T.Language.KO_KR]: 'TUREF / TM33 - EPSG:5255',
    [T.Language.EN_US]: 'TUREF / TM33 - EPSG:5255',
  },
  GRS80_EPSG_4917_EN: {
    [T.Language.KO_KR]: 'ITRF96 - EPSG:4917',
    [T.Language.EN_US]: 'ITRF96 - EPSG:4917',
  },
  GRS80_EPSG_4918_EN: {
    [T.Language.KO_KR]: 'ITRF97 - EPSG:4918',
    [T.Language.EN_US]: 'ITRF97 - EPSG:4918',
  },
  GRS80_EPSG_4919_EN: {
    [T.Language.KO_KR]: 'ITRF2000 - EPSG:4919',
    [T.Language.EN_US]: 'ITRF2000 - EPSG:4919',
  },
  GRS80_EPSG_4896_EN: {
    [T.Language.KO_KR]: 'ITRF2005 - EPSG:4896',
    [T.Language.EN_US]: 'ITRF2005 - EPSG:4896',
  },
  GRS80_EPSG_5332_EN: {
    [T.Language.KO_KR]: 'ITRF2008 - EPSG:5332',
    [T.Language.EN_US]: 'ITRF2008 - EPSG:5332',
  },
  GRS80_EPSG_7789_EN: {
    [T.Language.KO_KR]: 'ITRF2014 - EPSG:7789',
    [T.Language.EN_US]: 'ITRF2014 - EPSG:7789',
  },
  GRS80_EPSG_9988_EN: {
    [T.Language.KO_KR]: 'ITRF2020 - EPSG:9988',
    [T.Language.EN_US]: 'ITRF2020 - EPSG:9988',
  },

  WGS84_EPSG_32646_EN: {
    [T.Language.KO_KR]: 'UTM46N (WGS84) - EPSG:32646',
    [T.Language.EN_US]: 'WGS 84/UTM zone 46N - EPSG:32646',
  },
  WGS84_EPSG_32644_EN: {
    [T.Language.KO_KR]: 'UTM44N (WGS84) - EPSG:32644',
    [T.Language.EN_US]: 'WGS 84/UTM zone 44N - EPSG:32644',
  },
  WGS84_EPSG_32643_EN: {
    [T.Language.KO_KR]: 'UTM43N (WGS84) - EPSG:32643',
    [T.Language.EN_US]: 'WGS 84/UTM zone 43N - EPSG:32643',
  },

  WGS84_EPSG_32601_EN: {
    [T.Language.KO_KR]: 'UTM01N (WGS84) - EPSG:32601',
    [T.Language.EN_US]: 'WGS 84/UTM zone 01N - EPSG:32601',
  },
  WGS84_EPSG_32602_EN: {
    [T.Language.KO_KR]: 'UTM02N (WGS84) - EPSG:32602',
    [T.Language.EN_US]: 'WGS 84/UTM zone 02N - EPSG:32602',
  },
  WGS84_EPSG_32603_EN: {
    [T.Language.KO_KR]: 'UTM03N (WGS84) - EPSG:32603',
    [T.Language.EN_US]: 'WGS 84/UTM zone 03N - EPSG:32603',
  },
  WGS84_EPSG_32604_EN: {
    [T.Language.KO_KR]: 'UTM04N (WGS84) - EPSG:32604',
    [T.Language.EN_US]: 'WGS 84/UTM zone 04N - EPSG:32604',
  },
  WGS84_EPSG_32605_EN: {
    [T.Language.KO_KR]: 'UTM05N (WGS84) - EPSG:32605',
    [T.Language.EN_US]: 'WGS 84/UTM zone 05N - EPSG:32605',
  },
  WGS84_EPSG_32606_EN: {
    [T.Language.KO_KR]: 'UTM06N (WGS84) - EPSG:32606',
    [T.Language.EN_US]: 'WGS 84/UTM zone 06N - EPSG:32606',
  },
  WGS84_EPSG_32607_EN: {
    [T.Language.KO_KR]: 'UTM07N (WGS84) - EPSG:32607',
    [T.Language.EN_US]: 'WGS 84/UTM zone 07N - EPSG:32607',
  },
  WGS84_EPSG_32608_EN: {
    [T.Language.KO_KR]: 'UTM08N (WGS84) - EPSG:32608',
    [T.Language.EN_US]: 'WGS 84/UTM zone 08N - EPSG:32608',
  },
  WGS84_EPSG_32609_EN: {
    [T.Language.KO_KR]: 'UTM09N (WGS84) - EPSG:32609',
    [T.Language.EN_US]: 'WGS 84/UTM zone 09N - EPSG:32609',
  },
  WGS84_EPSG_32610_EN: {
    [T.Language.KO_KR]: 'UTM10N (WGS84) - EPSG:32610',
    [T.Language.EN_US]: 'WGS 84/UTM zone 10N - EPSG:32610',
  },
  WGS84_EPSG_32611_EN: {
    [T.Language.KO_KR]: 'UTM11N (WGS84) - EPSG:32611',
    [T.Language.EN_US]: 'WGS 84/UTM zone 11N - EPSG:32611',
  },
  WGS84_EPSG_32612_EN: {
    [T.Language.KO_KR]: 'UTM12N (WGS84) - EPSG:32612',
    [T.Language.EN_US]: 'WGS 84/UTM zone 12N - EPSG:32612',
  },
  WGS84_EPSG_32613_EN: {
    [T.Language.KO_KR]: 'UTM13N (WGS84) - EPSG:32613',
    [T.Language.EN_US]: 'WGS 84/UTM zone 13N - EPSG:32613',
  },
  WGS84_EPSG_32614_EN: {
    [T.Language.KO_KR]: 'UTM14N (WGS84) - EPSG:32614',
    [T.Language.EN_US]: 'WGS 84/UTM zone 14N - EPSG:32614',
  },
  WGS84_EPSG_32615_EN: {
    [T.Language.KO_KR]: 'UTM15N (WGS84) - EPSG:32615',
    [T.Language.EN_US]: 'WGS 84/UTM zone 15N - EPSG:32615',
  },
  WGS84_EPSG_32616_EN: {
    [T.Language.KO_KR]: 'UTM16N (WGS84) - EPSG:32616',
    [T.Language.EN_US]: 'WGS 84/UTM zone 16N - EPSG:32616',
  },
  WGS84_EPSG_32617_EN: {
    [T.Language.KO_KR]: 'UTM17N (WGS84) - EPSG:32617',
    [T.Language.EN_US]: 'WGS 84/UTM zone 17N - EPSG:32617',
  },
  WGS84_EPSG_32618_EN: {
    [T.Language.KO_KR]: 'UTM18N (WGS84) - EPSG:32618',
    [T.Language.EN_US]: 'WGS 84/UTM zone 18N - EPSG:32618',
  },
  WGS84_EPSG_32619_EN: {
    [T.Language.KO_KR]: 'UTM19N (WGS84) - EPSG:32619',
    [T.Language.EN_US]: 'WGS 84/UTM zone 19N - EPSG:32619',
  },


  WGS84_EPSG_6355_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alabama East - EPSG:6355',
    [T.Language.EN_US]: 'NAD83(2011) / Alabama East - EPSG:6355',
  },
  WGS84_EPSG_9748_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alabama East (ftUS) - EPSG:9748',
    [T.Language.EN_US]: 'NAD83(2011) / Alabama East (ftUS) - EPSG:9748',
  },
  WGS84_EPSG_6356_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alabama West - EPSG:6356',
    [T.Language.EN_US]: 'NAD83(2011) / Alabama West - EPSG:6356',
  },
  WGS84_EPSG_9749_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alabama West (ftUS) - EPSG:9749',
    [T.Language.EN_US]: 'NAD83(2011) / Alabama West (ftUS) - EPSG:9749',
  },
  WGS84_EPSG_6403_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 10 - EPSG:6403',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 10 - EPSG:6403',
  },
  WGS84_EPSG_6395_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 2 - EPSG:6395',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 2 - EPSG:6395',
  },
  WGS84_EPSG_6396_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 3 - EPSG:6396',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 3 - EPSG:6396',
  },
  WGS84_EPSG_6397_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 4 - EPSG:6397',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 4 - EPSG:6397',
  },
  WGS84_EPSG_6398_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 5 - EPSG:6398',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 5 - EPSG:6398',
  },
  WGS84_EPSG_6399_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 6 - EPSG:6399',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 6 - EPSG:6399',
  },
  WGS84_EPSG_6400_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 7 - EPSG:6400',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 7 - EPSG:6400',
  },
  WGS84_EPSG_6401_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 8 - EPSG:6401',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 8 - EPSG:6401',
  },
  WGS84_EPSG_6402_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Alaska zone 9 - EPSG:6402',
    [T.Language.EN_US]: 'NAD83(2011) / Alaska zone 9 - EPSG:6402',
  },
  WGS84_EPSG_6404_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona Central - EPSG:6404',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona Central - EPSG:6404',
  },
  WGS84_EPSG_6405_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona Central (ft) - EPSG:6405',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona Central (ft) - EPSG:6405',
  },
  WGS84_EPSG_6406_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona East - EPSG:6406',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona East - EPSG:6406',
  },
  WGS84_EPSG_6407_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona East (ft) - EPSG:6407',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona East (ft) - EPSG:6407',
  },
  WGS84_EPSG_6408_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona West - EPSG:6408',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona West - EPSG:6408',
  },
  WGS84_EPSG_6409_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arizona West (ft) - EPSG:6409',
    [T.Language.EN_US]: 'NAD83(2011) / Arizona West (ft) - EPSG:6409',
  },
  WGS84_EPSG_6410_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arkansas North - EPSG:6410',
    [T.Language.EN_US]: 'NAD83(2011) / Arkansas North - EPSG:6410',
  },
  WGS84_EPSG_6411_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arkansas North (ftUS) - EPSG:6411',
    [T.Language.EN_US]: 'NAD83(2011) / Arkansas North (ftUS) - EPSG:6411',
  },
  WGS84_EPSG_6412_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arkansas South - EPSG:6412',
    [T.Language.EN_US]: 'NAD83(2011) / Arkansas South - EPSG:6412',
  },
  WGS84_EPSG_6413_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Arkansas South (ftUS) - EPSG:6413',
    [T.Language.EN_US]: 'NAD83(2011) / Arkansas South (ftUS) - EPSG:6413',
  },
  WGS84_EPSG_6415_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 1 - EPSG:6415',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 1 - EPSG:6415',
  },
  WGS84_EPSG_6416_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 1 (ftUS) - EPSG:6416',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 1 (ftUS) - EPSG:6416',
  },
  WGS84_EPSG_6417_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 2 - EPSG:6417',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 2 - EPSG:6417',
  },
  WGS84_EPSG_6418_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 2 (ftUS) - EPSG:6418',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 2 (ftUS) - EPSG:6418',
  },
  WGS84_EPSG_6419_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 3 - EPSG:6419',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 3 - EPSG:6419',
  },
  WGS84_EPSG_6420_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 3 (ftUS) - EPSG:6420',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 3 (ftUS) - EPSG:6420',
  },
  WGS84_EPSG_6421_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 4 - EPSG:6421',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 4 - EPSG:6421',
  },
  WGS84_EPSG_6422_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 4 (ftUS) - EPSG:6422',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 4 (ftUS) - EPSG:6422',
  },
  WGS84_EPSG_6423_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 5 - EPSG:6423',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 5 - EPSG:6423',
  },
  WGS84_EPSG_6424_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 5 (ftUS) - EPSG:6424',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 5 (ftUS) - EPSG:6424',
  },
  WGS84_EPSG_6425_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 6 - EPSG:6425',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 6 - EPSG:6425',
  },
  WGS84_EPSG_6426_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / California zone 6 (ftUS) - EPSG:6426',
    [T.Language.EN_US]: 'NAD83(2011) / California zone 6 (ftUS) - EPSG:6426',
  },
  WGS84_EPSG_6427_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado Central - EPSG:6427',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado Central - EPSG:6427',
  },
  WGS84_EPSG_6428_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado Central (ftUS) - EPSG:6428',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado Central (ftUS) - EPSG:6428',
  },
  WGS84_EPSG_6429_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado North - EPSG:6429',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado North - EPSG:6429',
  },
  WGS84_EPSG_6430_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado North (ftUS) - EPSG:6430',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado North (ftUS) - EPSG:6430',
  },
  WGS84_EPSG_6431_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado South - EPSG:6431',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado South - EPSG:6431',
  },
  WGS84_EPSG_6432_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Colorado South (ftUS) - EPSG:6432',
    [T.Language.EN_US]: 'NAD83(2011) / Colorado South (ftUS) - EPSG:6432',
  },
  WGS84_EPSG_6433_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Connecticut - EPSG:6433',
    [T.Language.EN_US]: 'NAD83(2011) / Connecticut - EPSG:6433',
  },
  WGS84_EPSG_6434_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Connecticut (ftUS) - EPSG:6434',
    [T.Language.EN_US]: 'NAD83(2011) / Connecticut (ftUS) - EPSG:6434',
  },
  WGS84_EPSG_6435_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Delaware - EPSG:6435',
    [T.Language.EN_US]: 'NAD83(2011) / Delaware - EPSG:6435',
  },
  WGS84_EPSG_6436_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Delaware (ftUS) - EPSG:6436',
    [T.Language.EN_US]: 'NAD83(2011) / Delaware (ftUS) - EPSG:6436',
  },
  WGS84_EPSG_6437_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida East - EPSG:6437',
    [T.Language.EN_US]: 'NAD83(2011) / Florida East - EPSG:6437',
  },
  WGS84_EPSG_6438_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida East (ftUS) - EPSG:6438',
    [T.Language.EN_US]: 'NAD83(2011) / Florida East (ftUS) - EPSG:6438',
  },
  WGS84_EPSG_6440_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida North - EPSG:6440',
    [T.Language.EN_US]: 'NAD83(2011) / Florida North - EPSG:6440',
  },
  WGS84_EPSG_6441_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida North (ftUS) - EPSG:6441',
    [T.Language.EN_US]: 'NAD83(2011) / Florida North (ftUS) - EPSG:6441',
  },
  WGS84_EPSG_6442_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida West - EPSG:6442',
    [T.Language.EN_US]: 'NAD83(2011) / Florida West - EPSG:6442',
  },
  WGS84_EPSG_6443_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Florida West (ftUS) - EPSG:6443',
    [T.Language.EN_US]: 'NAD83(2011) / Florida West (ftUS) - EPSG:6443',
  },
  WGS84_EPSG_6444_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Georgia East - EPSG:6444',
    [T.Language.EN_US]: 'NAD83(2011) / Georgia East - EPSG:6444',
  },
  WGS84_EPSG_6445_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Georgia East (ftUS) - EPSG:6445',
    [T.Language.EN_US]: 'NAD83(2011) / Georgia East (ftUS) - EPSG:6445',
  },
  WGS84_EPSG_6446_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Georgia West - EPSG:6446',
    [T.Language.EN_US]: 'NAD83(2011) / Georgia West - EPSG:6446',
  },
  WGS84_EPSG_6447_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Georgia West (ftUS) - EPSG:6447',
    [T.Language.EN_US]: 'NAD83(2011) / Georgia West (ftUS) - EPSG:6447',
  },
  WGS84_EPSG_6448_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho Central - EPSG:6448',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho Central - EPSG:6448',
  },
  WGS84_EPSG_6449_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho Central (ftUS) - EPSG:6449',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho Central (ftUS) - EPSG:6449',
  },
  WGS84_EPSG_6450_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho East - EPSG:6450',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho East - EPSG:6450',
  },
  WGS84_EPSG_6451_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho East (ftUS) - EPSG:6451',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho East (ftUS) - EPSG:6451',
  },
  WGS84_EPSG_6452_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho West - EPSG:6452',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho West - EPSG:6452',
  },
  WGS84_EPSG_6453_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Idaho West (ftUS) - EPSG:6453',
    [T.Language.EN_US]: 'NAD83(2011) / Idaho West (ftUS) - EPSG:6453',
  },
  WGS84_EPSG_6454_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Illinois East - EPSG:6454',
    [T.Language.EN_US]: 'NAD83(2011) / Illinois East - EPSG:6454',
  },
  WGS84_EPSG_6455_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Illinois East (ftUS) - EPSG:6455',
    [T.Language.EN_US]: 'NAD83(2011) / Illinois East (ftUS) - EPSG:6455',
  },
  WGS84_EPSG_6456_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Illinois West - EPSG:6456',
    [T.Language.EN_US]: 'NAD83(2011) / Illinois West - EPSG:6456',
  },
  WGS84_EPSG_6457_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Illinois West (ftUS) - EPSG:6457',
    [T.Language.EN_US]: 'NAD83(2011) / Illinois West (ftUS) - EPSG:6457',
  },
  WGS84_EPSG_6458_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Indiana East - EPSG:6458',
    [T.Language.EN_US]: 'NAD83(2011) / Indiana East - EPSG:6458',
  },
  WGS84_EPSG_6459_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Indiana East (ftUS) - EPSG:6459',
    [T.Language.EN_US]: 'NAD83(2011) / Indiana East (ftUS) - EPSG:6459',
  },
  WGS84_EPSG_6460_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Indiana West - EPSG:6460',
    [T.Language.EN_US]: 'NAD83(2011) / Indiana West - EPSG:6460',
  },
  WGS84_EPSG_6461_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Indiana West (ftUS) - EPSG:6461',
    [T.Language.EN_US]: 'NAD83(2011) / Indiana West (ftUS) - EPSG:6461',
  },
  WGS84_EPSG_6462_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Iowa North - EPSG:6462',
    [T.Language.EN_US]: 'NAD83(2011) / Iowa North - EPSG:6462',
  },
  WGS84_EPSG_6463_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Iowa North (ftUS) - EPSG:6463',
    [T.Language.EN_US]: 'NAD83(2011) / Iowa North (ftUS) - EPSG:6463',
  },
  WGS84_EPSG_6464_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Iowa South - EPSG:6464',
    [T.Language.EN_US]: 'NAD83(2011) / Iowa South - EPSG:6464',
  },
  WGS84_EPSG_6465_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Iowa South (ftUS) - EPSG:6465',
    [T.Language.EN_US]: 'NAD83(2011) / Iowa South (ftUS) - EPSG:6465',
  },
  WGS84_EPSG_6466_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kansas North - EPSG:6466',
    [T.Language.EN_US]: 'NAD83(2011) / Kansas North - EPSG:6466',
  },
  WGS84_EPSG_6467_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kansas North (ftUS) - EPSG:6467',
    [T.Language.EN_US]: 'NAD83(2011) / Kansas North (ftUS) - EPSG:6467',
  },
  WGS84_EPSG_6468_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kansas South - EPSG:6468',
    [T.Language.EN_US]: 'NAD83(2011) / Kansas South - EPSG:6468',
  },
  WGS84_EPSG_6469_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kansas South (ftUS) - EPSG:6469',
    [T.Language.EN_US]: 'NAD83(2011) / Kansas South (ftUS) - EPSG:6469',
  },
  WGS84_EPSG_6470_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky North - EPSG:6470',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky North - EPSG:6470',
  },
  WGS84_EPSG_6471_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky North (ftUS) - EPSG:6471',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky North (ftUS) - EPSG:6471',
  },
  WGS84_EPSG_6472_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky Single Zone - EPSG:6472',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky Single Zone - EPSG:6472',
  },
  WGS84_EPSG_6473_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky Single Zone (ftUS) - EPSG:6473',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky Single Zone (ftUS) - EPSG:6473',
  },
  WGS84_EPSG_6474_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky South - EPSG:6474',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky South - EPSG:6474',
  },
  WGS84_EPSG_6475_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Kentucky South (ftUS) - EPSG:6475',
    [T.Language.EN_US]: 'NAD83(2011) / Kentucky South (ftUS) - EPSG:6475',
  },
  WGS84_EPSG_6476_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Louisiana North - EPSG:6476',
    [T.Language.EN_US]: 'NAD83(2011) / Louisiana North - EPSG:6476',
  },
  WGS84_EPSG_6477_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Louisiana North (ftUS) - EPSG:6477',
    [T.Language.EN_US]: 'NAD83(2011) / Louisiana North (ftUS) - EPSG:6477',
  },
  WGS84_EPSG_6478_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Louisiana South - EPSG:6478',
    [T.Language.EN_US]: 'NAD83(2011) / Louisiana South - EPSG:6478',
  },
  WGS84_EPSG_6479_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Louisiana South (ftUS) - EPSG:6479',
    [T.Language.EN_US]: 'NAD83(2011) / Louisiana South (ftUS) - EPSG:6479',
  },
  WGS84_EPSG_6483_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maine East - EPSG:6483',
    [T.Language.EN_US]: 'NAD83(2011) / Maine East - EPSG:6483',
  },
  WGS84_EPSG_6484_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maine East (ftUS) - EPSG:6484',
    [T.Language.EN_US]: 'NAD83(2011) / Maine East (ftUS) - EPSG:6484',
  },
  WGS84_EPSG_6485_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maine West - EPSG:6485',
    [T.Language.EN_US]: 'NAD83(2011) / Maine West - EPSG:6485',
  },
  WGS84_EPSG_6486_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maine West (ftUS) - EPSG:6486',
    [T.Language.EN_US]: 'NAD83(2011) / Maine West (ftUS) - EPSG:6486',
  },
  WGS84_EPSG_6487_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maryland - EPSG:6487',
    [T.Language.EN_US]: 'NAD83(2011) / Maryland - EPSG:6487',
  },
  WGS84_EPSG_6488_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Maryland (ftUS) - EPSG:6488',
    [T.Language.EN_US]: 'NAD83(2011) / Maryland (ftUS) - EPSG:6488',
  },
  WGS84_EPSG_6489_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Massachusetts Island - EPSG:6489',
    [T.Language.EN_US]: 'NAD83(2011) / Massachusetts Island - EPSG:6489',
  },
  WGS84_EPSG_6490_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Massachusetts Island (ftUS) - EPSG:6490',
    [T.Language.EN_US]: 'NAD83(2011) / Massachusetts Island (ftUS) - EPSG:6490',
  },
  WGS84_EPSG_6491_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Massachusetts Mainland - EPSG:6491',
    [T.Language.EN_US]: 'NAD83(2011) / Massachusetts Mainland - EPSG:6491',
  },
  WGS84_EPSG_6492_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Massachusetts Mainland (ftUS) - EPSG:6492',
    [T.Language.EN_US]: 'NAD83(2011) / Massachusetts Mainland (ftUS) - EPSG:6492',
  },
  WGS84_EPSG_6493_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan Central - EPSG:6493',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan Central - EPSG:6493',
  },
  WGS84_EPSG_6494_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan Central (ft) - EPSG:6494',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan Central (ft) - EPSG:6494',
  },
  WGS84_EPSG_6495_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan North - EPSG:6495',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan North - EPSG:6495',
  },
  WGS84_EPSG_6496_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan North (ft) - EPSG:6496',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan North (ft) - EPSG:6496',
  },
  WGS84_EPSG_6498_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan South - EPSG:6498',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan South - EPSG:6498',
  },
  WGS84_EPSG_6499_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Michigan South (ft) - EPSG:6499',
    [T.Language.EN_US]: 'NAD83(2011) / Michigan South (ft) - EPSG:6499',
  },
  WGS84_EPSG_6500_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota Central - EPSG:6500',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota Central - EPSG:6500',
  },
  WGS84_EPSG_6501_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota Central (ftUS) - EPSG:6501',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota Central (ftUS) - EPSG:6501',
  },
  WGS84_EPSG_6502_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota North - EPSG:6502',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota North - EPSG:6502',
  },
  WGS84_EPSG_6503_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota North (ftUS) - EPSG:6503',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota North (ftUS) - EPSG:6503',
  },
  WGS84_EPSG_6504_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota South - EPSG:6504',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota South - EPSG:6504',
  },
  WGS84_EPSG_6505_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Minnesota South (ftUS) - EPSG:6505',
    [T.Language.EN_US]: 'NAD83(2011) / Minnesota South (ftUS) - EPSG:6505',
  },
  WGS84_EPSG_6506_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Mississippi East - EPSG:6506',
    [T.Language.EN_US]: 'NAD83(2011) / Mississippi East - EPSG:6506',
  },
  WGS84_EPSG_6507_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Mississippi East (ftUS) - EPSG:6507',
    [T.Language.EN_US]: 'NAD83(2011) / Mississippi East (ftUS) - EPSG:6507',
  },
  WGS84_EPSG_6509_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Mississippi West - EPSG:6509',
    [T.Language.EN_US]: 'NAD83(2011) / Mississippi West - EPSG:6509',
  },
  WGS84_EPSG_6510_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Mississippi West (ftUS) - EPSG:6510',
    [T.Language.EN_US]: 'NAD83(2011) / Mississippi West (ftUS) - EPSG:6510',
  },
  WGS84_EPSG_6511_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Missouri Central - EPSG:6511',
    [T.Language.EN_US]: 'NAD83(2011) / Missouri Central - EPSG:6511',
  },
  WGS84_EPSG_6512_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Missouri East - EPSG:6512',
    [T.Language.EN_US]: 'NAD83(2011) / Missouri East - EPSG:6512',
  },
  WGS84_EPSG_6513_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Missouri West - EPSG:6513',
    [T.Language.EN_US]: 'NAD83(2011) / Missouri West - EPSG:6513',
  },
  WGS84_EPSG_6514_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Montana - EPSG:6514',
    [T.Language.EN_US]: 'NAD83(2011) / Montana - EPSG:6514',
  },
  WGS84_EPSG_6515_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Montana (ft) - EPSG:6515',
    [T.Language.EN_US]: 'NAD83(2011) / Montana (ft) - EPSG:6515',
  },
  WGS84_EPSG_6516_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nebraska - EPSG:6516',
    [T.Language.EN_US]: 'NAD83(2011) / Nebraska - EPSG:6516',
  },
  WGS84_EPSG_6880_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nebraska (ftUS) - EPSG:6880',
    [T.Language.EN_US]: 'NAD83(2011) / Nebraska (ftUS) - EPSG:6880',
  },
  WGS84_EPSG_6518_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada Central - EPSG:6518',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada Central - EPSG:6518',
  },
  WGS84_EPSG_6519_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada Central (ftUS) - EPSG:6519',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada Central (ftUS) - EPSG:6519',
  },
  WGS84_EPSG_6520_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada East - EPSG:6520',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada East - EPSG:6520',
  },
  WGS84_EPSG_6521_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada East (ftUS) - EPSG:6521',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada East (ftUS) - EPSG:6521',
  },
  WGS84_EPSG_6522_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada West - EPSG:6522',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada West - EPSG:6522',
  },
  WGS84_EPSG_6523_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Nevada West (ftUS) - EPSG:6523',
    [T.Language.EN_US]: 'NAD83(2011) / Nevada West (ftUS) - EPSG:6523',
  },
  WGS84_EPSG_6524_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Hampshire - EPSG:6524',
    [T.Language.EN_US]: 'NAD83(2011) / New Hampshire - EPSG:6524',
  },
  WGS84_EPSG_6525_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Hampshire (ftUS) - EPSG:6525',
    [T.Language.EN_US]: 'NAD83(2011) / New Hampshire (ftUS) - EPSG:6525',
  },
  WGS84_EPSG_6526_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Jersey - EPSG:6526',
    [T.Language.EN_US]: 'NAD83(2011) / New Jersey - EPSG:6526',
  },
  WGS84_EPSG_6527_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Jersey (ftUS) - EPSG:6527',
    [T.Language.EN_US]: 'NAD83(2011) / New Jersey (ftUS) - EPSG:6527',
  },
  WGS84_EPSG_6528_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico Central - EPSG:6528',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico Central - EPSG:6528',
  },
  WGS84_EPSG_6529_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico Central (ftUS) - EPSG:6529',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico Central (ftUS) - EPSG:6529',
  },
  WGS84_EPSG_6530_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico East - EPSG:6530',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico East - EPSG:6530',
  },
  WGS84_EPSG_6531_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico East (ftUS) - EPSG:6531',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico East (ftUS) - EPSG:6531',
  },
  WGS84_EPSG_6532_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico West - EPSG:6532',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico West - EPSG:6532',
  },
  WGS84_EPSG_6533_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New Mexico West (ftUS) - EPSG:6533',
    [T.Language.EN_US]: 'NAD83(2011) / New Mexico West (ftUS) - EPSG:6533',
  },
  WGS84_EPSG_6534_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York Central - EPSG:6534',
    [T.Language.EN_US]: 'NAD83(2011) / New York Central - EPSG:6534',
  },
  WGS84_EPSG_6535_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York Central (ftUS) - EPSG:6535',
    [T.Language.EN_US]: 'NAD83(2011) / New York Central (ftUS) - EPSG:6535',
  },
  WGS84_EPSG_6536_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York East - EPSG:6536',
    [T.Language.EN_US]: 'NAD83(2011) / New York East - EPSG:6536',
  },
  WGS84_EPSG_6537_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York East (ftUS) - EPSG:6537',
    [T.Language.EN_US]: 'NAD83(2011) / New York East (ftUS) - EPSG:6537',
  },
  WGS84_EPSG_6538_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York Long Island - EPSG:6538',
    [T.Language.EN_US]: 'NAD83(2011) / New York Long Island - EPSG:6538',
  },
  WGS84_EPSG_6539_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York Long Island (ftUS) - EPSG:6539',
    [T.Language.EN_US]: 'NAD83(2011) / New York Long Island (ftUS) - EPSG:6539',
  },
  WGS84_EPSG_6540_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York West - EPSG:6540',
    [T.Language.EN_US]: 'NAD83(2011) / New York West - EPSG:6540',
  },
  WGS84_EPSG_6541_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / New York West (ftUS) - EPSG:6541',
    [T.Language.EN_US]: 'NAD83(2011) / New York West (ftUS) - EPSG:6541',
  },
  WGS84_EPSG_6542_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Carolina - EPSG:6542',
    [T.Language.EN_US]: 'NAD83(2011) / North Carolina - EPSG:6542',
  },
  WGS84_EPSG_6543_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Carolina (ftUS) - EPSG:6543',
    [T.Language.EN_US]: 'NAD83(2011) / North Carolina (ftUS) - EPSG:6543',
  },
  WGS84_EPSG_6544_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Dakota North - EPSG:6544',
    [T.Language.EN_US]: 'NAD83(2011) / North Dakota North - EPSG:6544',
  },
  WGS84_EPSG_6545_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Dakota North (ft) - EPSG:6545',
    [T.Language.EN_US]: 'NAD83(2011) / North Dakota North (ft) - EPSG:6545',
  },
  WGS84_EPSG_6546_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Dakota South - EPSG:6546',
    [T.Language.EN_US]: 'NAD83(2011) / North Dakota South - EPSG:6546',
  },
  WGS84_EPSG_6547_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / North Dakota South (ft) - EPSG:6547',
    [T.Language.EN_US]: 'NAD83(2011) / North Dakota South (ft) - EPSG:6547',
  },
  WGS84_EPSG_6548_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Ohio North - EPSG:6548',
    [T.Language.EN_US]: 'NAD83(2011) / Ohio North - EPSG:6548',
  },
  WGS84_EPSG_6549_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Ohio North (ftUS) - EPSG:6549',
    [T.Language.EN_US]: 'NAD83(2011) / Ohio North (ftUS) - EPSG:6549',
  },
  WGS84_EPSG_6550_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Ohio South - EPSG:6550',
    [T.Language.EN_US]: 'NAD83(2011) / Ohio South - EPSG:6550',
  },
  WGS84_EPSG_6551_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Ohio South (ftUS) - EPSG:6551',
    [T.Language.EN_US]: 'NAD83(2011) / Ohio South (ftUS) - EPSG:6551',
  },
  WGS84_EPSG_6552_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oklahoma North - EPSG:6552',
    [T.Language.EN_US]: 'NAD83(2011) / Oklahoma North - EPSG:6552',
  },
  WGS84_EPSG_6553_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oklahoma North (ftUS) - EPSG:6553',
    [T.Language.EN_US]: 'NAD83(2011) / Oklahoma North (ftUS) - EPSG:6553',
  },
  WGS84_EPSG_6554_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oklahoma South - EPSG:6554',
    [T.Language.EN_US]: 'NAD83(2011) / Oklahoma South - EPSG:6554',
  },
  WGS84_EPSG_6555_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oklahoma South (ftUS) - EPSG:6555',
    [T.Language.EN_US]: 'NAD83(2011) / Oklahoma South (ftUS) - EPSG:6555',
  },
  WGS84_EPSG_6558_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oregon North - EPSG:6558',
    [T.Language.EN_US]: 'NAD83(2011) / Oregon North - EPSG:6558',
  },
  WGS84_EPSG_6559_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oregon North (ft) - EPSG:6559',
    [T.Language.EN_US]: 'NAD83(2011) / Oregon North (ft) - EPSG:6559',
  },
  WGS84_EPSG_6560_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oregon South - EPSG:6560',
    [T.Language.EN_US]: 'NAD83(2011) / Oregon South - EPSG:6560',
  },
  WGS84_EPSG_6561_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Oregon South (ft) - EPSG:6561',
    [T.Language.EN_US]: 'NAD83(2011) / Oregon South (ft) - EPSG:6561',
  },
  WGS84_EPSG_6562_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Pennsylvania North - EPSG:6562',
    [T.Language.EN_US]: 'NAD83(2011) / Pennsylvania North - EPSG:6562',
  },
  WGS84_EPSG_6563_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Pennsylvania North (ftUS) - EPSG:6563',
    [T.Language.EN_US]: 'NAD83(2011) / Pennsylvania North (ftUS) - EPSG:6563',
  },
  WGS84_EPSG_6564_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Pennsylvania South - EPSG:6564',
    [T.Language.EN_US]: 'NAD83(2011) / Pennsylvania South - EPSG:6564',
  },
  WGS84_EPSG_6565_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Pennsylvania South (ftUS) - EPSG:6565',
    [T.Language.EN_US]: 'NAD83(2011) / Pennsylvania South (ftUS) - EPSG:6565',
  },
  WGS84_EPSG_6567_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Rhode Island - EPSG:6567',
    [T.Language.EN_US]: 'NAD83(2011) / Rhode Island - EPSG:6567',
  },
  WGS84_EPSG_6568_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Rhode Island (ftUS) - EPSG:6568',
    [T.Language.EN_US]: 'NAD83(2011) / Rhode Island (ftUS) - EPSG:6568',
  },
  WGS84_EPSG_6569_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Carolina - EPSG:6569',
    [T.Language.EN_US]: 'NAD83(2011) / South Carolina - EPSG:6569',
  },
  WGS84_EPSG_6570_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Carolina (ft) - EPSG:6570',
    [T.Language.EN_US]: 'NAD83(2011) / South Carolina (ft) - EPSG:6570',
  },
  WGS84_EPSG_6571_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Dakota North - EPSG:6571',
    [T.Language.EN_US]: 'NAD83(2011) / South Dakota North - EPSG:6571',
  },
  WGS84_EPSG_6572_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Dakota North (ftUS) - EPSG:6572',
    [T.Language.EN_US]: 'NAD83(2011) / South Dakota North (ftUS) - EPSG:6572',
  },
  WGS84_EPSG_6573_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Dakota South - EPSG:6573',
    [T.Language.EN_US]: 'NAD83(2011) / South Dakota South - EPSG:6573',
  },
  WGS84_EPSG_6574_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / South Dakota South (ftUS) - EPSG:6574',
    [T.Language.EN_US]: 'NAD83(2011) / South Dakota South (ftUS) - EPSG:6574',
  },
  WGS84_EPSG_6575_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Tennessee - EPSG:6575',
    [T.Language.EN_US]: 'NAD83(2011) / Tennessee - EPSG:6575',
  },
  WGS84_EPSG_6576_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Tennessee (ftUS) - EPSG:6576',
    [T.Language.EN_US]: 'NAD83(2011) / Tennessee (ftUS) - EPSG:6576',
  },
  WGS84_EPSG_6577_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas Central - EPSG:6577',
    [T.Language.EN_US]: 'NAD83(2011) / Texas Central - EPSG:6577',
  },
  WGS84_EPSG_6578_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas Central (ftUS) - EPSG:6578',
    [T.Language.EN_US]: 'NAD83(2011) / Texas Central (ftUS) - EPSG:6578',
  },
  WGS84_EPSG_6581_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas North - EPSG:6581',
    [T.Language.EN_US]: 'NAD83(2011) / Texas North - EPSG:6581',
  },
  WGS84_EPSG_6582_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas North (ftUS) - EPSG:6582',
    [T.Language.EN_US]: 'NAD83(2011) / Texas North (ftUS) - EPSG:6582',
  },
  WGS84_EPSG_6583_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas North Central - EPSG:6583',
    [T.Language.EN_US]: 'NAD83(2011) / Texas North Central - EPSG:6583',
  },
  WGS84_EPSG_6584_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas North Central (ftUS) - EPSG:6584',
    [T.Language.EN_US]: 'NAD83(2011) / Texas North Central (ftUS) - EPSG:6584',
  },
  WGS84_EPSG_6585_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas South - EPSG:6585',
    [T.Language.EN_US]: 'NAD83(2011) / Texas South - EPSG:6585',
  },
  WGS84_EPSG_6586_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas South (ftUS) - EPSG:6586',
    [T.Language.EN_US]: 'NAD83(2011) / Texas South (ftUS) - EPSG:6586',
  },
  WGS84_EPSG_6587_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas South Central - EPSG:6587',
    [T.Language.EN_US]: 'NAD83(2011) / Texas South Central - EPSG:6587',
  },
  WGS84_EPSG_6588_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Texas South Central (ftUS) - EPSG:6588',
    [T.Language.EN_US]: 'NAD83(2011) / Texas South Central (ftUS) - EPSG:6588',
  },
  WGS84_EPSG_6619_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah Central - EPSG:6619',
    [T.Language.EN_US]: 'NAD83(2011) / Utah Central - EPSG:6619',
  },
  WGS84_EPSG_6625_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah Central (ftUS) - EPSG:6625',
    [T.Language.EN_US]: 'NAD83(2011) / Utah Central (ftUS) - EPSG:6625',
  },
  WGS84_EPSG_6620_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah North - EPSG:6620',
    [T.Language.EN_US]: 'NAD83(2011) / Utah North - EPSG:6620',
  },
  WGS84_EPSG_6626_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah North (ftUS) - EPSG:6626',
    [T.Language.EN_US]: 'NAD83(2011) / Utah North (ftUS) - EPSG:6626',
  },
  WGS84_EPSG_6621_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah South - EPSG:6621',
    [T.Language.EN_US]: 'NAD83(2011) / Utah South - EPSG:6621',
  },
  WGS84_EPSG_6627_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Utah South (ftUS) - EPSG:6627',
    [T.Language.EN_US]: 'NAD83(2011) / Utah South (ftUS) - EPSG:6627',
  },
  WGS84_EPSG_6589_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Vermont - EPSG:6589',
    [T.Language.EN_US]: 'NAD83(2011) / Vermont - EPSG:6589',
  },
  WGS84_EPSG_6590_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Vermont (ftUS) - EPSG:6590',
    [T.Language.EN_US]: 'NAD83(2011) / Vermont (ftUS) - EPSG:6590',
  },
  WGS84_EPSG_6592_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Virginia North - EPSG:6592',
    [T.Language.EN_US]: 'NAD83(2011) / Virginia North - EPSG:6592',
  },
  WGS84_EPSG_6593_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Virginia North (ftUS) - EPSG:6593',
    [T.Language.EN_US]: 'NAD83(2011) / Virginia North (ftUS) - EPSG:6593',
  },
  WGS84_EPSG_6594_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Virginia South - EPSG:6594',
    [T.Language.EN_US]: 'NAD83(2011) / Virginia South - EPSG:6594',
  },
  WGS84_EPSG_6595_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Virginia South (ftUS) - EPSG:6595',
    [T.Language.EN_US]: 'NAD83(2011) / Virginia South (ftUS) - EPSG:6595',
  },
  WGS84_EPSG_6598_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Washington North - EPSG:6598',
    [T.Language.EN_US]: 'NAD83(2011) / Washington North - EPSG:6598',
  },
  WGS84_EPSG_6599_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Washington South (ftUS) - EPSG:6599',
    [T.Language.EN_US]: 'NAD83(2011) / Washington South (ftUS) - EPSG:6599',
  },
  WGS84_EPSG_6600_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / West Virginia North - EPSG:6600',
    [T.Language.EN_US]: 'NAD83(2011) / West Virginia North - EPSG:6600',
  },
  WGS84_EPSG_6601_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / West Virginia North (ftUS) - EPSG:6601',
    [T.Language.EN_US]: 'NAD83(2011) / West Virginia North (ftUS) - EPSG:6601',
  },
  WGS84_EPSG_6602_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / West Virginia South - EPSG:6602',
    [T.Language.EN_US]: 'NAD83(2011) / West Virginia South - EPSG:6602',
  },
  WGS84_EPSG_6603_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / West Virginia South (ftUS) - EPSG:6603',
    [T.Language.EN_US]: 'NAD83(2011) / West Virginia South (ftUS) - EPSG:6603',
  },
  WGS84_EPSG_6879_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin Central - EPSG:6879',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin Central - EPSG:6879',
  },
  WGS84_EPSG_6605_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin Central (ftUS) - EPSG:6605',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin Central (ftUS) - EPSG:6605',
  },
  WGS84_EPSG_6606_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin North - EPSG:6606',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin North - EPSG:6606',
  },
  WGS84_EPSG_6607_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin North (ftUS) - EPSG:6607',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin North (ftUS) - EPSG:6607',
  },
  WGS84_EPSG_6608_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin South - EPSG:6608',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin South - EPSG:6608',
  },
  WGS84_EPSG_6609_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wisconsin South (ftUS) - EPSG:6609',
    [T.Language.EN_US]: 'NAD83(2011) / Wisconsin South (ftUS) - EPSG:6609',
  },
  WGS84_EPSG_6611_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming East - EPSG:6611',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming East - EPSG:6611',
  },
  WGS84_EPSG_6612_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming East (ftUS) - EPSG:6612',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming East (ftUS) - EPSG:6612',
  },
  WGS84_EPSG_6613_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming East Central - EPSG:6613',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming East Central - EPSG:6613',
  },
  WGS84_EPSG_6614_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming East Central (ftUS) - EPSG:6614',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming East Central (ftUS) - EPSG:6614',
  },
  WGS84_EPSG_6615_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming West - EPSG:6615',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming West - EPSG:6615',
  },
  WGS84_EPSG_6616_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming West (ftUS) - EPSG:6616',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming West (ftUS) - EPSG:6616',
  },
  WGS84_EPSG_6617_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming West Central - EPSG:6617',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming West Central - EPSG:6617',
  },
  WGS84_EPSG_6618_EN: {
    [T.Language.KO_KR]: 'NAD83(2011) / Wyoming West Central (ftUS) - EPSG:6618',
    [T.Language.EN_US]: 'NAD83(2011) / Wyoming West Central (ftUS) - EPSG:6618',
  },

  Bessel_EPSG_5173_EN: {
    [T.Language.KO_KR]: '보정된 서부원점(Bessel) - EPSG:5173',
    [T.Language.EN_US]: 'Korean 1985/Modified West Belt - EPSG:5173',
  },
  Bessel_EPSG_5174_EN: {
    [T.Language.KO_KR]: '보정된 중부원점(Bessel) - EPSG:5174',
    [T.Language.EN_US]: 'Korean 1985/Modified Central Belt - EPSG:5174',
  },
  Bessel_EPSG_5175_EN: {
    [T.Language.KO_KR]: '보정된 제주원점(Bessel) - EPSG:5175',
    [T.Language.EN_US]: 'Korean 1985/Modified Central Belt Jeju - EPSG:5175',
  },
  Bessel_EPSG_5176_EN: {
    [T.Language.KO_KR]: '보정된 동부원점(Bessel) - EPSG:5176',
    [T.Language.EN_US]: 'Korean 1985/Modified East Belt - EPSG:5176',
  },
  Bessel_EPSG_5177_EN: {
    [T.Language.KO_KR]: '보정된 동해(울릉)원점(Bessel) - EPSG:5177',
    [T.Language.EN_US]: 'Korean 1985/Modified East Sea Belt - EPSG:5177',
  },
  HD72_EPSG_23700_EN: {
    [T.Language.KO_KR]: 'HD72 / EOV - EPSG:23700',
    [T.Language.EN_US]: 'HD72 / EOV - EPSG:23700',
  },
  QND95_EPSG_2932_EN: {
    [T.Language.KO_KR]: 'QND95 / Qatar National Grid - EPSG:2932',
    [T.Language.EN_US]: 'QND95 / Qatar National Grid - EPSG:2932',
  },
  Peru96_EPSG_5387_EN: {
    [T.Language.KO_KR]: 'Peru96 / UTM zone 18S - EPSG:5387',
    [T.Language.EN_US]: 'Peru96 / UTM zone 18S - EPSG:5387',
  },
  ETRS89_EPSG_2180_EN: {
    [T.Language.KO_KR]: 'ETRS89 / Poland CS92 - EPSG:2180',
    [T.Language.EN_US]: 'ETRS89 / Poland CS92 - EPSG:2180',
  },
  ETRS89_EPSG_2177_EN: {
    [T.Language.KO_KR]: 'ETRS89 / Poland CS2000 zone 6 - EPSG:2177',
    [T.Language.EN_US]: 'ETRS89 / Poland CS2000 zone 6 - EPSG:2177',
  },
};
export const defaultCoordinateSystem: T.ProjectionEnum = T.ProjectionEnum.GRS80_EPSG_5186_EN;

export const availableProjections: Array<string> = projectionSystem.map((proj) => proj[0]);

/**
 * Bessel_EPSG_5174_EN --> EPSG:5174
 */
export const getEPSGfromProjectionLabel: (proj: T.ProjectionEnum) => string = (proj) => {
  const matches: RegExpMatchArray | null = proj.match(/EPSG_\d+/);
  /* istanbul ignore if: this doesn't occur unless proj not typeof T.ProjectEnum */
  if (matches === null || matches.length === 0) {
    return '';
  }
  const epsg: string = matches[0].replace('_', ':');

  /* istanbul ignore next: you can never reach '' */
  return availableProjections.includes(epsg) ? epsg : '';
};

export type LocationLabel = [string, string];
export const getLatLongYXLabel: (params: {
  proj?: T.ProjectionEnum;
  language?: T.Language;
  isFull?: boolean;
}) => [string, string] = ({
  proj, language, isFull,
}) => {
  const matches: RegExpMatchArray | null = proj !== null && proj !== undefined ?
    proj.match(/EPSG_\d+_EN/) : null;
  if (matches === null || matches.length === 0) {
    if (language === T.Language.KO_KR) {
      return ['위도', '경도'];
    }

    return isFull ? ['Latitude', 'Longitude'] : ['Lat', 'Long'];
  }

  return ['Y', 'X'];
};

export const getLatLongYX: (
  coordinates: T.GeoPoint, proj?: T.ProjectionEnum,
) => T.GeoPoint = (
  coordinates, proj,
) => {
  if (proj !== undefined) {
    const epsgProjection: string = getEPSGfromProjectionLabel(proj);
    if (epsgProjection.length > 0) {
      proj4.defs(projectionSystem);
      const convertedCoordinates: T.GeoPoint = proj4('EPSG:4326', epsgProjection).forward(coordinates);

      return [convertedCoordinates[1], convertedCoordinates[0]];
    }
  }

  return [coordinates[1], coordinates[0]];
};

/**
 * @info https://github.com/gagan-bansal/web-mercator-tiles/blob/master/index.js
 */
// Web mercator projection extent
const ProjectionExtent: T.Extent = {
  left: -20037508.342789244,
  right: 20037508.342789244,
  bottom: -20037508.342789244,
  top: 20037508.342789244,
};

// Tile size
const TileSize: number = 256;

// Resolutions
/* eslint-disable no-magic-numbers */
export const Resolutions: Array<number> = [
  156543.03392804097, 78271.51696402048, 39135.75848201024,
  19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564,
  1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525,
  76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032,
  4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395,
  0.29858214173896974, 0.14929107086948487, 0.07464553543474244,
  0.03732276771737122, 0.01866138385868561,
];
/* eslint-disable no-magic-numbers */

export const getTiles: (extent: T.Extent, z: number) => Array<T.ExtentTileInfo> = (extent, z) => {
  const tiles: Array<T.ExtentTileInfo> = [];

  //Coordinated in pixel
  const lx: number = Math.floor((extent.left - ProjectionExtent.left) / Resolutions[z]);
  const rx: number = Math.floor((extent.right - ProjectionExtent.left) / Resolutions[z]);
  const by: number = Math.floor((ProjectionExtent.top - extent.bottom) / Resolutions[z]);
  const ty: number = Math.floor((ProjectionExtent.top - extent.top) / Resolutions[z]);
  // Tile numbers
  const lX: number = Math.floor(lx / TileSize);
  const rX: number = Math.floor(rx / TileSize);
  const bY: number = Math.floor(by / TileSize);
  const tY: number = Math.floor(ty / TileSize);
  // Top left tile position of top-left tile with respect to window/div
  let top: number = (tY * TileSize) - ty;
  const topStart: number = (tY * TileSize) - ty;
  let left: number = (lX * TileSize) - lx;
  for (let i: number = lX; i <= rX; i++) {
    top = topStart;
    for (let j: number = tY; j <= bY; j++) {
      tiles.push({
        X: i,
        Y: j,
        Z: z,
        top,
        left,
      });
      top += TileSize;
    }
    left += TileSize;
  }

  return tiles;
};


// Static funtion to get tile extent in web mercator coordinates
// Params: {z: zoom level, x: x tile no, y: y tile no}
export type TileExtentInfo = T.Extent & { res: number };
export const getTileExtent: (z: number, x: number, y: number) => TileExtentInfo = (z, x, y) => {
  const right: number = ProjectionExtent.left + x * TileSize * Resolutions[z];
  const left: number = right - TileSize * Resolutions[z];
  const bottom: number = ProjectionExtent.top - y * TileSize * Resolutions[z];
  const top: number = bottom + TileSize * Resolutions[z];

  return {
    left, right, bottom, top,
    res: Resolutions[z],
  };
};

/* eslint-disable no-magic-numbers */
export const projectionSystemExtentMap: {[key in T.ProjectionEnum]: Coordinate[]} = {
  GRS80_EPSG_5182_EN: [[-219825.99, -485028.96], [819486.07, 827525.22]],
  GRS80_EPSG_5185_EN: [[-24021.26, -440417.92], [989888.48, 893557.29]],
  GRS80_EPSG_5186_EN: [[-219825.99, -435028.96], [819486.07, 877525.22]],
  GRS80_EPSG_5187_EN: [[-415909.65, -426336.34], [649203.95, 865410.62]],
  GRS80_EPSG_5188_EN: [[-612402.1, -414301.03], [479010.89, 857176.37]],
  WGS84_EPSG_4326_LL: [[-180, -90], [180 , 90]],
  WGS84_EPSG_3414_EN: [[919.05, 12576.34], [54338.72, 50172.05]],

  GRS80_EPSG_5255_EN: [[-179106.47, 3810321.03], [1590291.29, 4881225.4]],
  GRS80_EPSG_4917_EN: [[-6378136.98, -0.05], [0.04, 0.12]],
  GRS80_EPSG_4918_EN: [[-6378136.94, -0.04], [0.03, 0.08]],
  GRS80_EPSG_4919_EN: [[-6378137.0, -0.0], [0.0, 0.0]],
  GRS80_EPSG_4896_EN: [[-6378136.88, -0.06], [0.15, 0.01]],
  GRS80_EPSG_5332_EN: [[-6378137.0, -0.0], [0.0, 0.0]],
  GRS80_EPSG_7789_EN: [[-6378137.98, 1.03], [-0.7, 2.7]],
  GRS80_EPSG_9988_EN: [[-6378137.0, -0.0], [0.0, 0.0]],

  WGS84_EPSG_32601_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32602_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32603_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32604_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32605_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32606_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32607_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32608_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32609_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32610_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32611_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32612_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32613_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32614_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32615_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32616_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32617_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32618_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32619_EN: [[166021.44, 0], [833978.56, 9329005.18]],

  WGS84_EPSG_6355_EN: [[-12623464.22, -1724857.8], [2613777.62, 11784143.85]],
  WGS84_EPSG_9748_EN: [[-41415482.18, -5658970.98], [8575368.75, 38661811.96]],
  WGS84_EPSG_6356_EN: [[-12147334.71, -1669847.77], [3206049.89, 11501152.16]],
  WGS84_EPSG_9749_EN: [[-39853380.62, -5478492.23], [10518515.34, 37733363.36]],
  WGS84_EPSG_6403_EN: [[-1104602.47, -4284905.68], [10334280.24, 5022314.73]],
  WGS84_EPSG_6395_EN: [[-5625443.27, -4334167.85], [11885263.7, 3655990.85]],
  WGS84_EPSG_6396_EN: [[-5026386.98, -4335312.28], [12626381.23, 3775986.03]],
  WGS84_EPSG_6397_EN: [[-4459138.63, -4334820.01], [13150817.05, 3897317.7]],
  WGS84_EPSG_6398_EN: [[-3919216.77, -4333800.25], [13335094.35, 4063770.32]],
  WGS84_EPSG_6399_EN: [[-3402618.85, -4335230.55], [13298340.14, 5635025.57]],
  WGS84_EPSG_6400_EN: [[-2905796.81, -4335023.74], [13270548.34, 7040416.16]],
  WGS84_EPSG_6401_EN: [[-2425602.77, -4333382.64], [13332835.86, 8194740.56]],
  WGS84_EPSG_6402_EN: [[-1959227.2, -4335099.01], [13310800.12, 9096236.39]],
  WGS84_EPSG_6404_EN: [[-11619106.63, -1780237.07], [5988195.45, 6279872.75]],
  WGS84_EPSG_6405_EN: [[-38120428.58, -5840672.8], [19646310.55, 20603257.06]],
  WGS84_EPSG_6406_EN: [[-11923373.91, -1780613.88], [5730530.16, 6332584.68]],
  WGS84_EPSG_6407_EN: [[-39118680.8, -5841909.07], [18800951.97, 20776196.46]],
  WGS84_EPSG_6408_EN: [[-11268261.38, -1778972.57], [6265279.66, 6225191.41]],
  WGS84_EPSG_6409_EN: [[-36969361.49, -5836524.18], [20555379.47, 20423856.34]],
  WGS84_EPSG_6410_EN: [[-9190394.5, -2197647.27], [3572391.25, 6918411.28]],
  WGS84_EPSG_6411_EN: [[-30152152.63, -7210114.43], [11720420.28, 22698154.33]],
  WGS84_EPSG_6412_EN: [[-9242209.66, -1602884.29], [3548669.01, 7563945.77]],
  WGS84_EPSG_6413_EN: [[-30322149.54, -5258796.2], [11642591.59, 24816045.42]],
  WGS84_EPSG_6415_EN: [[-5449124.23, -2298762.69], [8375936.34, 5750932.38]],
  WGS84_EPSG_6416_EN: [[-17877668.43, -7541857.25], [27480051.15, 18867850.65]],
  WGS84_EPSG_6417_EN: [[-5421583.56, -2096337.74], [8335995.6, 5985525.18]],
  WGS84_EPSG_6418_EN: [[-17787312.07, -6877734.74], [27349012.25, 19637510.53]],
  WGS84_EPSG_6419_EN: [[-5529240.79, -1953222.32], [8166018.57, 6197851.88]],
  WGS84_EPSG_6420_EN: [[-18140517.48, -6408196.89], [26791345.91, 20334119.05]],
  WGS84_EPSG_6421_EN: [[-5642580.72, -1812855.94], [7999479.33, 6407007.22]],
  WGS84_EPSG_6422_EN: [[-18512366.91, -5947678.19], [26244958.44, 21020322.85]],
  WGS84_EPSG_6423_EN: [[-5712545.55, -1598963.68], [7867258.88, 6706984.84]],
  WGS84_EPSG_6424_EN: [[-18741909.87, -5245933.32], [25811165.19, 22004499.43]],
  WGS84_EPSG_6425_EN: [[-5854724.96, -1444144.36], [7671259.29, 6961727.37]],
  WGS84_EPSG_6426_EN: [[-19208376.82, -4737996.95], [25168123.18, 22840267.21]],
  WGS84_EPSG_6427_EN: [[-7755978.35, -2309940.32], [5608647.26, 6260497.17]],
  WGS84_EPSG_6428_EN: [[-25446072.32, -7578529.19], [18401036.89, 20539647.79]],
  WGS84_EPSG_6429_EN: [[-7751752.21, -2487733.06], [5636058.21, 6060168.11]],
  WGS84_EPSG_6430_EN: [[-25432207.03, -8161837.54], [18490967.66, 19882401.53]],
  WGS84_EPSG_6431_EN: [[-7762783.07, -2169262.83], [5580206.66, 6430085.81]],
  WGS84_EPSG_6432_EN: [[-25468397.47, -7116989.8], [18307728.01, 21096039.86]],
  WGS84_EPSG_6433_EN: [[-9779034.61, -2815455.8], [1356353.46, 6840398.35]],
  WGS84_EPSG_6434_EN: [[-32083382.71, -9237041.24], [4449969.64, 22442206.91]],
  WGS84_EPSG_6435_EN: [[-12572662.76, -2557342.6], [1448609.06, 12397335.21]],
  WGS84_EPSG_6436_EN: [[-41248811.07, -8390214.86], [4752644.89, 40673590.59]],
  WGS84_EPSG_6437_EN: [[-12585513.77, -1041971.43], [2066183.51, 13259280.34]],
  WGS84_EPSG_6438_EN: [[-41290973.1, -3418534.6], [6778803.73, 43501488.91]],
  WGS84_EPSG_6440_EN: [[-9691849.65, -1574809.46], [2882479.87, 8014962.07]],
  WGS84_EPSG_6441_EN: [[-31797343.38, -5166687.36], [9456936.02, 26295754.74]],
  WGS84_EPSG_6442_EN: [[-12536471.3, -1041922.42], [2178347.06, 13115601.0]],
  WGS84_EPSG_6443_EN: [[-41130072.92, -3418373.81], [7146793.65, 43030100.94]],
  WGS84_EPSG_6444_EN: [[-12547167.5, -1669666.08], [2197011.54, 12462339.52]],
  WGS84_EPSG_6445_EN: [[-41165165.38, -5477896.15], [7208028.68, 40886858.91]],
  WGS84_EPSG_6446_EN: [[-12129733.61, -1667954.98], [2923218.27, 12141261.03]],
  WGS84_EPSG_6447_EN: [[-39795634.34, -5472282.29], [9590591.94, 39833453.9]],
  WGS84_EPSG_6448_EN: [[-10931965.25, -2962884.45], [6590339.65, 5034246.53]],
  WGS84_EPSG_6449_EN: [[-35865955.98, -9720730.07], [21621806.0, 16516523.82]],
  WGS84_EPSG_6450_EN: [[-11586818.51, -2963723.54], [6012438.77, 5089086.7]],
  WGS84_EPSG_6451_EN: [[-38014420.39, -9723482.99], [19725809.53, 16696445.28]],
  WGS84_EPSG_6452_EN: [[-10274057.29, -2964164.44], [7162646.91, 4982212.52]],
  WGS84_EPSG_6453_EN: [[-33707469.63, -9724929.51], [23499450.75, 16345808.91]],
  WGS84_EPSG_6454_EN: [[-12468251.61, -2409031.54], [3003103.96, 10578627.72]],
  WGS84_EPSG_6455_EN: [[-40906255.5, -7903630.99], [9852683.56, 34706714.46]],
  WGS84_EPSG_6456_EN: [[-12132613.53, -2407189.52], [3618238.01, 10137526.97]],
  WGS84_EPSG_6457_EN: [[-39805082.9, -7897587.6], [11870835.86, 33259536.41]],
  WGS84_EPSG_6458_EN: [[-12727382.74, -2251183.85], [2494667.63, 11289573.39]],
  WGS84_EPSG_6459_EN: [[-41756421.53, -7385759.03], [8184588.7, 37039208.71]],
  WGS84_EPSG_6460_EN: [[-11872993.7, -2251775.23], [3457861.89, 11007756.2]],
  WGS84_EPSG_6461_EN: [[-38953313.49, -7387699.22], [11344668.54, 36114613.47]],
  WGS84_EPSG_6462_EN: [[-7815342.07, -2060323.38], [4973719.97, 6843607.09]],
  WGS84_EPSG_6463_EN: [[-25640834.77, -6759577.63], [16317946.27, 22452734.26]],
  WGS84_EPSG_6464_EN: [[-8848939.43, -2876823.21], [3942028.14, 6050501.62]],
  WGS84_EPSG_6465_EN: [[-29031895.45, -9438377.48], [12933137.31, 19850687.4]],
  WGS84_EPSG_6466_EN: [[-8743303.44, -2671517.7], [4296525.53, 6141219.4]],
  WGS84_EPSG_6467_EN: [[-28685321.38, -8764804.33], [14096184.17, 20148317.3]],
  WGS84_EPSG_6468_EN: [[-8735994.06, -2074977.57], [4322941.25, 6752126.11]],
  WGS84_EPSG_6469_EN: [[-28661340.52, -6807655.57], [14182849.74, 22152600.42]],
  WGS84_EPSG_6470_EN: [[-9383555.21, -2567268.53], [2851048.71, 6740967.56]],
  WGS84_EPSG_6471_EN: [[-30785880.73, -8422780.18], [9353815.65, 22115991.07]],
  WGS84_EPSG_6472_EN: [[-8340392.59, -1436289.47], [4012191.73, 7836389.49]],
  WGS84_EPSG_6473_EN: [[-27363438.03, -4712226.37], [13163332.37, 25709887.84]],
  WGS84_EPSG_6474_EN: [[-9365143.31, -1931946.6], [3004511.02, 7356095.56]],
  WGS84_EPSG_6475_EN: [[-30725474.33, -6338394.79], [9857299.9, 24134123.52]],
  WGS84_EPSG_6476_EN: [[-8682903.99, -1751915.89], [4173609.16, 7475706.02]],
  WGS84_EPSG_6477_EN: [[-28487160.84, -5747744.05], [13692916.04, 24526545.51]],
  WGS84_EPSG_6478_EN: [[-8834993.68, -1520909.75], [4024118.16, 7826452.13]],
  WGS84_EPSG_6479_EN: [[-28986141.76, -4989851.39], [13202461.0, 25677285.03]],
  WGS84_EPSG_6483_EN: [[-12517622.94, -3185970.09], [797488.73, 12322152.06]],
  WGS84_EPSG_6484_EN: [[-41068234.59, -10452636.86], [2616427.62, 40426927.22]],
  WGS84_EPSG_6485_EN: [[-11835226.26, -3093915.51], [1577550.13, 12301116.16]],
  WGS84_EPSG_6486_EN: [[-38829404.82, -10150621.14], [5175679.07, 40357911.93]],
  WGS84_EPSG_6487_EN: [[-9751511.46, -2593224.66], [1925381.01, 6975066.67]],
  WGS84_EPSG_6488_EN: [[-31993083.85, -8507937.91], [6316854.21, 22884031.23]],
  WGS84_EPSG_6489_EN: [[-9642736.69, -2989739.0], [1284621.04, 6757875.01]],
  WGS84_EPSG_6490_EN: [[-31636211.97, -9808835.37], [4214627.53, 22171461.59]],
  WGS84_EPSG_6491_EN: [[-9856706.32, -2247175.77], [1107971.48, 7442744.93]],
  WGS84_EPSG_6492_EN: [[-32338210.66, -7372609.16], [3635069.76, 24418405.65]],
  WGS84_EPSG_6493_EN: [[-3591918.47, -3285792.45], [8467479.04, 5896631.62]],
  WGS84_EPSG_6494_EN: [[-11784509.43, -10780158.97], [27780443.04, 19345904.27]],
  WGS84_EPSG_6495_EN: [[-1466245.46, -3474594.35], [10803508.3, 5611501.91]],
  WGS84_EPSG_6496_EN: [[-4810516.59, -11399587.75], [35444581.03, 18410439.35]],
  WGS84_EPSG_6498_EN: [[-5677765.44, -3057117.66], [6432042.97, 6153164.0]],
  WGS84_EPSG_6499_EN: [[-18627839.38, -10029913.58], [21102503.18, 20187545.93]],
  WGS84_EPSG_6500_EN: [[-8412842.6, -3398480.23], [4445991.12, 5443467.91]],
  WGS84_EPSG_6501_EN: [[-27601134.44, -11149847.21], [14586555.88, 17859110.98]],
  WGS84_EPSG_6502_EN: [[-8431759.82, -3590259.77], [4352314.73, 5284982.78]],
  WGS84_EPSG_6503_EN: [[-27663198.69, -11779043.92], [14279219.26, 17339147.67]],
  WGS84_EPSG_6504_EN: [[-8455118.56, -3150058.01], [4372311.12, 5714417.83]],
  WGS84_EPSG_6505_EN: [[-27739834.82, -10334815.33], [14344824.06, 18748052.49]],
  WGS84_EPSG_6506_EN: [[-12493763.95, -1613855.56], [3061462.57, 11258071.07]],
  WGS84_EPSG_6507_EN: [[-40989957.21, -5294791.12], [10044148.44, 36935854.82]],
  WGS84_EPSG_6509_EN: [[-12134486.79, -1612648.58], [3637969.36, 10889727.13]],
  WGS84_EPSG_6510_EN: [[-39811228.73, -5290831.23], [11935571.15, 35727379.76]],
  WGS84_EPSG_6511_EN: [[-12293936.98, -2316676.89], [3696350.54, 9591129.76]],
  WGS84_EPSG_6512_EN: [[-12585336.34, -2315150.14], [3207649.74, 10144106.4]],
  WGS84_EPSG_6513_EN: [[-11935400.62, -2353270.81], [4288917.32, 8935061.05]],
  WGS84_EPSG_6514_EN: [[-7837285.45, -3423961.43], [5926810.41, 4928103.79]],
  WGS84_EPSG_6515_EN: [[-25712878.78, -11233469.27], [19444916.05, 16168319.53]],
  WGS84_EPSG_6516_EN: [[-8493107.35, -2860170.04], [4663762.46, 5840989.78]],
  WGS84_EPSG_6880_EN: [[-27864469.7, -9383741.2], [15301027.33, 19163313.96]],
  WGS84_EPSG_6518_EN: [[-10381782.68, 3803511.94], [7008036.43, 11722674.89]],
  WGS84_EPSG_6519_EN: [[-34060898.68, 12478688.75], [22992199.53, 38460142.53]],
  WGS84_EPSG_6520_EN: [[-10908313.53, 5803674.78], [6536181.63, 13754655.93]],
  WGS84_EPSG_6521_EN: [[-35788358.62, 19040889.68], [21444122.57, 45126733.66]],
  WGS84_EPSG_6522_EN: [[-9675748.04, 1804614.33], [7619306.52, 9666530.57]],
  WGS84_EPSG_6523_EN: [[-31744516.7, 5920638.84], [24997674.79, 31714275.72]],
  WGS84_EPSG_6524_EN: [[-12508526.83, -3056019.44], [1140002.37, 12225592.6]],
  WGS84_EPSG_6525_EN: [[-41038391.78, -10026290.45], [3740157.76, 40110131.73]],
  WGS84_EPSG_6526_EN: [[-12662544.29, -2649327.8], [1298245.86, 12390770.53]],
  WGS84_EPSG_6527_EN: [[-41543697.39, -8692002.95], [4259328.29, 40652052.99]],
  WGS84_EPSG_6528_EN: [[-12148956.17, -1780119.45], [5461903.36, 6451395.04]],
  WGS84_EPSG_6529_EN: [[-39858700.36, -5840275.22], [17919594.61, 21165951.9]],
  WGS84_EPSG_6530_EN: [[-12621332.47, -1780631.35], [4865018.05, 6509867.48]],
  WGS84_EPSG_6531_EN: [[-41408488.29, -5841954.7], [15961313.38, 21357790.22]],
  WGS84_EPSG_6532_EN: [[-11645558.77, -1778841.16], [6013075.01, 6403359.33]],
  WGS84_EPSG_6533_EN: [[-38207137.39, -5836081.38], [19727896.94, 21008354.75]],
  WGS84_EPSG_6534_EN: [[-12513624.72, -2778963.98], [1626540.89, 12056476.24]],
  WGS84_EPSG_6535_EN: [[-41055117.09, -9117317.64], [5336409.57, 39555289.12]],
  WGS84_EPSG_6536_EN: [[-12662544.29, -2649327.8], [1298245.86, 12390770.53]],
  WGS84_EPSG_6537_EN: [[-41543697.39, -8692002.95], [4259328.29, 40652052.99]],
  WGS84_EPSG_6538_EN: [[-9805384.73, -2890155.97], [1493564.04, 6739414.33]],
  WGS84_EPSG_6539_EN: [[-32169833.08, -9482120.05], [4900134.68, 22110895.18]],
  WGS84_EPSG_6540_EN: [[-12483662.63, -2777299.91], [1947191.21, 11832967.34]],
  WGS84_EPSG_6541_EN: [[-40956816.47, -9111858.11], [6388409.84, 38821993.67]],
  WGS84_EPSG_6542_EN: [[-9694792.37, -2127916.08], [2328780.65, 7473483.43]],
  WGS84_EPSG_6543_EN: [[-31806997.96, -6981338.02], [7640341.18, 24519253.55]],
  WGS84_EPSG_6544_EN: [[-8329088.6, -3748141.15], [4998769.52, 4885729.66]],
  WGS84_EPSG_6545_EN: [[-27326406.18, -12297051.01], [16400162.45, 16029296.78]],
  WGS84_EPSG_6546_EN: [[-8331998.65, -3579506.61], [4961620.39, 5056395.65]],
  WGS84_EPSG_6547_EN: [[-27335953.59, -11743788.09], [16278282.11, 16589224.59]],
  WGS84_EPSG_6548_EN: [[-9227816.57, -2837628.28], [2787405.15, 6477417.88]],
  WGS84_EPSG_6549_EN: [[-30274928.18, -9309785.44], [9145011.74, 21251328.51]],
  WGS84_EPSG_6550_EN: [[-9312802.15, -2635481.13], [2764010.64, 6717412.7]],
  WGS84_EPSG_6551_EN: [[-30553751.73, -8646574.35], [9068258.24, 22038711.51]],
  WGS84_EPSG_6552_EN: [[-8601150.22, -2275927.99], [4435144.05, 6614855.11]],
  WGS84_EPSG_6553_EN: [[-28218940.36, -7466940.41], [14550968.45, 21702237.14]],
  WGS84_EPSG_6554_EN: [[-8634852.52, -2080367.86], [4407016.2, 6859308.74]],
  WGS84_EPSG_6555_EN: [[-28329511.97, -6825340.24], [14458685.65, 22504248.76]],
  WGS84_EPSG_6558_EN: [[-5151287.17, -3331630.04], [8852784.13, 4711006.48]],
  WGS84_EPSG_6559_EN: [[-16900548.45, -10930544.76], [29044567.37, 15456058.01]],
  WGS84_EPSG_6560_EN: [[-6111284.68, -3082726.91], [7795730.0, 4975416.27]],
  WGS84_EPSG_6561_EN: [[-20050146.58, -10113933.43], [25576541.99, 16323544.18]],
  WGS84_EPSG_6562_EN: [[-9363744.61, -2894577.14], [2238804.83, 6582666.65]],
  WGS84_EPSG_6563_EN: [[-30720885.46, -9496625.16], [7345145.51, 21596632.18]],
  WGS84_EPSG_6564_EN: [[-9424308.8, -2791758.75], [2228284.84, 6707176.71]],
  WGS84_EPSG_6565_EN: [[-30919586.44, -9159295.16], [7310631.18, 22005128.93]],
  WGS84_EPSG_6567_EN: [[-12702361.31, -2898905.4], [921951.15, 12396256.65]],
  WGS84_EPSG_6568_EN: [[-41674330.41, -9510825.47], [3024768.07, 40670052.03]],
  WGS84_EPSG_6569_EN: [[-9690666.32, -1908660.98], [2538074.89, 7675433.82]],
  WGS84_EPSG_6570_EN: [[-31793524.66, -6262011.09], [8327017.36, 25181869.49]],
  WGS84_EPSG_6571_EN: [[-8365265.6, -3350125.03], [4856168.57, 5312230.7]],
  WGS84_EPSG_6572_EN: [[-27445042.22, -10991201.86], [15932279.71, 17428543.56]],
  WGS84_EPSG_6573_EN: [[-8357497.7, -3163362.32], [4854176.1, 5500302.18]],
  WGS84_EPSG_6574_EN: [[-27419557.05, -10378464.53], [15925742.77, 18045574.75]],
  WGS84_EPSG_6575_EN: [[-9320621.67, -2199185.3], [3111866.28, 7124993.22]],
  WGS84_EPSG_6576_EN: [[-30579406.27, -7215160.44], [10209514.61, 23375915.25]],
  WGS84_EPSG_6577_EN: [[-8445968.48, 1345422.92], [4699513.1, 10337645.57]],
  WGS84_EPSG_6578_EN: [[-27709814.93, 4414108.36], [15418319.21, 33916092.16]],
  WGS84_EPSG_6581_EN: [[-8779571.83, -1156299.16], [4395260.22, 7635744.49]],
  WGS84_EPSG_6582_EN: [[-28804311.92, -3793624.82], [14420116.24, 25051605.06]],
  WGS84_EPSG_6583_EN: [[-8634226.71, 113059.42], [4435219.67, 9088549.98]],
  WGS84_EPSG_6584_EN: [[-28327458.79, 370929.1], [14551216.54, 29818017.71]],
  WGS84_EPSG_6585_EN: [[-9090962.98, 3800742.35], [4057825.53, 13038870.74]],
  WGS84_EPSG_6586_EN: [[-29825934.37, 12469602.2], [13313049.27, 42778361.76]],
  WGS84_EPSG_6587_EN: [[-8687493.23, 2553950.88], [4436444.08, 11663832.71]],
  WGS84_EPSG_6588_EN: [[-28502217.38, 8379087.18], [14555233.62, 38267091.16]],
  WGS84_EPSG_6619_EN: [[-7750282.22, -677007.08], [5829730.22, 7691861.02]],
  WGS84_EPSG_6625_EN: [[-25427384.25, -2221147.4], [19126373.22, 25235714.03]],
  WGS84_EPSG_6620_EN: [[-7758751.08, -1913976.01], [5865849.89, 6431086.62]],
  WGS84_EPSG_6626_EN: [[-25455169.18, -6279436.31], [19244875.84, 21099323.34]],
  WGS84_EPSG_6621_EN: [[-7743646.82, 526504.88], [5782189.76, 8939977.28]],
  WGS84_EPSG_6627_EN: [[-25405614.6, 1727374.76], [18970400.91, 29330575.46]],
  WGS84_EPSG_6589_EN: [[-12330763.56, -3055058.53], [1430464.23, 12158733.55]],
  WGS84_EPSG_6590_EN: [[-40455180.1, -10023137.87], [4693114.73, 39890778.31]],
  WGS84_EPSG_6592_EN: [[-6613365.78, -586877.83], [5195642.27, 8928543.19]],
  WGS84_EPSG_6593_EN: [[-21697350.9, -1925448.36], [17046036.36, 29293062.13]],
  WGS84_EPSG_6594_EN: [[-6692315.24, -1428426.98], [5182898.06, 8122879.9]],
  WGS84_EPSG_6595_EN: [[-21956370.91, -4686430.85], [17004224.73, 26649815.14]],
  WGS84_EPSG_6598_EN: [[-7182893.68, -3537972.57], [6896220.12, 4499728.82]],
  WGS84_EPSG_6599_EN: [[-23565877.02, -11607498.34], [22625348.85, 14762860.31]],
  WGS84_EPSG_6600_EN: [[-9414881.08, -2691762.23], [2421968.81, 6763405.96]],
  WGS84_EPSG_6601_EN: [[-30888655.67, -8831223.24], [7946075.99, 22189607.71]],
  WGS84_EPSG_6602_EN: [[-9439173.99, -2514239.01], [2577241.27, 6925362.11]],
  WGS84_EPSG_6603_EN: [[-30968356.68, -8248799.14], [8455499.07, 22720958.85]],
  WGS84_EPSG_6879_EN: [[-8808356.13, -3342829.41], [3723626.99, 5647893.16]],
  WGS84_EPSG_6605_EN: [[-28898748.39, -10967266.16], [12216599.54, 18529796.13]],
  WGS84_EPSG_6606_EN: [[-8774512.37, -3509703.89], [3752290.46, 5470328.9]],
  WGS84_EPSG_6607_EN: [[-28787712.67, -11514753.53], [12310639.62, 17947237.39]],
  WGS84_EPSG_6608_EN: [[-8849479.8, -3119574.5], [3692292.16, 5888151.9]],
  WGS84_EPSG_6609_EN: [[-29033668.3, -10234804.0], [12113795.19, 19318045.01]],
  WGS84_EPSG_6611_EN: [[-12537439.97, -2834693.24], [5013296.64, 5430631.89]],
  WGS84_EPSG_6612_EN: [[-41133250.97, -9300156.07], [16447790.73, 17816998.14]],
  WGS84_EPSG_6613_EN: [[-12136069.03, -2733127.91], [5512885.54, 5464673.82]],
  WGS84_EPSG_6614_EN: [[-39816419.8, -8966937.17], [18086858.64, 17928684.03]],
  WGS84_EPSG_6615_EN: [[-11350728.03, -2734670.22], [6305261.33, 5381330.59]],
  WGS84_EPSG_6616_EN: [[-37239846.87, -8971997.22], [20686511.54, 17655248.79]],
  WGS84_EPSG_6617_EN: [[-11753422.12, -2833909.46], [5913245.94, 5321675.42]],
  WGS84_EPSG_6618_EN: [[-38561019.06, -9297584.62], [19400374.39, 17459530.12]],

  WGS84_EPSG_32643_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32644_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32646_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32650_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32651_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  WGS84_EPSG_32652_EN: [[166021.44, 0], [833978.56, 9329005.18]],
  Bessel_EPSG_5173_EN: [[156312.03, 55202.27], [287521.6, 504908.71]],
  Bessel_EPSG_5174_EN: [[107314.04, 52227.33], [287175.27, 537096.41]],
  Bessel_EPSG_5175_EN: [[114831.13, 11204.95], [200659.74, 62956.79]],
  Bessel_EPSG_5176_EN: [[107892.86, 111015.49], [256333.25, 571232.64]],
  Bessel_EPSG_5177_EN: [[174066.18, 432343.17], [200627.6, 457827.25]],
  HD72_EPSG_23700_EN: [[421391.21, 48212.58], [934220.63, 366660.88]],
  QND95_EPSG_2932_EN: [[146718.73, 311103.73], [246386.93, 493865.19]],
  Peru96_EPSG_5387_EN: [[-509282.15, 7641491.42], [1205817.43, 9996663.62]],
  ETRS89_EPSG_2180_EN: [[-2861425.28, -1057534.86], [734796.39, 4087948.56]],
  ETRS89_EPSG_2177_EN: [[3236256.79, 4207696.11], [6745499.32, 9397976.34]],
};

export const COORDINATE_TITLE_MAP: { [K in T.CoordinateTitle]: T.CoordinateTitle } = {
  [T.CoordinateTitle.EASTING]: T.CoordinateTitle.LATITUDE,
  [T.CoordinateTitle.NORTHING]: T.CoordinateTitle.LONGITUDE,
  [T.CoordinateTitle.LATITUDE]: T.CoordinateTitle.EASTING,
  [T.CoordinateTitle.LONGITUDE]: T.CoordinateTitle.NORTHING,
  [T.CoordinateTitle.ALTITUDE]: T.CoordinateTitle.ALTITUDE,
};

// check how this has been using before changing the order of returning values
export const getCoordinateTitles: (crs: T.CoordinateSystem) => Array<T.CoordinateTitle> = (coordinateSystem) => {
  const DEFAULT_TITLES: Array<T.CoordinateTitle> = [EASTING, NORTHING, ALTITUDE];

  const coordinateSystemPosfix: string = coordinateSystem.substr(coordinateSystem.lastIndexOf('_'));

  switch (coordinateSystemPosfix) {
    case '_EN':
      return [NORTHING, EASTING, ALTITUDE];

    case '_LL':
      return [LATITUDE, LONGITUDE, ALTITUDE];

    default:
      return DEFAULT_TITLES;
  }
};
