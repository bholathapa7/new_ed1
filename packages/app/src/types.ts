/**
 * @todo Move store only types to `store/Types.ts`
 * @todo Refactor components to refer this module.
 */
/* eslint-disable max-lines */
import { Cartesian2, Cartesian3 } from 'cesium';
import Color from 'color';
import { RouterState as RS } from 'connected-react-router';
import { Coordinate } from 'ol/coordinate';

import { DDMSESSIONObject } from './store/customStorage';

export type RouterState = RS;

// APIs related types
/**
 * Enum for classification of HTTP errors.
 */
export enum HTTPError {
  CLIENT_ERROR = 'CLIENT_ERROR',
  CLIENT_AUTH_ERROR = 'CLIENT_AUTH_ERROR',
  CLIENT_UNAUTHORIZED_ERROR = 'CLIENT_UNAUTHORIZED_ERROR',
  CLIENT_NOT_FOUND_ERROR = 'CLIENT_NOT_FOUND_ERROR',
  CLIENT_OUTDATED_ERROR = 'CLIENT_OUTDATED_ERROR',
  CLIENT_NOT_ACCEPTED_ERROR = 'CLIENT_NOT_ACCEPTED_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Enum for representing API status
 */
export enum APIStatus {
  IDLE = 'IDLE',
  PROGRESS = 'PROGRESS',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

/**
 * Enum for representing user class
 */
export enum UserRole {
  DUMMY = 'dummy',
  BASIC = 'basic',
  PRO = 'pro',
  PREMIUM = 'premium',
  MANAGER = 'manager',
  ADMIN = 'admin',
  MASTER = 'master',
}

export interface Pagination {
  offset: number;
  limit: number;
  nextOffset: number;
}

/**
 * @desc Enum for representing calender type
 */
export enum CalendarType {
  FROM_TODAY_UNTIL_2100,
  FROM_2010_UNTIL_TODAY,
  FROM_2016_UNTIL_PLUS_4,
  SELECTED_DATE,
}

export enum CalendarScreenSize {
  S = 'S',
  M = 'M',
  L = 'L',
}

export const enum EditableTextUI {
  TOPBAR = 'TOPBAR',
  GROUP_TITLE = 'GROUP_TITLE',
  CONTENT_TITLE = 'CONTENT_TITLE',
  OL_CONTENT_TITLE = 'OL_CONTENT_TITLE',
  INPUT_S = 'INPUT_S',
  INPUT_L = 'INPUT_L',
  MARKER_PINPOINTER_MAP = 'MARKER_PINPOINTER_MAP',
  MARKER_PINPOINTER_SIDEBAR = 'MARKER_PINPOINTER_SIDEBAR',
}

export const TooltipAvailableEditableTextUI: Readonly<Array<EditableTextUI>> = [
  EditableTextUI.CONTENT_TITLE, EditableTextUI.GROUP_TITLE,
  EditableTextUI.OL_CONTENT_TITLE,
];

export enum CalendarScreenTab {
  LIST = 'list',
  CALENDAR = 'calendar',
}

export enum DateScreenButton {
  SPLIT_VIEW = 'split_view',
  MAP_CONTENTS_UPLOAD = 'MAP_CONTENTS_UPLOAD',
  DOWNLOAD = 'download',
  SBVC = 'sbvc',
  SBVC_POPUP = 'sbvc_popup',
}

export enum ModalPlacement {
  TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, TOP, BOTTOM, MIDDLE_RIGHT,
}

/**
 * Enum for 2D cut & fill
 */
export enum SurveyType {
  CUT_MIN, CUT_MAX, FILL_MIN, FILL_MAX,
}

/**
 * @desc Index of kind of survey type
 */
export enum VolumeSlider {
  CUT = 'CUT',
  FILL = 'FILL',
}

export type SurveyDoubleSlider = [number, number, number, number];
export type SurveySingleSlider = [number, number];

/**
 * @desc Enum for representing volume calculation method
 */
export enum VolumeCalcMethod {
  BASIC = 'vc',
  SURVEY = 'sbvc',
  DESIGN = 'dbvc',
}

export enum PointCloudEngine {
  POTREE = 'potree',
  CESIUM = 'cesium'
}

/**
 * @desc type of toast
 */
export enum Toast {
  SUCCESS = 'success',
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  DARK = 'dark',
}

export enum Feature {
  DDM = 'ddm',
  ESS = 'ess'
}

export enum MoveOption {
  FIRST = 'first',
  PREVIOUS = 'previous',
  NEXT = 'next',
  LAST = 'last',
}

export interface FullUser {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly contactNumber: string;
  readonly organization: string;
  readonly country: string;
  readonly language?: Language;
  readonly purpose: string;
  readonly avatar?: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly featurePermission: number;
  readonly unit?: UnitType;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RestrictedUser extends Omit<FullUser, 'role'> {}
export type User = FullUser | RestrictedUser;

export interface APIUser {
  readonly id: string;
  readonly type: 'users';
  /**
   * @todo
   * Please remove `?`s from these fields,
   * after adding the fields to old users.
   * DO NOT REMOVE `avatar`.
   */
  readonly attributes: Overwrite<
    Omit<User, 'id'>, {
      readonly contactNumber?: string | null;
      readonly organization?: string | null;
      readonly country?: string;
      readonly purpose?: string;
      readonly language?: string;
      readonly avatar: string | null;
    }
  >;
}

export interface APIAuthUser extends APIUser {
  readonly attributes: APIUser['attributes'] & {
    readonly token: string;
    readonly createdAt: string;
  };
}

export interface UserPassword {
  readonly password: string;
  readonly passwordConfirmation: string;
}

export interface UserConfig {
  readonly isPointEditTutorialPanelShown?: boolean;
}

export interface PlanConfig {
  /**
   * Unique id of the plan owner (?).
   * This is embedded in the URL, it has to be a slug-like string.
   * Example: Samsung Corp. Ltd. -> https://app.angelswing.io/login/samsung
   */
  readonly slug?: string;
  /**
   * Name of the plan owner. This is rendered in view as-is.
   * Example: Samsung Corp. Ltd.
   */
  readonly companyName?: string;
  /**
   * The plan owner logo. This is rendered on the hero section of the login page,
   * Optimal width is 300px, to fit in most scenarios of the hero container.
   */
  readonly logoUrl?: string;
  /**
   * The plan owner login background.
   * Optimal size is 1920x1080, most common user screen size.
   */
  readonly bgUrl?: string;
  /**
   * The logo specifically for the navbar.
   * The maximum size that would fit our UI nicely is 200x24 px.
   * Which is exactly the navbar size logo.
   */
  readonly navbarLogoUrl?: string;
  /**
   * The logo for the square-shaped top-left corner.
   * The maximum size that would fit our UI nicely is 30x30 px.
   */
  readonly squareLogoUrl?: string;
  /**
   * Primary color. For buttons, checkboxes, etc.
   */
  readonly primaryColor?: string;
  /**
   * Logo for the one right on top of the login and other non-scrollable non-auth pages.
   */
  readonly loginLogoTopUrl?: string;
  /**
   * Logo for the one right on the bottom of the login and other non-scrollable non-auth pages.
   */
  readonly loginLogoBottomUrl?: string;
  /**
   * Logo for top left corner of the non-auth page.
   */
  readonly logoTopLeftUrl?: string;
  /**
   * Logo for top left corner of the non-auth page.
   */
  readonly logoTopRightUrl?: string;
}

export interface PlanType {
  readonly id: number;
  readonly name: string;
  readonly userLimit: number;
  readonly processingLimit: number;
  readonly projectLimit: number;
  readonly sourcePhotoLimit: number;
  readonly inactiveDaysToNotify: number;
}

export interface Plan {
  readonly id: number;
  readonly planConfig: PlanConfig;
  readonly planType: PlanType;
  readonly companyName: string;
  readonly slug: string;
  readonly contractStartAt: string;
  readonly contractEndAt: string;
}

export interface Notice {
  id: number;
  type: string;
  url: string;
  title: string;
  headings: Array<string>;
  isRead: boolean;
  isShown: boolean;
  isHidden: boolean;
  createdAt: Date;
}

export interface APIScreen {
  readonly id: number;
  readonly projectId: number;
  readonly title: string | null;
  readonly appearAt: string;
  readonly contentIds: Array<number>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Screen {
  readonly id: number;
  readonly title: string;
  readonly appearAt: Date;
  readonly contentIds: Array<Content['id']>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Enum for representing project data processing status
 */
export enum ContentProcessingStatus {
  READY = 'ready',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Enum for representing project data processing status
 */
export enum AcceptStatus {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  DENIED = 'denied',
}
export interface ProjectWithConfig extends Project {
  /**
   * @todo
   * need to change this to `configs` like `Projects.projects`
   * Ex) configs: { [projectId]: ProjectConfig }
   */
  config: ProjectConfig;
}
export interface Project {
  readonly id: number;
  readonly owner: {
    readonly id: User['id'];
    readonly avatar?: User['avatar'];
    readonly lastName: User['lastName'];
    readonly firstName: User['firstName'];
    readonly email: User['email'];
    readonly organization: User['organization'];
  };
  readonly title: string;
  readonly coordinateSystem?: ProjectionEnum;
  readonly description: string;
  readonly logo?: string;
  readonly planId?: string;
  readonly thumbnail?: string;
  readonly permissionStatus: AcceptStatus;
  readonly permissionRole: PermissionRole;
  readonly features: PermissionFeature;
  readonly permissionsCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly availableDates: Array<Date>;
  readonly type: ProjectType;
  readonly unit?: UnitType;
}

export interface APIProject {
  readonly id: number;
  readonly owner: {
    readonly id: number;
    readonly avatar: string | null;
    readonly lastName: string;
    readonly firstName: string;
    readonly email: string;
    readonly organization: string;
  };
  readonly title: string;
  readonly description: string;
  readonly logo: string | null;
  readonly thumbnail: string | null;
  readonly coordinateSystem: CoordinateSystem | null;
  readonly status: string;
  readonly permissionStatus: AcceptStatus;
  readonly permissionRole: PermissionRole;
  readonly features: PermissionFeature;
  readonly permissionsCount: number;
  readonly config: ProjectConfig;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly availableDates: Array<string>;
  readonly type: ProjectType;
  readonly unit: UnitType;
}

export interface PermissionFeature{
  readonly ddm: boolean;
  readonly ess: boolean;
  readonly oneD: boolean;
}

export interface PermissionFeature{
  readonly ddm: boolean;
  readonly ess: boolean;
  readonly oneD: boolean;
}

export enum ProjectType {
  USER = 'user',
  DEMO = 'demo',
}

/**
 * Enum for representing permission level
 */
export enum PermissionRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
  PILOT = 'pilot',
  DEMO = 'demo',
}

/**
 * Enum for representing permission status
 */
export enum PermissionStatus {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  DENIED = 'denied',
}

export interface Permission {
  readonly id: number;
  readonly projectId: Project['id'];
  readonly userId: User['id'];
  readonly avatar: User['avatar'];
  readonly lastName: User['lastName'];
  readonly firstName: User['firstName'];
  readonly email: User['email'];
  readonly organization: User['organization'];
  readonly role: PermissionRole;
  readonly status: PermissionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly featureEss?: boolean;
  readonly features?: PermissionFeature;
}

export interface APIPermission {
  readonly id: number;
  readonly userId: number;
  readonly avatar: string | null;
  readonly lastName: string;
  readonly firstName: string;
  readonly email: string;
  readonly organization: string;
  readonly status: PermissionStatus;
  readonly role: PermissionRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type AttachmentContentTypeMap = Partial<Record<AttachmentType, ContentType>>;
/**
 * Enum for representing Content type
 */
export enum ContentType {
  MAP = 'orthophoto',
  DSM = 'dsm',
  POINTCLOUD = 'las',
  THREE_D_MESH = 'tiled_model',
  THREE_D_ORTHO = 'terrain',
  BLUEPRINT_PDF = 'blueprint_pdf',
  BLUEPRINT_DXF = 'blueprint_dxf',
  BLUEPRINT_DWG = 'blueprint_dwg',
  DESIGN_DXF = 'design_dxf',
  MARKER = 'marker',
  LENGTH = 'length',
  AREA = 'area',
  VOLUME = 'volume',
  GCP_GROUP = 'gcp_group',
  ESS_MODEL = 'ess_model',
  ESS_ARROW = 'ess_waypoints',
  ESS_POLYGON = 'ess_polygon',
  ESS_POLYLINE = 'ess_polyline',
  ESS_TEXT = 'ess_text',
  GROUP = 'content_group'
}

export enum ContentCategory {
  MAP = 'map',
  OVERLAY = 'overlay',
  MEASUREMENT = 'measurement',
  ESS = 'ess',
  METADATA = 'metadata',
}

export enum ContentsQueryParam {
  SCREEN = 'screen',
  TITLE = 'title',
  TYPE = 'type',
  TYPE_AND_SCREENID = 'type-and-screenid',
  ID = 'id',
}

export enum ScreensQueryParam {
  TITLE_AND_DATE = 'title-and-date',
  DATE = 'date',
  ID = 'id',
  CONTENT_ID = 'content-id',
}

/**
 * Volume algorithms
 */
export enum BasicCalcBasePlane {
  LOWEST_POINT = 'lowest',
  HIGHEST_POINT = 'highest',
  AVERAGE = 'average',
  TRIANGULATED = 'triangulation',
  CUSTOM = 'custom',
}

/**
 * Point is a pair of x and y.
 * @example [x, y]
 */
export type Point = Array<number>;

/**
 * Geopoint is a pair of longitude and latitude.
 * @example [lon, lat]
 */
export type GeoPoint = Array<number>;

/**
 * @todo please combine this with other types, `[number, number]`
 */
export type GCPPoint = [number, number];

/**
 * To optimize the data store in State & Database (network transfer)
 * The data is store by its values but not an object
 * @example [lon, lat, dist, alt]
 */
export type LengthElevationRawData = [number, number, number, number];

/**
 * Predefined Projection
 */
export enum ProjectionEnum {
  GRS80_EPSG_5182_EN = 'GRS80_EPSG_5182_EN',
  GRS80_EPSG_5185_EN = 'GRS80_EPSG_5185_EN',
  GRS80_EPSG_5186_EN = 'GRS80_EPSG_5186_EN',
  GRS80_EPSG_5187_EN = 'GRS80_EPSG_5187_EN',
  GRS80_EPSG_5188_EN = 'GRS80_EPSG_5188_EN',
  WGS84_EPSG_3414_EN = 'WGS84_EPSG_3414_EN',
  WGS84_EPSG_4326_LL = 'WGS84_EPSG_4326_LL',

  // Turkey
  GRS80_EPSG_5255_EN = 'GRS80_EPSG_5255_EN',
  GRS80_EPSG_4917_EN = 'GRS80_EPSG_4917_EN',
  GRS80_EPSG_4918_EN = 'GRS80_EPSG_4918_EN',
  GRS80_EPSG_4919_EN = 'GRS80_EPSG_4919_EN',
  GRS80_EPSG_4896_EN = 'GRS80_EPSG_4896_EN',
  GRS80_EPSG_5332_EN = 'GRS80_EPSG_5332_EN',
  GRS80_EPSG_7789_EN = 'GRS80_EPSG_7789_EN',
  GRS80_EPSG_9988_EN = 'GRS80_EPSG_9988_EN',

  // WSG84 UTM
  WGS84_EPSG_32601_EN = 'WGS84_EPSG_32601_EN',
  WGS84_EPSG_32602_EN = 'WGS84_EPSG_32602_EN',
  WGS84_EPSG_32603_EN = 'WGS84_EPSG_32603_EN',
  WGS84_EPSG_32604_EN = 'WGS84_EPSG_32604_EN',
  WGS84_EPSG_32605_EN = 'WGS84_EPSG_32605_EN',
  WGS84_EPSG_32606_EN = 'WGS84_EPSG_32606_EN',
  WGS84_EPSG_32607_EN = 'WGS84_EPSG_32607_EN',
  WGS84_EPSG_32608_EN = 'WGS84_EPSG_32608_EN',
  WGS84_EPSG_32609_EN = 'WGS84_EPSG_32609_EN',
  WGS84_EPSG_32610_EN = 'WGS84_EPSG_32610_EN',
  WGS84_EPSG_32611_EN = 'WGS84_EPSG_32611_EN',
  WGS84_EPSG_32612_EN = 'WGS84_EPSG_32612_EN',
  WGS84_EPSG_32613_EN = 'WGS84_EPSG_32613_EN',
  WGS84_EPSG_32614_EN = 'WGS84_EPSG_32614_EN',
  WGS84_EPSG_32615_EN = 'WGS84_EPSG_32615_EN',
  WGS84_EPSG_32616_EN = 'WGS84_EPSG_32616_EN',
  WGS84_EPSG_32617_EN = 'WGS84_EPSG_32617_EN',
  WGS84_EPSG_32618_EN = 'WGS84_EPSG_32618_EN',
  WGS84_EPSG_32619_EN = 'WGS84_EPSG_32619_EN',

  WGS84_EPSG_6355_EN = 'WGS84_EPSG_6355_EN',
  WGS84_EPSG_9748_EN = 'WGS84_EPSG_9748_EN',
  WGS84_EPSG_6356_EN = 'WGS84_EPSG_6356_EN',
  WGS84_EPSG_9749_EN = 'WGS84_EPSG_9749_EN',
  WGS84_EPSG_6403_EN = 'WGS84_EPSG_6403_EN',
  WGS84_EPSG_6395_EN = 'WGS84_EPSG_6395_EN',
  WGS84_EPSG_6396_EN = 'WGS84_EPSG_6396_EN',
  WGS84_EPSG_6397_EN = 'WGS84_EPSG_6397_EN',
  WGS84_EPSG_6398_EN = 'WGS84_EPSG_6398_EN',
  WGS84_EPSG_6399_EN = 'WGS84_EPSG_6399_EN',
  WGS84_EPSG_6400_EN = 'WGS84_EPSG_6400_EN',
  WGS84_EPSG_6401_EN = 'WGS84_EPSG_6401_EN',
  WGS84_EPSG_6402_EN = 'WGS84_EPSG_6402_EN',
  WGS84_EPSG_6404_EN = 'WGS84_EPSG_6404_EN',
  WGS84_EPSG_6405_EN = 'WGS84_EPSG_6405_EN',
  WGS84_EPSG_6406_EN = 'WGS84_EPSG_6406_EN',
  WGS84_EPSG_6407_EN = 'WGS84_EPSG_6407_EN',
  WGS84_EPSG_6408_EN = 'WGS84_EPSG_6408_EN',
  WGS84_EPSG_6409_EN = 'WGS84_EPSG_6409_EN',
  WGS84_EPSG_6410_EN = 'WGS84_EPSG_6410_EN',
  WGS84_EPSG_6411_EN = 'WGS84_EPSG_6411_EN',
  WGS84_EPSG_6412_EN = 'WGS84_EPSG_6412_EN',
  WGS84_EPSG_6413_EN = 'WGS84_EPSG_6413_EN',
  WGS84_EPSG_6415_EN = 'WGS84_EPSG_6415_EN',
  WGS84_EPSG_6416_EN = 'WGS84_EPSG_6416_EN',
  WGS84_EPSG_6417_EN = 'WGS84_EPSG_6417_EN',
  WGS84_EPSG_6418_EN = 'WGS84_EPSG_6418_EN',
  WGS84_EPSG_6419_EN = 'WGS84_EPSG_6419_EN',
  WGS84_EPSG_6420_EN = 'WGS84_EPSG_6420_EN',
  WGS84_EPSG_6421_EN = 'WGS84_EPSG_6421_EN',
  WGS84_EPSG_6422_EN = 'WGS84_EPSG_6422_EN',
  WGS84_EPSG_6423_EN = 'WGS84_EPSG_6423_EN',
  WGS84_EPSG_6424_EN = 'WGS84_EPSG_6424_EN',
  WGS84_EPSG_6425_EN = 'WGS84_EPSG_6425_EN',
  WGS84_EPSG_6426_EN = 'WGS84_EPSG_6426_EN',
  WGS84_EPSG_6427_EN = 'WGS84_EPSG_6427_EN',
  WGS84_EPSG_6428_EN = 'WGS84_EPSG_6428_EN',
  WGS84_EPSG_6429_EN = 'WGS84_EPSG_6429_EN',
  WGS84_EPSG_6430_EN = 'WGS84_EPSG_6430_EN',
  WGS84_EPSG_6431_EN = 'WGS84_EPSG_6431_EN',
  WGS84_EPSG_6432_EN = 'WGS84_EPSG_6432_EN',
  WGS84_EPSG_6433_EN = 'WGS84_EPSG_6433_EN',
  WGS84_EPSG_6434_EN = 'WGS84_EPSG_6434_EN',
  WGS84_EPSG_6435_EN = 'WGS84_EPSG_6435_EN',
  WGS84_EPSG_6436_EN = 'WGS84_EPSG_6436_EN',
  WGS84_EPSG_6437_EN = 'WGS84_EPSG_6437_EN',
  WGS84_EPSG_6438_EN = 'WGS84_EPSG_6438_EN',
  WGS84_EPSG_6440_EN = 'WGS84_EPSG_6440_EN',
  WGS84_EPSG_6441_EN = 'WGS84_EPSG_6441_EN',
  WGS84_EPSG_6442_EN = 'WGS84_EPSG_6442_EN',
  WGS84_EPSG_6443_EN = 'WGS84_EPSG_6443_EN',
  WGS84_EPSG_6444_EN = 'WGS84_EPSG_6444_EN',
  WGS84_EPSG_6445_EN = 'WGS84_EPSG_6445_EN',
  WGS84_EPSG_6446_EN = 'WGS84_EPSG_6446_EN',
  WGS84_EPSG_6447_EN = 'WGS84_EPSG_6447_EN',
  WGS84_EPSG_6448_EN = 'WGS84_EPSG_6448_EN',
  WGS84_EPSG_6449_EN = 'WGS84_EPSG_6449_EN',
  WGS84_EPSG_6450_EN = 'WGS84_EPSG_6450_EN',
  WGS84_EPSG_6451_EN = 'WGS84_EPSG_6451_EN',
  WGS84_EPSG_6452_EN = 'WGS84_EPSG_6452_EN',
  WGS84_EPSG_6453_EN = 'WGS84_EPSG_6453_EN',
  WGS84_EPSG_6454_EN = 'WGS84_EPSG_6454_EN',
  WGS84_EPSG_6455_EN = 'WGS84_EPSG_6455_EN',
  WGS84_EPSG_6456_EN = 'WGS84_EPSG_6456_EN',
  WGS84_EPSG_6457_EN = 'WGS84_EPSG_6457_EN',
  WGS84_EPSG_6458_EN = 'WGS84_EPSG_6458_EN',
  WGS84_EPSG_6459_EN = 'WGS84_EPSG_6459_EN',
  WGS84_EPSG_6460_EN = 'WGS84_EPSG_6460_EN',
  WGS84_EPSG_6461_EN = 'WGS84_EPSG_6461_EN',
  WGS84_EPSG_6462_EN = 'WGS84_EPSG_6462_EN',
  WGS84_EPSG_6463_EN = 'WGS84_EPSG_6463_EN',
  WGS84_EPSG_6464_EN = 'WGS84_EPSG_6464_EN',
  WGS84_EPSG_6465_EN = 'WGS84_EPSG_6465_EN',
  WGS84_EPSG_6466_EN = 'WGS84_EPSG_6466_EN',
  WGS84_EPSG_6467_EN = 'WGS84_EPSG_6467_EN',
  WGS84_EPSG_6468_EN = 'WGS84_EPSG_6468_EN',
  WGS84_EPSG_6469_EN = 'WGS84_EPSG_6469_EN',
  WGS84_EPSG_6470_EN = 'WGS84_EPSG_6470_EN',
  WGS84_EPSG_6471_EN = 'WGS84_EPSG_6471_EN',
  WGS84_EPSG_6472_EN = 'WGS84_EPSG_6472_EN',
  WGS84_EPSG_6473_EN = 'WGS84_EPSG_6473_EN',
  WGS84_EPSG_6474_EN = 'WGS84_EPSG_6474_EN',
  WGS84_EPSG_6475_EN = 'WGS84_EPSG_6475_EN',
  WGS84_EPSG_6476_EN = 'WGS84_EPSG_6476_EN',
  WGS84_EPSG_6477_EN = 'WGS84_EPSG_6477_EN',
  WGS84_EPSG_6478_EN = 'WGS84_EPSG_6478_EN',
  WGS84_EPSG_6479_EN = 'WGS84_EPSG_6479_EN',
  WGS84_EPSG_6483_EN = 'WGS84_EPSG_6483_EN',
  WGS84_EPSG_6484_EN = 'WGS84_EPSG_6484_EN',
  WGS84_EPSG_6485_EN = 'WGS84_EPSG_6485_EN',
  WGS84_EPSG_6486_EN = 'WGS84_EPSG_6486_EN',
  WGS84_EPSG_6487_EN = 'WGS84_EPSG_6487_EN',
  WGS84_EPSG_6488_EN = 'WGS84_EPSG_6488_EN',
  WGS84_EPSG_6489_EN = 'WGS84_EPSG_6489_EN',
  WGS84_EPSG_6490_EN = 'WGS84_EPSG_6490_EN',
  WGS84_EPSG_6491_EN = 'WGS84_EPSG_6491_EN',
  WGS84_EPSG_6492_EN = 'WGS84_EPSG_6492_EN',
  WGS84_EPSG_6493_EN = 'WGS84_EPSG_6493_EN',
  WGS84_EPSG_6494_EN = 'WGS84_EPSG_6494_EN',
  WGS84_EPSG_6495_EN = 'WGS84_EPSG_6495_EN',
  WGS84_EPSG_6496_EN = 'WGS84_EPSG_6496_EN',
  WGS84_EPSG_6498_EN = 'WGS84_EPSG_6498_EN',
  WGS84_EPSG_6499_EN = 'WGS84_EPSG_6499_EN',
  WGS84_EPSG_6500_EN = 'WGS84_EPSG_6500_EN',
  WGS84_EPSG_6501_EN = 'WGS84_EPSG_6501_EN',
  WGS84_EPSG_6502_EN = 'WGS84_EPSG_6502_EN',
  WGS84_EPSG_6503_EN = 'WGS84_EPSG_6503_EN',
  WGS84_EPSG_6504_EN = 'WGS84_EPSG_6504_EN',
  WGS84_EPSG_6505_EN = 'WGS84_EPSG_6505_EN',
  WGS84_EPSG_6506_EN = 'WGS84_EPSG_6506_EN',
  WGS84_EPSG_6507_EN = 'WGS84_EPSG_6507_EN',
  WGS84_EPSG_6509_EN = 'WGS84_EPSG_6509_EN',
  WGS84_EPSG_6510_EN = 'WGS84_EPSG_6510_EN',
  WGS84_EPSG_6511_EN = 'WGS84_EPSG_6511_EN',
  WGS84_EPSG_6512_EN = 'WGS84_EPSG_6512_EN',
  WGS84_EPSG_6513_EN = 'WGS84_EPSG_6513_EN',
  WGS84_EPSG_6514_EN = 'WGS84_EPSG_6514_EN',
  WGS84_EPSG_6515_EN = 'WGS84_EPSG_6515_EN',
  WGS84_EPSG_6516_EN = 'WGS84_EPSG_6516_EN',
  WGS84_EPSG_6880_EN = 'WGS84_EPSG_6880_EN',
  WGS84_EPSG_6518_EN = 'WGS84_EPSG_6518_EN',
  WGS84_EPSG_6519_EN = 'WGS84_EPSG_6519_EN',
  WGS84_EPSG_6520_EN = 'WGS84_EPSG_6520_EN',
  WGS84_EPSG_6521_EN = 'WGS84_EPSG_6521_EN',
  WGS84_EPSG_6522_EN = 'WGS84_EPSG_6522_EN',
  WGS84_EPSG_6523_EN = 'WGS84_EPSG_6523_EN',
  WGS84_EPSG_6524_EN = 'WGS84_EPSG_6524_EN',
  WGS84_EPSG_6525_EN = 'WGS84_EPSG_6525_EN',
  WGS84_EPSG_6526_EN = 'WGS84_EPSG_6526_EN',
  WGS84_EPSG_6527_EN = 'WGS84_EPSG_6527_EN',
  WGS84_EPSG_6528_EN = 'WGS84_EPSG_6528_EN',
  WGS84_EPSG_6529_EN = 'WGS84_EPSG_6529_EN',
  WGS84_EPSG_6530_EN = 'WGS84_EPSG_6530_EN',
  WGS84_EPSG_6531_EN = 'WGS84_EPSG_6531_EN',
  WGS84_EPSG_6532_EN = 'WGS84_EPSG_6532_EN',
  WGS84_EPSG_6533_EN = 'WGS84_EPSG_6533_EN',
  WGS84_EPSG_6534_EN = 'WGS84_EPSG_6534_EN',
  WGS84_EPSG_6535_EN = 'WGS84_EPSG_6535_EN',
  WGS84_EPSG_6536_EN = 'WGS84_EPSG_6536_EN',
  WGS84_EPSG_6537_EN = 'WGS84_EPSG_6537_EN',
  WGS84_EPSG_6538_EN = 'WGS84_EPSG_6538_EN',
  WGS84_EPSG_6539_EN = 'WGS84_EPSG_6539_EN',
  WGS84_EPSG_6540_EN = 'WGS84_EPSG_6540_EN',
  WGS84_EPSG_6541_EN = 'WGS84_EPSG_6541_EN',
  WGS84_EPSG_6542_EN = 'WGS84_EPSG_6542_EN',
  WGS84_EPSG_6543_EN = 'WGS84_EPSG_6543_EN',
  WGS84_EPSG_6544_EN = 'WGS84_EPSG_6544_EN',
  WGS84_EPSG_6545_EN = 'WGS84_EPSG_6545_EN',
  WGS84_EPSG_6546_EN = 'WGS84_EPSG_6546_EN',
  WGS84_EPSG_6547_EN = 'WGS84_EPSG_6547_EN',
  WGS84_EPSG_6548_EN = 'WGS84_EPSG_6548_EN',
  WGS84_EPSG_6549_EN = 'WGS84_EPSG_6549_EN',
  WGS84_EPSG_6550_EN = 'WGS84_EPSG_6550_EN',
  WGS84_EPSG_6551_EN = 'WGS84_EPSG_6551_EN',
  WGS84_EPSG_6552_EN = 'WGS84_EPSG_6552_EN',
  WGS84_EPSG_6553_EN = 'WGS84_EPSG_6553_EN',
  WGS84_EPSG_6554_EN = 'WGS84_EPSG_6554_EN',
  WGS84_EPSG_6555_EN = 'WGS84_EPSG_6555_EN',
  WGS84_EPSG_6558_EN = 'WGS84_EPSG_6558_EN',
  WGS84_EPSG_6559_EN = 'WGS84_EPSG_6559_EN',
  WGS84_EPSG_6560_EN = 'WGS84_EPSG_6560_EN',
  WGS84_EPSG_6561_EN = 'WGS84_EPSG_6561_EN',
  WGS84_EPSG_6562_EN = 'WGS84_EPSG_6562_EN',
  WGS84_EPSG_6563_EN = 'WGS84_EPSG_6563_EN',
  WGS84_EPSG_6564_EN = 'WGS84_EPSG_6564_EN',
  WGS84_EPSG_6565_EN = 'WGS84_EPSG_6565_EN',
  WGS84_EPSG_6567_EN = 'WGS84_EPSG_6567_EN',
  WGS84_EPSG_6568_EN = 'WGS84_EPSG_6568_EN',
  WGS84_EPSG_6569_EN = 'WGS84_EPSG_6569_EN',
  WGS84_EPSG_6570_EN = 'WGS84_EPSG_6570_EN',
  WGS84_EPSG_6571_EN = 'WGS84_EPSG_6571_EN',
  WGS84_EPSG_6572_EN = 'WGS84_EPSG_6572_EN',
  WGS84_EPSG_6573_EN = 'WGS84_EPSG_6573_EN',
  WGS84_EPSG_6574_EN = 'WGS84_EPSG_6574_EN',
  WGS84_EPSG_6575_EN = 'WGS84_EPSG_6575_EN',
  WGS84_EPSG_6576_EN = 'WGS84_EPSG_6576_EN',
  WGS84_EPSG_6577_EN = 'WGS84_EPSG_6577_EN',
  WGS84_EPSG_6578_EN = 'WGS84_EPSG_6578_EN',
  WGS84_EPSG_6581_EN = 'WGS84_EPSG_6581_EN',
  WGS84_EPSG_6582_EN = 'WGS84_EPSG_6582_EN',
  WGS84_EPSG_6583_EN = 'WGS84_EPSG_6583_EN',
  WGS84_EPSG_6584_EN = 'WGS84_EPSG_6584_EN',
  WGS84_EPSG_6585_EN = 'WGS84_EPSG_6585_EN',
  WGS84_EPSG_6586_EN = 'WGS84_EPSG_6586_EN',
  WGS84_EPSG_6587_EN = 'WGS84_EPSG_6587_EN',
  WGS84_EPSG_6588_EN = 'WGS84_EPSG_6588_EN',
  WGS84_EPSG_6619_EN = 'WGS84_EPSG_6619_EN',
  WGS84_EPSG_6625_EN = 'WGS84_EPSG_6625_EN',
  WGS84_EPSG_6620_EN = 'WGS84_EPSG_6620_EN',
  WGS84_EPSG_6626_EN = 'WGS84_EPSG_6626_EN',
  WGS84_EPSG_6621_EN = 'WGS84_EPSG_6621_EN',
  WGS84_EPSG_6627_EN = 'WGS84_EPSG_6627_EN',
  WGS84_EPSG_6589_EN = 'WGS84_EPSG_6589_EN',
  WGS84_EPSG_6590_EN = 'WGS84_EPSG_6590_EN',
  WGS84_EPSG_6592_EN = 'WGS84_EPSG_6592_EN',
  WGS84_EPSG_6593_EN = 'WGS84_EPSG_6593_EN',
  WGS84_EPSG_6594_EN = 'WGS84_EPSG_6594_EN',
  WGS84_EPSG_6595_EN = 'WGS84_EPSG_6595_EN',
  WGS84_EPSG_6598_EN = 'WGS84_EPSG_6598_EN',
  WGS84_EPSG_6599_EN = 'WGS84_EPSG_6599_EN',
  WGS84_EPSG_6600_EN = 'WGS84_EPSG_6600_EN',
  WGS84_EPSG_6601_EN = 'WGS84_EPSG_6601_EN',
  WGS84_EPSG_6602_EN = 'WGS84_EPSG_6602_EN',
  WGS84_EPSG_6603_EN = 'WGS84_EPSG_6603_EN',
  WGS84_EPSG_6879_EN = 'WGS84_EPSG_6879_EN',
  WGS84_EPSG_6605_EN = 'WGS84_EPSG_6605_EN',
  WGS84_EPSG_6606_EN = 'WGS84_EPSG_6606_EN',
  WGS84_EPSG_6607_EN = 'WGS84_EPSG_6607_EN',
  WGS84_EPSG_6608_EN = 'WGS84_EPSG_6608_EN',
  WGS84_EPSG_6609_EN = 'WGS84_EPSG_6609_EN',
  WGS84_EPSG_6611_EN = 'WGS84_EPSG_6611_EN',
  WGS84_EPSG_6612_EN = 'WGS84_EPSG_6612_EN',
  WGS84_EPSG_6613_EN = 'WGS84_EPSG_6613_EN',
  WGS84_EPSG_6614_EN = 'WGS84_EPSG_6614_EN',
  WGS84_EPSG_6615_EN = 'WGS84_EPSG_6615_EN',
  WGS84_EPSG_6616_EN = 'WGS84_EPSG_6616_EN',
  WGS84_EPSG_6617_EN = 'WGS84_EPSG_6617_EN',
  WGS84_EPSG_6618_EN = 'WGS84_EPSG_6618_EN',

  // NAD83(2011)
  WGS84_EPSG_32643_EN = 'WGS84_EPSG_32643_EN',
  WGS84_EPSG_32644_EN = 'WGS84_EPSG_32644_EN',
  WGS84_EPSG_32646_EN = 'WGS84_EPSG_32646_EN',
  WGS84_EPSG_32650_EN = 'WGS84_EPSG_32650_EN',
  WGS84_EPSG_32651_EN = 'WGS84_EPSG_32651_EN',
  WGS84_EPSG_32652_EN = 'WGS84_EPSG_32652_EN',
  Bessel_EPSG_5173_EN = 'Bessel_EPSG_5173_EN',
  Bessel_EPSG_5174_EN = 'Bessel_EPSG_5174_EN',
  Bessel_EPSG_5175_EN = 'Bessel_EPSG_5175_EN',
  Bessel_EPSG_5176_EN = 'Bessel_EPSG_5176_EN',
  Bessel_EPSG_5177_EN = 'Bessel_EPSG_5177_EN',
  HD72_EPSG_23700_EN = 'HD72_EPSG_23700_EN',
  QND95_EPSG_2932_EN = 'QND95_EPSG_2932_EN',
  Peru96_EPSG_5387_EN = 'Peru96_EPSG_5387_EN',
  ETRS89_EPSG_2180_EN = 'ETRS89_EPSG_2180_EN',
  ETRS89_EPSG_2177_EN = 'ETRS89_EPSG_2177_EN',
}
export type CoordinateSystem = keyof typeof ProjectionEnum;
export enum CoordinateTitle {
  EASTING = 'Easting(X)',
  NORTHING = 'Northing(Y)',
  LATITUDE = 'Latitude',
  LONGITUDE = 'Longitude',
  ALTITUDE = 'ALTITUDE',
}

/**
 * Response data from the backend
 */
export interface LengthElevationData {
  readonly lon: number;
  readonly lat: number;
  readonly dist: number;
  readonly alt: number;
}

// The reason why the surface and the point to point distance
// is using primitive types instead of mapping it from the state is that
// BE gives us a list of numbers whereas we only need the total of it,
// which is just a number, hence the type differences.
export interface LengthSurfaceResponse {
  distances: number[];
}

export interface LengthPointToPointResponse {
  distances: number[];
}

export interface BaseContent {
  readonly id: number;
  readonly projectId: Project['id'];
  readonly title: string;
  readonly color: Color;
  readonly type: ContentType;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info?: {
    readonly move?: boolean;
  };
  readonly config?: ContentConfigPerUser;
  readonly attachmentsCount: number;
  readonly createdAt: Date;
  readonly createdBy: {
    readonly id: User['id'];
    readonly name: string;
    readonly email: User['email'];
  } | undefined;
  readonly updatedAt: Date;
  /**
   * @desc show this content on the map and left sidebar at this date only.
   * _**appearAt === undefined always means the content is PINNED.**_
   */
  readonly appearAt?: Screen['appearAt'];
  /**
   * @desc the date a content was actually pinned.
   * This is NOT the date that was selected when the content was pinned.
   */
  readonly pinEventAt?: Date;
  readonly screenId?: Screen['id'];
  readonly groupId?: number;
}

export interface MapBoundary {
  readonly minLon: number;
  readonly minLat: number;
  readonly maxLon: number;
  readonly maxLat: number;
  /**
   * @desc To reverse Tile coordinates from float number of Longitude & Latitude does not make sure
   * that we will `get` the correct values.
   * Therefore, we need to get the original values of Tile coordinate from the Backend
   */
  readonly minX?: number; // The Left coordinate
  readonly minY?: number; // The Bottom coordinate
  readonly maxX?: number; // The Right coordinate
  readonly maxY?: number; // The Top coordinate
}

export interface MapBoundaries {
  readonly [zoom: number]: MapBoundary;
}

interface TMS {
  zoomLevels: ReadonlyArray<number>;
  boundaries: MapBoundaries;
}

export interface MapContent extends BaseContent {
  readonly appearAt: Date;
  readonly type: ContentType.MAP;
  readonly category: ContentCategory.MAP;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly tms?: TMS;
    readonly opacity?: number;
  };
  readonly config?: MapConfigPerUser;
}

export interface DSMContent extends BaseContent {
  readonly appearAt: Date;
  readonly type: ContentType.DSM;
  readonly category: ContentCategory.MAP;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly elevation: {
      readonly counts: Array<number>;
      readonly bins: Array<number>;
    };
    readonly tms?: TMS;
    readonly minHeight: number | null;
    readonly maxHeight: number | null;
    readonly opacity?: number;
  };
  readonly config?: DSMConfigPerUser;
}

export interface ThreeDOrthoContent extends BaseContent {
  readonly appearAt: Date;
  readonly type: ContentType.THREE_D_ORTHO;
  readonly category: ContentCategory.MAP;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    dsm: DSMContent['id'];
    map: MapContent['id'];
  };
  readonly status?: ContentProcessingStatus;
  readonly config?: ThreeDOrthoConfigPerUser;
}

export interface PointCloudContent extends BaseContent {
  readonly appearAt: Date;
  readonly type: ContentType.POINTCLOUD;
  readonly category: ContentCategory.MAP;
  readonly status?: ContentProcessingStatus;
  readonly config?: PointCloudConfigPerUser;
  readonly info?: BaseContent['info'] & {
    downsample_status?: APILasDownSamplingStatus;
    engine: PointCloudEngine;
  };
}

export interface ThreeDMeshContent extends BaseContent {
  readonly appearAt: Date;
  readonly type: ContentType.THREE_D_MESH;
  readonly category: ContentCategory.MAP;
  readonly status?: ContentProcessingStatus;
  readonly config?: ThreeDMeshConfigPerUser;
}

export interface BlueprintPDFContent extends BaseContent {
  readonly type: ContentType.BLUEPRINT_PDF;
  readonly category: ContentCategory.OVERLAY;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    // ImagePoint stores the pin point location based on Image (width, height)
    readonly imagePoint: [Point, Point];

    // GeoPoint stores the pin point location based on Geo (longitude, latitude)
    readonly geoPoint: [Coordinate, Coordinate];

    // Dimension of blueprint image after processing (pdf --> png tiles), info from Backend server
    readonly dimension?: {
      width: number;
      height: number;
    };
    readonly tms?: MapContent['info']['tms'];
    readonly opacity?: number;
  };
  readonly config?: BlueprintPDFConfigPerUser;
}

export enum MapBounds {
  MIN_LAT = 0,
  MAX_LON,
  MAX_LAT,
  MIN_LON,
}

export interface BlueprintDXFContent extends BaseContent {
  readonly type: ContentType.BLUEPRINT_DXF;
  readonly category: ContentCategory.OVERLAY;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly coordinateSystem: ProjectionEnum;
    readonly opacity?: number;
    readonly tms?: MapContent['info']['tms'] & {
      bounds?: [number, number, number, number];
      center?: [number, number];
      maxzoom?: number;
      minzoom?: number;
    };
    readonly error?: {
      readonly message: Record<Language, string> & {
        readonly [Language.KO_KR]: string;
        readonly [Language.EN_US]: string;
      };
    };
  };
  readonly config?: BlueprintDXFConfigPerUser;
}

export interface BlueprintDWGContent extends BaseContent {
  readonly type: ContentType.BLUEPRINT_DWG;
  readonly category: ContentCategory.OVERLAY;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly coordinateSystem: ProjectionEnum;
    readonly opacity?: number;
    readonly tms?: MapContent['info']['tms'] & {
      bounds?: [number, number, number, number];
      center?: [number, number];
      maxzoom?: number;
      minzoom?: number;
    };
    readonly error?: {
      readonly message: Record<Language, string> & {
        readonly [Language.KO_KR]: string;
        readonly [Language.EN_US]: string;
      };
    };
  };
  readonly config?: BlueprintDWGConfigPerUser;
}

export interface DesignDXFContent extends BaseContent {
  readonly type: ContentType.DESIGN_DXF;
  readonly category: ContentCategory.OVERLAY;
  readonly status?: ContentProcessingStatus;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly coordinateSystem: ProjectionEnum;
    readonly opacity?: number;
    readonly designBorder: Array<[number, number]>;
  };
  readonly config?: DesignDXFConfigPerUser;
}

export enum UnitType {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
  ANY = 'any',
}

export type ValidUnitType = Exclude<UnitType, UnitType.ANY>;
export type UnitValue<T> = Omit<Record<UnitType, T>, UnitType.ANY>;

export interface ElevationInfo {
  readonly value: number;
  readonly unit?: string;
}
export interface MarkerContent extends BaseContent {
  readonly type: ContentType.MARKER;
  readonly category: ContentCategory.MEASUREMENT;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly location: GeoPoint;
    readonly description: string;
    readonly targetMapContentId?: MapContent['id'];
    readonly elevationInfo?: ElevationInfo;
    readonly opacity?: number;
  };
  readonly config?: MarkerConfigPerUser;
}

export interface LengthContent extends BaseContent {
  readonly type: ContentType.LENGTH;
  readonly category: ContentCategory.MEASUREMENT;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly locations: Array<GeoPoint>;
    readonly elevations?: Array<{
      comparisonContentId: DSMContent['id'] | DesignDXFContent['id'];
      points: Array<LengthElevationRawData>;
      comparison: { title: string; color: string };
    }>;
    readonly metrics?: {
      surface: number;
      pointToPoint: number;
    };
  };
  readonly config?: LengthConfigPerUser;
}

export interface AreaContent extends BaseContent {
  readonly type: ContentType.AREA;
  readonly category: ContentCategory.MEASUREMENT;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly locations: Array<GeoPoint>;
    readonly surface?: number;
  };
  readonly config?: AreaConfigPerUser;
}

export interface GroupContent extends BaseContent {
  readonly type: ContentType.GROUP;
  readonly category: ContentCategory;
  readonly config?: ContentGroupConfigPerUser;
  readonly info: BaseContent['info'] & {
    readonly isOpened?: boolean;
  };
}

export interface ESSModelInstance {
  /**
   * The model's id.
   */
  readonly id: number;
  /**
   * The model's readable name.
   * In English.
   */
  readonly nameEn: string;
  /**
   * The model's readable name.
   * In Korean.
   */
  readonly nameKo: string;
  /**
   * The model's detail.
   * Could be the model size, weight in English.
   */
  readonly detailEn: string;
  /**
   * The model's detail.
   * Could be the model size, weight in Korean.
   */
  readonly detailKo: string;
  /**
   * The model's category id.
   * FE will use this as the unique identifier
   * to group the models with.
   */
  readonly categoryId: number;
  /**
   * The model's category readable name.
   * In English.
   */
  readonly categoryNameEn: string;
  /**
   * The model's category readable name.
   * In Korean.
   */
  readonly categoryNameKo: string;
  /**
   * The model's source URL.
   */
  readonly url: string;
  /**
   * The model's thumbnail URL.
   */
  readonly thumbnailUrl: string;
  /**
   * The model's width (in meters).
   * This value is independent of the scale (original width).
   */
  readonly width: number;
  /**
   * The model's length (in meters).
   * This value is independent of the scale (original length).
   */
  readonly length: number;
  /**
   * The model's height (in meters).
   * This value is independent of the scale (original height).
   */
  readonly height: number;
  /**
   * The model's predefined heading in radians (or degrees?).
   * Default should be 0.
   * Typically models face the north, but if for some reason it isn't,
   * the value tells how much it's headed against the north.
   */
  readonly heading?: number;
  /**
   * The model's scale.
   * Default is 1 (1:1 with the original),
   * but it can be decided if it would be smaller/bigger than the original.
   */
  readonly scale?: number;
  /**
   * Whether the model's ground is at the center of the model.
   * Default is false, because models usually lay flat on the ground.
   * Some models lay their center point on the ground.
   * (this is a bit hard to explain in text, so let me know if you need more explanation)
   */
  readonly groundAtCenter?: boolean;
  /**
   * Model's owrk radius. Some models need to show the range
   * the arm covering around the model.
   */
  readonly workRadius?: number;
}

export interface ESSModelCategory {
  /**
   * Id of the ESS model category.
   */
  readonly id: number;
  /**
   * The name of the category in English.
   */
  readonly nameEn: string;
  /**
   * The name of the category in Korean.
   */
  readonly nameKo: string;
}

export interface APIWMSInfo {
  layer: string;
  nativeBoundingBox: {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
  };
  url: string;
}

export interface BaseCalculationInfo<U> {
  readonly volumeAlgorithm: BasicCalcBasePlane;
  readonly volumeElevation: number;
  readonly type: U;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BasicCalculationInfo extends BaseCalculationInfo<VolumeCalcMethod.BASIC> {}

export interface SurveyCalculationInfo extends BaseCalculationInfo<VolumeCalcMethod.SURVEY> {
  /**
   * @desc this also takes DSMs after current date, need to change request parameter & backend code & exisitng data to change this name
   */
  readonly previousDsmId: DSMContent['id'];
}
export interface DesignCalculationInfo extends BaseCalculationInfo<VolumeCalcMethod.DESIGN> {
  readonly designDxfId: DesignDXFContent['id'];
}

export type CalculationInfo = BasicCalculationInfo | SurveyCalculationInfo | DesignCalculationInfo;
export interface CalculatedVolumeInfo {
  readonly calculation: CalculationInfo;
  readonly fill: number;
  readonly cut: number;
  readonly total: number;
  readonly wmsInfo?: APIWMSInfo;
  readonly minMaxElevation?: {
    readonly minHeight: number;
    readonly maxHeight: number;
  };
}
export interface VolumeContent extends BaseContent {
  readonly type: ContentType.VOLUME;
  readonly category: ContentCategory.MEASUREMENT;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly locations: Array<GeoPoint>;
    readonly calculatedVolume: CalculatedVolumeInfo;
    readonly isBoundaryViolated?: boolean;
  };
  readonly config?: VolumeConfigPerUser;
}

export interface GCP {
  readonly label: string;
  readonly easting: number;
  readonly northing: number;
  readonly altitude: number;
}

export interface GCPGroupContent extends BaseContent {
  readonly type: ContentType.GCP_GROUP;
  readonly category: ContentCategory.METADATA;
  /**
   * @warning
   * if you want to change content.info, please discuss with BE team
   * because there will be implications when recovering content
   */
  readonly info: BaseContent['info'] & {
    readonly crs: ProjectionEnum;
    readonly gcps: Array<GCP>;
  };
  readonly config?: GCPGroupConfigPerUser;
}

export type Content =
  | MapContent
  | ThreeDOrthoContent
  | PointCloudContent
  | DSMContent
  | BlueprintPDFContent
  | BlueprintDXFContent
  | BlueprintDWGContent
  | DesignDXFContent
  | MarkerContent
  | LengthContent
  | AreaContent
  | VolumeContent
  | ThreeDMeshContent
  | GCPGroupContent
  | ESSModelContent
  | ESSArrowContent
  | ESSPolygonContent
  | ESSPolylineContent
  | ESSTextContent
  | GroupContent
  ;

export type CADContent =
  | BlueprintDXFContent
  | BlueprintDWGContent
  ;

export interface RawAPIBaseContent {
  readonly id: number;
  readonly projectId: number;
  readonly title: string;
  readonly color: string;
  readonly attachmentsCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: {
    readonly id: number;
    readonly name: string;
    readonly email: string;
  } | undefined;
  readonly groupId: number | null;
}

export interface APIBaseContent extends RawAPIBaseContent {
  readonly path: string;
  readonly pinEventAt: string | null;
  readonly appearAt: string | null;
  readonly screenId: Screen['id'] | null;
}

export interface APIMapContent extends APIBaseContent {
  readonly appearAt: string;
  readonly type: MapContent['type'];
  readonly category: ContentCategory.MAP;
  readonly status: ContentProcessingStatus | null;
  readonly size: number | null;
  readonly info: MapContent['info'];
  readonly config: MapConfigPerUser | null;
}

export interface APIBlueprintPDFContent extends APIBaseContent {
  readonly type: BlueprintPDFContent['type'];
  readonly category: ContentCategory.OVERLAY;
  readonly status: ContentProcessingStatus | null;
  readonly info: BlueprintPDFContent['info'];
  readonly config: BlueprintPDFConfigPerUser | null;
}

export interface APIBlueprintDXFContent extends APIBaseContent {
  readonly type: BlueprintDXFContent['type'];
  readonly category: ContentCategory.OVERLAY;
  readonly status: ContentProcessingStatus | null;
  readonly info: BlueprintDXFContent['info'];
  readonly config: BlueprintDXFConfigPerUser | null;
}

export interface APIBlueprintDWGContent extends APIBaseContent {
  readonly type: BlueprintDWGContent['type'];
  readonly category: ContentCategory.OVERLAY;
  readonly status: ContentProcessingStatus | null;
  readonly info: BlueprintDWGContent['info'];
  readonly config: BlueprintDWGConfigPerUser | null;
}

export interface APIDesignDXFContent extends APIBaseContent {
  readonly type: DesignDXFContent['type'];
  readonly category: ContentCategory.OVERLAY;
  readonly status: ContentProcessingStatus | null;
  readonly info: DesignDXFContent['info'];
  readonly config: DesignDXFConfigPerUser | null;
}

export interface APIMarkerContent extends APIBaseContent {
  readonly type: MarkerContent['type'];
  readonly category: ContentCategory.MEASUREMENT;
  readonly info: MarkerContent['info'];
  readonly config: MarkerConfigPerUser | null;
}

export interface APILengthContent extends APIBaseContent {
  readonly type: LengthContent['type'];
  readonly category: ContentCategory.MEASUREMENT;
  readonly info: LengthContent['info'];
  readonly config: LengthConfigPerUser | null;
}

export interface APIAreaContent extends APIBaseContent {
  readonly type: AreaContent['type'];
  readonly category: ContentCategory.MEASUREMENT;
  readonly info: AreaContent['info'];
  readonly config: AreaConfigPerUser | null;
}

export interface APIVolumeContent extends APIBaseContent {
  readonly type: VolumeContent['type'];
  readonly category: ContentCategory.MEASUREMENT;
  readonly info: VolumeContent['info'];
  readonly config: VolumeConfigPerUser | null;
}

export interface APIDSMContent extends APIBaseContent {
  readonly appearAt: string;
  readonly type: DSMContent['type'];
  readonly category: ContentCategory.MAP;
  readonly info: DSMContent['info'];
  readonly elevation: DSMContent['info']['elevation'];
  readonly minHeight: DSMContent['info']['minHeight'];
  readonly maxHeight: DSMContent['info']['maxHeight'];
  readonly opacity: DSMContent['info']['maxHeight'];
  readonly status: ContentProcessingStatus | null;
  readonly config: DSMConfigPerUser | null;
}

export interface APIThreeDOrthoContent extends APIBaseContent {
  readonly appearAt: string;
  readonly type: ContentType.THREE_D_ORTHO;
  readonly category: ContentCategory.MAP;
  readonly info: ThreeDOrthoContent['info'];
  readonly status: ContentProcessingStatus | null;
  readonly config: ThreeDOrthoConfigPerUser | null;
}

export interface APIPointCloudContent extends APIBaseContent {
  readonly appearAt: string;
  readonly type: ContentType.POINTCLOUD;
  readonly category: ContentCategory.MAP;
  readonly info: PointCloudContent['info'];
  readonly status: ContentProcessingStatus | null;
  readonly config: PointCloudConfigPerUser | null;
}

export interface APIThreeDMeshContent extends APIBaseContent {
  readonly appearAt: string;
  readonly type: ContentType.THREE_D_MESH;
  readonly category: ContentCategory.MAP;
  readonly info: ThreeDMeshContent['info'];
  readonly status: ContentProcessingStatus | null;
  readonly config: ThreeDMeshConfigPerUser | null;
}

export interface APIGCPGroupContent extends APIBaseContent {
  readonly type: ContentType.GCP_GROUP;
  readonly category: ContentCategory.METADATA;
  readonly info: GCPGroupContent['info'];
  readonly status: ContentProcessingStatus | null;
  readonly config: GCPGroupConfigPerUser;
}

export enum APIESSContentType {
  MODEL = 'model',
  ARROW = 'waypoint',
  POLYGON = 'polygon',
  POLYLINE = 'polyline',
  TEXT = 'text',
  GROUP = 'content_group',
}

export interface APIESSModelContent extends APIBaseContent {
  readonly type: APIESSContentType.MODEL;
  readonly category: ContentCategory.ESS;
  readonly memo: ESSModelContent['info']['description'];
  readonly info: {
    readonly locations: ESSModelContent['info']['location'];
    readonly modelId: ESSModelContent['info']['modelId'];
    readonly heading: ESSModelContent['info']['heading'];
    readonly speed: ESSModelContent['info']['speed'];
    readonly waypointId: ESSModelContent['info']['waypointId'];
  };
  readonly config: ESSModelContentConfigPerUser;
}

export interface APIESSArrowContent extends APIBaseContent {
  readonly type: APIESSContentType.ARROW;
  readonly category: ContentCategory.ESS;
  readonly info: {
    readonly locations: ESSArrowContent['info']['locations'];
  };
  readonly config: ESSArrowContentConfigPerUser;
}

export interface APIESSPolygonContent extends APIBaseContent {
  readonly type: APIESSContentType.POLYGON;
  readonly category: ContentCategory.ESS;
  readonly info: {
    readonly locations: ESSPolygonContent['info']['locations'];
  };
  readonly config: ESSPolygonContentConfigPerUser;
}

export interface APIESSPolylineContent extends APIBaseContent {
  readonly type: APIESSContentType.POLYLINE;
  readonly category: ContentCategory.ESS;
  readonly info: {
    readonly locations: ESSPolylineContent['info']['locations'];
  };
  readonly config: ESSPolylineContentConfigPerUser;
}

export interface APIESSTextContent extends APIBaseContent {
  readonly type: APIESSContentType.TEXT;
  readonly category: ContentCategory.ESS;
  readonly info: {
    readonly locations: ESSTextContent['info']['location'];
    readonly fontSize: ESSTextContent['info']['fontSize'];
    readonly description: ESSTextContent['info']['description'];
    readonly fontColor: string;
  };
  readonly config: ESSTextContentConfigPerUser;
}

export interface APIContentGroup extends APIBaseContent {
  readonly type: ContentType.GROUP;
  readonly category: ContentCategory;
  readonly config: ContentGroupConfigPerUser;
  readonly info: GroupContent['info'];
}

export type APIContent = APIMapContent | APIBlueprintPDFContent | APIBlueprintDXFContent | APIBlueprintDWGContent | APIDesignDXFContent
  | APIMarkerContent | APILengthContent | APIAreaContent | APIVolumeContent | APIDSMContent | APIThreeDOrthoContent | APIPointCloudContent
  | APIThreeDMeshContent | APIGCPGroupContent | APIESSModelContent | APIESSArrowContent | APIESSPolygonContent | APIESSPolylineContent
  | APIESSTextContent | APIContentGroup;

export type APIESSContent = APIESSModelContent
  | APIESSArrowContent
  | APIESSPolygonContent
  | APIESSPolylineContent
  | APIESSTextContent
  | APIContentGroup;

/**
 * Enum for classification of resources
 */
export enum ResourceType {
  SOURCE = 'sourcephoto.zip',
  ORTHO = 'orthophoto.tif',
  ORTHO_COMPRESSED_10 = 'orthophoto_reduced_10.tif',
  ORTHO_COMPRESSED_20 = 'orthophoto_reduced_20.tif',
  ORTHO_TFW = 'orthophoto.tfw',
  ORTHO_COMPRESSED_10_TFW = 'orthophoto_reduced_10.tfw',
  ORTHO_COMPRESSED_20_TFW = 'orthophoto_reduced_20.tfw',
  DSM = 'dsm.tif',
  DSM_COMPRESSED = 'dsm_reduced.tif',
  POINT_CLOUD = 'pointcloud.las',
  POINT_CLOUD_COMPRESSED_100 = 'pointcloud_100.las',
  POINT_CLOUD_COMPRESSED_25 = 'pointcloud_25.las',
  POINT_CLOUD_COMPRESSED_4 = 'pointcloud_4.las',
  MESH = '3dmodel.zip',
}

export type OrthophotoDownloadTypes =
  ResourceType.ORTHO |
  ResourceType.ORTHO_COMPRESSED_10 |
  ResourceType.ORTHO_COMPRESSED_20
  ;

export type OrthophotoTfwDownloadTypes =
  ResourceType.ORTHO_TFW |
  ResourceType.ORTHO_COMPRESSED_10_TFW |
  ResourceType.ORTHO_COMPRESSED_20_TFW
  ;

/**
 * Enum for classification of attatchment file
 */
export enum AttachmentType {
  PHOTO = 'photo',
  SOURCE = 'source',
  ORTHO = 'orthophoto',
  BLUEPRINT_PDF = 'blueprint_pdf',
  BLUEPRINT_DXF = 'blueprint_dxf',
  BLUEPRINT_DWG = 'blueprint_dwg',
  DESIGN_DXF = 'design_dxf',
  DSM = 'dsm',
  POINTCLOUD = 'las',
}

export interface Attachment {
  readonly id: number;
  readonly contentId: Content['id'];
  readonly file: {
    readonly url: string;
    readonly markerThumb: {
      url: string;
    };
    readonly photoThumb?: {
      readonly url: string;
    };
  };
  readonly type: AttachmentType;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface APIAttachment {
  id: string;
  readonly type: 'attachments';
  readonly attributes: Overwrite<
    Omit<Attachment, 'id'>, {
      readonly createdAt: string;
      readonly updatedAt: string;
    }
  >;
}

export const AttachmentOverlayTypes: Readonly<AttachmentType[]> = [
  AttachmentType.BLUEPRINT_DXF,
  AttachmentType.BLUEPRINT_PDF,
  AttachmentType.BLUEPRINT_DWG,
  AttachmentType.DESIGN_DXF,
];

export interface SurveyContent {
  readonly maxCut: number;
  readonly maxFill: number;
  readonly minLow: number;
  readonly minHigh: number;
  readonly maxLow: number;
  readonly maxHigh: number;
}
export interface DSMPercents {
  readonly min: number;
  readonly max: number;
  readonly survey?: SurveyContent;
}

export interface DSMInfo {
  /**
   * @warn
   * Legacy DSMInfo does not have `isOn`.
   */
  readonly isOn?: boolean;
  readonly opacity: number;
  readonly percents: DSMPercents;
}

export type ContentConfigPerUser = MarkerConfigPerUser | LengthConfigPerUser | VolumeConfigPerUser | AreaConfigPerUser | BlueprintConfigPerUser
  | DesignDXFConfigPerUser | MapConfigPerUser | DSMConfigPerUser | PointCloudConfigPerUser | ThreeDOrthoConfigPerUser | ThreeDMeshConfigPerUser
  | GCPGroupConfigPerUser | ESSModelContentConfigPerUser | ESSArrowContentConfigPerUser | ESSPolygonContentConfigPerUser
  | ESSPolylineContentConfigPerUser | ESSTextContentConfigPerUser | ContentGroupConfigPerUser;

/**
 * @desc Config for each content and each user (content 별 user 별 설정)
 */
export interface BaseContentConfigPerUser {
  readonly type: ContentType;
  readonly selectedAt?: Date;
}

export interface MarkerConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.MARKER;
}

export enum DistanceType {
  HORIZONTAL = 'horizontal',
  SURFACE = 'surface',
  POINT_TO_POINT = 'point-to-point',
}

export interface LengthConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.LENGTH;
  readonly isElevationToggled: boolean;
  readonly distanceType?: DistanceType;
}
export interface AreaConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.AREA;
}
export interface VolumeConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.VOLUME;
  readonly dsm?: DSMInfo;
}

interface WithOpacity {
  readonly opacity: number;
}

export interface BlueprintDXFConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.BLUEPRINT_DXF;
}
export interface BlueprintDWGConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.BLUEPRINT_DWG;
}
export interface BlueprintPDFConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.BLUEPRINT_PDF;
}
export interface DesignDXFConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.DESIGN_DXF;
}

export type BlueprintConfigPerUser =
  BlueprintDXFConfigPerUser | BlueprintPDFConfigPerUser | BlueprintDWGConfigPerUser;

export interface MapConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.MAP;
}
export interface DSMConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.DSM;
  readonly percents: {
    min: number;
    max: number;
  };
}

export interface PointCloudConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.POINTCLOUD;
  readonly points: {
    numberOfPointsInMil: number;
    sizeOfPoint: number;
  };
}

export interface ThreeDMeshConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.THREE_D_MESH;
}

export interface ThreeDOrthoConfigPerUser extends BaseContentConfigPerUser, WithOpacity {
  readonly type: ContentType.THREE_D_ORTHO;
}

export interface GCPGroupConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.GCP_GROUP;
}

export interface ESSModelContentConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.ESS_MODEL;
}

export interface ESSArrowContentConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.ESS_ARROW;
}

export interface ESSPolygonContentConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.ESS_POLYGON;
}

export interface ESSPolylineContentConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.ESS_POLYLINE;
}

export interface ESSTextContentConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.ESS_TEXT;
}

export interface ContentGroupConfigPerUser extends BaseContentConfigPerUser {
  readonly type: ContentType.GROUP;
}

/**
 * This config exists by project and by user (프로젝트 별 유저 별)
 */
export interface ProjectConfig {
  readonly projectId: Project['id'];
  readonly lastSelectedScreenId?: Screen['id'];
  /**
   * @desc used to display last uploaded GCP in GCP upload popup
   */
  readonly lastGcp?: ProjectConfigLastGcp;
  readonly isMapShown?: boolean;
}

export interface ProjectConfigLastGcp {
  readonly coordinateSystem: string;
  readonly gcpTitles?: Array<string>;
  readonly gcpData: Array<Array<string>>;
  readonly uploadedAt: Date;
}

export interface UploadContent {
  readonly id: Content['id'];
  readonly type: AttachmentType;
  readonly file: Array<{
    size: File['size'];
    hash: string;
  }>;
  readonly uploadedAt: Date;
  readonly status: APIStatus;
  readonly error?: HTTPError;
}
// Pages related types
/**
 * Type of front page tabs.
 */
export enum FrontPageTabType {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  PROMOTION = 'PROMOTION',
}

export enum PhotoTabType {
  MAP = 'MAP',
  TIME = 'TIME',
}

export type SignInFormUserKeys = 'email';
export type SignInFormUserPasswordKeys = 'password';
export type SignInFormKeys =
  | keyof Pick<User, SignInFormUserKeys>
  | keyof Pick<UserPassword, SignInFormUserPasswordKeys>
  ;

export type PasswordFormKeys = 'email';
export type PasswordFormValues = Pick<User, PasswordFormKeys>;
export type NewPasswordFormKeys = 'password' | 'passwordConfirmation';
export type NewPasswordFormValues = Pick<UserPassword, NewPasswordFormKeys>;

export type SignUpFormUserKeys
  =
  | 'email'
  | 'avatar'
  | 'firstName' | 'lastName'
  | 'contactNumber'
  | 'organization'
  | 'country'
  | 'purpose'
  | 'language'
  ;
export type SignUpFormUserPasswordKeys = 'password' | 'passwordConfirmation';
export type RequiredSignUpFormKeys =
  | keyof Pick<User, Exclude<SignUpFormUserKeys, 'avatar'>>
  | keyof Pick<UserPassword, SignUpFormUserPasswordKeys>
  | 'eula'
  ;
export type SignUpFormKeys =
  | RequiredSignUpFormKeys
  | 'avatar'
  ;

export type RequiredSignUpFormValues =
  & Pick<User, Exclude<SignUpFormUserKeys, 'avatar'>>
  & Pick<UserPassword, SignUpFormUserPasswordKeys>
  & { readonly eula: boolean }
  ;
export type SignUpFormValues =
  & RequiredSignUpFormValues
  & { avatar?: File }
  ;
export type SignUpFormDirties = Readonly<Record<SignUpFormKeys, boolean>>;

/**
 * Type of project page tabs.
 */
export enum ProjectPageTabType {
  LIST = 'LIST',
  MANAGE = 'MANAGE',
  MYPAGE = 'MYPAGE',
  MARKET = 'MARKET',
  PILOT = 'PILOT',
}

export type MyPageFormUserKeys =
  | 'contactNumber'
  | 'organization'
  | 'country'
  | 'purpose'
  | 'language'
  ;
export type MyPageFormUserPasswordKeys = 'password' | 'passwordConfirmation';
export type MyPageFormFileKey = 'avatar';

export type MyPageFormValues =
  & Pick<User, MyPageFormUserKeys>
  & Pick<UserPassword, MyPageFormUserPasswordKeys>
  & Partial<Record<MyPageFormFileKey, { readonly file: File; readonly url: string }>>
  ;

/**
 * Type of project page popups.
 */
export enum ProjectPagePopupType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  INVITE = 'INVITE',
  INVITE_ALERT = 'INVITE_ALERT',
  SHARE = 'SHARE',
  SHARE_ALERT = 'SHARE_ALERT',
  ACCEPT = 'ACCEPT',
  CONFIRM_USER_UPDATE = 'CONFIRM_USER_UPDATE',
  USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS',
  NO_PERMISSION = 'NO_PERMISSION',
  SIGN_UP_TUTORIAL = 'SIGN_UP_TUTORIAL',
  CONFIRM_DELETE_PERMISSION = 'CONFIRM_DELETE_PERMISSION'
}

/**
 * Type of content page tabs.
 */
export enum ContentPageTabType {
  MAP = 'MAP',
  OVERLAY = 'OVERLAY',
  MEASUREMENT = 'MEASUREMENT',
  ESS = 'ESS',
  PHOTO = 'PHOTO',
}

/**
 * Type of map horizontal tabs.
 */
export enum MapHorizontalTabStatus {
  HIDDEN = 'HIDDEN',
  ESS = 'ESS',
  ELEVATION_PROFILE = 'ELEVATION_PROFILE',
}

/**
 * @desc type for map popups
 */
export enum ContentPagePopupOnMapType {
  DESIGN_DXF_SELECT = 'DESIGN_DXF_SELECT',
  SURVEY_SELECT = 'SURVEY_SELECT',
}

/**
 * Type of content page popups.
 */
export enum ContentPagePopupType {
  IMAGE = 'IMAGE',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  UNDOWNLOADABLE = 'UNDOWNLOADABLE',
  BLUEPRINT_ALIGN = 'BLUEPRINT_ALIGN',

  DELETE_CONFIRM = 'DELETE_CONFIRM',

  DELETE_GROUP = 'DELETE_GROUP',
  DELETE_SCREEN = 'DELETE_SCREEN',
  OVERWRITE_SCREEN = 'OVERWRITE_SCREEN',

  PHOTO_UPLOAD = 'PHOTO_UPLOAD',
  PHOTO_UPLOAD_SUCCESS = 'PHOTO_UPLOAD_SUCCESS',
  PHOTO_UPLOAD_FAIL = 'PHOTO_UPLOAD_FAIL',
  DELETE_PHOTO = 'DELETE_PHOTO',

  BLUEPRINT_UPLOAD = 'BLUEPRINT_UPLOAD',
  SOURCE_ERROR = 'SOURCE_ERROR',
  ORTHO_UPLOAD = 'ORTHO_UPLOAD',
  LAS_UPLOAD = 'LAS_UPLOAD',
  DSM_UPLOAD = 'DSM_UPLOAD',
  DESIGN_UPLOAD = 'DESIGN_UPLOAD',

  PROGRESS_BAR = 'PROGRESS_BAR',
  UPLOAD_COMPLETE = 'UPLOAD_COMPLETE',
  PROCESSING_FAILED = 'PROCESSING_FAILED',

  REPORT_DOWNLOAD = 'REPORT_DOWNLOAD',

  SHARE = 'SHARE',
  SHARE_ALERT = 'SHARE_ALERT',
  EXTERNAL_SHARE = 'EXTERNAL_SHARE',

  NO_SELECTED_MAP = 'NO_SELECTED_MAP',
  PROCESSING = 'PROCESSING',
  CANCEL = 'CANCEL',
  NO_PERMISSION = 'NO_PERMISSION',
  PRINT_START = 'PRINT_START',
  PRINT_SUCCESS = 'PRINT_SUCCESS',

  DXF2RASTER_PROCESSING_FAIL = 'DXF2RASTER_PROCESSING_FAIL',
  CANCEL_VOLUME_CREATION_POPUP = 'CANCEL_VOLUME_CREATION_POPUP',
}

/**
 * type of Attachment popup type
 */
export enum AttachPopupTypes {
  PHOTO = 'photo',
  ORTHO = 'orthophoto',
  BLUEPRINT_PDF = 'blueprint_pdf',
  BLUEPRINT_DXF = 'blueprint_dxf',
  BLUEPRINT_DWG = 'blueprint_dwg',
  DESIGN_DXF = 'design_dxf',
  DSM = 'dsm',
  POINTCLOUD = 'las',
}

/**
 * Type of printing format
 */
export enum BlueprintFormat {
  PDF = 'PDF',
  DXF = 'DXF',
}

/**
 * Type of printing format
 */
export enum PrintFormat {
  JPG = 'JPG',
}
/**
 * Type of printing Size
 */
export enum PrintSize {
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
}

export interface PrintFormatAndSize {
  format: PrintFormat;
  size: PrintSize;
}

/**
 * Type of Print Format and its sizes
 */
export type PrintFormatsAndSizes = Array<PrintFormatAndSize>;

/**
 * Modes of TwoDDisplay
 */
export enum TwoDDisplayMode {
  NORMAL = 'NORMAL',
  SLIDER = 'SLIDER',
  COMPARISON2 = 'COMPARISON2',
  COMPARISON4 = 'COMPARISON4',
}

export enum GeolocationError {
  PERMISSION = 1,
}

export interface Compare2Contents {
  readonly leftId?: Content['id'];
  readonly rightId?: Content['id'];
}

export interface Compare4Contents {
  readonly firstId?: Content['id'];
  readonly secondId?: Content['id'];
  readonly thirdId?: Content['id'];
  readonly fourthId?: Content['id'];
}

export type MeasurementContent = AreaContent | MarkerContent | LengthContent | VolumeContent;
export type DSMorMapContent = DSMContent | MapContent | ThreeDOrthoContent | PointCloudContent | ThreeDMeshContent | GCPGroupContent;
export type OverLayContent = BlueprintDXFContent | BlueprintDWGContent | BlueprintPDFContent | DesignDXFContent;
export type LengthAreaVolumeContent = LengthContent | AreaContent | VolumeContent;
export type GeometryContent = MeasurementContent | ESSArrowContent | ESSPolygonContent | ESSPolylineContent;

export type ProcessibleContent = MapContent | BlueprintPDFContent | BlueprintDXFContent | BlueprintDWGContent |
  DesignDXFContent | ThreeDOrthoContent | DSMContent | PointCloudContent | ThreeDMeshContent;
export type PinnableContent = MeasurementContent & OverLayContent;

export interface PinnedAndUnpinnedContents {
  pinnedContents: Array<Content>;
  unpinnedContents: Array<Content>;
}

export const MeasurementContentTypes: Array<ContentType>
  = [ContentType.AREA, ContentType.LENGTH, ContentType.MARKER, ContentType.VOLUME];
export const DSMorMapContentTypes: Array<ContentType>
  = [ContentType.MAP, ContentType.THREE_D_ORTHO, ContentType.DSM, ContentType.POINTCLOUD, ContentType.GCP_GROUP, ContentType.THREE_D_MESH];
export const OverlayContentTypes: Array<ContentType>
  = [ContentType.BLUEPRINT_PDF, ContentType.BLUEPRINT_DXF, ContentType.BLUEPRINT_DWG, ContentType.DESIGN_DXF];
export const ESSContentTypes: Array<ContentType>
  = [ContentType.ESS_MODEL, ContentType.ESS_ARROW, ContentType.ESS_POLYGON, ContentType.ESS_POLYLINE, ContentType.ESS_TEXT];

export type ESSLineBasedContent = ESSArrowContent | ESSPolygonContent | ESSPolylineContent;
export type ESSWorkToolContent = ESSLineBasedContent | ESSTextContent;
export type ESSLineBasedType = ESSLineBasedContent['type'];
export type ESSWorkToolType = ESSWorkToolContent['type'];
export type LocationBasedContentType = GeometryContent['type'] | ContentType.ESS_MODEL | ContentType.ESS_TEXT;

export const ProcessibleContentTypes: Array<ContentType>
  = [
    ContentType.MAP, ContentType.BLUEPRINT_PDF, ContentType.BLUEPRINT_DXF, ContentType.BLUEPRINT_DWG, ContentType.DESIGN_DXF,
    ContentType.THREE_D_ORTHO, ContentType.DSM, ContentType.POINTCLOUD, ContentType.THREE_D_MESH,
  ];
export const IsPinnableContentTypes: Array<ContentType>
  = [...MeasurementContentTypes, ...OverlayContentTypes];

export enum ContentEvent {
  CREATED = 'create',
  DESTROY = 'destroy',
  RECOVERED = 'recover',
}

export enum ContentEventStatus {
  OK = 'ok',
  EXPIRED = 'expired',
  PERFORMED = 'performed',
}

export interface ContentEventLog {
  readonly id: number;
  readonly relatedLogId: ContentEventLog['id'] | null;
  readonly event: ContentEvent;
  readonly status: ContentEventStatus;

  readonly screen: {
    readonly id: Screen['id'] | null;
    readonly appearAt: Date | null;
    readonly title: string;
  };

  readonly content: {
    readonly id: Content['id'];
    readonly type: Content['type'];
    readonly description: string;
    readonly color: Content['color'];

    readonly createdBy: {
      readonly id: User['id'];
      readonly name: string;
      readonly email: string;
    };

    readonly createdAt: Content['createdAt'];
    readonly deletedAt: Date | null;
  };

  readonly createdBy: {
    readonly id: User['id'];
    readonly name: string;
    readonly email: string;
  };
  readonly createdAt: Date;
}

export interface APIContentEventLog {
  readonly id: number;
  readonly relatedLogId: ContentEventLog['id'] | null;
  readonly event: ContentEvent;
  readonly status: ContentEventStatus;

  readonly screen: {
    readonly id: Screen['id'] | null;
    readonly appearAt: string | null;
    readonly title: string;
  };

  readonly content: {
    readonly id: number;
    readonly type: Content['type'];
    readonly description: string;
    readonly color: string | null;

    readonly createdBy: {
      readonly id: User['id'];
      readonly name: string;
      readonly email: string;
    };

    readonly createdAt: string;
    readonly deletedAt: string | null;
  };

  readonly createdBy: {
    readonly id: User['id'];
    readonly name: string;
    readonly email: string;
  };
  readonly createdAt: string;
}

export enum ContentEventLogKey {
  ID = 'id',
  CREATED_AT = 'createdAt',
  CREATED_BY = 'createdBy',
  EVENT = 'event',
  SCREEN = 'screen',
  CONTENT = 'content',
  ACTION = 'action',
}

export enum LasDownSamplingStatus {
  NOT_GENERATED = 'not-generated',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

// In BE, when it has not yet been generated, it's empty/undefined, hence the exclude.
// In FE, it is made more explicit by setting it as NOT_GENERATED.
export type APILasDownSamplingStatus = Exclude<LasDownSamplingStatus, LasDownSamplingStatus.NOT_GENERATED>;

export interface AttachmentPostStatus {
  readonly total: number;
  readonly progress: number;
  readonly error?: HTTPError;
}

/**
 * @author Junyoung Clare Jang
 * @desc Languages we will use to localize
 */
export enum Language {
  KO_KR = 'ko-KR',
  EN_US = 'en-US',
}

export interface APICloudFront {
  readonly cloudFrontPolicy: string;
  readonly cloudFrontSignature: string;
  readonly cloudFrontKeyPairId: string;
}

export interface CloudFront {
  readonly policy: APICloudFront['cloudFrontPolicy'];
  readonly signature: APICloudFront['cloudFrontSignature'];
  readonly keyPairId: APICloudFront['cloudFrontKeyPairId'];
}

export interface CookieCloudFront {
  'CloudFront-Policy': CloudFront['policy'];
  'CloudFront-Signature': CloudFront['signature'];
  'CloudFront-Key-Pair-Id': CloudFront['keyPairId'];
}

// Model states for APIs
export interface AuthState {
  readonly authedUser?: Pick<User, 'id'> & {
    readonly token: string;
  } & CloudFront;
  readonly tempUser?: Pick<User, 'id'> & {
    readonly token: string;
  };
  readonly automaticSignIn: boolean;
  readonly signInStatus: APIStatus;
  readonly signUpStatus: APIStatus;
  readonly signInError?: HTTPError;
  readonly signInErrorCode?: number;
  readonly signUpError?: HTTPError;
  readonly pathBeforeAuth?: string;
}

export interface UsersState {
  readonly users: {
    readonly byId: {
      readonly [id: number]: User;
    };
    readonly allIds: Array<User['id']>;
  };
  readonly notices: {
    readonly [id: number]: Notice;
  };
  readonly getUserInfoStatus: APIStatus;
  readonly getUserInfoError?: HTTPError;
  readonly patchUserInfoStatus: APIStatus;
  readonly patchUserInfoError?: HTTPError;
  readonly postPasswordResetStatus: APIStatus;
  readonly postPasswordResetError?: HTTPError;
  readonly patchPasswordStatus: APIStatus;
  readonly patchPasswordError?: HTTPError;
  readonly getNoticeStatus: APIStatus;
  readonly getNoticeError?: HTTPError;
  readonly patchNoticeStatus: APIStatus;
  readonly patchNoticeError?: HTTPError;
}

export interface UserConfigState {
  readonly config?: UserConfig;

  readonly getUserConfigStatus: APIStatus;
  readonly getUserConfigError?: HTTPError;
  readonly patchUserConfigStatus: APIStatus;
  readonly patchUserConfigError?: HTTPError;
}

export interface PlanConfigState {
  readonly config?: PlanConfig;

  readonly getPlanConfigStatus: APIStatus;
  readonly getPlanConfigError?: HTTPError;
}

export interface ESSModelsState {
  readonly byId: Partial<Record<ESSModelInstance['id'], ESSModelInstance>>;
  readonly byCategory?: Partial<Record<ESSModelCategory['id'], Array<ESSModelInstance['id']>>>;
  readonly categories?: ESSModelCategory[];
  readonly selectedCategoryId?: number;
  readonly selectedModelId?: number;

  readonly getESSModelsByCategoryStatus: APIStatus;
  readonly getESSModelsByCategoryError?: HTTPError;
  readonly getESSModelByIdStatus: APIStatus;
  readonly getESSModelByIdError?: HTTPError;
  readonly getESSModelCategoriesStatus: APIStatus;
  readonly getESSModelCategoriesError?: HTTPError;
}

export interface ESSModelContent extends BaseContent {
  readonly type: ContentType.ESS_MODEL;
  readonly category: ContentCategory.ESS;
  readonly info: BaseContent['info'] & {
    /**
     * The location of the model.
     */
    readonly location: GeoPoint;
    /**
     * Description to write on the model.
     */
    readonly description: string;
    /**
     * Model id. This will be cross-referenced to the list of models in the ESSModels
     * to retrieve info such as the model url itself.
     */
    readonly modelId: number;
    /**
     * Whether this model's work radius visualization is enabled or not.
     */
    readonly isWorkRadiusVisEnabled: boolean;
    /**
     * User can set the model to connect with an arrow/waypoint content
     * so that it moves along the track.
     */
    readonly waypointId?: number;
    /**
     * Model's custom heading. User can define their own model heading.
     * Heading is in degrees.
     */
    readonly heading?: number;
    /**
     * Model's speed. User can control the speed of the model when moving.
     */
    readonly speed?: number;
  };
}

export interface ESSArrowContent extends BaseContent {
  readonly type: ContentType.ESS_ARROW;
  readonly category: ContentCategory.ESS;
  readonly info: BaseContent['info'] & {
    /**
     * The locations of each segment of the arrow.
     */
    readonly locations: GeoPoint[];
  };
}

export interface ESSPolygonContent extends BaseContent {
  readonly type: ContentType.ESS_POLYGON;
  readonly category: ContentCategory.ESS;
  readonly info: BaseContent['info'] & {
    readonly locations: GeoPoint[];
  };
}

export interface ESSPolylineContent extends BaseContent {
  readonly type: ContentType.ESS_POLYLINE;
  readonly category: ContentCategory.ESS;
  readonly info: BaseContent['info'] & {
    readonly locations: GeoPoint[];
  };
}

export interface ESSTextContent extends BaseContent {
  readonly type: ContentType.ESS_TEXT;
  readonly category: ContentCategory.ESS;
  readonly info: BaseContent['info'] & {
    readonly location: GeoPoint;
    readonly fontSize: number;
    readonly fontColor: Color;
    readonly description: string;
  };
}

export type ESSContent = ESSModelContent | ESSArrowContent | ESSPolygonContent | ESSPolylineContent | ESSTextContent | GroupContent;

export interface ESSContentsState {
  readonly createESSContentStatus: APIStatus;
  readonly createESSContentError?: HTTPError;
  readonly createESSGroupContentStatus: APIStatus;
  readonly createESSGroupContentError?: HTTPError;
  readonly patchESSContentStatus: APIStatus;
  readonly patchESSContentError?: HTTPError;
  readonly deleteESSContentStatus: APIStatus;
  readonly deleteESSContentError?: HTTPError;
}

export interface ProjectsState {
  readonly projects: {
    readonly byId: {
      readonly [id: number]: Project;
    };
    readonly allIds: Array<Project['id']>;
  };
  readonly getProjectsStatus: APIStatus;
  readonly postProjectStatus: APIStatus;
  readonly patchProjectStatus: APIStatus;
  readonly deleteProjectStatus: APIStatus;
  readonly getCalendarStatus: APIStatus;
  readonly getProjectStatus: APIStatus;
  readonly getCalendarError?: HTTPError;
  readonly getProjectError?: HTTPError;
  readonly getProjectsError?: HTTPError;
  readonly postProjectError?: HTTPError;
  readonly patchProjectError?: HTTPError;
  readonly deleteProjectError?: HTTPError;
}

export interface PermissionsState {
  readonly permissions: {
    readonly byId: {
      readonly [id: number]: Permission;
    };
    readonly allIds: Array<Permission['id']>;
  };
  readonly getPermissionsStatus: APIStatus;
  readonly postPermissionsStatus: APIStatus;
  readonly patchPermissionStatus: APIStatus;
  readonly deletePermissionStatus: APIStatus;
  readonly getPermissionsError?: HTTPError;
  readonly postPermissionsError?: HTTPError;
  readonly patchPermissionError?: HTTPError;
  readonly deletePermissionError?: HTTPError;
  readonly confirmDeletePermission?: Permission;
}

export interface ContentApiStatus {
  readonly status: APIStatus;
  readonly error?: HTTPError;
}

export interface ContentsState {
  readonly contents: {
    readonly byId: {
      readonly [id: number]: Content;
    };
    readonly allIds: Array<Content['id']>;
  };
  readonly measurement: {
    readonly [contentId: number]: string;
  };
  readonly uploadContents: {
    readonly [id: number]: UploadContent;
  };
  readonly getContentsStatus: APIStatus;
  readonly getInitialContentsStatus: APIStatus;
  readonly postContentStatus: APIStatus;
  readonly patchContentStatus: APIStatus;
  readonly deleteContentStatus: APIStatus;
  readonly printMapStatus: APIStatus;
  readonly dxf2RasterStatus: APIStatus;
  readonly getContentsError?: HTTPError;
  readonly getInitialContentsError?: HTTPError;
  readonly postContentError?: HTTPError;
  readonly patchContentError?: HTTPError;
  readonly deleteContentError?: HTTPError;
  readonly printMapError?: HTTPError;
  readonly dxf2RasterError?: HTTPError;
  readonly runPotreeError?: HTTPError;
  readonly contentUploadError?: HTTPError;
  /**
   * @desc Please delete these properties. This should be in content.
   */
  readonly requestVolumeCalculation: {
    readonly [id: number]: ContentApiStatus;
  };
  readonly requestMarkerElevationInfo: {
    readonly [id: number]: ContentApiStatus;
  };
  readonly requestLengthElevationInfo: {
    readonly [id: number]: ContentApiStatus;
  };
  readonly getLengthMetrics: {
    readonly [id: number]: ContentApiStatus;
  };
  readonly getAreaSurface: {
    readonly [contentId: number]: ContentApiStatus;
  };

  readonly outdatedVolumeIds: Array<VolumeContent['id']>;

  readonly requestLasDownSamplingStatus: APIStatus;
  readonly requestLasDownSamplingError?: HTTPError;
  readonly getContentDownloadablesStatus: APIStatus;
  readonly getContentDownloadablesError?: HTTPError;
  readonly lasDownSamplingStatus: Partial<
    Record<Screen['id'], { contentId: PointCloudContent['id']; status: LasDownSamplingStatus }>
  >;
  readonly contentDownloadables: Partial<
    Record<Screen['id'], Partial<Record<ResourceType, boolean>>>
  >;
  readonly requestLasReprocessingStatus: APIStatus;
  readonly requestLasReprocessingError?: HTTPError;
}

export interface ScreensState {
  readonly screens: Array<Screen>;
  readonly getScreensStatus: APIStatus;
  readonly patchScreensStatus: APIStatus;
  readonly postScreensStatus: APIStatus;
  readonly deleteScreensStatus: APIStatus;

  readonly getScreensError?: HTTPError;
  readonly patchScreensError?: HTTPError;
  readonly postScreensError?: HTTPError;
  readonly deleteScreensError?: HTTPError;
}

export interface AttachmentsState {
  readonly attachments: {
    readonly byId: {
      readonly [id: number]: Attachment;
    };
    readonly allIds: Array<Attachment['id']>;
  };
  readonly getAttachmentsStatus: {
    readonly [contentId: number]: ContentApiStatus;
  };
  readonly postAttachmentStatus: {
    readonly [contentId: number]: {
      readonly [hash: string]: AttachmentPostStatus;
    };
  };
}

export interface ESSAttachmentsState {
  readonly attachments: {
    readonly byId: {
      readonly [id: number]: Attachment;
    };
    readonly allIds: Array<Attachment['id']>;
  };
  readonly getESSAttachmentsStatus: {
    readonly [contentId: number]: ContentApiStatus;
  };
  readonly postESSAttachmentStatus: {
    readonly [contentId: number]: {
      readonly [hash: string]: AttachmentPostStatus;
    };
  };
}

export interface SharedContentsState {
  readonly shareToken?: string;
  readonly showAt?: Date;
  readonly projectName: string;
  readonly projection: ProjectionEnum;
  readonly screenTitle: NonNullable<Screen['title']>;
  readonly navbarLogoUrl: string;
  readonly initialCameraPosition: Coordinate;
  readonly getSharedContentsStatus: APIStatus;
  readonly postShareRequestStatus: APIStatus;
  readonly getSharedContentsError?: HTTPError;
  readonly postShareRequestError?: HTTPError;
  readonly projectUnit?: UnitType;
}

// Model states for pages
export interface CommonPageState {
  readonly language: Language;
  readonly timezoneOffset: number; // Offset in minute
}

export interface FrontPageState {
  readonly tab: FrontPageTabType;
  readonly newPasswordToken?: string;
  readonly passwordFormValues: PasswordFormValues;
  readonly newPasswordFormValues: NewPasswordFormValues;
  readonly signUpFormValues: SignUpFormValues;
  readonly signUpFormDirties: SignUpFormDirties;
}

export interface ProjectPageState {
  readonly tab: ProjectPageTabType;
  readonly popup?: ProjectPagePopupType;
  readonly editingProjectId?: Project['id'];
  readonly myPageFormValues: MyPageFormValues;
  readonly isSignUpTutorialPopupHidden?: boolean;
}

/**
 * @fixme compare2Contents/compare4Contents and twoDDisplayMode have
 * redundant information
 */
export interface ContentsPageState {
  readonly projectId?: Project['id'];
  readonly in3D: boolean;
  readonly isOnWorkRadius: boolean;
  readonly in3DPointCloud: boolean;
  readonly currentPointCloudEngine: PointCloudEngine;
  readonly showSidebar: boolean;
  readonly isTopbarShown: boolean;
  readonly editingContentId?: Content['id'];
  readonly deletingContentId?: Content['id'];
  readonly compare2: Compare2Contents;
  readonly compare4: Compare4Contents;
  readonly twoDDisplayMode: TwoDDisplayMode;
  readonly isInContentsEventLogTable: boolean;
  readonly isInSourcePhotoUpload: boolean;
  readonly currentContentTypeFromAnnotationPicker?: MeasurementContent['type'] | ESSWorkToolType;
  readonly previousContentTypeFromAnnotationPicker?: MeasurementContent['type'] | ESSWorkToolType;
  readonly isMeasurementClickedFromMap: boolean;
  readonly twoDDisplayCenter: GeoPoint;
  readonly twoDDisplayZoom: number;
  readonly rotation: number;
  readonly sidebarTab: ContentPageTabType;
  readonly previousSidebarTab?: ContentPageTabType;
  readonly popup?: {
    readonly type: ContentPagePopupType;
    readonly contentId?: Content['id'];
  };
  readonly imageViewerStatus: {
    readonly contentId: Content['id'];
    readonly attachmentId: Attachment['id'];
  };
  readonly printingContentId?: Content['id'];
  readonly printingSquare?: Coordinate[];
  readonly printingAngle?: number;
  readonly isFirstVisit?: boolean;
  /**
   * @desc Using combination of (editingContentId, aligningBlueprintId)
   * to determine correct action of Blueprint: Edit or Align
   */
  readonly aligningBlueprintId?: BlueprintPDFContent['id'];
  readonly aligningBlueprintScratchpad?: Partial<BlueprintPDFContent['info']>;
  readonly mapHorizontalTabStatus: MapHorizontalTabStatus;

  readonly getLonLatOn2D3DToggleStatus: APIStatus;

  readonly mapPopup?: {
    readonly type: ContentPagePopupOnMapType;
  };

  readonly creatingVolumeInfo?: {
    readonly type?: VolumeCalcMethod;
    readonly designDxfId?: DesignDXFContent['id'];
    readonly previousDsmId?: DSMContent['id'];
    readonly isDrawing?: boolean;
  };

  readonly creatingGCPGroupInfo?: {
    readonly gcps: GCP[];
    readonly crs: ProjectionEnum;
  };
  readonly editingGCPIndex?: number;

  readonly previewingDesignId?: DesignDXFContent['id'];

  readonly isPreventAutoSelect?: boolean;

  readonly shouldUpdateTwoDDisplayZoom: boolean;
  readonly shouldUpdateTwoDDisplayCenter: boolean;
  readonly threeDTilesetBounds?: {
    readonly min: Cartesian3;
    readonly max: Cartesian3;
  };
}

export interface ScreenTree {
  readonly pinned: Array<Content['id']>;
  readonly unpinned: Record<Screen['id'], Array<Content['id']>>;
}

export interface GroupsState {
  readonly selectedGroupIdByTab: Record<ContentPageTabType, GroupContent['id'] | undefined>;
  readonly isCreatingNewGroup: boolean;
  readonly isGroupAlreadyDeleted: boolean;
  readonly isCreatingContentOnDeletedGroup: boolean;
  readonly tree: {
    readonly idsByGroup: Record<GroupContent['id'], Array<Content['id']>>;
    readonly rootIdsByCategory: Record<ContentCategory, ScreenTree>;
  };
  readonly moveContentStatus: APIStatus;
  readonly moveContentError?: HTTPError;
}

export interface PagesState {
  readonly Common: CommonPageState;
  readonly Front: FrontPageState;
  readonly Project: ProjectPageState;
  readonly Contents: ContentsPageState;
}

export interface ProjectConfigPerUserState {
  readonly config?: ProjectConfig;
  readonly patchProjectConfigStatus: APIStatus;
  readonly patchProjectConfigError?: HTTPError;
}
export interface PhotosState {
  readonly photos: Array<Photo>;
  readonly currentPhotoId?: Photo['id'];
  readonly photoTab: PhotoTabType;
  readonly uploadedPhotoCount: number;
}
export interface BasePhoto {
  readonly id: number;
  readonly originalFilename: string;
  readonly imageUrl: string;
  readonly thumbUrl: string;
  readonly fullUrl: string;
  readonly boxThumbUrl: string;
  readonly geotags: PhotoGeotag;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly altitude: number | null;
  readonly direction: number | null;
}
export interface Photo extends BasePhoto {
  readonly takenAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export interface APIPhoto extends BasePhoto {
  takenAt: string;
  createdAt: string;
  updatedAt: string;
}
export interface PhotoGeotag {
  readonly gpsLatitude: [number, number, number] | null;
  readonly gpsLongitude: [number, number, number] | null;
  readonly gpsAltitude: number | null;
  readonly gpsSpeed: number | null;
  readonly gpsImgDirection: number | null;
  readonly gpsDestBearing: number | null;

  readonly gpsLatitudeRef: string | null;
  readonly gpsLongitudeRef: string | null;
  readonly gpsAltitudeRef: number | null;
  readonly gpsSpeedRef: string | null;
  readonly gpsImgDirectionRef: string | null;
  readonly gpsDestBearingRef: string | null;

  readonly gpsDateStamp: string | null;
}

// Merged model state
export interface State {
  readonly Auth: AuthState;
  readonly Users: UsersState;
  readonly UserConfig: UserConfigState;
  readonly PlanConfig: PlanConfigState;
  readonly ESSModels: ESSModelsState;
  readonly ESSContents: ESSContentsState;
  readonly Projects: ProjectsState;
  readonly Permissions: PermissionsState;
  readonly Contents: ContentsState;
  readonly Screens: ScreensState;
  readonly Attachments: AttachmentsState;
  readonly ESSAttachments: ESSAttachmentsState;
  readonly SharedContents: SharedContentsState;
  readonly ProjectConfigPerUser: ProjectConfigPerUserState;
  readonly Photos: PhotosState;
  readonly Groups: GroupsState;

  readonly Pages: PagesState;
  readonly router: RouterState;
}
export interface SerialState extends DDMSESSIONObject {
  readonly version?: string;
  readonly authedUser?: State['Auth']['authedUser'];
  readonly automaticSignIn?: State['Auth']['automaticSignIn'];
}

export interface Extent {
  left: number;
  right: number;
  bottom: number;
  top: number;
}
export interface ExtentTileInfo {
  X: number;
  Y: number;
  Z: number;
  top: number;
  left: number;
}

export interface MapCenter {
  lon: number;
  lat: number;
  alt: number;
  rotation: number;
}

export const CHANGE_COORDS_ON_PROJECTIONSYSTEM_CHANGE: ContentType[] = [ContentType.MARKER];

export type MapTabTwoDContent = MapContent | DSMContent;
export type MapTabThreeDContent = ThreeDOrthoContent | ThreeDMeshContent | PointCloudContent;
export type MapTabContent = MapTabTwoDContent | MapTabThreeDContent;

export const MAP_TAB_THREE_D_CONTENTS: Array<ContentType> = [ContentType.POINTCLOUD, ContentType.THREE_D_ORTHO, ContentType.THREE_D_MESH];
export const MAP_TAB_TWO_D_CONTENTS: Array<ContentType> = [ContentType.MAP, ContentType.DSM, ContentType.GCP_GROUP];
export const MAP_TAB_CONTENTS: Array<ContentType> = [...MAP_TAB_THREE_D_CONTENTS, ...MAP_TAB_TWO_D_CONTENTS];

export const MAP_TAB_CONTENTS_ORDER: {[key: string]: number} = {
  [ContentType.MAP]: 1,
  [ContentType.THREE_D_ORTHO]: 3,
  [ContentType.POINTCLOUD]: 4,
  [ContentType.DSM]: 2,
  [ContentType.THREE_D_MESH]: 5,
  [ContentType.GCP_GROUP]: 6,
};

export type MouseOrTouchEvent = MouseEvent | TouchEvent;
/*
 * @desc Location-related props between MouseEvent and Touch(TouchEvent.ChangedTouches: Touch[]).
 */
export interface MouseOrTouchEventLocation {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  // Alias of clientX/Y, in MouseEvent
  x?: number;
  y?: number;
  // MouseEvent-Only Props
  layerX?: number;
  layerY?: number;
  movementX?: number;
  movementY?: number;
  offsetX?: number;
  offsetY?: number;
  // TouchEvent-Only Props
  radiusX?: number;
  radiusY?: number;
}

export interface LocationOverlayUpdater<T> {
  getLonLat(param: T): Coordinate;
  getProjectCoordinate(param: T): Coordinate;
  setCoordXY(param: T): void;
}

export interface LocationOverlayUpdaterState {
  lastDebounceTimeout: number;
  isDebouncing: boolean;
  debounceTime: number;
}

export interface CesiumMovement {
  startPosition: Cartesian2;
  endPosition: Cartesian2;
}

export enum MarkerPinpointerLocation {
  LEFT_SIDEBAR = 'left-sidebar',
  MAP = 'map',
}

export const enum UserAgent {
  FIREFOX = 'FIREFOX',
  CHROME = 'CHROME',
  SAMSUNG_INTERNET = 'SAMSUNG_INTERNET',
  IE = 'IE',
  EDGE = 'EDGE',
  SAFARI = 'SAFARI',
  OPERA = 'OPERA',
  UNKNOWN = 'UNKNOWN',
}

export enum Device {
  MOBILE_S = 'MOBILE_S',
  MOBILE_L = 'MOBILE_L',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

// eslint-disable-next-line no-magic-numbers
export const TIPPY_OFFSET: [number, number] = [0, 3];

export enum HotKey {
  MINUS = '-',
  PERIOD = '.',
  C = 'c',
  D = 'd',
  DELETE = 'Delete',
  ENTER = 'Enter',
  ESCAPE = 'Escape',
  TAB = 'Tab',
}

export enum ShortCut {
  CONTROL = 'Control',
  DELETE = 'Delete',
  D = 'd',
}

export enum TagName {
  INPUT = 'INPUT'
}

export enum ExcludedContentType {
  THERMAL = 'thermal',
}
