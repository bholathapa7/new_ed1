/* eslint-disable max-lines, no-magic-numbers */

import Color from 'color';
import { RouterActionType } from 'connected-react-router';

import { defaultCoordinateSystem } from '^/utilities/coordinate-util';

import * as T from '^/types';

import { defaultBlueprintPDFHeight, defaultBlueprintPDFWidth } from '^/constants/defaultContent';
import palette from '^/constants/palette';
import { getUserFeaturePermission } from '^/utilities/withFeatureToggle';
import { createInitialContentsTree } from './duck/Groups';

export const mockAuth: T.AuthState = {
  authedUser: {
    id: 1,
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NTYzNDY5ODcsInN1YiI6NTJ9.hpJKzM3oSWMs1p3afFwJ6cx-R0u5VsLYr9YVgPQq2Uk',
    policy: '2019년',
    signature: '11월',
    keyPairId: '25일 고기땡긴다',
  },
  automaticSignIn: false,
  signInStatus: T.APIStatus.IDLE,
  signUpStatus: T.APIStatus.IDLE,
};

export const mockrouter: T.RouterState = {
  location: {
    hash: '',
    key: '',
    pathname: '/',
    search: '',
    state: {},
  },
  action: 'PUSH' as RouterActionType,
};

export const mockAuthWithoutToken: T.AuthState = {
  ...mockAuth,
  authedUser: undefined,
};

export const mockContents: T.ContentsState = {
  contents: {
    byId: {
      3: {
        id: 3,
        projectId: 1,
        title: '샘플 지도',
        type: T.ContentType.MAP,
        category: T.ContentCategory.MAP,
        screenId: 1,
        color: new Color('#222222'),
        info: {
        },
        appearAt: new Date(Date.UTC(2020, 4 - 1, 19)),
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 26)),
        createdBy: {
          id: 1,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 26)),
      },
      4: {
        id: 4,
        projectId: 1,
        title: '샘플 도면',
        type: T.ContentType.BLUEPRINT_PDF,
        category: T.ContentCategory.OVERLAY,
        screenId: 1,
        color: new Color('#444444'),
        info: {
          imagePoint: [[0.1, 0.1], [0.9, 0.7]],
          geoPoint: [[1, 2], [3, 4]],
          dimension: {
            width: defaultBlueprintPDFWidth,
            height: defaultBlueprintPDFHeight,
          },
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 24)),
        createdBy: {
          id: 2,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 24)),
      },
      5: {
        id: 5,
        projectId: 3,
        title: '샘플 위치',
        type: T.ContentType.MARKER,
        category: T.ContentCategory.MEASUREMENT,
        screenId: 1,
        color: new Color('#666666'),
        info: {
          location: [7, 8],
          description: '샘플 설명',
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 23)),
        createdBy: {
          id: 3,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 23)),
      },
      7: {
        id: 7,
        projectId: 1,
        title: '샘플 거리',
        screenId: 1,
        type: T.ContentType.LENGTH,
        category: T.ContentCategory.MEASUREMENT,
        color: new Color('#C1C1C1'),
        info: {
          locations: [[10, 11], [9, 17], [14, 15]],
          elevations: [{
            comparisonContentId: 0,
            points: [
              [
                -84.1466977876,
                30.6016064353,
                0,
                74.38208,
              ],
              [
                -84.1466955271,
                30.6016075619,
                0.25,
                74.31017,
              ],
              [
                -84.1466932666,
                30.6016086885,
                0.5,
                74.27462,
              ],
              [
                -84.1466910061,
                30.6016098151,
                0.75,
                73.892136,
              ],
              [
                -84.1466887456,
                30.6016109417,
                1,
                73.9848,
              ],
              [
                -84.1466864851,
                30.6016120682,
                1.25,
                73.9848,
              ],
              [
                -84.1466842246,
                30.6016131948,
                1.5,
                73.9848,
              ],
              [
                -84.1466819641,
                30.6016143214,
                1.75,
                74.22152,
              ],
              [
                -84.1466797036,
                30.601615448,
                2,
                74.40717,
              ],
              [
                -84.1466774431,
                30.6016165746,
                2.25,
                74.94979,
              ],
              [
                -84.1466751826,
                30.6016177012,
                2.5,
                75.22481,
              ],
              [
                -84.1466729221,
                30.6016188278,
                2.75,
                76.02325,
              ],
              [
                -84.1466706616,
                30.6016199544,
                3,
                76.41463,
              ],
              [
                -84.1466684011,
                30.601621081,
                3.25,
                76.688065,
              ],
              [
                -84.1466661406,
                30.6016222076,
                3.5,
                76.97466,
              ],
              [
                -84.1466638801,
                30.6016233342,
                3.75,
                77.146774,
              ],
              [
                -84.1466616196,
                30.6016244608,
                4,
                77.38676,
              ],
              [
                -84.1466593591,
                30.6016255874,
                4.25,
                77.72249,
              ],
              [
                -84.1466570985,
                30.601626714,
                4.5,
                77.681694,
              ],
              [
                -84.146654838,
                30.6016278406,
                4.75,
                77.72249,
              ],
              [
                -84.1466525775,
                30.6016289671,
                5,
                77.72599,
              ],
              [
                -84.146650317,
                30.6016300937,
                5.25,
                77.45223,
              ],
              [
                -84.1466480565,
                30.6016312203,
                5.5,
                77.45223,
              ],
              [
                -84.146645796,
                30.6016323469,
                5.75,
                77.1833,
              ],
              [
                -84.1466435355,
                30.6016334735,
                6,
                76.77744,
              ],
              [
                -84.146641275,
                30.6016346001,
                6.25,
                76.655045,
              ],
              [
                -84.1466390145,
                30.6016357267,
                6.5,
                77.831696,
              ],
              [
                -84.146636754,
                30.6016368533,
                6.75,
                76.92505,
              ],
              [
                -84.1466344935,
                30.6016379799,
                7,
                76.04776,
              ],
              [
                -84.146632233,
                30.6016391065,
                7.25,
                75.12384,
              ],
              [
                -84.1466299725,
                30.6016402331,
                7.5,
                79.52534,
              ],
              [
                -84.146627712,
                30.6016413597,
                7.75,
                79.57543,
              ],
              [
                -84.1466254515,
                30.6016424863,
                8,
                79.67621,
              ],
              [
                -84.146623191,
                30.6016436129,
                8.25,
                79.67621,
              ],
              [
                -84.1466209305,
                30.6016447394,
                8.5,
                79.575096,
              ],
              [
                -84.14661867,
                30.601645866,
                8.75,
                79.497955,
              ],
              [
                -84.1466164095,
                30.6016469926,
                9,
                79.39684,
              ],
              [
                -84.146614149,
                30.6016481192,
                9.25,
                79.17643,
              ],
              [
                -84.1466118885,
                30.6016492458,
                9.5,
                79.16911,
              ],
              [
                -84.146609628,
                30.6016503724,
                9.75,
                78.84329,
              ],
              [
                -84.1466073675,
                30.601651499,
                10,
                78.93302,
              ],
              [
                -84.146605107,
                30.6016526256,
                10.25,
                78.573,
              ],
              [
                -84.1466028465,
                30.6016537522,
                10.5,
                78.2501,
              ],
              [
                -84.146600586,
                30.6016548788,
                10.75,
                77.90244,
              ],
              [
                -84.1465983255,
                30.6016560054,
                11,
                77.76902,
              ],
              [
                -84.146596065,
                30.601657132,
                11.25,
                77.6687,
              ],
              [
                -84.1465938045,
                30.6016582586,
                11.5,
                77.50224,
              ],
              [
                -84.146591544,
                30.6016593852,
                11.75,
                77.80059,
              ],
              [
                -84.1465892835,
                30.6016605117,
                12,
                77.43345,
              ],
              [
                -84.146587023,
                30.6016616383,
                12.25,
                77.159256,
              ]],
            comparison: {
              title: 'dfdfd',
              color: '#ffffff',
            },
          }],
        },
        attachmentsCount: 0,
        appearAt: new Date(),
        createdBy: {
          id: 4,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        createdAt: new Date(Date.UTC(2017, 8, 21)),
        updatedAt: new Date(Date.UTC(2017, 8, 21)),
      },
      8: {
        id: 8,
        projectId: 3,
        screenId: 2,
        title: '샘플 넓이',
        type: T.ContentType.AREA,
        category: T.ContentCategory.MEASUREMENT,
        color: new Color('#DBDBDB'),
        info: {
          locations: [[10, 11], [9, 17], [14, 15]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 5,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      9: {
        id: 9,
        projectId: 1,
        title: '샘플 지도 2',
        screenId: 2,
        type: T.ContentType.MAP,
        category: T.ContentCategory.MAP,
        color: new Color('#222222'),
        info: {
        },
        attachmentsCount: 0,
        appearAt: new Date(Date.UTC(2020, 4 - 1, 19)),
        createdAt: new Date(Date.UTC(2017, 12, 26)),
        createdBy: {
          id: 6,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 12, 26)),
      },
      10: {
        id: 10,
        projectId: 3,
        title: '샘플 체적',
        type: T.ContentType.VOLUME,
        category: T.ContentCategory.MEASUREMENT,
        screenId: 3,
        color: palette.measurements.volume,
        info: {
          locations: [[10, 11], [9, 17], [14, 15]],
          calculatedVolume: {
            calculation: {
              type: T.VolumeCalcMethod.BASIC,
              volumeAlgorithm: T.BasicCalcBasePlane.HIGHEST_POINT,
              volumeElevation: 0,
            },
            cut: 0,
            fill: 0,
            total: 0,
          },
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 7,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      11: {
        id: 11,
        projectId: 1,
        screenId: 3,
        title: 'Blueprint DXF',
        type: T.ContentType.BLUEPRINT_DXF,
        category: T.ContentCategory.OVERLAY,
        color: new Color('#444444'),
        info: {
          coordinateSystem: defaultCoordinateSystem,
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 24)),
        createdBy: {
          id: 8,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 24)),
      },
      12: {
        id: 12,
        projectId: 1,
        screenId: 3,
        title: 'Blueprint DWG',
        type: T.ContentType.BLUEPRINT_DWG,
        category: T.ContentCategory.OVERLAY,
        color: new Color('#444444'),
        info: {
          coordinateSystem: defaultCoordinateSystem,
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 24)),
        createdBy: {
          id: 100,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 24)),
      },
      13: {
        id: 13,
        projectId: 1,
        title: 'idkidkidk',
        screenId: 3,
        type: T.ContentType.MAP,
        category: T.ContentCategory.MAP,
        color: new Color('#222222'),
        info: {
          move: true,
          tms: {
            zoomLevels: [
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
            ],
            boundaries: {
              12: {
                minLon: 126.650390625,
                minLat: 37.579412513438385,
                maxLon: 126.73828125,
                maxLat: 37.64903402157866,
                minX: 3489,
                maxX: 3489,
                minY: 2510,
                maxY: 2510,
              },
              13: {
                minLon: 126.6943359375,
                minLat: 37.579412513438385,
                maxLon: 126.73828125,
                maxLat: 37.61423141542417,
                minX: 6979,
                maxX: 6979,
                minY: 5020,
                maxY: 5020,
              },
              14: {
                minLon: 126.6943359375,
                minLat: 37.579412513438385,
                maxLon: 126.73828125,
                maxLat: 37.61423141542417,
                minX: 13958,
                maxX: 13959,
                minY: 10040,
                maxY: 10041,
              },
              15: {
                minLon: 126.6943359375,
                minLat: 37.579412513438385,
                maxLon: 126.727294921875,
                maxLat: 37.61423141542417,
                minX: 27916,
                maxX: 27918,
                minY: 20080,
                maxY: 20083,
              },
              16: {
                minLon: 126.6943359375,
                minLat: 37.583765767186236,
                maxLon: 126.727294921875,
                maxLat: 37.609879943747146,
                minX: 55832,
                maxX: 55837,
                minY: 40161,
                maxY: 40166,
              },
              17: {
                minLon: 126.69708251953125,
                minLat: 37.58594229860422,
                maxLon: 126.72454833984375,
                maxLat: 37.60770411242839,
                minX: 111665,
                maxX: 111674,
                minY: 80323,
                maxY: 80332,
              },
              18: {
                minLon: 126.69845581054688,
                minLat: 37.58703054044867,
                maxLon: 126.72454833984375,
                maxLat: 37.60770411242839,
                minX: 223331,
                maxX: 223349,
                minY: 160647,
                maxY: 160665,
              },
              19: {
                minLon: 126.69845581054688,
                minLat: 37.587574655404694,
                maxLon: 126.72386169433594,
                maxLat: 37.60716014465307,
                minX: 446662,
                maxX: 446698,
                minY: 321295,
                maxY: 321330,
              },
              20: {
                minLon: 126.69845581054688,
                minLat: 37.587574655404694,
                maxLon: 126.72386169433594,
                maxLat: 37.60688815927359,
                minX: 893324,
                maxX: 893397,
                minY: 642590,
                maxY: 642660,
              },
              21: {
                minLon: 126.69845581054688,
                minLat: 37.587710683522225,
                maxLon: 126.72369003295898,
                maxLat: 37.60688815927359,
                minX: 1786648,
                maxX: 1786794,
                minY: 1285181,
                maxY: 1285321,
              },
              22: {
                minLon: 126.69845581054688,
                minLat: 37.58777869748775,
                maxLon: 126.72369003295898,
                maxLat: 37.60688815927359,
                minX: 3573296,
                maxX: 3573589,
                minY: 2570363,
                maxY: 2570643,
              },
            },
          },
        },
        attachmentsCount: 0,
        appearAt: new Date(Date.UTC(2020, 4 - 1, 19)),
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 9,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      15: {
        id: 15,
        projectId: 3,
        title: 'Design DXF',
        type: T.ContentType.DESIGN_DXF,
        category: T.ContentCategory.OVERLAY,
        screenId: 4,
        color: new Color('#ABCDEF'),
        info: {
          coordinateSystem: T.ProjectionEnum.Bessel_EPSG_5174_EN,
          opacity: 100,
          designBorder: [
            [14134679.137052, 4519619.36741],
            [14135349.155378, 4519579.357403],
            [14135567.717506, 4520951.043762],
            [14134523.874338, 4520851.317327],
            [14134679.137052, 4519619.36741],
          ],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 10,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      8737: {
        id: 8737,
        projectId: 3,
        title: 'Violated DBVC Volume',
        type: T.ContentType.VOLUME,
        category: T.ContentCategory.MEASUREMENT,
        color: palette.measurements.volume,
        screenId: 5,
        info: {
          locations: [
            [126.974466, 38.57693],
            [126.979165, 38.577202],
            [126.979605, 38.5838],
            [126.974091, 38.584055],
          ],
          calculatedVolume: {
            cut: 0,
            fill: 0,
            total: 0,
            minMaxElevation: {
              maxHeight: 100,
              minHeight: -100,
            },
            calculation: {
              type: T.VolumeCalcMethod.DESIGN,
              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
              volumeElevation: 0,
              designDxfId: 15,
            },
            wmsInfo: {
              layer: 'SAMPLE_LAYER',
              nativeBoundingBox: {
                minx: 1,
                miny: 1,
                maxx: 2,
                maxy: 2,
              },
              url: 'angelswing.io',
            },
          },
          isBoundaryViolated: true,
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 11,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      8738: {
        id: 8738,
        projectId: 3,
        title: 'Not violated DBVC Volume',
        type: T.ContentType.VOLUME,
        category: T.ContentCategory.MEASUREMENT,
        color: palette.measurements.volume,
        screenId: 1,
        config: {
          type: T.ContentType.VOLUME,
          dsm: {
            opacity: 70,
            isOn: true,
            percents: {
              max: 0,
              min: 0,
              survey: {
                maxCut: 100,
                maxFill: 100,
                maxHigh: 100,
                maxLow: 100,
                minHigh: 0,
                minLow: 0,
              },
            },
          },
        },
        info: {
          locations: [
            [126.974466, 37.57693],
            [126.979165, 37.577202],
            [126.979605, 37.5838],
            [126.974091, 37.584055],
          ],
          calculatedVolume: {
            cut: 0,
            fill: 0,
            total: 0,
            minMaxElevation: {
              maxHeight: 100,
              minHeight: -100,
            },
            calculation: {
              type: T.VolumeCalcMethod.DESIGN,
              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
              volumeElevation: 0,
              designDxfId: 15,
            },
            wmsInfo: {
              layer: 'SAMPLE_LAYER',
              nativeBoundingBox: {
                minx: 1,
                miny: 1,
                maxx: 2,
                maxy: 2,
              },
              url: 'angelswing.io',
            },
          },
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 12,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      8739: {
        id: 8739,
        projectId: 3,
        title: 'SBVC Volume',
        type: T.ContentType.VOLUME,
        category: T.ContentCategory.MEASUREMENT,
        color: palette.measurements.volume,
        screenId: 1,
        config: {
          type: T.ContentType.VOLUME,
          dsm: {
            opacity: 70,
            isOn: true,
            percents: {
              max: 0,
              min: 0,
              survey: {
                maxCut: 100,
                maxFill: 100,
                maxHigh: 100,
                maxLow: 100,
                minHigh: 0,
                minLow: 0,
              },
            },
          },
        },
        info: {
          locations: [
            [10, 11],
            [9, 17],
            [14, 15],
          ],
          calculatedVolume: {
            cut: 0,
            fill: 0,
            total: 0,
            minMaxElevation: {
              maxHeight: 100,
              minHeight: -100,
            },
            calculation: {
              type: T.VolumeCalcMethod.SURVEY,
              volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
              volumeElevation: 0,
              previousDsmId: 8740,
            },
            wmsInfo: {
              layer: 'SAMPLE_LAYER',
              nativeBoundingBox: {
                minx: 1,
                miny: 1,
                maxx: 2,
                maxy: 2,
              },
              url: 'angelswing.io',
            },
          },
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        createdBy: {
          id: 13,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
      },
      8740: {
        type: T.ContentType.DSM,
        category: T.ContentCategory.MAP,
        id: 8740,
        projectId: 1,
        title: 'DSM Content',
        color: new Color('#000000'),
        appearAt: new Date(),
        info: {
          elevation: {
            counts: [],
            bins: [],
          },
          minHeight: null,
          maxHeight: null,
        },
        attachmentsCount: 0,
        status: T.ContentProcessingStatus.COMPLETED,
        createdAt: new Date(),
        createdBy: {
          id: 14,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(),
        screenId: 1,
      },
      23971: {
        type: T.ContentType.THREE_D_MESH,
        category: T.ContentCategory.MAP,
        id: 23971,
        projectId: 1,
        title: '',
        color: new Color('#ffffff'),
        appearAt: new Date(),
        info: {},
        attachmentsCount: 0,
        createdAt: new Date(),
        createdBy: {
          id: 15,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(),
        screenId: 1,
        status: T.ContentProcessingStatus.COMPLETED,
      },
      20210518: {
        type: T.ContentType.ESS_MODEL,
        category: T.ContentCategory.ESS,
        id: 20210518,
        projectId: 1,
        title: 'user-defined title',
        color: new Color('#ffffff'),
        appearAt: new Date(),
        info: {
          location: [9, 19],
          description: 'Some description',
          modelId: 1,
          isWorkRadiusVisEnabled: true,
        },
        attachmentsCount: 0,
        createdAt: new Date(),
        createdBy: {
          id: 15,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(),
        screenId: 1,
      },
      20210519: {
        type: T.ContentType.ESS_ARROW,
        category: T.ContentCategory.ESS,
        id: 20210519,
        projectId: 1,
        title: 'user-defined title',
        color: new Color('#ffffff'),
        appearAt: new Date(),
        info: {
          locations: [[9, 19], [9, 19]],
        },
        attachmentsCount: 0,
        createdAt: new Date(),
        createdBy: {
          id: 15,
          email: 'yejun@angelswing.io',
          name: 'Yejun Lee',
        },
        updatedAt: new Date(),
        screenId: 1,
      },
      20210823: {
        type: T.ContentType.ESS_TEXT,
        category: T.ContentCategory.ESS,
        id: 20210823,
        projectId: 1,
        title: 'user-defined title',
        color: new Color('#ffffff'),
        appearAt: new Date(),
        info: {
          location: [9, 19],
          fontSize: 11,
          fontColor: new Color('#000000'),
          description: 'happy',
        },
        attachmentsCount: 0,
        createdAt: new Date(),
        createdBy: {
          id: 16,
          email: 'jinyoung@angelswing.io',
          name: 'Jinyoung Bae',
        },
        updatedAt: new Date(),
        screenId: 1,
      },
    },
    allIds: [3, 4, 5, 7, 8, 9, 10, 11, 12, 15, 8737, 8738, 8739, 8740, 23971, 20210518, 20210519, 20210823],
  },
  measurement: {
    3: '1',
    4: '1',
    5: '1',
    6: '1',
    7: '1',
    8: '1',
    9: '1',
    10: '1',
    11: '1',
  },
  uploadContents: {
    1: {
      id: 1,
      type: T.AttachmentType.POINTCLOUD,
      file: [{
        hash: 'data.las// 10',
        size: 50000,
      }],
      uploadedAt: new Date(),
      status: T.APIStatus.PROGRESS,
    },
  },
  getContentsStatus: T.APIStatus.IDLE,
  getInitialContentsStatus: T.APIStatus.IDLE,
  postContentStatus: T.APIStatus.IDLE,
  patchContentStatus: T.APIStatus.IDLE,
  deleteContentStatus: T.APIStatus.IDLE,
  printMapStatus: T.APIStatus.IDLE,
  dxf2RasterStatus: T.APIStatus.IDLE,
  getContentDownloadablesStatus: T.APIStatus.IDLE,
  requestLasDownSamplingStatus: T.APIStatus.IDLE,
  requestLasReprocessingStatus: T.APIStatus.IDLE,
  requestVolumeCalculation: {},
  requestMarkerElevationInfo: {},
  requestLengthElevationInfo: {},
  getLengthMetrics: {},
  getAreaSurface: {},
  outdatedVolumeIds: [],
  contentDownloadables: {},
  lasDownSamplingStatus: {},
};

export const mockProjects: T.ProjectsState = {
  projects: {
    byId: {
      1: {
        id: 1,
        owner: {
          id: 3,
          avatar: undefined,
          lastName: 'Yogi',
          firstName: 'Kim',
          email: 'yogi@angeslwing.io',
          organization: 'ANGELSWING',
        },
        title: '산라파헬 광산',
        coordinateSystem: undefined,
        description: '관악구 삼성동(원신길 남부) 시민 안전을 위한 상세지도 프로젝트 ' +
                     '관악구 삼성동(원신길 남부) 시민 안전을 위한 상세지도 프로젝트 ' +
                     '관악구 삼성동(원신길 남부) 시민 안전을 위한 상세지도 프로젝트',
        logo: 'https://www.angelswing.org/aw/common/img/layout/header_logo.png',
        thumbnail: undefined,
        permissionStatus: T.AcceptStatus.ACCEPTED,
        permissionRole: T.PermissionRole.ADMIN,
        permissionsCount: 2,
        createdAt: new Date(Date.UTC(2017, 8, 20)),
        updatedAt: new Date(Date.UTC(2017, 8, 20)),
        availableDates: ['2017/08/20', '2018/12/23'].map((date) => new Date(date)),
        type: T.ProjectType.USER,
        features: {
          ddm: true,
          ess: true,
          oneD: false,
        },
      },
      3: {
        id: 3,
        owner: {
          id: 5,
          avatar: undefined,
          lastName: 'Yejun',
          firstName: 'Lee',
          email: 'yejun@naver.com',
          organization: 'NAVER',
        },
        title: '엔젤스윙 사옥',
        coordinateSystem: undefined,
        description: '회사에서 집사줬다 하앍하앍',
        logo: undefined,
        thumbnail: undefined,
        permissionStatus: T.AcceptStatus.PENDING,
        permissionRole: T.PermissionRole.MEMBER,
        permissionsCount: 1,
        createdAt: new Date(Date.UTC(2017, 8, 31)),
        updatedAt: new Date(Date.UTC(2017, 9, 3)),
        availableDates: ['2017/08/20', '2018/12/23'].map((date) => new Date(date)),
        type: T.ProjectType.USER,
        features: {
          ddm: true,
          ess: true,
          oneD: false,
        },
      },
    },
    allIds: [1, 3],
  },
  getProjectStatus: T.APIStatus.IDLE,
  getProjectsStatus: T.APIStatus.IDLE,
  postProjectStatus: T.APIStatus.IDLE,
  patchProjectStatus: T.APIStatus.IDLE,
  deleteProjectStatus: T.APIStatus.IDLE,
  getCalendarStatus: T.APIStatus.IDLE,
};

export const mockUsers: T.UsersState = {
  users: {
    byId: {
      1: {
        id: 1,
        email: 'test01@example.com',
        firstName: '성',
        lastName: '이름',
        organization: '조직',
        contactNumber: '+8219-3044-1205',
        country: 'Korea',
        language: T.Language.KO_KR,
        purpose: '몰라요',
        avatar: undefined,
        role: T.UserRole.PREMIUM,
        featurePermission: getUserFeaturePermission(T.Feature.DDM),
        createdAt: new Date(),
      },
      3: {
        id: 3,
        email: 'test02@example.org',
        firstName: '트',
        lastName: '테스',
        organization: 'none',
        contactNumber: '+2-512-213-1245',
        country: 'Somewhere',
        language: T.Language.EN_US,
        purpose: 'Some purpose',
        avatar: undefined,
        featurePermission: getUserFeaturePermission(T.Feature.DDM),
        createdAt: new Date(),
      },
      7: {
        id: 7,
        email: 'test03@example.com',
        firstName: '테스트',
        lastName: '테스트',
        organization: '???',
        contactNumber: '+1-203-404-2302',
        country: 'aere',
        language: T.Language.KO_KR,
        purpose: 'fweefe',
        avatar: undefined,
        featurePermission: getUserFeaturePermission(T.Feature.DDM),
        createdAt: new Date(),
      },
    },
    allIds: [1, 3, 7],
  },
  notices: {
    1: {
      id: 1,
      type: 'releaseNotes',
      url: 'https://www.naver.com/',
      title: '[공지] 플랫폼 ver16.8.1 업데이트 알림',
      headings: ['1. 시간여행 가능', '2. 드론 자가용으로 사용 가능', '3. 엔젤스윙 흑백모드 출시'],
      isRead: true,
      isHidden: false,
      isShown: false,
      createdAt: new Date(Date.UTC(2500, 8, 21)),
    },
    2: {
      id: 2,
      type: 'releaseNotes',
      url: 'https://www.naver.com/',
      title: '[공지] 플랫폼 ver29.2.7 업데이트 알림',
      headings: ['1. 고양이', '2. 강아지', '3. 얼룩말'],
      isRead: false,
      isHidden: false,
      isShown: false,
      createdAt: new Date(Date.UTC(2500, 8, 22)),
    },
    3: {
      id: 3,
      type: 'releaseNotes',
      url: 'https://www.naver.com/',
      title: '[공지] 플랫폼 ver37.1.2 업데이트 알림',
      headings: ['1. 오늘은 2019년 10월 28일', '2. 내일은 2019년 10월 29일', '3. 좀 있으면 11월'],
      isRead: false,
      isHidden: false,
      isShown: false,
      createdAt: new Date(Date.UTC(2500, 8, 23)),
    },
  },
  getUserInfoStatus: T.APIStatus.IDLE,
  patchUserInfoStatus: T.APIStatus.IDLE,
  postPasswordResetStatus: T.APIStatus.IDLE,
  patchPasswordStatus: T.APIStatus.IDLE,
  getNoticeStatus: T.APIStatus.IDLE,
  patchNoticeStatus: T.APIStatus.IDLE,
};

export const mockUserConfig: T.UserConfigState = {
  config: undefined,
  getUserConfigStatus: T.APIStatus.IDLE,
  patchUserConfigStatus: T.APIStatus.IDLE,
};

export const mockPlanConfig: T.PlanConfigState = {
  config: {},
  getPlanConfigStatus: T.APIStatus.IDLE,
};

export const mockPermissions: T.PermissionsState = {
  permissions: {
    byId: {
      1: {
        id: 1,
        projectId: 1,
        userId: 1,
        avatar: undefined,
        email: 'test01@example.com',
        firstName: '스트',
        lastName: '테',
        organization: '없음',
        role: T.PermissionRole.ADMIN,
        status: T.PermissionStatus.ACCEPTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      2: {
        id: 2,
        projectId: 1,
        userId: 3,
        avatar: undefined,
        email: 'test01@example.com',
        firstName: '스트',
        lastName: '테',
        organization: '없음',
        role: T.PermissionRole.ADMIN,
        status: T.PermissionStatus.ACCEPTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      3: {
        id: 3,
        projectId: 1,
        userId: 7,
        avatar: undefined,
        email: 'test01@example.com',
        firstName: '스트',
        lastName: '테',
        organization: '없음',
        role: T.PermissionRole.MEMBER,
        status: T.PermissionStatus.DENIED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      4: {
        id: 4,
        projectId: 3,
        userId: 1,
        avatar: undefined,
        email: 'test01@example.com',
        firstName: '스트',
        lastName: '테',
        organization: '없음',
        role: T.PermissionRole.MEMBER,
        status: T.PermissionStatus.ACCEPTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      5: {
        id: 5,
        projectId: 3,
        userId: 7,
        avatar: undefined,
        email: 'test01@example.com',
        firstName: '스트',
        lastName: '테',
        organization: '없음',
        role: T.PermissionRole.ADMIN,
        status: T.PermissionStatus.ACCEPTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    allIds: [1, 2, 3, 4, 5],
  },
  getPermissionsStatus: T.APIStatus.IDLE,
  postPermissionsStatus: T.APIStatus.IDLE,
  patchPermissionStatus: T.APIStatus.IDLE,
  deletePermissionStatus: T.APIStatus.IDLE,
};

export const mockContentEventLogs: Array<T.ContentEventLog> = [
  {
    id: 1,
    relatedLogId: null,
    event: T.ContentEvent.CREATED,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 's',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'S',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'S',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 2,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 3,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.EXPIRED,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 4,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.PERFORMED,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 5,
    relatedLogId: null,
    event: T.ContentEvent.RECOVERED,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'long long long dataset name',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'long long long long name',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'long long long long long long name',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 6,
    relatedLogId: null,
    event: T.ContentEvent.CREATED,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 's',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'S',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'S',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 7,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 8,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.EXPIRED,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 9,
    relatedLogId: null,
    event: T.ContentEvent.DESTROY,
    status: T.ContentEventStatus.PERFORMED,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'medium dataset length',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'Medium name length',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'Medium name length',
      email: 'yejun@angelswing.io',
    },
  },
  {
    id: 10,
    relatedLogId: null,
    event: T.ContentEvent.RECOVERED,
    status: T.ContentEventStatus.OK,
    screen: {
      id: 1,
      appearAt: new Date(),
      title: 'long long long dataset name',
    },
    content: {
      id: 1,
      type: T.ContentType.MARKER,
      description: '위치 1',
      color: new Color('#000'),
      createdAt: new Date(),
      createdBy: {
        id: 1,
        email: 'yejun@angelswing.io',
        name: 'long long long long name',
      },
      deletedAt: null,
    },
    createdAt: new Date(),
    createdBy: {
      id: 1,
      name: 'long long long long long long name',
      email: 'yejun@angelswing.io',
    },
  }];

const attachments: T.AttachmentsState['attachments'] | T.ESSAttachmentsState['attachments'] = {
  byId: {
    1: {
      id: 1,
      contentId: 5,
      file: {
        url: 'mock_attachment_1.png',
        markerThumb: {
          url: 'mock_attachment_1.png',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 21)),
      updatedAt: new Date(Date.UTC(2017, 8, 21)),
    },
    2: {
      id: 2,
      contentId: 5,
      file: {
        url: 'mock_attachment_2.png',
        markerThumb: {
          url: 'mock_attachment_2.png',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 20)),
      updatedAt: new Date(Date.UTC(2017, 8, 20)),
    },
    3: {
      id: 3,
      contentId: 5,
      file: {
        url: 'mock_attachment_3.jpg',
        markerThumb: {
          url: 'mock_attachment_3.png',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 19)),
      updatedAt: new Date(Date.UTC(2017, 8, 19)),
    },
    4: {
      id: 4,
      contentId: 5,
      file: {
        url: 'mock_attachment_4.bmp',
        markerThumb: {
          url: 'mock_attachment_4.bmp',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 18)),
      updatedAt: new Date(Date.UTC(2017, 8, 18)),
    },
    5: {
      id: 5,
      contentId: 5,
      file: {
        url: 'mock_attachment_5.bmp',
        markerThumb: {
          url: 'mock_attachment_5.bmp',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 18)),
      updatedAt: new Date(Date.UTC(2017, 8, 18)),
    },
    6: {
      id: 6,
      contentId: 5,
      file: {
        url: 'mock_attachment_6.bmp',
        markerThumb: {
          url: 'mock_attachment_6.bmp',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 18)),
      updatedAt: new Date(Date.UTC(2017, 8, 18)),
    },
    7: {
      id: 7,
      contentId: 5,
      file: {
        url: 'mock_attachment_7.bmp',
        markerThumb: {
          url: 'mock_attachment_7.bmp',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 18)),
      updatedAt: new Date(Date.UTC(2017, 8, 18)),
    },
    8: {
      id: 8,
      contentId: 5,
      file: {
        url: 'mock_attachment_8.bmp',
        markerThumb: {
          url: 'mock_attachment_8.bmp',
        },
      },
      type: T.AttachmentType.PHOTO,
      createdAt: new Date(Date.UTC(2017, 8, 18)),
      updatedAt: new Date(Date.UTC(2017, 8, 18)),
    },
  },
  allIds: [1, 2, 3, 4, 5, 6, 7, 8],
};

export const mockAttachments: T.AttachmentsState = {
  attachments,
  getAttachmentsStatus: {},
  postAttachmentStatus: {},
};

export const mockESSAttachments: T.ESSAttachmentsState = {
  attachments,
  getESSAttachmentsStatus: {},
  postESSAttachmentStatus: {},
};

export const mockSharedContents: T.SharedContentsState = {
  /*
  sharedContents: {
    byId: {
      1: {
        id: 1,
        projectId: 324,
        type: T.ContentType.MAP,
        title: '이것은 공유되었다',
        color: new Color('#523794'),
        info: {
          takenAt: new Date(Date.UTC(2020, 8, 25)),
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2020, 8, 26)),
        updatedAt: new Date(Date.UTC(2020, 8, 26)),
      },
      202: {
        id: 202,
        projectId: 324,
        type: T.ContentType.MARKER,
        title: '여기는 어디 나는 누구',
        color: new Color('#49205A'),
        info: {
          location: [23, 5505235],
          description: 'fwejofjew!!@#@! 열줃 ㄸ랃ㄷㄸㄸ!!!',
        },
        attachmentsCount: 2,
        createdAt: new Date(Date.UTC(2013, 9, 10)),
        updatedAt: new Date(Date.UTC(2014, 5, 28)),
      },
      203: {
        id: 203,
        projectId: 324,
        type: T.ContentType.MARKER,
        title: '노는게 제일 좋아',
        color: new Color('#49205A'),
        info: {
          location: [25523, 5505234],
          description: '뜨르르르르르크크크크랄ㄹㄹ랄!',
        },
        attachmentsCount: 2,
        createdAt: new Date(Date.UTC(2013, 9, 11)),
        updatedAt: new Date(Date.UTC(2013, 9, 11)),
      },
      204: {
        id: 204,
        projectId: 324,
        type: T.ContentType.MARKER,
        title: '친구들 모였다',
        color: new Color('#49205A'),
        info: {
          location: [282, 5505236],
          description: '크롱이 주거써!',
        },
        attachmentsCount: 1,
        createdAt: new Date(Date.UTC(2013, 9, 11)),
        updatedAt: new Date(Date.UTC(2013, 9, 11)),
      },
      223: {
        id: 223,
        projectId: 324,
        type: T.ContentType.AREA,
        title: '여기는 얼마나 크으으으니',
        color: new Color('#23E12A'),
        info: {
          locations: [[23, 52], [34, 53], [2495, 234]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 1, 2)),
        updatedAt: new Date(Date.UTC(2017, 3, 6)),
      },
      224: {
        id: 224,
        projectId: 324,
        type: T.ContentType.AREA,
        title: '크고... 아름답습니다...',
        color: new Color('#AE12DE'),
        info: {
          locations: [[20234, 32405], [22034, 30322], [20112, 36212], [25021, 38212]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 1, 2)),
        updatedAt: new Date(Date.UTC(2017, 3, 6)),
      },
      225: {
        id: 225,
        projectId: 324,
        type: T.ContentType.AREA,
        title: '크고... 아름답습니다...',
        color: new Color('#529024'),
        info: {
          locations: [[20234, 32405], [22034, 30322], [20112, 36212], [25021, 38212]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 1, 2)),
        updatedAt: new Date(Date.UTC(2017, 3, 6)),
      },
      244: {
        id: 244,
        projectId: 324,
        type: T.ContentType.LENGTH,
        title: '기다란 기차',
        color: new Color('#234E33'),
        info: {
          locations: [[4231, 9012], [4902, 9123], [4562, 9673]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 5, 12)),
        updatedAt: new Date(Date.UTC(2017, 5, 12)),
      },
      245: {
        id: 245,
        projectId: 324,
        type: T.ContentType.LENGTH,
        title: '기차는 길어어어어어어어ㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓ',
        color: new Color('#C234B1'),
        info: {
          locations: [[63490, 346834], [62134, 349051], [60912, 340124], [59122, 350232]],
        },
        attachmentsCount: 0,
        createdAt: new Date(Date.UTC(2017, 5, 12)),
        updatedAt: new Date(Date.UTC(2017, 5, 12)),
      },
      3340: {
        id: 3340,
        projectId: 324,
        type: T.ContentType.BLUEPRINT,
        title: '우주로 가즈아아아아아아~#@!@@!#!@$@!%#$()',
        color: new Color('#402863'),
        info: {
          imagePoint: [[3, 5], [21, 5]],
          geoPoint: [[324, 7], [12, 2]],
        },
        attachmentsCount: 1,
        createdAt: new Date(Date.UTC(2022, 4, 1)),
        updatedAt: new Date(Date.UTC(2023, 7, 2)),
      },
    },
    allIds: [1, 202, 203, 204, 223, 224, 225, 244, 245, 2590, 3340],
  },
  */
  projection: T.ProjectionEnum.Bessel_EPSG_5176_EN,
  shareToken: 'fawegwgwgn23oigb23oigb3ioe',
  navbarLogoUrl: 'https://test.angelswing.io/static/media/logo.e5ee7d3d.png',
  showAt: new Date(),
  initialCameraPosition: [127, 39],
  projectName: 'my test project long long long long name',
  getSharedContentsStatus: T.APIStatus.IDLE,
  postShareRequestStatus: T.APIStatus.IDLE,
  screenTitle: '스크린 타이틀 테스트 길면 어떻게 될까 아랄ㄹ랄알알ㅇ날ㅇ랑랑ㄹ알알ㅇ랑ㄹ알ㅇ랑ㄹㅇ랑랑랄ㅇㄹㅇ',
};

export const mockScreens: T.ScreensState = {
  screens: [
    {
      id: 1,
      title: '목 스크린 목 123 목 목 최대 길이 테스트 삐빅 삐빅 삐빅 삐빅',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 1),
      appearAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '엔젤스윙 날아다님',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 2),
      appearAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: '세번째 Title임',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 3),
      appearAt: new Date(2020, 7, 13),
      updatedAt: new Date(2020, 7, 13),
      createdAt: new Date(2020, 7, 13),
    },
    {
      id: 4,
      title: '이제 적을 말이 점점 없어짐',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 4),
      appearAt: new Date(2020, 6, 20),
      updatedAt: new Date(2020, 6, 20),
      createdAt: new Date(2020, 6, 20),
    },
    {
      id: 5,
      title: '이 커밋 기준 title 최대 길이는 100글자임',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 5),
      appearAt: new Date(2020, 6, 25),
      createdAt: new Date(2020, 6, 25),
      updatedAt: new Date(2020, 6, 25),
    },
    {
      id: 6,
      title: '어쩌라고',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 6),
      appearAt: new Date(2020, 6, 30),
      createdAt: new Date(2020, 6, 30),
      updatedAt: new Date(2020, 6, 30),
    },
    {
      id: 7,
      title: '어쩌라고랑 똑같은 날짜',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 7),
      appearAt: new Date(2020, 6, 30),
      createdAt: new Date(2020, 6, 30),
      updatedAt: new Date(2020, 6, 30),
    },
    {
      id: 8,
      title: '어쩌라고랑 똑같은 날짜 2',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 8),
      appearAt: new Date(2020, 6, 30),
      createdAt: new Date(2020, 6, 30),
      updatedAt: new Date(2020, 6, 30),
    },
    {
      id: 9,
      title: '44444444444444444444444444444',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 3),
      appearAt: new Date(2020, 7, 11),
      createdAt: new Date(2020, 7, 11),
      updatedAt: new Date(2020, 7, 11),
    },
    {
      id: 10,
      title: '5555555555555555555555555555555',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 3),
      appearAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 11,
      title: '6666666666666666666666666666666666',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 3),
      appearAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 12,
      title: '77777777777777777777777777777777777777',
      contentIds: mockContents.contents.allIds.filter((contentId) => mockContents.contents.byId[contentId].screenId === 3),
      appearAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  getScreensStatus: T.APIStatus.IDLE,
  patchScreensStatus: T.APIStatus.IDLE,
  postScreensStatus: T.APIStatus.IDLE,
  deleteScreensStatus: T.APIStatus.IDLE,
};

export const mockCommonPage: T.CommonPageState = {
  language: T.Language.KO_KR,
  timezoneOffset: 0,
};

export const mockFrontPage: T.FrontPageState = {
  tab: T.FrontPageTabType.LOGIN,
  passwordFormValues: {
    email: '',
  },
  newPasswordFormValues: {
    password: '',
    passwordConfirmation: '',
  },
  signUpFormValues: {
    avatar: undefined,
    email: '',
    password: '',
    passwordConfirmation: '',
    firstName: '',
    lastName: '',
    organization: '',
    contactNumber: '',
    country: '',
    purpose: '',
    language: T.Language.EN_US,
    eula: false,
  },
  signUpFormDirties: {
    avatar: false,
    email: false,
    password: false,
    passwordConfirmation: false,
    firstName: false,
    lastName: false,
    organization: false,
    contactNumber: false,
    country: false,
    purpose: false,
    language: true,
    eula: false,
  },
};

export const mockProjectPage: T.ProjectPageState = {
  tab: T.ProjectPageTabType.LIST,
  myPageFormValues: {
    password: '',
    passwordConfirmation: '',
    organization: '',
    contactNumber: '',
    country: 'Korea',
    language: T.Language.EN_US,
    purpose: 'droneService',
  },
};

export const mockProjectPageWithEditing: T.ProjectPageState = {
  ...mockProjectPage,
  editingProjectId: 1,
};

export const mockContentsPage: T.ContentsPageState = {
  projectId: 1,
  showSidebar: true,
  isOnWorkRadius: false,
  isTopbarShown: true,
  in3D: false,
  in3DPointCloud: false,
  compare2: {},
  compare4: {},
  twoDDisplayMode: T.TwoDDisplayMode.NORMAL,
  twoDDisplayCenter: [0, 0],
  twoDDisplayZoom: 0,
  isInSourcePhotoUpload: false,
  isInContentsEventLogTable: false,
  isMeasurementClickedFromMap: false,
  rotation: 0,
  sidebarTab: T.ContentPageTabType.MAP,
  imageViewerStatus: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    contentId: mockContents.contents.allIds.find(
      (id) => mockContents.contents.byId[id].type === T.ContentType.MARKER,
    )!,
    attachmentId: 1,
  },
  mapHorizontalTabStatus: T.MapHorizontalTabStatus.HIDDEN,
  getLonLatOn2D3DToggleStatus: T.APIStatus.IDLE,
  shouldUpdateTwoDDisplayZoom: false,
  shouldUpdateTwoDDisplayCenter: false,
  currentPointCloudEngine: T.PointCloudEngine.POTREE,
};

export const mockPages: T.PagesState = {
  Common: mockCommonPage,
  Front: mockFrontPage,
  Project: mockProjectPage,
  Contents: mockContentsPage,
};

export const mockPhotos: T.PhotosState = {
  photos: [],
  currentPhotoId: undefined,
  photoTab: T.PhotoTabType.TIME,
  uploadedPhotoCount: 0,
};

export const mockProjectConfigPerUser: T.ProjectConfigPerUserState = {
  config: {
    projectId: mockProjects.projects.byId[1].id,
    lastSelectedScreenId: 1,
  },
  patchProjectConfigStatus: T.APIStatus.IDLE,
};

export const mockESSModels: T.ESSModelsState = {
  byId: {},
  byCategory: undefined,
  categories: undefined,
  selectedCategoryId: NaN,
  getESSModelByIdStatus: T.APIStatus.IDLE,
  getESSModelsByCategoryStatus: T.APIStatus.IDLE,
  getESSModelCategoriesStatus: T.APIStatus.IDLE,
};

export const mockESSContents: T.ESSContentsState = {
  createESSContentStatus: T.APIStatus.IDLE,
  createESSGroupContentStatus: T.APIStatus.IDLE,
  patchESSContentStatus: T.APIStatus.IDLE,
  deleteESSContentStatus: T.APIStatus.IDLE,
};

export const mockGroups: T.GroupsState = {
  selectedGroupIdByTab: {
    [T.ContentPageTabType.OVERLAY]: undefined,
    [T.ContentPageTabType.MEASUREMENT]: undefined,
    [T.ContentPageTabType.ESS]: undefined,
    [T.ContentPageTabType.MAP]: undefined,
    [T.ContentPageTabType.PHOTO]: undefined,
  },
  isCreatingNewGroup: false,
  isGroupAlreadyDeleted: false,
  isCreatingContentOnDeletedGroup: false,
  tree: createInitialContentsTree(),
  moveContentStatus: T.APIStatus.IDLE,
};

export const sampleMultipleProjects: Array<T.Project> =
  mockProjects.projects.allIds.map((key) => mockProjects.projects.byId[key]);

export const sampleSingleProject: T.Project =
  mockProjects.projects.byId[mockProjects.projects.allIds[0]];

export const sampleMultiplePermissions: Array<T.Permission> =
  mockPermissions.permissions.allIds
    .map((key) => mockPermissions.permissions.byId[key])
    .filter((permission) => permission.projectId === mockProjects.projects.allIds[0]);

export const sampleSinglePermission: T.Permission =
  mockPermissions.permissions.byId[mockPermissions.permissions.allIds[0]];

export const sampleMultipleAttachments: Array<T.Attachment> =
  mockAttachments.attachments.allIds.map((id) => mockAttachments.attachments.byId[id]);

export const sampleSingleAttachment: T.Attachment = sampleMultipleAttachments[0];

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const sampleRestrictedUser: T.RestrictedUser = mockUsers.users.allIds.map(
  (id) => mockUsers.users.byId[id],
).find(
  (user) => !Object.keys(user).includes('role'),
)!;

export const sampleFullUser: T.FullUser =
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mockUsers.users.byId[mockAuth.authedUser!.id] as T.FullUser;

export const multipleContents: Array<T.Content> =
  mockContents.contents.allIds.map((id) => mockContents.contents.byId[id]);

export const sampleMultipleContentsFromType: (
  type: T.ContentType,
) => Array<T.Content> = (
  type,
) => multipleContents.filter((content) => content.type === type);

export const sampleContentFromType: (
  type: T.ContentType,
) => T.Content = (
  type,
) => multipleContents.filter((content) => content.type === type)[0];

export const sampleScreen: () => T.Screen = () => mockScreens.screens[0];

export const imageUrl: string = 'https://javascriptis/awesomeLang/hehehehe/cute?gophter=true';

export const file: File = new File([], 'mockFile');
