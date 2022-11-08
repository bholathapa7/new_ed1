/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, max-lines, no-magic-numbers, max-len */
import Chart, { ChartDataSets } from 'chart.js';
import { autobind } from 'core-decorators';
import * as _ from 'lodash-es';
import React, { Component, ReactNode, RefObject, createRef, memo } from 'react';
import styled, { CSSObject } from 'styled-components';

import * as T from '^/types';

import ResetZoomSvg from '^/assets/icons/centered-view.svg';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { l10n } from '^/utilities/l10n';
import { arePropsEqual } from '^/utilities/react-util';
import Color from 'color';
import { crosshairPlugin } from './chartjs-plugin-crosshair';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import Text from './text';
import { UNIT_SYMBOL, VALUES_PER_METER } from '^/utilities/imperial-unit';

require('chartjs-plugin-zoom');

const AXES_TICK_PRECISION: number = 2;
const POINT_RADIUS: number = 3;
const NO_DSM_ALT: number = 1e-10;
const NO_DSM_FLAG: Record<T.ValidUnitType, Array<number>> = {
  [T.UnitType.METRIC]: [-1000, -10000],
  [T.UnitType.IMPERIAL]: [-1000, -10000].map((val) => val * VALUES_PER_METER[T.UnitType.IMPERIAL]),
};
const TOOLTIP_OFFSET_COEFFICIENT: {[key: string]: {X: number; Y: number}} = {
  5: {
    X: 16,
    Y: 0.35,
  },
  4: {
    X: 20,
    Y: 0.4,
  },
  3: {
    X: 28,
    Y: 0.45,
  },
  2: {
    X: 40,
    Y: 0.5,
  },
  1: {
    X: 80,
    Y: 0.54,
  },
};

const ResetZoomButton = styled.div({
  position: 'absolute',
  right: '25px',
  top: '11px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '30px',
  height: '30px',

  backdropFilter: 'blur(10px)',
  borderRadius: '3px',

  backgroundColor: palette.ElevationProfile.resetButton.toString(),

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
});

const Root = styled.div({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: 'transparent',
});

const ZoomSvgWrapper = styled.div({
  width: '30px',
  height: '30px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const TooltipBalloonStyle: CSSObject = {
  position: 'absolute',
  left: 'auto',
  right: '33px',
  bottom: '3px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: {
    width: '100%',
    height: '100%',
  },
  tooltipBalloonStyle: TooltipBalloonStyle,
};

const chartSuggedtedMinMargin: number = 0.03;

const makeData: (rawData: Array<T.LengthElevationData>) => Array<Chart.ChartPoint> = (
  rawData,
) => rawData
  .map(({ dist, alt }: T.LengthElevationData) => ({ x: dist, y: alt }));

const getPointRadius: (context: any) => number = (context) => context.dataIndex === 0 ? POINT_RADIUS : 0;

const findTheLongestAmong: (setsOfChartData: Array<Array<Chart.ChartPoint>>) => {
  data: Array<Chart.ChartPoint>; maxTick: number;
} = (setsOfChartData) => {
  let maxTick: number | undefined = -999999;
  let setOfChartDataWithlongestLength: Array<Chart.ChartPoint> = [];

  for (const setOfChartData of setsOfChartData) {
    const currentX: number = setOfChartData[setOfChartData.length - 1].x !== undefined ?
      setOfChartData[setOfChartData.length - 1].x as number : maxTick;
    if (maxTick < currentX) {
      maxTick = currentX;
      setOfChartDataWithlongestLength = setOfChartData;
    }
  }

  return { data: setOfChartDataWithlongestLength, maxTick };
};

function findTheHighestAlt(setsOfChartData: Array<Array<Chart.ChartPoint>>): number {
  return Math.max(...setsOfChartData.map((setOfChartData) => Math.max(...setOfChartData.map((data) => data.y as number))));
}

function findTheLowestAlt(setsOfChartData: Array<Array<Chart.ChartPoint>>): number {
  return Math.min(...setsOfChartData.map((setOfChartData) => Math.min(...setOfChartData.map((data) => data.y as number))));
}

function findComparisonBaseAlt(dataset: Chart.ChartDataSets, tooltipItem: Chart.ChartTooltipItem): number {
  for (const datum of dataset.data as Array<Chart.ChartPoint>) {
    if (datum.x === tooltipItem.xLabel) return datum.y as number;
  }

  return NO_DSM_ALT;
}
/**
 * @info Below code helps to reduce the number of points to display on Chart, max = 500 points
 */
const makeRevisedData: (unit: T.ValidUnitType) => (data: Array<T.LengthElevationRawData>) => Array<T.LengthElevationData> =
  (unit) => (data) => data.map(([lon, lat, dist, alt]) => ({
    lon, lat, dist, alt: NO_DSM_FLAG[unit].includes(alt) ? NO_DSM_ALT : alt,
  }));

const makeOptions: (
  onHoverCallback: (index?: number) => void,
  language: T.Language,
  setsOfChartData: Array<Array<Chart.ChartPoint>>,
  comparisonColors: Array<Color>,
  unit: T.ValidUnitType,
  suggestedMin?: number,
  isBeginAtZero?: boolean,
  designDXFDatasetIdxs?: Array<number>,
) => Chart.ChartOptions = (
  onHoverCallback, language, setsOfChartData, comparisonColors, unit, suggestedMin, isBeginAtZero, designDXFDatasetIdxs,
) => {
  const elevationText: string = l10n(Text.elevation, language);
  const lengthText: string = l10n(Text.length, language);
  const setOfChartDataWithLongestLength: Array<Chart.ChartPoint> = findTheLongestAmong(setsOfChartData).data;
  const highestAlt: number = findTheHighestAlt(setsOfChartData);
  const lowestAlt: number = findTheLowestAlt(setsOfChartData);

  const isNotAvailable: boolean = highestAlt === NO_DSM_ALT && lowestAlt === NO_DSM_ALT;

  const steps: number = 5;
  const stepSize: number = (highestAlt - lowestAlt) / steps;

  const normalizedHighestAlt: number = isNotAvailable ? 30 : Math.ceil(highestAlt / stepSize) * stepSize;
  const normalizedLowestAlt: number = isNotAvailable ? 0 : Math.floor(lowestAlt / stepSize) * stepSize;

  return {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      mode: 'index',
      caretSize: 0,
      position: 'custom',
      intersect: false,
      displayColors: true,
      backgroundColor: palette.ElevationProfile.tooltipBackground.toString(),
      xPadding: 13,
      yPadding: 13,
      titleMarginBottom: 4,
      titleFontSize: 11,
      titleFontColor: dsPalette.title.toString(),
      titleFontStyle: '500',
      bodyFontColor: dsPalette.title.toString(),
      bodyFontStyle: '430',
      bodySpacing: 3,
      bodyFontSize: 11,
      footerFontSize: 11,
      footerFontColor: dsPalette.title.toString(),
      footerFontStyle: '430',
      footerMarginTop: 7,
      itemSort: (i0, i1) => {
        const v0: number = i0.yLabel as number;
        const v1: number = i1.yLabel as number;

        return (v0 > v1) ? -1 : (v0 < v1) ? 1 : 0;
      },
      callbacks: {
        title(): string {
          return elevationText;
        },
        label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData): string {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!data || !data.datasets) return '';

          const currentAlt: number = tooltipItem.yLabel as number;
          if (currentAlt === NO_DSM_ALT) {
            return tooltipItem.datasetIndex && designDXFDatasetIdxs?.includes(tooltipItem?.datasetIndex) ?
              l10n(Text.noDesign, language) : l10n(Text.noDSM, language);
          }

          const comparisonBaseAlt: number = findComparisonBaseAlt(data.datasets[0], tooltipItem);
          const comparisonCurrentAlt: number = _.round((currentAlt - comparisonBaseAlt), 2);
          const signedComparisonCurrentAlt: string = comparisonCurrentAlt > 0 ? `+${comparisonCurrentAlt}` : comparisonCurrentAlt.toString();

          const isBaseDataset: boolean = tooltipItem.datasetIndex === 0;
          const comparisonText: string = comparisonBaseAlt === NO_DSM_ALT ? `(-${UNIT_SYMBOL[unit]})` :
            isBaseDataset ? `(${signedComparisonCurrentAlt} ${UNIT_SYMBOL[unit]}:${l10n(Text.baseAlt, language)})` : `(${signedComparisonCurrentAlt} ${UNIT_SYMBOL[unit]})`;

          return `${_.round(currentAlt, 2).toFixed(2)} ${UNIT_SYMBOL[unit]} ${comparisonText}`;
        },
        labelColor(tooltipItem: Chart.ChartTooltipItem): Chart.ChartTooltipLabelColor {
          return {
            borderColor: palette.ElevationProfile.tooltipBackground.toString(),
            backgroundColor: comparisonColors[tooltipItem.datasetIndex as number].toString(),
          };
        },
        footer(): string {
          return lengthText;
        },
        afterFooter(tooltipItem: Array<Chart.ChartTooltipItem>): string {
          return `${_.round(setOfChartDataWithLongestLength[tooltipItem[0].index as number].x as number, 2).toFixed(2)} ${UNIT_SYMBOL[unit]}`;
        },
      },
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      xAxes: [{
        type: 'linear',
        display: true,
        scaleLabel: {
          display: true,
          labelString: `${l10n(Text.length, language)} (${UNIT_SYMBOL[unit]})`,
          fontColor: palette.textLight.toString(),
          fontSize: 13,
          lineHeight: 1,
          padding: {
            top: 0,
            bottom: 0,
          },
        },
        gridLines: {
          tickMarkLength: 0,
          zeroLineColor: palette.ElevationProfile.axis.toString(),
        },
        ticks: {
          autoSkip: true,
          beginAtZero: false,
          fontColor: dsPalette.title.toString(),
          padding: 5,
          max: findTheLongestAmong(setsOfChartData).maxTick,
          callback: (value) => {
            if (value === 0) return '';

            return _.round(Number(value), AXES_TICK_PRECISION);
          },
        },
      }],
      yAxes: [{
        type: 'linear',
        display: true,
        scaleLabel: {
          display: true,
          labelString: `${l10n(Text.elevation, language)} (${UNIT_SYMBOL[unit]})`,
          fontColor: palette.textLight.toString(),
          fontSize: 13,
          padding: 0,
        },
        ticks: {
          beginAtZero: isBeginAtZero,
          suggestedMin,
          fontSize: 12,
          fontColor: dsPalette.title.toString(),
          stepSize,
          padding: 10,
          max: normalizedHighestAlt,
          min: normalizedLowestAlt,
          callback: (value) =>
            // Only y-axes will have two decimals at all times as per requirement.
            Number(value).toFixed(AXES_TICK_PRECISION)
          ,
        },
        gridLines: {
          tickMarkLength: 0,
          zeroLineColor: palette.ElevationProfile.axis.toString(),
        },
      }],
    },
    legend: {
      display: false,
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          speed: 0.1,
          rangeMin: {
            x: 0,
            y: normalizedLowestAlt,
          },
          rangeMax: {
            x: setOfChartDataWithLongestLength[setOfChartDataWithLongestLength.length - 1].x as number,
            y: normalizedHighestAlt,
          },
          mode: 'xy',
        },
        zoom: {
          enabled: true,
          speed: 0.07,
          rangeMin: {
            x: 0,
            y: normalizedLowestAlt,
          },
          rangeMax: {
            x: setOfChartDataWithLongestLength[setOfChartDataWithLongestLength.length - 1].x as number,
            y: normalizedHighestAlt,
          },
          mode: 'xy',
        },
      },
      crosshair: {
        line: {
          color: palette.ElevationProfile.crosshair.toString(),
          width: 1,
          // eslint-disable-next-line no-magic-numbers
          dashPattern: [3, 3],
        },
        zoom: {
          enabled: false,
        },
        snap: {
          enabled: true,
        },
      },
    },
    onHover: (...hoverData) => {
      if (hoverData[1].length > 0) {
        const { _index: index }: any = hoverData[1][0];
        onHoverCallback(index);
      } else {
        onHoverCallback();
      }
    },
  };
};
export interface Props {
  readonly data: Array<Array<T.LengthElevationRawData>>;
  readonly isDesignDXFMap: Array<boolean>;
  readonly comparisonTitles: Array<string>;
  readonly comparisonColors: Array<Color>;
  readonly unitType: T.ValidUnitType;
  readonly isBeginAtZero?: boolean;
  readonly className?: string;
  onRendered?(): void;
  hoverOn?(location?: T.GeoPoint): void;
}
/**
 * Component for item in content list
 */
class ChartLine extends Component<Props & L10nProps> {
  private readonly chartRef: RefObject<HTMLCanvasElement>;
  private readonly rootRef: RefObject<HTMLDivElement>;
  private ctx: CanvasRenderingContext2D | null | undefined;
  private chart: Chart | undefined;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private designDXFDatasetIdxs: Array<number>;

  private revisedData: Array<Array<T.LengthElevationData>> = [];
  public constructor(props: Readonly<Props & L10nProps>) {
    super(props);
    this.chartRef = createRef();
    this.rootRef = createRef();
    this.designDXFDatasetIdxs = [];
  }

  public componentDidMount(): void {
    if (!this.ctx && this.chartRef.current) {
      this.revisedData = this.props.data.map(makeRevisedData(this.props.unitType));
      this.chart = this.makeChart(this.revisedData, this.props.language, this.props.isBeginAtZero);
    }
  }

  public componentWillMount(): void {
    Chart.pluginService.register(crosshairPlugin);
    Chart.Tooltip.positioners.custom = (elements, position) => {
      let offset: number = elements.length;
      if (elements[0]._chart.width / 2 > position.x) {
        offset *= TOOLTIP_OFFSET_COEFFICIENT[elements.length].X;
      } else {
        offset *= -TOOLTIP_OFFSET_COEFFICIENT[elements.length].X;
      }

      return {
        x: position.x + offset,
        y: (elements[0]._chart.height / 2) * TOOLTIP_OFFSET_COEFFICIENT[elements.length].Y,
      };
    };
  }

  public componentWillUnmount(): void {
    this.chart?.destroy();
  }

  public componentDidUpdate(prevProps: Readonly<Props>): void {
    if (
      prevProps.data !== this.props.data ||
      prevProps.isBeginAtZero !== this.props.isBeginAtZero
    ) {
      this.revisedData = this.props.data.map(makeRevisedData(this.props.unitType));
      this.chart?.destroy();
      this.chart = this.makeChart(this.revisedData, this.props.language, this.props.isBeginAtZero);
    }
  }

  private resetZoom(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = this.makeChart(this.revisedData, this.props.language, this.props.isBeginAtZero);
    }
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private getDataset: (
    setOfChartData: Array<Chart.ChartPoint>, language: T.Language, idx: number,
  ) => ChartDataSets = (
    setOfChartData, language, idx,
  ) => {
    if (!this.ctx) throw new Error('ctx is not defined');
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.props.comparisonColors) throw new Error(`color not found for ${idx}`);

    const isDesignDXF: boolean = this.props.isDesignDXFMap[idx];
    if (isDesignDXF) this.designDXFDatasetIdxs.push(idx);

    const dataColor: Color = this.props.comparisonColors[idx];
    const gradient: CanvasGradient = this.ctx.createLinearGradient(0, 0, 0, Math.max(...setOfChartData.map((data) => data.y as number)) * 3);
    gradient.addColorStop(1, dataColor.alpha(0).toString());
    gradient.addColorStop(0, dataColor.alpha(0.14).toString());

    return {
      data: setOfChartData,
      label: `${l10n(Text.elevation, language)}`,
      borderWidth: isDesignDXF ? 2 : 1,
      borderColor: dataColor.toString(),
      backgroundColor: isDesignDXF ? 'transparent' : gradient ,
      scaleFontColor: '#FFFFFF',

      pointRadius: getPointRadius as any,
      pointHoverBorderWidth: 3,
      pointHoverBorderColor: dataColor.toString(),
      pointHoverRadius: POINT_RADIUS,
      pointHoverBackgroundColor: palette.white.toString(),

      lineTension: 0,
    };
  };

  @autobind
  private onHoverCallback(index?: number): void {
    if (this.props.hoverOn && this.props.data.length > 0) {
      if (index) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const { lon, lat }: T.LengthElevationData = this.revisedData[0][index] || { lon: 0, lat: 0 };
        this.props.hoverOn([lon, lat]);
        this.updateChartConfigRadius(true);
      } else {
        this.props.hoverOn();
        this.updateChartConfigRadius();
      }
    }
  }

  private updateChartConfigRadius(isHover?: boolean): void {
    if (this.chart && this.chart.data.datasets && this.chart.data.datasets.length > 0) {
      if (isHover) {
        if (this.chart.data.datasets[0].pointRadius !== 0) {
          this.chart.data.datasets[0].pointRadius = 0;
          this.chart.update();
        }
      } else {
        if (this.chart.data.datasets[0].pointRadius === 0) {
          this.chart.data.datasets[0].pointRadius = getPointRadius as any;
          this.chart.update();
        }
      }
    }
  }
  private makeChart(
    rawData: Array<Array<T.LengthElevationData>>, language: T.Language, isBeginAtZero?: boolean,
  ): Chart | undefined {
    if (this.chartRef.current) {
      this.ctx = this.chartRef.current.getContext('2d');
      if (this.ctx) {
        const lowestPoint: T.LengthElevationData | undefined = _.minBy(rawData[0], 'alt');
        const highestPoint: T.LengthElevationData | undefined = _.maxBy(rawData[0], 'alt');
        const suggestedMin: number = lowestPoint && highestPoint ?
          (lowestPoint.alt - chartSuggedtedMinMargin * (highestPoint.alt - lowestPoint.alt)) : 0;

        const setsOfchartData: Array<Array<Chart.ChartPoint>> = rawData.map(makeData);
        const chartConfiguration: Chart.ChartConfiguration = {
          type: 'line',
          data: { datasets: setsOfchartData.map((setOfchartData, idx) => this.getDataset(setOfchartData, language, idx)) },
          options: makeOptions(
            this.onHoverCallback, language, setsOfchartData, this.props.comparisonColors, this.props.unitType,
            suggestedMin, isBeginAtZero, this.designDXFDatasetIdxs,
          ),
        };

        const chart = new Chart(this.ctx, chartConfiguration);
        if (this.props.onRendered) this.props.onRendered();

        return chart;
      }
    }

    return undefined;
  }

  public render(): ReactNode {
    return (
      <Root ref={this.rootRef}>
        <canvas ref={this.chartRef} />
        <ResetZoomButton onClick={() => this.resetZoom()}>
          <WrapperHoverable
            allowForceCheckMouseout={true}
            allowForceCheckTouchend={true}
            title={l10n(Text.resetZoom, this.props.language)}
            customStyle={TooltipCustomStyle}
          >
            <ZoomSvgWrapper>
              <ResetZoomSvg />
            </ZoomSvgWrapper>
          </WrapperHoverable>
        </ResetZoomButton >
      </Root>
    );
  }
}
export default memo(withL10n(ChartLine), arePropsEqual);
