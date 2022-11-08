import { PostAttachmentNewResponse } from '^/store/duck/Attachments';
import Evaporate from 'evaporate';
import { sha256 } from 'js-sha256';
import { Observable, Observer } from 'rxjs';
import SparkMD5 from 'spark-md5';
import { ExifParserFactory } from 'ts-exif-parser';
import { makeV2APIURL } from '../duck/API';

export type FileMultipartUploadProgress = Readonly<{
  progress: number;
  total: number;
}>;

export type FileMultipartUploadResponse = FileMultipartUploadProgress | string;


type IsFileMultipartUploadProgress = (
  response: FileMultipartUploadResponse,
) => response is FileMultipartUploadProgress;

export const isFileMultipartUploadProgress: IsFileMultipartUploadProgress = (
  response: FileMultipartUploadResponse,
): response is FileMultipartUploadProgress => typeof response !== 'string';

interface FileMultipartUploadParams {
  file: File;
  header?: object;
  s3FileName?: string;
}

// eslint-disable-next-line no-magic-numbers
const partSize: number = 10 * 1024 * 1024;
// eslint-disable-next-line no-magic-numbers
const progressIntervalMS: number = 3 * 1000;

/**
 * This can submit and cancel files to S3.
 */
export class FileMultipartUpload {
  public evaporate?: Evaporate;
  public options?: PostAttachmentNewResponse;
  private readonly file: File;
  private readonly header?: object;
  private readonly s3FileName?: string;

  public constructor({ file, header, s3FileName }: FileMultipartUploadParams) {
    this.file = file;
    this.header = header;
    this.s3FileName = s3FileName;
  }

  public create(options: PostAttachmentNewResponse): Observable<FileMultipartUploadResponse> {
    const { file, header, s3FileName }: FileMultipartUpload = this;
    // eslint-disable-next-line no-template-curly-in-string
    const path: string = options.key.replace('${filename}', s3FileName || file.name)
      .normalize('NFC');

    return new Observable((observer: Observer<any>) => {
      Evaporate.create({
        aws_key: options['aws-id'],
        bucket: options.bucket,
        awsRegion: options.region,
        signerUrl: makeV2APIURL('signv4'),
        signHeaders: header,
        logging: false,
        computeContentMd5: true,
        partSize,
        progressIntervalMS,
        cryptoMd5Method: (data: ArrayBuffer) => (
          btoa(SparkMD5.ArrayBuffer.hash(data, true))
        ),
        cryptoHexEncodedHash256: (data: string) => (
          sha256.create().update(data).hex()
        ),
      }).then(async (_e_: Evaporate): Promise<void> => {
        this.evaporate = _e_;

        const xAmzHeadersAtInitiate: Record<string, string> = {};

        if (file.name.toUpperCase().endsWith('.JPG') || file.name.toUpperCase().endsWith('.JPEG')) {
          const data: ArrayBuffer = await file.arrayBuffer();
          const tags: any = ExifParserFactory.create(data).parse().tags;

          xAmzHeadersAtInitiate['x-amz-meta-altitude'] = (tags.GPSAltitude ?? '').toString();
          xAmzHeadersAtInitiate['x-amz-meta-altitude-ref'] = (tags.GPSAltitudeRef ?? '').toString();
          xAmzHeadersAtInitiate['x-amz-meta-latitude'] = (tags.GPSLatitude ?? '').toString();
          xAmzHeadersAtInitiate['x-amz-meta-latitude-ref'] = (tags.GPSLatitudeRef ?? '').toString();
          xAmzHeadersAtInitiate['x-amz-meta-longitude'] = (tags.GPSLongitude ?? '').toString();
          xAmzHeadersAtInitiate['x-amz-meta-longitude-ref'] = (tags.GPSLongitudeRef ?? '').toString();
        }

        _e_.add({
          name: path,
          file: this.file,
          xAmzHeadersAtInitiate,
          progress: (progress: number) => {
            observer.next({
              progress: file.size * progress,
              total: file.size,
            });
          },
        }).then((response: string) => {
          observer.next(response);
          observer.complete();
        }).catch((error: Error) => {
          throw error;
        });
      }).catch((reason: string): never => {
        throw new Error(reason);
      });
    });
  }

  public cancel(): void {
    if (this.evaporate === undefined) {
      return;
    }

    this.evaporate.cancel()
      .catch(
        (reason: string): never => {
          throw new Error(reason);
        },
      );
  }
}
